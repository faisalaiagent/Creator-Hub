"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "pinterest";
export type TagCategory = "viral" | "niche" | "broad" | "trending";

export interface HashtagItem {
  tag: string;
  category: TagCategory;
  difficulty: number;
  popularity: number;
  posts?: string;
}

export interface HashtagResult {
  viral: HashtagItem[];
  niche: HashtagItem[];
  broad: HashtagItem[];
  trending: HashtagItem[];
  totalCount: number;
  strategy: string;
}

export interface SavedSet {
  id: string;
  niche: string;
  platform: Platform;
  tags: string[];
  savedAt: Date;
}

interface UseHashtagGeneratorReturn {
  // Form
  niche: string;
  platform: Platform;
  selectedCategories: TagCategory[];
  keywords: string;
  setNiche: (v: string) => void;
  setPlatform: (v: Platform) => void;
  toggleCategory: (cat: TagCategory) => void;
  setKeywords: (v: string) => void;

  // Generation
  loading: boolean;
  result: HashtagResult | null;
  error: string | null;
  generate: () => Promise<void>;

  // Display filter
  activeCategory: TagCategory | "all";
  setActiveCategory: (v: TagCategory | "all") => void;
  displayTags: HashtagItem[];

  // Selection
  selectedTags: Set<string>;
  selectedCount: number;
  toggleTag: (tag: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Copy
  copiedField: string | null;
  copy: (text: string, field: string) => Promise<void>;
  copySelected: () => void;
  copyCategory: (cat: TagCategory) => void;
  copyAll: () => void;

  // Saved sets
  savedSets: SavedSet[];
  saveCurrentSet: () => void;
  deleteSavedSet: (id: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useHashtagGenerator(): UseHashtagGeneratorReturn {
  // Form
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [selectedCategories, setSelectedCategories] = useState<TagCategory[]>([
    "viral", "niche", "broad", "trending",
  ]);
  const [keywords, setKeywords] = useState("");

  // Generation
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Display filter
  const [activeCategory, setActiveCategory] = useState<TagCategory | "all">("all");

  // Selection
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Copy
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Saved sets
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);

  const toggleCategory = useCallback((cat: TagCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const generate = useCallback(async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedTags(new Set());
    setActiveCategory("all");

    try {
      const res = await fetch("/api/tools/hashtag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), platform, categories: selectedCategories, keywords }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [niche, platform, selectedCategories, keywords]);

  // Display tags based on active category filter
  const displayTags: HashtagItem[] = result
    ? activeCategory === "all"
      ? [...result.viral, ...result.niche, ...result.broad, ...result.trending]
      : result[activeCategory] ?? []
    : [];

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!result) return;
    const all = [...result.viral, ...result.niche, ...result.broad, ...result.trending].map((t) => t.tag);
    setSelectedTags(new Set(all));
  }, [result]);

  const clearSelection = useCallback(() => setSelectedTags(new Set()), []);

  const copy = useCallback(async (text: string, field: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
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

  const copySelected = useCallback(() => {
    copy(Array.from(selectedTags).join(" "), "selected");
  }, [selectedTags, copy]);

  const copyCategory = useCallback((cat: TagCategory) => {
    if (!result) return;
    copy(result[cat].map((t) => t.tag).join(" "), `cat-${cat}`);
  }, [result, copy]);

  const copyAll = useCallback(() => {
    if (!result) return;
    const all = [...result.viral, ...result.niche, ...result.broad, ...result.trending]
      .map((t) => t.tag)
      .join(" ");
    copy(all, "all");
  }, [result, copy]);

  const saveCurrentSet = useCallback(() => {
    if (!result || selectedTags.size === 0) return;
    setSavedSets((prev) =>
      [
        {
          id: crypto.randomUUID(),
          niche: niche.trim(),
          platform,
          tags: Array.from(selectedTags),
          savedAt: new Date(),
        },
        ...prev,
      ].slice(0, 10)
    );
  }, [result, selectedTags, niche, platform]);

  const deleteSavedSet = useCallback((id: string) => {
    setSavedSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    niche, platform, selectedCategories, keywords,
    setNiche, setPlatform, toggleCategory, setKeywords,
    loading, result, error, generate,
    activeCategory, setActiveCategory, displayTags,
    selectedTags, selectedCount: selectedTags.size,
    toggleTag, selectAll, clearSelection,
    copiedField, copy, copySelected, copyCategory, copyAll,
    savedSets, saveCurrentSet, deleteSavedSet,
  };
}
