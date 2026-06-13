"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Copy, Check, RefreshCw, Loader2, AlertCircle,
  Star, ArrowRight, ChevronDown, Sparkles, Hash, Image as ImageIcon,
  TrendingUp, Search, BookmarkPlus, BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TitleStyle = "seo" | "clickable" | "emotional" | "curiosity" | "shorts" | "listicle";
type Platform = "youtube" | "tiktok" | "instagram" | "blog";

interface TitleItem {
  title: string;
  style: TitleStyle;
  ctrScore: number;
  seoScore: number;
  charCount: number;
  explanation: string;
}

interface TitleResult {
  titles: TitleItem[];
  topPick: number;
  keywords: string[];
  thumbnailTextSuggestions: string[];
  strategyNote: string;
}

interface SavedTitle {
  id: string;
  topic: string;
  title: TitleItem;
  savedAt: Date;
}

const STYLES: { value: TitleStyle; label: string; desc: string }[] = [
  { value: "seo",       label: "SEO",       desc: "Search-optimized" },
  { value: "clickable", label: "Clickable", desc: "High CTR triggers" },
  { value: "emotional", label: "Emotional", desc: "Identity & feeling" },
  { value: "curiosity", label: "Curiosity", desc: "Open loops" },
  { value: "shorts",    label: "Shorts",    desc: "Punchy & short" },
  { value: "listicle",  label: "Listicle",  desc: "Numbered format" },
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "youtube",   label: "YouTube"   },
  { value: "tiktok",    label: "TikTok"    },
  { value: "instagram", label: "Instagram" },
  { value: "blog",      label: "Blog / SEO"},
];

const TITLE_COUNT_OPTIONS = [3, 5, 7, 10];

function scoreColor(score: number): string {
  if (score >= 85) return "#C0392B"; // breaking-news red
  if (score >= 70) return "#D68910";
  if (score >= 50) return "#27AE60";
  return "#95A5A6";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "BREAKING";
  if (score >= 70) return "STRONG";
  if (score >= 50) return "SOLID";
  return "WEAK";
}

