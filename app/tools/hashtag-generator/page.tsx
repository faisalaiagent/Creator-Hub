"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Sparkles, Copy, Check, ChevronLeft, Loader2,
  RefreshCw, TrendingUp, Target, Layers, Zap,
  BarChart2, ArrowRight, X, BookmarkPlus, BookmarkCheck,
  ChevronDown, AlertCircle, Search,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "pinterest";
type TagCategory = "viral" | "niche" | "broad" | "trending";

interface HashtagItem {
  tag: string;
  category: TagCategory;
  difficulty: number;    // 0–100
  popularity: number;    // 0–100
  posts?: string;        // e.g. "2.3M"
}

interface HashtagResult {
  viral: HashtagItem[];
  niche: HashtagItem[];
  broad: HashtagItem[];
  trending: HashtagItem[];
  totalCount: number;
  strategy: string;
}

interface SavedSet {
  id: string;
  niche: string;
  platform: Platform;
  tags: string[];
  savedAt: Date;
}

// ── Platform config ────────────────────────────────────────────────────────────
const PLATFORMS: { value: Platform; label: string; color: string; maxTags: number; tip: string }[] = [
  { value: "instagram", label: "Instagram", color: "#E1306C", maxTags: 30, tip: "Use all 30 for max reach" },
  { value: "tiktok", label: "TikTok", color: "#010101", maxTags: 10, tip: "5–10 targeted tags work best" },
  { value: "youtube", label: "YouTube", color: "#FF0000", maxTags: 15, tip: "Tags go in description footer" },
  { value: "linkedin", label: "LinkedIn", color: "#0A66C2", maxTags: 5, tip: "3–5 highly relevant only" },
  { value: "twitter", label: "Twitter / X", color: "#1DA1F2", maxTags: 3, tip: "2–3 max to avoid spam look" },
  { value: "pinterest", label: "Pinterest", color: "#E60023", maxTags: 20, tip: "Mix broad + niche pins" },
];

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES: { value: TagCategory; label: string; icon: React.ReactNode; desc: string; accent: string }[] = [
  { value: "viral", label: "Viral", icon: <Zap size={13} />, desc: "High reach, high competition", accent: "#F59E0B" },
  { value: "niche", label: "Niche", icon: <Target size={13} />, desc: "Targeted, engaged audience", accent: "#10B981" },
  { value: "broad", label: "Broad", icon: <Layers size={13} />, desc: "Wide discovery potential", accent: "#6366F1" },
  { value: "trending", label: "Trending", icon: <TrendingUp size={13} />, desc: "Momentum right now", accent: "#EF4444" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function difficultyLabel(score: number): string {
  if (score >= 80) return "Very Hard";
  if (score >= 60) return "Hard";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Easy";
  return "Very Easy";
}

function difficultyColor(score: number): string {
  if (score >= 80) return "#EF4444";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#6366F1";
  return "#10B981";
}

function popularitySize(score: number): string {
  if (score >= 80) return "text-base";
  if (score >= 60) return "text-sm";
  if (score >= 40) return "text-sm";
  return "text-xs";
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HashtagGeneratorPage() {
  // Form
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [selectedCategories, setSelectedCategories] = useState<TagCategory[]>(["viral", "niche", "broad", "trending"]);
  const [keywords, setKeywords] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TagCategory | "all">("all");

  // Selection
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Saved sets
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activePlatform = PLATFORMS.find((p) => p.value === platform)!;

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!niche.trim()) { inputRef.current?.focus(); return; }
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
  };

  // ── Tag selection ───────────────────────────────────────────────────────────
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const selectAll = () => {
    if (!result) return;
    const all = getAllTags().map((t) => t.tag);
    setSelectedTags(new Set(all));
  };

  const clearSelection = () => setSelectedTags(new Set());

  const getAllTags = (): HashtagItem[] => {
    if (!result) return [];
    const all = [...result.viral, ...result.niche, ...result.broad, ...result.trending];
    if (activeCategory === "all") return all;
    return result[activeCategory] ?? [];
  };

  // ── Copy ────────────────────────────────────────────────────────────────────
  const copy = useCallback(async (text: string, field: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const copySelected = () => {
    const tags = Array.from(selectedTags).join(" ");
    copy(tags, "selected");
  };

  const copyCategory = (cat: TagCategory) => {
    if (!result) return;
    const tags = result[cat].map((t) => t.tag).join(" ");
    copy(tags, `cat-${cat}`);
  };

  const copyAll = () => {
    if (!result) return;
    const all = getAllTags().map((t) => t.tag).join(" ");
    copy(all, "all");
  };

  // ── Save set ────────────────────────────────────────────────────────────────
  const saveCurrentSet = () => {
    if (!result || selectedTags.size === 0) return;
    const newSet: SavedSet = {
      id: crypto.randomUUID(),
      niche: niche.trim(),
      platform,
      tags: Array.from(selectedTags),
      savedAt: new Date(),
    };
    setSavedSets((prev) => [newSet, ...prev].slice(0, 10));
  };

  const deleteSavedSet = (id: string) => setSavedSets((prev) => prev.filter((s) => s.id !== id));

  const toggleCategory = (cat: TagCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const displayTags = getAllTags();
  const maxTagsForPlatform = activePlatform.maxTags;
  const selectedCount = selectedTags.size;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #FEFCF7 0%, #FEF9EC 40%, #FFF8F0 100%)",
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      {/* ── Subtle grid texture ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#92400E 0,#92400E 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#92400E 0,#92400E 1px,transparent 1px,transparent 40px)",
        }}
      />

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-20"
        style={{
          background: "rgba(254,252,247,0.9)",
          borderBottom: "1px solid rgba(180,120,60,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools" className="transition-colors" style={{ color: "rgba(120,80,30,0.4)" }}>
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
              >
                <Hash size={13} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>
                  Hashtag Generator
                </p>
                <p className="text-[10px]" style={{ color: "rgba(120,80,30,0.5)" }}>
                  Groq · llama-3.3-70b
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="relative text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: showSaved ? "rgba(245,158,11,0.12)" : "rgba(180,120,60,0.06)",
                color: showSaved ? "#D97706" : "rgba(120,80,30,0.5)",
                border: showSaved ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
              }}
            >
              <BookmarkPlus size={13} className="inline mr-1.5" />
              Saved
              {savedSets.length > 0 && (
                <span
                  className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.2)", color: "#D97706" }}
                >
                  {savedSets.length}
                </span>
              )}
            </button>
            <span
              className="text-[11px] px-3 py-1.5 rounded-full"
              style={{ background: "rgba(180,120,60,0.07)", color: "rgba(120,80,30,0.45)" }}
            >
              8 / 10 today
            </span>
            <Link
              href="/pricing"
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
            >
              Upgrade
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-8 relative">

        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Hash size={12} style={{ color: "#D97706" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#D97706" }}>
              Creator Utility Suite
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1C1008", letterSpacing: "-0.02em" }}>
            Hashtag Generator
          </h1>
          <p className="text-sm" style={{ color: "rgba(120,80,30,0.6)" }}>
            Generate viral, niche, broad & trending hashtags with difficulty and popularity scores. Pick your platform, build your set.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">

          {/* ── LEFT: Controls ── */}
          <div className="space-y-3">

            {/* Niche input */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)", boxShadow: "0 1px 8px rgba(180,120,60,0.06)" }}
            >
              <div className="px-4 pt-4 pb-3">
                <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(120,80,30,0.7)" }}>
                  Your niche or topic
                </label>
                <textarea
                  ref={inputRef}
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. fitness motivation, vegan recipes, digital art, travel photography..."
                  rows={2}
                  className="w-full resize-none text-sm outline-none leading-relaxed placeholder:text-amber-200"
                  style={{ color: "#1C1008", caretColor: "#F59E0B", background: "transparent" }}
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate(); }}
                />
              </div>
              <div
                className="px-4 pb-3 flex justify-between items-center"
                style={{ borderTop: "1px solid rgba(180,120,60,0.07)" }}
              >
                <span className="text-[10px]" style={{ color: "rgba(180,120,60,0.35)" }}>⌘+Enter to generate</span>
                <span className="text-[10px]" style={{ color: niche.length > 200 ? "#F59E0B" : "rgba(180,120,60,0.35)" }}>
                  {niche.length}/250
                </span>
              </div>
            </div>

            {/* Platform selector */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)", boxShadow: "0 1px 8px rgba(180,120,60,0.06)" }}
            >
              <label className="block text-xs font-semibold mb-3" style={{ color: "rgba(120,80,30,0.7)" }}>
                Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className="flex flex-col items-start gap-1 px-2.5 py-2.5 rounded-xl transition-all"
                    style={{
                      background: platform === p.value ? `${p.color}12` : "rgba(180,120,60,0.03)",
                      border: platform === p.value ? `1.5px solid ${p.color}50` : "1px solid rgba(180,120,60,0.08)",
                    }}
                  >
                    <span className="text-xs font-semibold" style={{ color: platform === p.value ? p.color : "#1C1008" }}>
                      {p.label}
                    </span>
                    <span className="text-[9px]" style={{ color: "rgba(120,80,30,0.4)" }}>
                      max {p.maxTags} tags
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-2.5 px-1" style={{ color: "rgba(120,80,30,0.5)" }}>
                💡 {activePlatform.tip}
              </p>
            </div>

            {/* Category toggles */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)", boxShadow: "0 1px 8px rgba(180,120,60,0.06)" }}
            >
              <label className="block text-xs font-semibold mb-3" style={{ color: "rgba(120,80,30,0.7)" }}>
                Tag categories to generate
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left"
                    style={{
                      background: selectedCategories.includes(cat.value) ? `${cat.accent}10` : "rgba(180,120,60,0.03)",
                      border: selectedCategories.includes(cat.value)
                        ? `1.5px solid ${cat.accent}40`
                        : "1px solid rgba(180,120,60,0.08)",
                    }}
                  >
                    <span style={{ color: selectedCategories.includes(cat.value) ? cat.accent : "rgba(120,80,30,0.4)" }}>
                      {cat.icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#1C1008" }}>{cat.label}</p>
                      <p className="text-[9px]" style={{ color: "rgba(120,80,30,0.45)" }}>{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)", boxShadow: "0 1px 8px rgba(180,120,60,0.06)" }}
            >
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-3.5"
              >
                <span className="text-xs font-semibold" style={{ color: "rgba(120,80,30,0.6)" }}>
                  Seed keywords (optional)
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    color: "rgba(120,80,30,0.35)",
                    transform: showAdvanced ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(180,120,60,0.07)" }}>
                      <p className="text-[11px] my-2.5" style={{ color: "rgba(120,80,30,0.45)" }}>
                        Add specific keywords to seed the generation (comma-separated).
                      </p>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g. meal prep, weight loss, HIIT"
                        className="w-full text-sm outline-none rounded-xl px-3 py-2.5"
                        style={{
                          background: "rgba(180,120,60,0.04)",
                          border: "1px solid rgba(180,120,60,0.1)",
                          color: "#1C1008",
                          caretColor: "#F59E0B",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !niche.trim()}
              className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  loading || !niche.trim()
                    ? "rgba(180,120,60,0.1)"
                    : "linear-gradient(135deg,#F59E0B,#D97706)",
                color: loading || !niche.trim() ? "rgba(120,80,30,0.4)" : "white",
                boxShadow: loading || !niche.trim() ? "none" : "0 4px 20px rgba(245,158,11,0.35)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating hashtags...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate hashtags
                  <span className="text-xs opacity-70 font-normal">({activePlatform.label})</span>
                </>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", color: "#DC2626" }}
              >
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Output ── */}
          <div>
            <AnimatePresence mode="wait">

              {/* Empty state */}
              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl flex flex-col items-center justify-center text-center py-20"
                  style={{ background: "white", border: "1.5px dashed rgba(180,120,60,0.15)" }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.12),rgba(217,119,6,0.08))" }}
                  >
                    <Hash size={28} style={{ color: "#F59E0B" }} />
                  </div>
                  <p className="text-base font-bold mb-2" style={{ color: "#1C1008" }}>No hashtags yet</p>
                  <p className="text-sm mb-6 max-w-xs" style={{ color: "rgba(120,80,30,0.5)" }}>
                    Enter your niche, pick a platform, and generate a full set of scored hashtags.
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-sm px-4">
                    {["fitness & wellness", "food photography", "travel vlogs", "digital art"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setNiche(ex)}
                        className="text-xs px-3 py-2 rounded-xl text-left transition-all capitalize"
                        style={{
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.15)",
                          color: "#D97706",
                        }}
                      >
                        <Hash size={10} className="inline mr-1.5" />
                        {ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-6"
                  style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-xl" style={{ background: "rgba(245,158,11,0.1)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={20} style={{ color: "#F59E0B" }} className="animate-spin" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>Generating hashtag set...</p>
                      <p className="text-xs" style={{ color: "rgba(120,80,30,0.45)" }}>
                        Scoring difficulty & popularity for {activePlatform.label}
                      </p>
                    </div>
                  </div>
                  {/* Skeleton tag cloud */}
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full animate-pulse"
                        style={{
                          height: 30,
                          width: [80, 100, 65, 120, 90, 75, 110, 85][i % 8],
                          background: "rgba(180,120,60,0.07)",
                          animationDelay: `${i * 0.04}s`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Stats bar */}
                  <div
                    className="rounded-2xl p-4 grid grid-cols-4 gap-3"
                    style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)" }}
                  >
                    {[
                      { label: "Total tags", value: result.totalCount, icon: <Hash size={14} /> },
                      { label: "Viral", value: result.viral.length, icon: <Zap size={14} /> },
                      { label: "Niche", value: result.niche.length, icon: <Target size={14} /> },
                      { label: "Selected", value: selectedCount, icon: <Check size={14} /> },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="flex justify-center mb-1" style={{ color: "#F59E0B" }}>{s.icon}</div>
                        <p className="text-xl font-bold" style={{ color: "#1C1008" }}>{s.value}</p>
                        <p className="text-[10px]" style={{ color: "rgba(120,80,30,0.5)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Strategy note */}
                  {result.strategy && (
                    <div
                      className="rounded-2xl px-4 py-3 flex items-start gap-2.5"
                      style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
                    >
                      <Sparkles size={14} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
                      <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
                        <span className="font-semibold">Strategy: </span>{result.strategy}
                      </p>
                    </div>
                  )}

                  {/* Category filter + actions */}
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)" }}
                  >
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                      {[{ value: "all" as const, label: "All tags", count: result.totalCount }, ...CATEGORIES].map((cat) => {
                        const count = cat.value === "all" ? result.totalCount : result[cat.value as TagCategory]?.length ?? 0;
                        const accent = cat.value === "all" ? "#F59E0B" : (CATEGORIES.find(c => c.value === cat.value)?.accent ?? "#F59E0B");
                        const isActive = activeCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                            style={{
                              background: isActive ? `${accent}15` : "rgba(180,120,60,0.04)",
                              color: isActive ? accent : "rgba(120,80,30,0.5)",
                              border: isActive ? `1.5px solid ${accent}40` : "1px solid rgba(180,120,60,0.08)",
                            }}
                          >
                            {"icon" in cat && cat.icon}
                            {cat.label}
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ background: isActive ? `${accent}20` : "rgba(180,120,60,0.07)", color: isActive ? accent : "rgba(120,80,30,0.4)" }}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selection controls */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={selectAll}
                          className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                          style={{ background: "rgba(245,158,11,0.08)", color: "#D97706" }}
                        >
                          Select all
                        </button>
                        {selectedCount > 0 && (
                          <button
                            onClick={clearSelection}
                            className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                            style={{ background: "rgba(180,120,60,0.06)", color: "rgba(120,80,30,0.5)" }}
                          >
                            Clear ({selectedCount})
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {activeCategory !== "all" && (
                          <button
                            onClick={() => copyCategory(activeCategory as TagCategory)}
                            className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                            style={{
                              background: copiedField === `cat-${activeCategory}` ? "rgba(245,158,11,0.15)" : "rgba(180,120,60,0.06)",
                              color: copiedField === `cat-${activeCategory}` ? "#D97706" : "rgba(120,80,30,0.5)",
                            }}
                          >
                            {copiedField === `cat-${activeCategory}` ? <Check size={10} /> : <Copy size={10} />}
                            Copy group
                          </button>
                        )}
                        <button
                          onClick={copyAll}
                          className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                          style={{
                            background: copiedField === "all" ? "rgba(245,158,11,0.15)" : "rgba(180,120,60,0.06)",
                            color: copiedField === "all" ? "#D97706" : "rgba(120,80,30,0.5)",
                          }}
                        >
                          {copiedField === "all" ? <Check size={10} /> : <Copy size={10} />}
                          Copy all
                        </button>
                      </div>
                    </div>

                    {/* Tag cloud */}
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {displayTags.map((item, i) => {
                          const isSelected = selectedTags.has(item.tag);
                          const catAccent = CATEGORIES.find((c) => c.value === item.category)?.accent ?? "#F59E0B";
                          return (
                            <motion.button
                              key={item.tag}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.025, duration: 0.2 }}
                              onClick={() => toggleTag(item.tag)}
                              className={cn("relative flex items-center gap-1.5 rounded-full transition-all font-medium", popularitySize(item.popularity))}
                              style={{
                                padding: item.popularity >= 70 ? "6px 14px" : "5px 11px",
                                background: isSelected
                                  ? `${catAccent}20`
                                  : "rgba(180,120,60,0.05)",
                                border: isSelected
                                  ? `1.5px solid ${catAccent}60`
                                  : "1px solid rgba(180,120,60,0.12)",
                                color: isSelected ? catAccent : "#1C1008",
                                boxShadow: isSelected ? `0 2px 8px ${catAccent}25` : "none",
                              }}
                            >
                              {item.tag}
                              {isSelected && <Check size={10} />}
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Per-category detail cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CATEGORIES.filter((cat) => result[cat.value]?.length > 0).map((cat) => (
                      <div
                        key={cat.value}
                        className="rounded-2xl p-4"
                        style={{ background: "white", border: "1px solid rgba(180,120,60,0.1)" }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span style={{ color: cat.accent }}>{cat.icon}</span>
                            <span className="text-xs font-bold" style={{ color: "#1C1008" }}>{cat.label} tags</span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ background: `${cat.accent}15`, color: cat.accent }}
                            >
                              {result[cat.value].length}
                            </span>
                          </div>
                          <button
                            onClick={() => copyCategory(cat.value)}
                            className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                            style={{
                              background: copiedField === `cat-${cat.value}` ? `${cat.accent}15` : "rgba(180,120,60,0.05)",
                              color: copiedField === `cat-${cat.value}` ? cat.accent : "rgba(120,80,30,0.4)",
                            }}
                          >
                            {copiedField === `cat-${cat.value}` ? <Check size={9} /> : <Copy size={9} />}
                            Copy
                          </button>
                        </div>

                        {/* Tag rows with scores */}
                        <div className="space-y-2">
                          {result[cat.value].slice(0, 5).map((item) => (
                            <div key={item.tag} className="flex items-center gap-2">
                              <button
                                onClick={() => toggleTag(item.tag)}
                                className="text-xs font-medium flex-1 text-left truncate transition-colors"
                                style={{ color: selectedTags.has(item.tag) ? cat.accent : "#1C1008" }}
                              >
                                {selectedTags.has(item.tag) && <Check size={9} className="inline mr-1" />}
                                {item.tag}
                              </button>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Difficulty */}
                                <div className="flex items-center gap-1">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{ width: 40, background: "rgba(180,120,60,0.1)" }}
                                  >
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${item.difficulty}%`,
                                        background: difficultyColor(item.difficulty),
                                      }}
                                    />
                                  </div>
                                  <span className="text-[9px]" style={{ color: difficultyColor(item.difficulty) }}>
                                    {difficultyLabel(item.difficulty)}
                                  </span>
                                </div>
                                {/* Popularity */}
                                <div className="flex items-center gap-0.5">
                                  <BarChart2 size={9} style={{ color: "rgba(120,80,30,0.35)" }} />
                                  <span className="text-[9px]" style={{ color: "rgba(120,80,30,0.4)" }}>
                                    {item.posts ?? `${item.popularity}%`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Copy selected + save CTA */}
                  {selectedCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-4 flex items-center gap-3"
                      style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.05))", border: "1.5px solid rgba(245,158,11,0.25)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: "#92400E" }}>
                          {selectedCount} tag{selectedCount !== 1 ? "s" : ""} selected
                          {selectedCount > maxTagsForPlatform && (
                            <span className="ml-2 text-[10px] text-orange-500">
                              ({selectedCount - maxTagsForPlatform} over {activePlatform.label} limit)
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: "rgba(120,80,30,0.55)" }}>
                          {Array.from(selectedTags).slice(0, 5).join(" ")}
                          {selectedCount > 5 && ` +${selectedCount - 5} more`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={saveCurrentSet}
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            color: "#D97706",
                            border: "1px solid rgba(245,158,11,0.2)",
                          }}
                        >
                          <BookmarkPlus size={12} />
                          Save set
                        </button>
                        <button
                          onClick={copySelected}
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl text-white font-semibold transition-all"
                          style={{
                            background: copiedField === "selected"
                              ? "#10B981"
                              : "linear-gradient(135deg,#F59E0B,#D97706)",
                            boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
                          }}
                        >
                          {copiedField === "selected" ? <Check size={12} /> : <Copy size={12} />}
                          {copiedField === "selected" ? "Copied!" : "Copy selected"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Regenerate */}
                  <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm transition-all"
                    style={{
                      background: "rgba(180,120,60,0.05)",
                      border: "1px solid rgba(180,120,60,0.12)",
                      color: "rgba(120,80,30,0.6)",
                    }}
                  >
                    <RefreshCw size={14} />
                    Regenerate with same settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Saved sets drawer ── */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-6 rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(180,120,60,0.12)" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(180,120,60,0.08)" }}
              >
                <h3 className="text-sm font-bold" style={{ color: "#1C1008" }}>Saved hashtag sets</h3>
                <span className="text-xs" style={{ color: "rgba(120,80,30,0.4)" }}>{savedSets.length} sets</span>
              </div>
              {savedSets.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm" style={{ color: "rgba(120,80,30,0.4)" }}>
                    No saved sets yet — select hashtags and click "Save set"
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(180,120,60,0.07)" }}>
                  {savedSets.map((set) => (
                    <div key={set.id} className="flex items-start gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold" style={{ color: "#1C1008" }}>{set.niche}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(245,158,11,0.1)", color: "#D97706" }}
                          >
                            {set.platform}
                          </span>
                          <span className="text-[10px]" style={{ color: "rgba(120,80,30,0.4)" }}>
                            {set.tags.length} tags
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: "rgba(120,80,30,0.5)" }}>
                          {set.tags.slice(0, 8).join(" ")}
                          {set.tags.length > 8 && ` +${set.tags.length - 8}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copy(set.tags.join(" "), `saved-${set.id}`)}
                          className="text-[11px] flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
                          style={{
                            background: copiedField === `saved-${set.id}` ? "rgba(245,158,11,0.15)" : "rgba(180,120,60,0.06)",
                            color: copiedField === `saved-${set.id}` ? "#D97706" : "rgba(120,80,30,0.45)",
                          }}
                        >
                          {copiedField === `saved-${set.id}` ? <Check size={10} /> : <Copy size={10} />}
                          Copy
                        </button>
                        <button
                          onClick={() => deleteSavedSet(set.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "rgba(180,120,60,0.3)" }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SEO block ── */}
        <div className="mt-16 pt-12" style={{ borderTop: "1px solid rgba(180,120,60,0.1)" }}>
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1C1008" }}>
              AI Hashtag Generator for Creators
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(120,80,30,0.6)" }}>
              Creator Hub's hashtag generator uses Groq's ultra-fast LLaMA 3.3 model to generate categorised hashtag sets — viral, niche, broad, and trending — with difficulty and popularity scores for every tag. Each generation is tuned for your specific platform, from Instagram's 30-tag limit to LinkedIn's 5-tag best practice.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Platforms", value: "6 supported" },
                { label: "Tag categories", value: "Viral · Niche · Broad · Trending" },
                { label: "Per generation", value: "20–30 hashtags" },
                { label: "Scoring", value: "Difficulty + Popularity" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3"
                  style={{ background: "white", border: "1px solid rgba(180,120,60,0.1)" }}
                >
                  <p className="text-xs mb-1" style={{ color: "rgba(120,80,30,0.45)" }}>{s.label}</p>
                  <p className="text-sm font-semibold" style={{ color: "#1C1008" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
