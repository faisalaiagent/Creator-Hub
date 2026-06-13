"use client";

import { useState, useCallback } from "react";

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

export interface TitleResult {
  titles: TitleItem[];
  topPick: number;
  keywords: string[];
  thumbnailTextSuggestions: string[];
  strategyNote: string;
}

export interface SavedTitle {
  id: string;
  topic: string;
  title: TitleItem;
  savedAt: Date;
}

interface UseTitleGeneratorReturn {
  topic: string; platform: Platform; selectedStyles: TitleStyle[]; titleCount: number; keywords: string;
  setTopic: (v: string) => void; setPlatform: (v: Platform) => void; toggleStyle: (s: TitleStyle) => void;
  setTitleCount: (v: number) => void; setKeywords: (v: string) => void;
  loading: boolean; result: TitleResult | null; error: string | null; generate: () => Promise<void>;
  copiedId: string | null; copy: (text: string, id: string) => Promise<void>; copyAll: () => void;
  savedTitles: SavedTitle[]; toggleSave: (item: TitleItem, idx: number) => void; isSaved: (idx: number) => boolean;
}

export function useTitleGenerator(): UseTitleGeneratorReturn {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [selectedStyles, setSelectedStyles] = useState<TitleStyle[]>(["seo", "clickable", "curiosity"]);
  const [titleCount, setTitleCount] = useState(5);
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TitleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedTitles, setSavedTitles] = useState<SavedTitle[]>([]);

  const toggleStyle = useCallback((style: TitleStyle) => {
    setSelectedStyles((prev) => prev.includes(style) ? (prev.length > 1 ? prev.filter((s) => s !== style) : prev) : [...prev, style]);
  }, []);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/tools/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), platform, styles: selectedStyles, titleCount, keywords: keywords.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [topic, platform, selectedStyles, titleCount, keywords]);

  const copy = useCallback(async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const copyAll = useCallback(() => {
    if (!result) return;
    copy(result.titles.map((t, i) => `${i + 1}. ${t.title}`).join("\n"), "all");
  }, [result, copy]);

  const toggleSave = useCallback((item: TitleItem, idx: number) => {
    const id = `saved-${idx}`;
    setSavedTitles((prev) => prev.some((s) => s.id === id) ? prev.filter((s) => s.id !== id) : [{ id, topic: topic.trim(), title: item, savedAt: new Date() }, ...prev].slice(0, 20));
  }, [topic]);

  const isSaved = useCallback((idx: number) => savedTitles.some((s) => s.id === `saved-${idx}`), [savedTitles]);

  return {
    topic, platform, selectedStyles, titleCount, keywords,
    setTopic, setPlatform, toggleStyle, setTitleCount, setKeywords,
    loading, result, error, generate,
    copiedId, copy, copyAll,
    savedTitles, toggleSave, isSaved,
  };
}