export default function TitleGeneratorPage() {
  const [topic, setTopic]           = useState("");
  const [platform, setPlatform]     = useState<Platform>("youtube");
  const [selectedStyles, setSelectedStyles] = useState<TitleStyle[]>(["seo", "clickable", "curiosity"]);
  const [titleCount, setTitleCount] = useState(5);
  const [keywords, setKeywords]     = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<TitleResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedTitles, setSavedTitles] = useState<SavedTitle[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activePlatform = PLATFORMS.find((p) => p.value === platform)!;

  const handleGenerate = async () => {
    if (!topic.trim()) { inputRef.current?.focus(); return; }
    setLoading(true);
    setError(null);

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
  };

  const copy = useCallback(async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const copyAll = () => {
    if (!result) return;
    copy(result.titles.map((t, i) => `${i + 1}. ${t.title}`).join("\n"), "all");
  };

  const toggleSave = (item: TitleItem, idx: number) => {
    const id = `saved-${idx}`;
    setSavedTitles((prev) =>
      prev.some((s) => s.id === id)
        ? prev.filter((s) => s.id !== id)
        : [{ id, topic: topic.trim(), title: item, savedAt: new Date() }, ...prev].slice(0, 20)
    );
  };
  const isSaved = (idx: number) => savedTitles.some((s) => s.id === `saved-${idx}`);

  const toggleStyle = (style: TitleStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.length > 1 ? prev.filter((s) => s !== style) : prev
        : [...prev, style]
    );
  };

  const accent = "#C0392B"; // editorial red

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "'IBM Plex Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap'); .font-fraunces{font-family:'Fraunces',serif} .font-mono-plex{font-family:'IBM Plex Mono',monospace}`}</style>

      {/* Top accent strip */}
      <div className="h-1.5 w-full" style={{ background: `repeating-linear-gradient(45deg, ${accent} 0 10px, #000 10px 20px)` }} />

      {/* Nav */}
      <nav className="sticky top-0 z-20" style={{ background: "rgba(250,250,248,0.95)", borderBottom: "2px solid #1A1A1A", backdropFilter: "blur(8px)" }}>
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools" className="transition-colors" style={{ color: "rgba(0,0,0,0.3)" }}><ChevronLeft size={18} /></Link>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: accent }}>
                <span className="text-white font-fraunces font-black text-sm">T</span>
              </div>
              <div>
                <p className="text-sm font-bold font-fraunces text-black leading-none tracking-tight">Video Title Generator</p>
                <p className="text-[10px] font-mono-plex mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>Groq · llama-3.3-70b</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSaved(!showSaved)} className="text-xs px-3 py-1.5 rounded-sm font-mono-plex font-medium transition-all"
              style={{ background: showSaved ? "#FDEDEC" : "transparent", color: showSaved ? accent : "rgba(0,0,0,0.5)", border: `1px solid ${showSaved ? accent : "rgba(0,0,0,0.15)"}` }}>
              <BookmarkPlus size={12} className="inline mr-1.5" />Saved
              {savedTitles.length > 0 && <span className="ml-1.5 text-[10px] px-1.5 rounded-full" style={{ background: accent, color: "white" }}>{savedTitles.length}</span>}
            </button>
            <span className="text-[11px] px-3 py-1.5 font-mono-plex" style={{ color: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,0,0,0.1)" }}>9 / 10 today</span>
            <Link href="/pricing" className="text-xs px-3 py-1.5 font-bold font-fraunces text-white" style={{ background: "#1A1A1A" }}>UPGRADE</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* Masthead header */}
        <div className="mb-10 pb-6" style={{ borderBottom: "3px double #1A1A1A" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-mono-plex font-bold uppercase tracking-[0.25em] mb-2" style={{ color: accent }}>
                Creator Utility Suite · Edition №07
              </p>
              <h1 className="font-fraunces font-black text-black" style={{ fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                Video Title Generator
              </h1>
              <p className="text-sm font-mono-plex mt-2" style={{ color: "rgba(0,0,0,0.45)" }}>
                SEO titles · Clickable titles · Curiosity hooks · Listicles · Shorts formats — scored for CTR & search.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">

          {/* LEFT — controls */}
          <div className="space-y-4">

            {/* Topic */}
            <div style={{ border: "1.5px solid #1A1A1A" }}>
              <div className="px-4 pt-3 pb-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest" style={{ color: accent }}>What's the video about?</p>
              </div>
              <div className="px-4 py-3">
                <textarea
                  ref={inputRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How I edit videos 10x faster using AI tools, my morning routine that changed my life..."
                  rows={3}
                  className="w-full resize-none text-sm bg-transparent outline-none leading-relaxed placeholder:text-black/25 text-black font-mono-plex"
                  style={{ caretColor: accent }}
                  onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate(); }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-mono-plex" style={{ color: "rgba(0,0,0,0.25)" }}>⌘+Enter to generate</span>
                  <span className="text-[10px] font-mono-plex" style={{ color: topic.length > 400 ? accent : "rgba(0,0,0,0.25)" }}>{topic.length}/500</span>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div style={{ border: "1.5px solid #1A1A1A" }}>
              <div className="px-4 pt-3 pb-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.5)" }}>Platform</p>
              </div>
              <div className="grid grid-cols-2 gap-0" style={{ borderTop: "0" }}>
                {PLATFORMS.map((p, i) => (
                  <button key={p.value} onClick={() => setPlatform(p.value)}
                    className="py-3 text-sm font-fraunces font-bold transition-all"
                    style={{
                      background: platform === p.value ? "#1A1A1A" : "transparent",
                      color: platform === p.value ? "white" : "#1A1A1A",
                      borderRight: i % 2 === 0 ? "1px solid #1A1A1A" : "none",
                      borderTop: i >= 2 ? "1px solid #1A1A1A" : "none",
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div style={{ border: "1.5px solid #1A1A1A" }}>
              <div className="px-4 pt-3 pb-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.5)" }}>Title styles to generate</p>
              </div>
              <div className="grid grid-cols-2">
                {STYLES.map((s, i) => {
                  const active = selectedStyles.includes(s.value);
                  return (
                    <button key={s.value} onClick={() => toggleStyle(s.value)}
                      className="px-3 py-2.5 text-left transition-all"
                      style={{
                        background: active ? "#FDEDEC" : "transparent",
                        borderRight: i % 2 === 0 ? "1px solid #1A1A1A" : "none",
                        borderTop: i >= 2 ? "1px solid #1A1A1A" : "none",
                      }}>
                      <p className="text-xs font-fraunces font-bold" style={{ color: active ? accent : "#1A1A1A" }}>{s.label}</p>
                      <p className="text-[10px] font-mono-plex" style={{ color: "rgba(0,0,0,0.4)" }}>{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Count */}
            <div style={{ border: "1.5px solid #1A1A1A" }}>
              <div className="px-4 pt-3 pb-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.5)" }}>Number of titles</p>
              </div>
              <div className="grid grid-cols-4">
                {TITLE_COUNT_OPTIONS.map((n, i) => (
                  <button key={n} onClick={() => setTitleCount(n)}
                    className="py-3 text-base font-fraunces font-black transition-all"
                    style={{
                      background: titleCount === n ? "#1A1A1A" : "transparent",
                      color: titleCount === n ? "white" : "#1A1A1A",
                      borderRight: i < 3 ? "1px solid #1A1A1A" : "none",
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div style={{ border: "1.5px solid #1A1A1A" }}>
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between px-4 py-3">
                <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.45)" }}>Target keywords (optional)</p>
                <ChevronDown size={13} style={{ color: "rgba(0,0,0,0.3)", transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-3" style={{ borderTop: "1px solid #1A1A1A" }}>
                      <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g. productivity, time management, AI tools"
                        className="w-full text-sm font-mono-plex outline-none bg-transparent text-black placeholder:text-black/25 mt-3"
                        style={{ caretColor: accent, borderBottom: "1px solid rgba(0,0,0,0.15)", paddingBottom: 6 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate */}
            <button onClick={handleGenerate} disabled={loading || !topic.trim()}
              className="w-full py-4 font-fraunces font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: loading || !topic.trim() ? "rgba(0,0,0,0.08)" : accent, color: loading || !topic.trim() ? "rgba(0,0,0,0.3)" : "white" }}>
              {loading ? (<><Loader2 size={16} className="animate-spin" /> Drafting headlines...</>) : (<>Generate {titleCount} Titles<ArrowRight size={15} /></>)}
            </button>

            {error && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 px-4 py-3" style={{ background: "#FDEDEC", border: `1px solid ${accent}` }}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: accent }} />
                <span className="text-xs font-mono-plex" style={{ color: accent }}>{error}</span>
              </motion.div>
            )}
          </div>

          {/* RIGHT — output */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">

              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-24"
                  style={{ border: "1.5px dashed rgba(0,0,0,0.15)" }}>
                  <div className="w-14 h-14 flex items-center justify-center mb-5" style={{ border: `2px solid ${accent}` }}>
                    <span className="font-fraunces font-black text-2xl" style={{ color: accent }}>T</span>
                  </div>
                  <p className="font-fraunces font-black text-xl text-black mb-2">No headlines drafted yet</p>
                  <p className="text-sm font-mono-plex max-w-sm" style={{ color: "rgba(0,0,0,0.4)" }}>
                    Enter your topic, choose title styles, and generate scored title variations.
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-md px-6">
                    {["How I edit videos 10x faster with AI", "My morning routine that changed everything", "5 mistakes killing your channel growth"].map((ex) => (
                      <button key={ex} onClick={() => setTopic(ex)} className="text-xs font-mono-plex px-4 py-2.5 text-left transition-all flex items-center gap-2"
                        style={{ border: "1px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.55)" }}>
                        <ArrowRight size={10} style={{ color: accent, flexShrink: 0 }} />{ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {Array.from({ length: Math.min(titleCount, 5) }).map((_, i) => (
                    <div key={i} className="p-5 animate-pulse" style={{ border: "1px solid rgba(0,0,0,0.1)", animationDelay: `${i * 0.1}s` }}>
                      <div className="h-4 rounded-sm w-3/4 mb-3" style={{ background: "rgba(0,0,0,0.06)" }} />
                      <div className="h-2 rounded-sm w-1/2" style={{ background: "rgba(0,0,0,0.04)" }} />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 justify-center py-4">
                    <Loader2 size={16} style={{ color: accent }} className="animate-spin" />
                    <span className="text-xs font-mono-plex" style={{ color: accent }}>Drafting {titleCount} headlines for {activePlatform.label}...</span>
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                  {/* Strategy header */}
                  <div className="px-5 py-4 flex items-start justify-between gap-4" style={{ background: "#1A1A1A" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest mb-1.5" style={{ color: "#FF6B5B" }}>Editor's note</p>
                      <p className="text-xs font-mono-plex leading-relaxed text-white/70">{result.strategyNote}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={handleGenerate} className="p-2 transition-all" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }} title="Regenerate"><RefreshCw size={13} /></button>
                      <button onClick={copyAll} className="flex items-center gap-1.5 text-xs px-3 py-2 font-mono-plex font-medium transition-all"
                        style={{ background: copiedId === "all" ? "#27AE60" : "rgba(255,255,255,0.1)", color: "white" }}>
                        {copiedId === "all" ? <Check size={12} /> : <Copy size={12} />}{copiedId === "all" ? "Copied!" : `Copy all ${result.titles.length}`}
                      </button>
                    </div>
                  </div>

                  {/* Title cards */}
                  {result.titles.map((item, idx) => {
                    const isTop = idx === result.topPick;
                    const saved = isSaved(idx);
                    const copyKey = `title-${idx}`;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        style={{ border: isTop ? `2px solid ${accent}` : "1px solid rgba(0,0,0,0.12)", background: isTop ? "#FDEDEC" : "white" }}>

                        {/* Header row */}
                        <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-wrap">
                          <span className="font-fraunces font-black text-lg" style={{ color: isTop ? accent : "rgba(0,0,0,0.2)" }}>
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-mono-plex font-bold uppercase tracking-wider px-2 py-0.5" style={{ background: "#1A1A1A", color: "white" }}>
                            {item.style}
                          </span>
                          {isTop && (
                            <span className="text-[10px] font-mono-plex font-bold uppercase tracking-widest px-2 py-0.5 flex items-center gap-1" style={{ background: accent, color: "white" }}>
                              <Star size={9} fill="white" />Top Pick
                            </span>
                          )}
                          <span className="text-[10px] font-mono-plex ml-auto" style={{ color: "rgba(0,0,0,0.35)" }}>
                            {item.charCount} chars
                          </span>
                        </div>

                        {/* Title text - headline style */}
                        <div className="px-4 pb-3">
                          <p className="font-fraunces font-bold text-black leading-snug" style={{ fontSize: "clamp(16px,2.2vw,22px)" }}>
                            {item.title}
                          </p>
                        </div>

                        {/* Scores */}
                        <div className="px-4 pb-3 flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={12} style={{ color: scoreColor(item.ctrScore) }} />
                            <span className="text-[10px] font-mono-plex uppercase" style={{ color: "rgba(0,0,0,0.4)" }}>CTR</span>
                            <div className="w-20 h-1.5" style={{ background: "rgba(0,0,0,0.08)" }}>
                              <div className="h-full" style={{ width: `${item.ctrScore}%`, background: scoreColor(item.ctrScore) }} />
                            </div>
                            <span className="text-[10px] font-mono-plex font-bold" style={{ color: scoreColor(item.ctrScore) }}>{item.ctrScore}</span>
                            <span className="text-[9px] font-mono-plex font-bold uppercase" style={{ color: scoreColor(item.ctrScore) }}>{scoreLabel(item.ctrScore)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Search size={12} style={{ color: scoreColor(item.seoScore) }} />
                            <span className="text-[10px] font-mono-plex uppercase" style={{ color: "rgba(0,0,0,0.4)" }}>SEO</span>
                            <div className="w-20 h-1.5" style={{ background: "rgba(0,0,0,0.08)" }}>
                              <div className="h-full" style={{ width: `${item.seoScore}%`, background: scoreColor(item.seoScore) }} />
                            </div>
                            <span className="text-[10px] font-mono-plex font-bold" style={{ color: scoreColor(item.seoScore) }}>{item.seoScore}</span>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="px-4 pb-3">
                          <p className="text-xs font-mono-plex leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>
                            {item.explanation}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="px-4 pb-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10 }}>
                          <button onClick={() => toggleSave(item, idx)} className="p-1.5 transition-all" style={{ background: saved ? "#FDEDEC" : "transparent", color: saved ? accent : "rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>
                            {saved ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
                          </button>
                          <button onClick={() => copy(item.title, copyKey)}
                            className="ml-auto flex items-center gap-1.5 text-xs font-mono-plex font-bold px-3 py-1.5 transition-all"
                            style={{ background: copiedId === copyKey ? "#27AE60" : "#1A1A1A", color: "white" }}>
                            {copiedId === copyKey ? <Check size={12} /> : <Copy size={12} />}
                            {copiedId === copyKey ? "Copied!" : "Copy title"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Keywords + thumbnail text */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div style={{ border: "1.5px solid #1A1A1A" }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1A1A1A" }}>
                        <Hash size={13} style={{ color: accent }} />
                        <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest">SEO Keywords</p>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {result.keywords.map((kw, i) => (
                          <button key={i} onClick={() => copy(kw, `kw-${i}`)} className="text-xs font-mono-plex px-2.5 py-1 transition-all"
                            style={{ background: copiedId === `kw-${i}` ? "#27AE60" : "#F5F5F0", color: copiedId === `kw-${i}` ? "white" : "#1A1A1A", border: "1px solid rgba(0,0,0,0.1)" }}>
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ border: "1.5px solid #1A1A1A" }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1A1A1A" }}>
                        <ImageIcon size={13} style={{ color: accent }} />
                        <p className="text-[10px] font-mono-plex font-bold uppercase tracking-widest">Thumbnail Text Ideas</p>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {result.thumbnailTextSuggestions.map((tt, i) => (
                          <button key={i} onClick={() => copy(tt, `tt-${i}`)} className="text-xs font-fraunces font-black px-3 py-1.5 transition-all uppercase"
                            style={{ background: copiedId === `tt-${i}` ? "#27AE60" : "#1A1A1A", color: "white" }}>
                            {tt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-2 py-3.5 font-mono-plex text-sm font-medium transition-all"
                    style={{ border: "1px solid rgba(0,0,0,0.15)", color: "rgba(0,0,0,0.5)" }}>
                    <RefreshCw size={14} />Regenerate with same settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Saved drawer */}
        <AnimatePresence>
          {showSaved && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="mt-6" style={{ border: "1.5px solid #1A1A1A" }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <h3 className="text-sm font-fraunces font-black">Saved titles</h3>
                <span className="text-xs font-mono-plex" style={{ color: "rgba(0,0,0,0.4)" }}>{savedTitles.length} saved</span>
              </div>
              {savedTitles.length === 0 ? (
                <div className="py-10 text-center"><p className="text-sm font-mono-plex" style={{ color: "rgba(0,0,0,0.35)" }}>No saved titles yet — click the bookmark icon on any title card.</p></div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  {savedTitles.map((s) => (
                    <div key={s.id} className="flex items-start gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-fraunces font-bold text-black">{s.title.title}</p>
                        <p className="text-[10px] font-mono-plex mt-0.5" style={{ color: "rgba(0,0,0,0.35)" }}>{s.topic} · {s.title.style} · CTR {s.title.ctrScore}</p>
                      </div>
                      <button onClick={() => copy(s.title.title, `saved-copy-${s.id}`)} className="flex-shrink-0 p-1.5 transition-all"
                        style={{ background: copiedId === `saved-copy-${s.id}` ? "#27AE60" : "transparent", color: copiedId === `saved-copy-${s.id}` ? "white" : "rgba(0,0,0,0.4)", border: "1px solid rgba(0,0,0,0.12)" }}>
                        {copiedId === `saved-copy-${s.id}` ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO block */}
        <div className="mt-16 pt-10" style={{ borderTop: "3px double #1A1A1A" }}>
          <div className="max-w-2xl">
            <h2 className="font-fraunces font-black text-2xl text-black mb-3">AI Video Title Generator for Creators</h2>
            <p className="text-sm font-mono-plex leading-relaxed mb-6" style={{ color: "rgba(0,0,0,0.5)" }}>
              Creator Hub's title generator uses Groq's LLaMA 3.3 model to produce titles across six proven styles — SEO, clickable, emotional, curiosity, shorts, and listicle — each scored for click-through rate and search discoverability. Every generation includes SEO keyword suggestions and thumbnail text ideas.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{l:"Title styles",v:"6 categories"},{l:"Platforms",v:"YouTube, TikTok, IG, Blog"},{l:"Scoring",v:"CTR + SEO"},{l:"Bonus output",v:"Keywords + Thumbnail text"}].map((s) => (
                <div key={s.l} className="p-3" style={{ border: "1px solid rgba(0,0,0,0.12)" }}>
                  <p className="text-[10px] font-mono-plex mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>{s.l}</p>
                  <p className="text-sm font-fraunces font-bold text-black">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
