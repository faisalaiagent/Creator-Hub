"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "facebook";
export type Tone = "motivational" | "casual" | "professional" | "humorous" | "emotional" | "educational";
export type CaptionLength = "short" | "long";

export interface CaptionResult {
  short: string;
  long: string;
  hook: string;
  ctas: string[];
  emojis: string[];
  hashtags: string[];
}

export interface HistoryItem {
  id: string;
  topic: string;
  platform: Platform;
  tone: Tone;
  result: CaptionResult;
  createdAt: Date;
  saved: boolean;
}

interface UseCaptionGeneratorReturn {
  // Form
  topic: string;
  platform: Platform;
  tone: Tone;
  extraContext: string;
  setTopic: (v: string) => void;
  setPlatform: (v: Platform) => void;
  setTone: (v: Tone) => void;
  setExtraContext: (v: string) => void;

  // Generation
  loading: boolean;
  result: CaptionResult | null;
  error: string | null;
  activeLength: CaptionLength;
  setActiveLength: (v: CaptionLength) => void;
  generate: () => Promise<void>;
  reset: () => void;

  // Clipboard
  copiedField: string | null;
  copy: (text: string, field: string) => Promise<void>;
  copyFull: () => void;

  // History
  history: HistoryItem[];
  toggleSaved: (id: string) => void;
  restoreFromHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCaptionGenerator(): UseCaptionGeneratorReturn {
  // Form
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState<Tone>("casual");
  const [extraContext, setExtraContext] = useState("");

  // Generation
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLength, setActiveLength] = useState<CaptionLength>("short");

  // Clipboard
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // History (client-side; for server-persisted, use the GET endpoint)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), platform, tone, extraContext }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setResult(data);
      setActiveLength("short");

      // Prepend to local history
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          topic: topic.trim(),
          platform,
          tone,
          result: data,
          createdAt: new Date(),
          saved: false,
        },
        ...prev,
      ].slice(0, 20));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [topic, platform, tone, extraContext]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setTopic("");
    setExtraContext("");
  }, []);

  const copy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const copyFull = useCallback(() => {
    if (!result) return;
    const caption = activeLength === "short" ? result.short : result.long;
    const hashStr = result.hashtags.slice(0, 15).join(" ");
    copy(`${caption}\n\n${hashStr}`, "full");
  }, [result, activeLength, copy]);

  const toggleSaved = useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, saved: !h.saved } : h))
    );
  }, []);

  const restoreFromHistory = useCallback((item: HistoryItem) => {
    setTopic(item.topic);
    setPlatform(item.platform);
    setTone(item.tone);
    setResult(item.result);
    setActiveLength("short");
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    topic, platform, tone, extraContext,
    setTopic, setPlatform, setTone, setExtraContext,
    loading, result, error, activeLength, setActiveLength,
    generate, reset,
    copiedField, copy, copyFull,
    history, toggleSaved, restoreFromHistory, clearHistory,
  };
}
