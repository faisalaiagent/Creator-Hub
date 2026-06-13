import Groq from "groq-sdk";

let _groq: Groq | null = null;

export function getGroqClient(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  }
  return _groq;
}

export interface GroqCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export async function groqCompletion(opts: GroqCompletionOptions): Promise<string> {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model: opts.model ?? "llama-3.3-70b-versatile",
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.75,
    response_format: opts.jsonMode ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: opts.systemPrompt },
      { role: "user", content: opts.userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  return content;
}

export async function groqJSON<T>(opts: Omit<GroqCompletionOptions, "jsonMode">): Promise<T> {
  const raw = await groqCompletion({ ...opts, jsonMode: true });
  const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    throw new Error(`Failed to parse Groq JSON: ${clean.slice(0, 200)}`);
  }
}
