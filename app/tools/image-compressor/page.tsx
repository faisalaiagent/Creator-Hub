"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, Download, Loader2, CheckCircle2, AlertCircle,
  Zap, SlidersHorizontal, RotateCcw, ChevronLeft, ArrowRight,
  ImageDown, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OutputFormat = "jpeg" | "png" | "webp" | "original";
type ProcessingState = "idle" | "processing" | "done" | "error";

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "processing" | "done" | "error";
  originalSize: number;
  compressedSize?: number;
  compressedUrl?: string;
  compressedFilename?: string;
  savingsPercent?: number;
  error?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 10;

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "original", label: "Keep original" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP (smallest)" },
];

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(decimals)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(decimals)} MB`;
}

function savingsColor(pct: number): string {
  if (pct >= 60) return "text-emerald-600";
  if (pct >= 30) return "text-sky-600";
  return "text-amber-600";
}

export default function ImageCompressorPage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [globalState, setGlobalState] = useState<ProcessingState>("idle");
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const addFiles = (incoming: File[]) => {
    setError(null);
    const valid = incoming.filter(
      (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
    );
    if (valid.length === 0) {
      setError("Please upload JPG, PNG, or WebP images under 20 MB.");
      return;
    }
    const newItems: FileItem[] = valid
      .slice(0, MAX_FILES - items.length)
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "pending" as const,
        originalSize: f.size,
      }));
    setItems((prev) => [...prev, ...newItems].slice(0, MAX_FILES));
    if (globalState === "done") setGlobalState("idle");
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, patch: Partial<FileItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleCompress = async () => {
    if (items.length === 0) return;
    setError(null);
    setGlobalState("processing");
    const pending = items.filter((i) => i.status === "pending");

    for (const item of pending) {
      updateItem(item.id, { status: "processing" });
      try {
        const formData = new FormData();
        formData.append("image", item.file);
        formData.append("quality", String(quality));
        formData.append("format", format);

        const res = await fetch("/api/tools/image-compressor", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Compression failed");

        const savings = Math.round(
          ((item.originalSize - data.compressedSize) / item.originalSize) * 100
        );
        updateItem(item.id, {
          status: "done",
          compressedSize: data.compressedSize,
          compressedUrl: data.url,
          compressedFilename: data.filename,
          savingsPercent: Math.max(0, savings),
        });
      } catch (err: unknown) {
        updateItem(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Failed",
        });
      }
    }
    setGlobalState("done");
  };

  const handleDownload = (item: FileItem) => {
    if (!item.compressedUrl || !item.compressedFilename) return;
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = item.compressedFilename;
    a.click();
  };

  const handleDownloadAll = () =>
    items
      .filter((i) => i.status === "done")
      .forEach((i, idx) => setTimeout(() => handleDownload(i), idx * 250));

  const handleReset = () => {
    setItems([]);
    setGlobalState("idle");
    setError(null);
  };

  const doneItems = items.filter((i) => i.status === "done");
  const totalOriginal = doneItems.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = doneItems.reduce((s, i) => s + (i.compressedSize ?? 0), 0);
  const totalSaved = totalOriginal - totalCompressed;
  const totalSavedPct =
    totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const processingCount = items.filter((i) => i.status === "processing").length;
  const isProcessing = globalState === "processing";
  const hasDone = doneItems.length > 0;
  const qualityLabel =
    quality >= 85 ? "High quality" : quality >= 65 ? "Balanced" : "Max compression";
  const qualityColor =
    quality >= 85 ? "text-emerald-600" : quality >= 65 ? "text-sky-600" : "text-amber-600";

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tools" className="text-stone-400 hover:text-stone-700 transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <ImageDown size={16} className="text-sky-600" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-stone-900">Image Compressor</h1>
                <p className="text-xs text-stone-400">Sharp-powered · Free plan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 border border-stone-200 rounded-full px-3 py-1">
              3 / 10 uses today
            </span>
            <Link
              href="/pricing"
              className="text-xs bg-sky-600 text-white rounded-full px-3 py-1 hover:bg-sky-700 transition-colors"
            >
              Upgrade for bulk
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-sky-500" />
            <span className="text-xs font-medium text-sky-600 uppercase tracking-wider">
              Creator Utility Suite
            </span>
          </div>
          <h2 className="text-2xl font-medium text-stone-900 mb-1">
            Compress images without losing quality
          </h2>
          <p className="text-sm text-stone-500">
            Reduce file size for faster websites and social uploads. Bulk support up to 10 images.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left */}
          <div className="space-y-4">
            {/* Drop zone */}
            {globalState !== "done" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none",
                  dragActive
                    ? "border-sky-400 bg-sky-50"
                    : "border-stone-200 bg-white hover:border-sky-300 hover:bg-sky-50/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_TYPES.join(",")}
                  multiple
                  onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                />
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
                    dragActive ? "bg-sky-200" : "bg-sky-100"
                  )}
                >
                  <Upload size={22} className="text-sky-600" />
                </div>
                <p className="text-sm font-medium text-stone-800 mb-1">
                  {dragActive ? "Drop to add images" : "Drag & drop images here"}
                </p>
                <p className="text-xs text-stone-400">
                  JPG · PNG · WebP &nbsp;·&nbsp; max 20 MB &nbsp;·&nbsp; up to {MAX_FILES} images
                </p>
                {dragActive && (
                  <div className="absolute inset-2 rounded-xl border-2 border-sky-400 pointer-events-none" />
                )}
              </motion.div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle size={15} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Summary bar */}
            <AnimatePresence>
              {hasDone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-stone-100 rounded-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-3 divide-x divide-stone-100">
                    {[
                      { label: "Original total", value: formatBytes(totalOriginal), sub: `${doneItems.length} file${doneItems.length !== 1 ? "s" : ""}`, color: "text-stone-700" },
                      { label: "Compressed total", value: formatBytes(totalCompressed), sub: "after compression", color: "text-sky-700" },
                      { label: "Total saved", value: `${totalSavedPct}%`, sub: formatBytes(totalSaved) + " saved", color: savingsColor(totalSavedPct) },
                    ].map((s) => (
                      <div key={s.label} className="px-5 py-4">
                        <p className="text-xs text-stone-400 mb-1">{s.label}</p>
                        <p className={cn("text-lg font-medium", s.color)}>{s.value}</p>
                        <p className="text-xs text-stone-400">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* File list */}
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-stone-100 rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-stone-400">{formatBytes(item.originalSize)}</span>
                      {item.status === "done" && item.compressedSize && (
                        <>
                          <ArrowRight size={10} className="text-stone-300" />
                          <span className="text-xs text-sky-600 font-medium">{formatBytes(item.compressedSize)}</span>
                          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", item.savingsPercent && item.savingsPercent >= 60 ? "bg-emerald-50 text-emerald-600" : item.savingsPercent && item.savingsPercent >= 30 ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600")}>
                            −{item.savingsPercent}%
                          </span>
                        </>
                      )}
                      {item.status === "processing" && (
                        <span className="text-xs text-sky-500">Compressing...</span>
                      )}
                      {item.status === "error" && (
                        <span className="text-xs text-red-500">{item.error}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === "pending" && (
                      <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                        <X size={15} />
                      </button>
                    )}
                    {item.status === "processing" && <Loader2 size={16} className="text-sky-500 animate-spin" />}
                    {item.status === "done" && (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-500" />
                        <button
                          onClick={() => handleDownload(item)}
                          className="flex items-center gap-1 text-xs text-white bg-sky-600 hover:bg-sky-700 rounded-lg px-2.5 py-1.5 transition-colors"
                        >
                          <Download size={11} />
                          Save
                        </button>
                      </>
                    )}
                    {item.status === "error" && <AlertCircle size={15} className="text-red-400" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* CTAs */}
            {globalState === "done" ? (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => { fileInputRef.current?.click(); setGlobalState("idle"); }}
                  className="flex items-center gap-2 text-sm border border-stone-200 rounded-xl px-4 py-2.5 hover:bg-stone-50 transition-colors text-stone-600"
                >
                  <Upload size={14} />
                  Add more images
                </button>
                {doneItems.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    className="flex items-center gap-2 text-sm bg-sky-600 text-white rounded-xl px-4 py-2.5 hover:bg-sky-700 transition-colors"
                  >
                    <Download size={14} />
                    Download all {doneItems.length}
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors ml-auto"
                >
                  <RotateCcw size={13} />
                  Start over
                </button>
              </div>
            ) : (
              items.length > 0 && (
                <button
                  onClick={handleCompress}
                  disabled={isProcessing || pendingCount === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all",
                    isProcessing || pendingCount === 0
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-200"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Compressing{processingCount > 0 ? ` image ${processingCount}...` : "..."}
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Compress {pendingCount} image{pendingCount !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              )
            )}
          </div>

          {/* Right: settings */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={14} className="text-stone-400" />
                <span className="text-xs font-medium text-stone-700">Compression settings</span>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-stone-500">Quality</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-800">{quality}%</span>
                    <span className={cn("text-xs", qualityColor)}>{qualityLabel}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-stone-400">Smaller file</span>
                  <span className="text-[10px] text-stone-400">Higher quality</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-2">Output format</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormat(opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left",
                        format === opt.value
                          ? "border-sky-400 bg-sky-50 text-sky-700"
                          : "border-stone-100 text-stone-500 hover:border-stone-300"
                      )}
                    >
                      {opt.label}
                      {opt.value === "webp" && (
                        <span className="block text-[10px] text-emerald-600 mt-0.5">recommended</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5">
              <p className="text-xs font-medium text-stone-700 mb-3">Quick presets</p>
              <div className="space-y-2">
                {[
                  { name: "Web optimized", desc: "Fast load, great quality", q: 80, f: "webp" as OutputFormat },
                  { name: "Social media", desc: "Instagram, TikTok, Twitter", q: 85, f: "jpeg" as OutputFormat },
                  { name: "Max compression", desc: "Smallest possible file", q: 50, f: "webp" as OutputFormat },
                  { name: "Lossless PNG", desc: "No quality loss", q: 100, f: "png" as OutputFormat },
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => { setQuality(p.q); setFormat(p.f); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-all",
                      quality === p.q && format === p.f
                        ? "border-sky-300 bg-sky-50"
                        : "border-stone-100 hover:border-stone-200"
                    )}
                  >
                    <span className="font-medium text-stone-800">{p.name}</span>
                    <span className="block text-stone-400 mt-0.5">{p.desc} · {p.q}% · {p.f.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format guide */}
            <div className="bg-white border border-stone-100 rounded-2xl p-5">
              <p className="text-xs font-medium text-stone-700 mb-3">Format guide</p>
              <div className="space-y-2">
                {[
                  { fmt: "WebP", desc: "Best for web — 25–35% smaller than JPEG", badge: "bg-emerald-100 text-emerald-700" },
                  { fmt: "JPEG", desc: "Universal — works everywhere", badge: "bg-sky-100 text-sky-700" },
                  { fmt: "PNG", desc: "Lossless — ideal for logos & screenshots", badge: "bg-violet-100 text-violet-700" },
                ].map((row) => (
                  <div key={row.fmt} className="flex items-start gap-2.5">
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5", row.badge)}>
                      {row.fmt}
                    </span>
                    <span className="text-xs text-stone-400 leading-relaxed">{row.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade nudge */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-sky-600" />
                <span className="text-xs font-medium text-sky-800">Pro plan</span>
              </div>
              <p className="text-xs text-stone-500 mb-3">
                Compress 50 images at once, batch ZIP download, no daily limit.
              </p>
              <Link href="/pricing" className="text-xs font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1">
                Upgrade to Pro <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>

        {/* SEO block */}
        <div className="mt-16 border-t border-stone-200 pt-12">
          <div className="max-w-2xl">
            <h2 className="text-lg font-medium text-stone-900 mb-3">
              Free Image Compressor for Creators
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-6">
              Creator Hub's image compressor uses Sharp — the fastest Node.js image processing library — to reduce file sizes by up to 80% with no visible quality loss. Compress images for YouTube thumbnails, Instagram posts, website assets, and more.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Engine", value: "Sharp (libvips)" },
                { label: "Max file size", value: "20 MB" },
                { label: "Formats", value: "JPG · PNG · WebP" },
                { label: "Typical savings", value: "40–80%" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-stone-100 rounded-xl p-3">
                  <p className="text-xs text-stone-400 mb-1">{s.label}</p>
                  <p className="text-sm font-medium text-stone-800">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
