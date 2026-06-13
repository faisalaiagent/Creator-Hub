"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, ChevronLeft, RotateCcw,
  Bookmark, BookmarkCheck, ChevronDown, Loader2,
  MessageSquare, Hash, Zap, Heart, BookOpen,
  Instagram, Youtube, Linkedin, Twitter,
  ArrowRight, AlertCircle, RefreshCw, Wand2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "facebook";
type Tone = "motivational" | "casual" | "professional" | "humorous" | "emotional" | "educational";
type CaptionLength = "short" | "long";

interface CaptionResult {
  short: string;
  long: string;
  ctas: string[];
  emojis: string[];
  hashtags: string[];
  hook: string;
}

interface HistoryItem {
  id: string;
  topic: string;
  platform: Platform;
  tone: Tone;
  result: CaptionResult;
  createdAt: Date;
  saved: boolean;
}

// ── Platform config ────────────────────────────────────────────────────────────
const PLATFORMS: { value: Platform; label: string; icon: React.ReactNode; color: string; charLimit: number; hint: string }[] = [
  {
    value: "instagram",
    label: "Instagram",
    icon: <Instagram size={14} />,
    color: "from-pink-500 to-orange-400",
    charLimit: 2200,
    hint: "Emojis + hashtags perform best",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: <span className="text-xs font-black">TT</span>,
    color: "from-slate-900 to-slate-700",
    charLimit: 2200,
    hint: "Hook in first 3 words",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: <Youtube size={14} />,
    color: "from-red-600 to-red-500",
    charLimit: 5000,
    hint: "Keywords in first 100 chars",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: <Linkedin size={14} />,
    color: "from-blue-700 to-blue-500",
    charLimit: 3000,
    hint: "Professional insights drive shares",
  },
  {
    value: "twitter",
    label: "Twitter / X",
    icon: <Twitter size={14} />,
    color: "from-slate-800 to-slate-600",
    charLimit: 280,
    hint: "Short, punchy, quotable",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: <span className="text-xs font-black">f</span>,
    color: "from-blue-600 to-blue-400",
    charLimit: 63206,
    hint: "Stories + questions boost reach",
  },
];

