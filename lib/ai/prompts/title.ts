export type TitleStyle = "seo" | "clickable" | "emotional" | "curiosity" | "shorts" | "listicle";
export type Platform = "youtube" | "tiktok" | "instagram" | "blog";

export interface TitleItem {
  title: string;
  style: TitleStyle;
  ctrScore: number;
  seoScore: number;
  charCount: number;
  explanation: string;
}

export interface TitleOutput {
  titles: TitleItem[];
  topPick: number;
  keywords: string[];
  thumbnailTextSuggestions: string[];
  strategyNote: string;
}

const STYLE_TECHNIQUES: Record<TitleStyle, string> = {
  seo: "Front-load primary keyword in first 40 chars. Match search intent (how-to, best, vs, guide). Numbers/years add specificity.",
  clickable: "Strong emotional trigger or visual promise. Power words (Insane, Shocking, Proven). Promise transformation/result. Specificity beats vagueness.",
  emotional: "Tap into identity, fear, hope, nostalgia. Use 'you'. Reference shared struggle or aspiration.",
  curiosity: "Create an open loop - withhold key info. Use 'why', 'what happens when', 'the truth about'. Never fully answer in the title.",
  shorts: "Under 40 chars ideally. Punchy, no fluff. Works as on-screen text overlay too.",
  listicle: "Specific odd number (7, 13, 23 not 10) for credibility. Clear scannable structure. 'X Ways To', 'X Things I Wish I Knew'.",
};

const PLATFORM_TITLE_RULES: Record<Platform, string> = {
  youtube: "Max 100 chars, ~60 show in search, ~40 on mobile thumbnails. Front-load keywords AND hooks. Title+thumbnail work together.",
  tiktok: "Caption-as-title, first 1-2 lines matter before 'more'. Conversational, lowercase often performs well.",
  instagram: "First line is the hook before 'more' cutoff (~125 chars). Reels overlay - keep to 1 short punchy line.",
  blog: "SEO title tag ideal 50-60 chars. Primary keyword near start. Optimized for search CTR.",
};

export function buildTitleSystemPrompt(): string {
  return `You are an elite YouTube strategist and copywriter who has written titles for channels with hundreds of millions of views.

Return ONLY a valid JSON object matching this EXACT schema (no preamble, no markdown):
{
  "titles": [
    { "title": "string", "style": "seo|clickable|emotional|curiosity|shorts|listicle", "ctrScore": 82, "seoScore": 65, "charCount": 47, "explanation": "max 130 chars - why this works" }
  ],
  "topPick": 0,
  "keywords": ["primary keyword", "secondary keyword"],
  "thumbnailTextSuggestions": ["2-5 word overlay text", "..."],
  "strategyNote": "max 180 chars - one actionable insight"
}

SCORING:
ctrScore 0-100: probability of click given impression (85+=irresistible, 70-84=strong, 50-69=solid, under 50=generic)
seoScore 0-100: search discoverability (85+=matches high-intent queries, 70-84=good keyword presence, under 50=no searchable keywords)

RULES: charCount = EXACT character count of title string. Generate exactly the requested number with variety. keywords: 5-8 items. thumbnailTextSuggestions: 3-5 items. Never use "Unlock the secrets", "Dive into", or other generic AI phrases. No undeliverable clickbait. Vary structure and length across titles.`;
}

export function buildTitleUserPrompt(opts: {
  topic: string;
  platform: Platform;
  styles: TitleStyle[];
  titleCount: number;
  keywords?: string;
}): string {
  const { topic, platform, styles, titleCount, keywords } = opts;
  const styleInstructions = styles.map((s) => `${s.toUpperCase()}: ${STYLE_TECHNIQUES[s]}`).join("\n");
  const distribution = titleCount <= styles.length
    ? `Generate ${titleCount} titles, one per style from: ${styles.join(", ")}`
    : `Generate ${titleCount} titles distributed across: ${styles.join(", ")}. Prioritise styles best fitting the topic.`;

  return `TOPIC: ${topic}
PLATFORM: ${platform.toUpperCase()}
${keywords ? `TARGET KEYWORDS: ${keywords}` : ""}

PLATFORM RULES: ${PLATFORM_TITLE_RULES[platform]}

STYLE TECHNIQUES:
${styleInstructions}

${distribution}

Score honestly - not every title should be 90+. Generate the JSON now.`;
}
