import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { groqJSON } from "@/lib/ai/groq";
import {
  buildCaptionSystemPrompt,
  buildCaptionUserPrompt,
  type CaptionOutput,
  type Platform,
  type Tone,
} from "@/lib/ai/prompts/caption";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const DAILY_LIMIT = 15;

const captionRequestSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500).transform((s) => s.trim()),
  platform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "twitter", "facebook"]),
  tone: z.enum(["motivational", "casual", "professional", "humorous", "emotional", "educational"]),
  extraContext: z.string().max(1000).optional().transform((s) => s?.trim()),
});

function sanitizeCaptionOutput(raw: unknown): CaptionOutput {
  if (typeof raw !== "object" || raw === null) throw new Error("AI returned non-object");
  const obj = raw as Record<string, unknown>;

  const ensureString = (v: unknown, fallback: string): string =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;

  const ensureStringArray = (v: unknown, fallbacks: string[]): string[] => {
    if (!Array.isArray(v)) return fallbacks;
    const filtered = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    return filtered.length > 0 ? filtered : fallbacks;
  };

  const hashtags = ensureStringArray(obj.hashtags, ["#creator", "#content", "#socialmedia"])
    .map((h) => (h.startsWith("#") ? h : `#${h}`))
    .map((h) => h.replace(/\s+/g, ""))
    .filter((h) => h.length > 1);

  return {
    short: ensureString(obj.short, "Check out this content!"),
    long: ensureString(obj.long, ensureString(obj.short, "Check out this content!")),
    hook: ensureString(obj.hook, ensureString(obj.short, "This changes everything.")),
    ctas: ensureStringArray(obj.ctas, ["Follow for more", "Comment below", "Share this", "Save for later"]),
    emojis: ensureStringArray(obj.emojis, ["✨", "🔥", "💪", "🎯", "🚀", "💡", "❤️", "👇"]),
    hashtags,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip, "caption", DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow or upgrade to Pro.` },
        { status: 429 }
      );
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const parsed = captionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { topic, platform, tone, extraContext } = parsed.data;

    const rawResult = await groqJSON<CaptionOutput>({
      systemPrompt: buildCaptionSystemPrompt(),
      userPrompt: buildCaptionUserPrompt({ topic, platform: platform as Platform, tone: tone as Tone, extraContext }),
      maxTokens: 1200,
      temperature: 0.78,
    });

    const result = sanitizeCaptionOutput(rawResult);

    return NextResponse.json({ ...result, remaining });
  } catch (err: unknown) {
    console.error("[caption/route POST]", err);
    if (err instanceof Error) {
      if (err.message.includes("rate_limit") || err.message.includes("429")) {
        return NextResponse.json({ error: "AI service is busy. Please try again." }, { status: 503 });
      }
      if (err.message.includes("Failed to parse")) {
        return NextResponse.json({ error: "AI returned unexpected response. Please retry." }, { status: 502 });
      }
    }
    return NextResponse.json({ error: "Caption generation failed. Please try again." }, { status: 500 });
  }
}
