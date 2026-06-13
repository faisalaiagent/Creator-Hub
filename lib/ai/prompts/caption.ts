export type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "facebook";
export type Tone = "motivational" | "casual" | "professional" | "humorous" | "emotional" | "educational";

export interface CaptionOutput {
  short: string;
  long: string;
  hook: string;
  ctas: string[];
  emojis: string[];
  hashtags: string[];
}

const PLATFORM_CONTEXT: Record<Platform, string> = {
  instagram: "Hook in first 125 chars. 3-5 emojis. 15-25 hashtags (3 broad, 5 niche, rest mid-range). End with engagement question or CTA. Use line breaks.",
  tiktok: "First 3 words ARE the hook. Keep short caption punchy. 5-8 trending hashtags. Drive comments. 2-3 emojis max.",
  youtube: "First 100 chars = SEO meta. Primary keyword in first sentence. Full description with structure. 3-5 hashtags at bottom. CTA for subscription + likes.",
  linkedin: "Bold opening statement or insight. One idea per short paragraph. 3-5 relevant hashtags only. End with open-ended question. 1-2 emojis max.",
  twitter: "STRICT 280 char limit for short. Lead with the best idea. Strong active verbs. 1-2 hashtags max. Every word earns its place.",
  facebook: "Conversational and community-oriented. Front-load value in first 3 lines. Ask a question. 1-3 hashtags.",
};

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  motivational: "Powerful action-oriented language. Short punchy sentences. Imperative verbs. Create urgency. Use 'you' directly.",
  casual: "Write like texting a friend. Contractions. Natural and warm. Relatable imperfections OK.",
  professional: "Polished and authoritative. Data and specifics. No slang. Suitable for B2B.",
  humorous: "Witty and self-aware. Light sarcasm and wordplay. Subvert expectations. Subtle is funnier than obvious.",
  emotional: "Vulnerability and authenticity. Share the feeling not just the fact. Create empathy and connection.",
  educational: "Clear, structured, informative. 'Did you know' framing. Break down complex ideas simply.",
};

export function buildCaptionSystemPrompt(): string {
  return `You are an elite social media copywriter who has written captions for creators with 10M+ followers.

Return ONLY a valid JSON object matching this EXACT schema — no preamble, no markdown fences:
{
  "short": "scroll-stopping caption under 150 characters",
  "long": "full caption with line breaks 200-600 chars (Twitter: under 280 strictly)",
  "hook": "single opening hook line under 100 characters",
  "ctas": ["exactly 4 CTA phrases, 3-8 words each, no emojis"],
  "emojis": ["exactly 8 single emoji characters relevant to topic"],
  "hashtags": ["exactly 20 hashtags starting with #, no spaces, mix broad/niche"]
}

Rules: Only JSON. No explanation. hashtags start with #. ctas have no emojis. emojis are single characters only. Short must be genuinely short. Captions must feel human-written.`;
}

export function buildCaptionUserPrompt(opts: {
  topic: string;
  platform: Platform;
  tone: Tone;
  extraContext?: string;
}): string {
  const { topic, platform, tone, extraContext } = opts;
  return `TOPIC: ${topic}
PLATFORM: ${platform.toUpperCase()}
TONE: ${tone.toUpperCase()}
${extraContext ? `EXTRA CONTEXT: ${extraContext}` : ""}

Platform rules: ${PLATFORM_CONTEXT[platform]}
Tone rules: ${TONE_INSTRUCTIONS[tone]}

Generate the JSON caption package now.`;
}
