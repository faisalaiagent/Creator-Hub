import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { groqJSON } from "@/lib/ai/groq";
import {
  buildHashtagSystemPrompt,
  buildHashtagUserPrompt,
  type HashtagOutput,
  type HashtagItem,
  type Platform,
  type TagCategory,
} from "@/lib/ai/prompts/hashtag";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const DAILY_LIMIT = 15;

const hashtagRequestSchema = z.object({
  niche: z.string().min(2, "Niche must be at least 2 characters").max(250).transform((s) => s.trim()),
  platform: z.enum(["instagram", "tiktok", "youtube", "linkedin", "twitter", "pinterest"]),
  categories: z.array(z.enum(["viral", "niche", "broad", "trending"])).min(1).default(["viral", "niche", "broad", "trending"]),
  keywords: z.string().max(500).optional().transform((s) => s?.trim()),
});

function sanitizeHashtagItem(raw: unknown, category: TagCategory): HashtagItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const tag = typeof obj.tag === "string" ? obj.tag.trim() : null;
  if (!tag || tag.length < 2) return null;

  const normalizedTag = tag.startsWith("#") ? tag : `#${tag}`;
  const cleanTag = normalizedTag.replace(/\s+/g, "");

  const difficulty = typeof obj.difficulty === "number" ? Math.min(100, Math.max(0, Math.round(obj.difficulty))) : 50;
  const popularity = typeof obj.popularity === "number" ? Math.min(100, Math.max(0, Math.round(obj.popularity))) : 50;
  const posts = typeof obj.posts === "string" ? obj.posts : undefined;

  return { tag: cleanTag, category, difficulty, popularity, posts };
}

function sanitizeHashtagOutput(raw: unknown): HashtagOutput {
  if (typeof raw !== "object" || raw === null) throw new Error("AI returned non-object");
  const obj = raw as Record<string, unknown>;

  const sanitizeCategory = (key: TagCategory): HashtagItem[] => {
    const arr = obj[key];
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => sanitizeHashtagItem(item, key)).filter((item): item is HashtagItem => item !== null);
  };

  const viral = sanitizeCategory("viral");
  const niche = sanitizeCategory("niche");
  const broad = sanitizeCategory("broad");
  const trending = sanitizeCategory("trending");
  const totalCount = viral.length + niche.length + broad.length + trending.length;

  if (totalCount === 0) throw new Error("AI returned no valid hashtags");

  const strategy = typeof obj.strategy === "string" && obj.strategy.trim().length > 0
    ? obj.strategy.trim().slice(0, 200)
    : "Mix niche and viral hashtags for optimal reach on this platform.";

  return { viral, niche, broad, trending, totalCount, strategy };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip, "hashtag", DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow or upgrade to Pro.` },
        { status: 429 }
      );
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const parsed = hashtagRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { niche, platform, categories, keywords } = parsed.data;

    const rawResult = await groqJSON<HashtagOutput>({
      systemPrompt: buildHashtagSystemPrompt(),
      userPrompt: buildHashtagUserPrompt({ niche, platform: platform as Platform, categories: categories as TagCategory[], keywords }),
      maxTokens: 2000,
      temperature: 0.65,
    });

    const result = sanitizeHashtagOutput(rawResult);

    return NextResponse.json({ ...result, remaining });
  } catch (err: unknown) {
    console.error("[hashtag/route POST]", err);
    if (err instanceof Error) {
      if (err.message.includes("rate_limit") || err.message.includes("429")) {
        return NextResponse.json({ error: "AI service is busy. Please try again." }, { status: 503 });
      }
      if (err.message.includes("no valid hashtags")) {
        return NextResponse.json({ error: "AI couldn't generate hashtags for this niche. Try a different topic." }, { status: 502 });
      }
    }
    return NextResponse.json({ error: "Hashtag generation failed. Please try again." }, { status: 500 });
  }
}
