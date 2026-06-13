// ─── Types ────────────────────────────────────────────────────────────────────
export type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "pinterest";
export type TagCategory = "viral" | "niche" | "broad" | "trending";

export interface HashtagItem {
  tag: string;         // e.g. "#fitness"
  category: TagCategory;
  difficulty: number;  // 0–100 (higher = more competition)
  popularity: number;  // 0–100 (higher = more posts/usage)
  posts?: string;      // Optional human-readable count e.g. "2.3M"
}

export interface HashtagOutput {
  viral: HashtagItem[];
  niche: HashtagItem[];
  broad: HashtagItem[];
  trending: HashtagItem[];
  totalCount: number;
  strategy: string;    // One-sentence strategy note for this niche + platform combo
}

// ─── Platform context ─────────────────────────────────────────────────────────
const PLATFORM_HASHTAG_RULES: Record<Platform, string> = {
  instagram: `
- Instagram supports up to 30 hashtags. Generate exactly that.
- Mix: 5 broad (1M+ posts), 8 mid-range (100K–1M), 10 niche (10K–100K), 7 very niche/community (<10K)
- Avoid banned hashtags. Never use #like4like, #followme, #l4l (shadow-ban risk)
- Use singular versions often: #photographer not #photographers
- Capitalise for accessibility: #MorningWorkout not #morningworkout
`,
  tiktok: `
- TikTok recommends 3–10 hashtags. Generate 10.
- Always include: 2 mega-viral (#fyp, #foryoupage or niche equivalent), 3 niche, 2 trending, 3 content-specific
- TikTok hashtags influence the FYP algorithm heavily — prioritise discoverability over volume
- Keep them concise — TikTok users scan fast
`,
  youtube: `
- YouTube tags are SEO keywords, not social hashtags — treat them differently
- Generate 15 tags. First 3 appear above the video title — make them count
- Mix: exact-match title keywords, broader topic keywords, long-tail variations
- Include both #hashtag and plain keyword variations
`,
  linkedin: `
- LinkedIn is very conservative with hashtags. Generate exactly 5.
- Choose only the most authoritative, professional hashtags for the topic
- Avoid overly broad (#marketing) unless highly relevant — specificity wins
- CamelCase for multi-word: #ContentMarketing not #contentmarketing
`,
  twitter: `
- Twitter users see hashtags as interruptions — less is more
- Generate 5, with the expectation that only 1–2 will be used
- Trending hashtags change hourly on Twitter — focus on topic-specific ones that last
- Keep short: #SEO not #SearchEngineOptimization
`,
  pinterest: `
- Pinterest is a search engine — hashtags are keywords
- Generate 20 hashtags. Mix: 5 broad, 8 medium, 7 specific/niche
- Pinterest hashtag search is separate from pin search — use both styles
- Focus on inspirational, aspirational, and instructional terms
`,
};

// ─── System prompt ────────────────────────────────────────────────────────────
export function buildHashtagSystemPrompt(): string {
  return `You are a world-class social media strategist and hashtag researcher with deep expertise in platform algorithms, content discovery, and niche community building. You have studied hashtag performance data for millions of creators across all major platforms.

You generate hashtag sets that are:
- Platform-native and algorithm-aware
- Strategically categorised for maximum reach + engagement
- Accurately scored for competitive difficulty and popularity
- Varied enough to avoid shadow-ban clustering

Return ONLY a valid JSON object matching this EXACT schema (no preamble, no markdown, no explanations):
{
  "viral": [
    { "tag": "#hashtag", "category": "viral", "difficulty": 85, "popularity": 90, "posts": "12.4M" }
  ],
  "niche": [
    { "tag": "#hashtag", "category": "niche", "difficulty": 30, "popularity": 45, "posts": "87K" }
  ],
  "broad": [
    { "tag": "#hashtag", "category": "broad", "difficulty": 70, "popularity": 80, "posts": "5.1M" }
  ],
  "trending": [
    { "tag": "#hashtag", "category": "trending", "difficulty": 55, "popularity": 75, "posts": "432K" }
  ],
  "totalCount": 24,
  "strategy": "One sentence of strategic advice for this niche+platform combination."
}

RULES:
- Every tag must start with # and be one word (CamelCase for multi-word)
- difficulty: 0–100 integer (100 = dominated by huge accounts, nearly impossible to rank)
- popularity: 0–100 integer (100 = billions of posts, 0 = almost no posts)
- posts: human-readable string like "2.3M", "450K", "12.8B" — estimate realistically based on niche
- Each category array must have at least 4 tags
- totalCount must equal the actual sum of all arrays
- strategy: max 120 characters, actionable and specific to the niche+platform
- Do NOT include banned, NSFW, or shadow-ban-risk tags
- Tags must be genuinely relevant to the niche — not generic filler`;
}

// ─── User prompt ──────────────────────────────────────────────────────────────
export function buildHashtagUserPrompt(opts: {
  niche: string;
  platform: Platform;
  categories: TagCategory[];
  keywords?: string;
}): string {
  const { niche, platform, categories, keywords } = opts;

  const platformRules = PLATFORM_HASHTAG_RULES[platform];
  const catInstructions = categories.length < 4
    ? `Focus on these categories only: ${categories.join(", ")}. Still include at least 4 tags per requested category.`
    : "Include all four categories (viral, niche, broad, trending).";

  return `Generate a complete hashtag set for:

NICHE / TOPIC: ${niche}
PLATFORM: ${platform.toUpperCase()}
${keywords ? `SEED KEYWORDS: ${keywords}` : ""}

PLATFORM-SPECIFIC RULES:
${platformRules}

CATEGORY INSTRUCTIONS:
${catInstructions}

DIFFICULTY SCORING GUIDE:
- 80–100: Dominated by verified accounts, celebrities, brands with millions of followers
- 60–79: Competitive but accessible to established mid-tier creators (50K–500K followers)
- 40–59: Achievable for growing creators (5K–50K followers)
- 20–39: Easily rankable for small creators (500–5K followers)
- 0–19: Very niche, emerging, or underused tag — fast ranking potential

POPULARITY SCORING GUIDE:
- 80–100: Billions to hundreds of millions of posts
- 60–79: Tens of millions of posts
- 40–59: Millions of posts
- 20–39: Hundreds of thousands of posts
- 0–19: Tens of thousands or fewer posts

Generate the JSON hashtag set now. Be realistic with scores — don't inflate difficulty or popularity.`;
}