const TONES: { value: Tone; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "motivational", label: "Motivational", icon: <Zap size={13} />, desc: "Inspire action" },
  { value: "casual", label: "Casual", icon: <MessageSquare size={13} />, desc: "Friendly & relatable" },
  { value: "professional", label: "Professional", icon: <Linkedin size={13} />, desc: "Polished & credible" },
  { value: "humorous", label: "Humorous", icon: <span className="text-sm">😄</span>, desc: "Fun & witty" },
  { value: "emotional", label: "Emotional", icon: <Heart size={13} />, desc: "Connect deeply" },
  { value: "educational", label: "Educational", icon: <BookOpen size={13} />, desc: "Teach & inform" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function charCount(text: string): number {
  return [...text].length;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CaptionGeneratorPage() {
  // Form state
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState<Tone>("casual");
  const [extraContext, setExtraContext] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLength, setActiveLength] = useState<CaptionLength>("short");

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePlatform = PLATFORMS.find((p) => p.value === platform)!;
  const activeTone = TONES.find((t) => t.value === tone)!;

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) {
      textareaRef.current?.focus();
      return;
    }
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

      // Add to history
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        topic: topic.trim(),
        platform,
        tone,
        result: data,
        createdAt: new Date(),
        saved: false,
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 20));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for non-HTTPS
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  // ── Copy full package ─────────────────────────────────────────────────────
  const handleCopyFull = () => {
    if (!result) return;
    const caption = activeLength === "short" ? result.short : result.long;
    const hashStr = result.hashtags.slice(0, 10).join(" ");
    const full = `${caption}\n\n${hashStr}`;
    handleCopy(full, "full");
  };

  // ── Restore from history ──────────────────────────────────────────────────
  const restoreFromHistory = (item: HistoryItem) => {
    setTopic(item.topic);
    setPlatform(item.platform);
    setTone(item.tone);
    setResult(item.result);
    setShowHistory(false);
  };

  // ── Toggle saved ──────────────────────────────────────────────────────────
  const toggleSaved = (id: string) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, saved: !h.saved } : h))
    );
  };

  const activeCaption = result
    ? activeLength === "short"
      ? result.short
      : result.long
    : null;

  const captionCharCount = activeCaption ? charCount(activeCaption) : 0;
  const charLimit = activePlatform.charLimit;
  const charPct = Math.min(100, (captionCharCount / charLimit) * 100);
  const charWarning = charPct > 90;

  return (
    <div className="min-h-screen" style={{ background: "#0F0F10", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* ── Nav ── */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,15,16,0.95)" }}
        className="sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools" className="text-white/30 hover:text-white/70 transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                <MessageSquare size={13} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">Caption Generator</p>
                <p className="text-[10px] text-white/30 mt-0.5">Groq · llama-3.3-70b</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="relative text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: showHistory ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: showHistory ? "#10b981" : "rgba(255,255,255,0.5)" }}
            >
              History
              {history.length > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>
                  {history.length}
                </span>
              )}
            </button>
            <span className="text-[11px] px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}>
              7 / 10 today
            </span>
            <Link href="/pricing"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "white" }}>
              Upgrade
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 size={13} style={{ color: "#10b981" }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#10b981" }}>
              Creator Utility Suite
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Caption Generator
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Generate platform-optimised captions, CTAs, hashtags, and emoji suggestions in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">

          {/* ── LEFT: Input panel ── */}
          <div className="space-y-4">

            {/* Topic input */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-5 pt-5 pb-4">
                <label className="block text-xs font-medium mb-2.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  What's your content about?
                </label>
                <textarea
                  ref={textareaRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Morning productivity routine, my 5-step skincare routine, hitting 100k subscribers, new product launch..."
                  rows={3}
                  className="w-full resize-none text-sm bg-transparent outline-none placeholder:text-white/20 text-white leading-relaxed"
                  style={{ caretColor: "#10b981" }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
                  }}
                />
              </div>
              <div className="px-5 pb-3 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                  ⌘ + Enter to generate
                </span>
                <span className="text-[10px]" style={{ color: topic.length > 400 ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>
                  {topic.length} / 500
                </span>
              </div>
            </div>

            {/* Platform selector */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <label className="block text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      "relative flex flex-col items-start gap-1.5 px-3 py-3 rounded-xl text-left transition-all duration-200",
                    )}
                    style={{
                      background: platform === p.value
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(255,255,255,0.03)",
                      border: platform === p.value
                        ? "1px solid rgba(16,185,129,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-white bg-gradient-to-br", p.color)}>
                        {p.icon}
                      </div>
                      <span className="text-xs font-medium text-white">{p.label}</span>
                    </div>
                    <span className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {p.hint}
                    </span>
                    {platform === p.value && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone selector */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <label className="block text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                Tone of voice
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: tone === t.value ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                      border: tone === t.value ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ color: tone === t.value ? "#10b981" : "rgba(255,255,255,0.4)" }}>
                      {t.icon}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-white">{t.label}</p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced options */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left"
              >
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Additional context (optional)
                </span>
                <ChevronDown
                  size={14}
                  style={{ color: "rgba(255,255,255,0.3)", transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
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
                    <div className="px-5 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[11px] mb-2 mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Add keywords, target audience, product details, or any extra instructions for the AI.
                      </p>
                      <textarea
                        value={extraContext}
                        onChange={(e) => setExtraContext(e.target.value)}
                        placeholder="e.g. Target audience: fitness enthusiasts aged 25–35. Brand voice: bold and direct. Include our slogan 'Train Harder'."
                        rows={3}
                        className="w-full resize-none text-sm bg-transparent outline-none placeholder:text-white/20 text-white leading-relaxed"
                        style={{ caretColor: "#10b981" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading || !topic.trim()
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg,#10b981,#059669)",
                color: "white",
                boxShadow: loading || !topic.trim() ? "none" : "0 0 30px rgba(16,185,129,0.3)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate captions
                  <span className="text-xs opacity-60 font-normal">({activePlatform.label} · {activeTone.label})</span>
                </>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Output panel ── */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl flex flex-col items-center justify-center text-center py-16 px-8"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(16,185,129,0.1)" }}>
                    <MessageSquare size={22} style={{ color: "#10b981" }} />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">No captions yet</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Fill in your topic, pick a platform & tone, then hit generate.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                    {["Morning fitness routine", "New product launch 🚀", "Behind the scenes vlog"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setTopic(ex)}
                        className="text-xs px-3 py-2 rounded-lg text-left transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
                      >
                        <ArrowRight size={10} className="inline mr-1.5" style={{ color: "#10b981" }} />
                        {ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl py-16 flex flex-col items-center justify-center gap-4"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-2xl" style={{ background: "rgba(16,185,129,0.12)" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={26} style={{ color: "#10b981" }} className="animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl animate-ping" style={{ background: "rgba(16,185,129,0.06)" }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">Writing your captions...</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                      llama-3.3-70b is crafting {activePlatform.label} content
                    </p>
                  </div>
                  {/* Animated skeleton */}
                  <div className="w-full max-w-sm space-y-2 px-6 mt-2">
                    {[100, 80, 65].map((w, i) => (
                      <div key={i} className="h-2.5 rounded-full animate-pulse"
                        style={{ width: `${w}%`, background: "rgba(255,255,255,0.06)", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Caption output card */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-white bg-gradient-to-br text-[10px]", activePlatform.color)}>
                          {activePlatform.icon}
                        </div>
                        <span className="text-xs font-medium text-white">{activePlatform.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                          {activeTone.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setResult(null); setTopic(""); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          title="Reset"
                        >
                          <RotateCcw size={13} />
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          title="Regenerate"
                        >
                          <RefreshCw size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Short / Long toggle */}
                    <div className="flex items-center gap-1 p-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {(["short", "long"] as CaptionLength[]).map((len) => (
                        <button
                          key={len}
                          onClick={() => setActiveLength(len)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                          style={{
                            background: activeLength === len ? "rgba(16,185,129,0.15)" : "transparent",
                            color: activeLength === len ? "#10b981" : "rgba(255,255,255,0.35)",
                            border: activeLength === len ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                          }}
                        >
                          {len === "short" ? "Short caption" : "Long caption"}
                        </button>
                      ))}
                    </div>

                    {/* Caption text */}
                    <div className="p-4">
                      <div className="relative">
                        <p className="text-sm leading-relaxed text-white whitespace-pre-wrap" style={{ minHeight: 80 }}>
                          {activeLength === "short" ? result.short : result.long}
                        </p>
                        <button
                          onClick={() => handleCopy(activeCaption!, "caption")}
                          className="absolute top-0 right-0 p-1.5 rounded-lg transition-all"
                          style={{
                            background: copiedField === "caption" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                            color: copiedField === "caption" ? "#10b981" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {copiedField === "caption" ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>

                      {/* Char count bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            Character count
                          </span>
                          <span className="text-[10px]" style={{ color: charWarning ? "#f59e0b" : "rgba(255,255,255,0.25)" }}>
                            {captionCharCount} / {charLimit.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${charPct}%`,
                              background: charWarning
                                ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                                : "linear-gradient(90deg,#10b981,#059669)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hook line */}
                    {result.hook && (
                      <div className="px-4 pb-4">
                        <div className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Zap size={11} style={{ color: "#10b981" }} />
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#10b981" }}>
                              Hook line
                            </span>
                          </div>
                          <p className="text-sm text-white italic">&ldquo;{result.hook}&rdquo;</p>
                          <button
                            onClick={() => handleCopy(result.hook, "hook")}
                            className="mt-2 text-[10px] flex items-center gap-1 transition-colors"
                            style={{ color: copiedField === "hook" ? "#10b981" : "rgba(255,255,255,0.3)" }}
                          >
                            {copiedField === "hook" ? <Check size={10} /> : <Copy size={10} />}
                            {copiedField === "hook" ? "Copied!" : "Copy hook"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Copy full package CTA */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={handleCopyFull}
                        className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: copiedField === "full" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                          border: copiedField === "full" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                          color: copiedField === "full" ? "#10b981" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {copiedField === "full" ? <Check size={13} /> : <Copy size={13} />}
                        {copiedField === "full" ? "Copied!" : "Copy caption + hashtags"}
                      </button>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight size={12} style={{ color: "#10b981" }} />
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                          CTA suggestions
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                        tap to copy
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.ctas.map((cta, i) => (
                        <button
                          key={i}
                          onClick={() => handleCopy(cta, `cta-${i}`)}
                          className="text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                          style={{
                            background: copiedField === `cta-${i}` ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                            border: copiedField === `cta-${i}` ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                            color: copiedField === `cta-${i}` ? "#10b981" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {copiedField === `cta-${i}` ? <Check size={10} /> : null}
                          {cta}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emojis */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-sm">✨</span>
                      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Emoji suggestions
                      </span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>· tap to copy</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.emojis.map((emoji, i) => (
                        <button
                          key={i}
                          onClick={() => handleCopy(emoji, `emoji-${i}`)}
                          className="text-xl px-2 py-1 rounded-xl transition-all"
                          title={`Copy ${emoji}`}
                          style={{
                            background: copiedField === `emoji-${i}` ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                            border: copiedField === `emoji-${i}` ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                            transform: copiedField === `emoji-${i}` ? "scale(1.2)" : "scale(1)",
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Hash size={12} style={{ color: "#10b981" }} />
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                          Hashtags ({result.hashtags.length})
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(result.hashtags.join(" "), "hashtags")}
                        className="text-[10px] flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          background: copiedField === "hashtags" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                          color: copiedField === "hashtags" ? "#10b981" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {copiedField === "hashtags" ? <Check size={10} /> : <Copy size={10} />}
                        Copy all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => handleCopy(tag, `tag-${i}`)}
                          className="text-xs px-2.5 py-1 rounded-full font-mono transition-all"
                          style={{
                            background: copiedField === `tag-${i}` ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                            border: copiedField === `tag-${i}` ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.07)",
                            color: copiedField === `tag-${i}` ? "#10b981" : "rgba(255,255,255,0.45)",
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── History drawer ── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-8 rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 className="text-sm font-medium text-white">Recent generations</h3>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{history.length} items</span>
              </div>
              {history.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No history yet</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <button onClick={() => restoreFromHistory(item)} className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-white truncate">{item.topic}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                            {item.platform}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                            {item.tone}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {item.result.short}
                        </p>
                      </button>
                      <button
                        onClick={() => toggleSaved(item.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
                        style={{ color: item.saved ? "#10b981" : "rgba(255,255,255,0.25)" }}
                      >
                        {item.saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SEO block ── */}
        <div className="mt-16 pt-12" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-2xl">
            <h2 className="text-lg font-medium text-white mb-3">
              AI Caption Generator for Creators
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              Stop staring at a blank caption box. Creator Hub's caption generator uses Groq's ultra-fast LLaMA 3.3 model to produce platform-optimised captions for Instagram, TikTok, YouTube, LinkedIn, Twitter, and Facebook in seconds. Each generation includes a short caption, long caption, hook line, CTA options, emoji suggestions, and hashtags.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "AI model", value: "LLaMA 3.3-70b" },
                { label: "Platforms", value: "6 supported" },
                { label: "Tones", value: "6 styles" },
                { label: "Output", value: "Caption + hashtags" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                  <p className="text-sm font-medium text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
