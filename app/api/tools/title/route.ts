import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { groqJSON } from "@/lib/ai/groq";
import {
  buildTitleSystemPrompt,
  buildTitleUserPrompt,
  type TitleOutput,
  type TitleItem,
  type Platform,
  type TitleStyle,
} from "@/lib/ai/prompts/title";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const DAILY_LIMIT = 15;

const titleRequestSchema = z.object({
  topic: z.string().min(3).max(500).transform((s) => s.trim()),
  platform: z.enum(["youtube", "tiktok", "instagram", "blog"]),
  styles: z.array(z.enum(["seo", "clickable", "emotional", "curiosity", "shorts", "listicle"])).min(1),
  titleCount: z.number().int().min(1).max(10),
  keywords: z.string().max(300).optional().transform((s) => s?.trim()),
});

function sanitizeTitleItem(raw: unknown): TitleItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : null;
  if (!title) return null;

  const validStyles: TitleStyle[] = ["seo", "clickable", "emotional", "curiosity", "shorts", "listicle"];
  const style = validStyles.includes(o.style as TitleStyle) ? (o.style as TitleStyle) : "clickable";
  const clamp = (v: unknown) => typeof v === "number" ? Math.min(100, Math.max(0, Math.round(v))) : 50;

  return {
    title,
    style,
    ctrScore: clamp(o.ctrScore),
    seoScore: clamp(o.seoScore),
    charCount: title.length,
    explanation: typeof o.explanation === "string" && o.explanation.trim() ? o.explanation.trim() : "A strong title for this topic.",
  };
}

function sanitizeTitleOutput(raw: unknown, expectedCount: number): TitleOutput {
  if (typeof raw !== "object" || raw === null) throw new Error("AI returned non-object");
  const o = raw as Record<string, unknown>;

  const titlesArr = Array.isArray(o.titles) ? o.titles : [];
  const titles = titlesArr.map(sanitizeTitleItem).filter((t): t is TitleItem => t !== null);
  if (titles.length === 0) throw new Error("AI returned no valid titles");

  let topPick = typeof o.topPick === "number" ? Math.round(o.topPick) : 0;
  if (topPick < 0 || topPick >= titles.length) {
    topPick = titles.reduce((best, t, i, arr) =>
      (t.ctrScore + t.seoScore) > (arr[best].ctrScore + arr[best].seoScore) ? i : best, 0);
  }

  const keywords = Array.isArray(o.keywords)
    ? o.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0).slice(0, 10)
    : [];
  const thumbnailTextSuggestions = Array.isArray(o.thumbnailTextSuggestions)
    ? o.thumbnailTextSuggestions.filter((k): k is string => typeof k === "string" && k.trim().length > 0).slice(0, 6)
    : [];

  const strategyNote = typeof o.strategyNote === "string" && o.strategyNote.trim()
    ? o.strategyNote.trim().slice(0, 220)
    : "Test the top-scoring title first, then iterate based on early CTR data.";

  return {
    titles: titles.slice(0, expectedCount),
    topPick,
    keywords: keywords.length > 0 ? keywords : ["content", "tutorial", "guide"],
    thumbnailTextSuggestions: thumbnailTextSuggestions.length > 0 ? thumbnailTextSuggestions : ["WATCH THIS", "YOU WON'T BELIEVE"],
    strategyNote,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip, "title", DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow or upgrade to Pro.` },
        { status: 429 }
      );
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const parsed = titleRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { topic, platform, styles, titleCount, keywords } = parsed.data;

    const rawResult = await groqJSON<TitleOutput>({
      systemPrompt: buildTitleSystemPrompt(),
      userPrompt: buildTitleUserPrompt({ topic, platform: platform as Platform, styles: styles as TitleStyle[], titleCount, keywords }),
      maxTokens: 2200,
      temperature: 0.75,
    });

    const result = sanitizeTitleOutput(rawResult, titleCount);

    return NextResponse.json({ ...result, remaining });
  } catch (err: unknown) {
    console.error("[title/route POST]", err);
    if (err instanceof Error) {
      if (err.message.includes("rate_limit") || err.message.includes("429")) {
        return NextResponse.json({ error: "AI service is busy. Please try again." }, { status: 503 });
      }
      if (err.message.includes("Failed to parse") || err.message.includes("no valid titles")) {
        return NextResponse.json({ error: "AI returned unexpected response. Please retry." }, { status: 502 });
      }
    }
    return NextResponse.json({ error: "Title generation failed. Please try again." }, { status: 500 });
  }
}
