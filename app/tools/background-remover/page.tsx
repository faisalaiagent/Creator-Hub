"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Download,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

interface ProcessedImage {
  id: string;
  originalUrl: string;
  resultUrl: string;
  filename: string;
  originalSize: number;
  resultSize: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5; // Free plan batch limit

// ─── Page Component ───────────────────────────────────────────────────────────
export default function BackgroundRemoverPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>("idle");
  const [processed, setProcessed] = useState<ProcessedImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const BG_OPTIONS = [
    { label: "Transparent", value: "transparent", preview: "checkerboard" },
    { label: "White", value: "#ffffff", preview: "#ffffff" },
    { label: "Black", value: "#000000", preview: "#000000" },
    { label: "Cream", value: "#FFF8F0", preview: "#FFF8F0" },
    { label: "Sky", value: "#E0F2FE", preview: "#E0F2FE" },
    { label: "Lavender", value: "#EDE9FE", preview: "#EDE9FE" },
  ];

  // ─── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    validateAndSetFiles(dropped);
  }, []);

  const validateAndSetFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });
    if (valid.length === 0) {
      setError("Please upload JPG, PNG, or WebP images under 10MB.");
      return;
    }
    setError(null);
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
  };

  // ─── Process Images ──────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (files.length === 0) return;
    setState("uploading");
    setError(null);
    setProcessed([]);

    try {
      const results: ProcessedImage[] = [];

      for (const file of files) {
        setState("processing");
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/tools/background-remover", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Processing failed");
        }

        const data = await res.json();
        results.push({
          id: crypto.randomUUID(),
          originalUrl: URL.createObjectURL(file),
          resultUrl: data.resultUrl,
          filename: file.name.replace(/\.[^.]+$/, "") + "_no_bg.png",
          originalSize: file.size,
          resultSize: data.resultSize ?? 0,
        });
      }

      setProcessed(results);
      setActiveIndex(0);
      setSliderPos(50);
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  // ─── Slider ──────────────────────────────────────────────────────────────────
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSlider(true);
  };

  const handleSliderMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingSlider || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
      setSliderPos(Math.round(pct));
    },
    [isDraggingSlider]
  );

  const handleSliderMouseUp = () => setIsDraggingSlider(false);

  // ─── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async (img: ProcessedImage) => {
    try {
      // Must fetch as blob first — browser blocks cross-origin downloads
      // when using anchor.download directly on Cloudinary URLs
      const response = await fetch(img.resultUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = img.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Release memory
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      // Fallback: open in new tab if blob fetch fails
      window.open(img.resultUrl, "_blank");
    }
  };

  const handleDownloadAll = () => {
    processed.forEach((img, idx) =>
      setTimeout(() => handleDownload(img), idx * 500)
    );
  };

  // ── Download with baked-in background color ────────────────────────────────
  // Renders the transparent PNG onto a canvas filled with the chosen color,
  // then exports that flattened result as a new PNG. This is separate from
  // handleDownload (which always exports the raw transparent PNG).
  const [flattening, setFlattening] = useState(false);

  const handleDownloadWithBackground = async (img: ProcessedImage, color: string) => {
    if (color === "transparent") {
      // No color selected — just download the transparent version
      handleDownload(img);
      return;
    }

    setFlattening(true);
    try {
      // Load the transparent PNG into an Image element
      const imageEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.crossOrigin = "anonymous";
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = img.resultUrl;
      });

      // Create a canvas matching the image's natural dimensions
      const canvas = document.createElement("canvas");
      canvas.width = imageEl.naturalWidth;
      canvas.height = imageEl.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // 1. Fill the entire canvas with the chosen background color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw the transparent-background PNG on top —
      //    transparent pixels reveal the fill color beneath
      ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);

      // 3. Export the flattened canvas as a PNG blob
      const flattenedBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          "image/png"
        );
      });

      // 4. Trigger download of the flattened PNG
      const blobUrl = URL.createObjectURL(flattenedBlob);
      const a = document.createElement("a");
      const colorLabel =
        BG_OPTIONS.find((o) => o.value === color)?.label.toLowerCase() ?? "color";
      a.href = blobUrl;
      a.download = img.filename.replace(/\.png$/i, `_${colorLabel}_bg.png`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error("[flatten download]", err);
      setError("Couldn't apply background color. Downloading transparent PNG instead.");
      handleDownload(img);
    } finally {
      setFlattening(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setProcessed([]);
    setState("idle");
    setError(null);
  };

  const activeImage = processed[activeIndex];
  const formatBytes = (b: number) =>
    b > 1024 * 1024
      ? `${(b / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(b / 1024)} KB`;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* ── Header ── */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="text-stone-400 hover:text-stone-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Layers size={16} className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-stone-900">
                  Background Remover
                </h1>
                <p className="text-xs text-stone-400">AI-powered • Free plan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 border border-stone-200 rounded-full px-3 py-1">
              5 / 10 uses today
            </span>
            <Link
              href="/pricing"
              className="text-xs bg-violet-600 text-white rounded-full px-3 py-1 hover:bg-violet-700 transition-colors"
            >
              Upgrade for unlimited
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Page Title ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-violet-500" />
            <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">
              Creator Utility Suite
            </span>
          </div>
          <h2 className="text-2xl font-medium text-stone-900 mb-1">
            Remove image background
          </h2>
          <p className="text-sm text-stone-500">
            Upload up to 5 images. AI removes backgrounds in seconds. Download
            transparent PNG.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* ── Left: Upload / Preview ── */}
          <div className="space-y-4">
            {/* Upload zone */}
            <AnimatePresence mode="wait">
              {state === "idle" || state === "error" ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none",
                      dragActive
                        ? "border-violet-400 bg-violet-50"
                        : "border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50/40"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept={ACCEPTED_TYPES.join(",")}
                      multiple
                      onChange={(e) =>
                        validateAndSetFiles(
                          Array.from(e.target.files ?? [])
                        )
                      }
                    />

                    <motion.div
                      animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                      className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4"
                    >
                      <Upload size={24} className="text-violet-600" />
                    </motion.div>

                    <p className="text-sm font-medium text-stone-800 mb-1">
                      {dragActive
                        ? "Drop images here"
                        : "Drag & drop images here"}
                    </p>
                    <p className="text-xs text-stone-400">
                      or click to browse · JPG, PNG, WebP · max 10MB each · up
                      to {MAX_FILES} images
                    </p>

                    {dragActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-2 rounded-xl border-2 border-violet-400 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 space-y-2"
                    >
                      {files.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-4 py-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">
                              {f.name}
                            </p>
                            <p className="text-xs text-stone-400">
                              {formatBytes(f.size)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
                            }}
                            className="text-stone-300 hover:text-stone-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                    >
                      <AlertCircle size={15} />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                </motion.div>
              ) : state === "uploading" || state === "processing" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-stone-100 rounded-2xl p-12 flex flex-col items-center justify-center gap-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                      <Loader2 size={28} className="text-violet-600 animate-spin" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-stone-800">
                      {state === "uploading"
                        ? "Uploading images..."
                        : "Removing backgrounds with AI..."}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      This usually takes 3–8 seconds per image
                    </p>
                  </div>
                  <div className="w-48 h-1 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 4, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ) : state === "done" && activeImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-stone-100 rounded-2xl overflow-hidden"
                >
                  {/* Result header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium text-stone-800">
                        Background removed
                      </span>
                      {processed.length > 1 && (
                        <span className="text-xs bg-stone-100 text-stone-500 rounded-full px-2 py-0.5">
                          {activeIndex + 1} / {processed.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <RotateCcw size={12} />
                        New batch
                      </button>
                      <button
                        onClick={() => handleDownload(activeImage)}
                        className="flex items-center gap-1.5 text-xs text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <Download size={12} />
                        Download PNG
                      </button>
                    </div>
                  </div>

                  {/* Before/After slider */}
                  <div
                    ref={sliderRef}
                    className="relative select-none overflow-hidden"
                    style={{
                      height: 400,
                      cursor: isDraggingSlider ? "ew-resize" : "default",
                    }}
                    onMouseMove={handleSliderMouseMove}
                    onMouseUp={handleSliderMouseUp}
                    onMouseLeave={handleSliderMouseUp}
                  >
                    {/* Result layer (bottom) — two separate layers:
                        1. Color/pattern background behind the PNG
                        2. PNG image on top with mix-blend-mode normal
                        This ensures transparent PNG pixels show the
                        chosen background color correctly */}
                    <div className="absolute inset-0">
                      {/* Layer 1: background color or checkerboard */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            bgColor === "transparent"
                              ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23e5e5e5'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e5e5e5'/%3E%3Crect x='10' width='10' height='10' fill='%23f5f5f5'/%3E%3Crect y='10' width='10' height='10' fill='%23f5f5f5'/%3E%3C/svg%3E")`
                              : bgColor,
                          backgroundSize:
                            bgColor === "transparent" ? "20px 20px" : "auto",
                        }}
                      />
                      {/* Layer 2: PNG image — transparent areas reveal Layer 1 */}
                      <img
                        src={activeImage.resultUrl}
                        alt="Background removed"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ background: "transparent" }}
                      />
                    </div>

                    {/* Original layer (clipped left portion) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <div className="absolute inset-0 bg-stone-50">
                        <img
                          src={activeImage.originalUrl}
                          alt="Original"
                          className="w-full h-full object-contain"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>

                    {/* Slider handle */}
                    <div
                      className="absolute top-0 bottom-0 flex items-center"
                      style={{
                        left: `calc(${sliderPos}% - 1px)`,
                        zIndex: 10,
                      }}
                    >
                      <div className="w-0.5 h-full bg-white opacity-90" />
                      <div
                        onMouseDown={handleSliderMouseDown}
                        className="absolute w-8 h-8 rounded-full bg-white border-2 border-violet-400 flex items-center justify-center cursor-ew-resize shadow-md"
                        style={{ left: -16, top: "50%", marginTop: -16 }}
                      >
                        <div className="flex items-center gap-0.5">
                          <ChevronLeft size={10} className="text-violet-500" />
                          <ChevronRight size={10} className="text-violet-500" />
                        </div>
                      </div>
                    </div>

                    {/* Labels */}
                    <span className="absolute top-3 left-3 text-xs bg-black/40 text-white rounded-full px-2 py-0.5 backdrop-blur-sm">
                      Original
                    </span>
                    <span className="absolute top-3 right-3 text-xs bg-black/40 text-white rounded-full px-2 py-0.5 backdrop-blur-sm">
                      No background
                    </span>
                  </div>

                  {/* Multi-image nav */}
                  {processed.length > 1 && (
                    <div className="flex items-center gap-2 px-5 py-3 border-t border-stone-100 overflow-x-auto">
                      {processed.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setActiveIndex(i);
                            setSliderPos(50);
                          }}
                          className={cn(
                            "w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all",
                            i === activeIndex
                              ? "border-violet-500"
                              : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img
                            src={img.resultUrl}
                            alt={img.filename}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* ── Right: Controls & Info ── */}
          <div className="space-y-4">
            {/* Action button */}
            {(state === "idle" || state === "error") && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                disabled={files.length === 0}
                onClick={handleProcess}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all",
                  files.length > 0
                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed"
                )}
              >
                <Sparkles size={16} />
                Remove background
                {files.length > 0 && (
                  <span className="bg-violet-500 rounded-full text-xs px-2 py-0.5">
                    {files.length} {files.length === 1 ? "image" : "images"}
                  </span>
                )}
              </motion.button>
            )}

            {state === "done" && processed.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Download size={15} />
                Download all {processed.length} images
              </button>
            )}

            {/* Background color picker (only when result is visible) */}
            {state === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-stone-100 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal size={14} className="text-stone-400" />
                  <span className="text-xs font-medium text-stone-700">
                    Preview background
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {BG_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBgColor(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-xs",
                        bgColor === opt.value
                          ? "border-violet-400 bg-violet-50"
                          : "border-stone-100 hover:border-stone-300"
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-lg border border-stone-200 overflow-hidden"
                        style={
                          opt.preview === "checkerboard"
                            ? {
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' width='8' height='8' fill='%23fff'/%3E%3Crect y='8' width='8' height='8' fill='%23fff'/%3E%3C/svg%3E")`,
                              }
                            : { backgroundColor: opt.preview }
                        }
                      />
                      <span className="text-stone-500">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Download with the currently selected background color baked in.
                    Hidden when "Transparent" is selected since that's identical
                    to the regular "Download PNG" button above. */}
                {bgColor !== "transparent" && activeImage && (
                  <button
                    onClick={() => handleDownloadWithBackground(activeImage, bgColor)}
                    disabled={flattening}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "#7C3AED",
                      color: "white",
                    }}
                  >
                    {flattening ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Applying background...
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        Download with{" "}
                        {BG_OPTIONS.find((o) => o.value === bgColor)?.label} background
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}

            {/* File info card */}
            {state === "done" && activeImage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-stone-100 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-stone-400" />
                  <span className="text-xs font-medium text-stone-700">
                    File details
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "Filename",
                      value: activeImage.filename,
                    },
                    {
                      label: "Original size",
                      value: formatBytes(activeImage.originalSize),
                    },
                    {
                      label: "Result size",
                      value:
                        activeImage.resultSize > 0
                          ? formatBytes(activeImage.resultSize)
                          : "—",
                    },
                    { label: "Format", value: "PNG (transparent)" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-xs text-stone-400">
                        {row.label}
                      </span>
                      <span className="text-xs text-stone-700 font-medium truncate max-w-[160px]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* How it works */}
            <div className="bg-white border border-stone-100 rounded-2xl p-4">
              <p className="text-xs font-medium text-stone-700 mb-3">
                How it works
              </p>
              <ol className="space-y-2.5">
                {[
                  {
                    icon: Upload,
                    text: "Upload your image (JPG, PNG, WebP)",
                  },
                  { icon: Sparkles, text: "AI detects and removes the background" },
                  { icon: Download, text: "Download your transparent PNG instantly" },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-medium text-violet-600">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 leading-relaxed">
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-medium text-amber-800 mb-2">
                💡 Pro tips
              </p>
              <ul className="space-y-1.5">
                {[
                  "Works best with clear subject-background contrast",
                  "Hair and fur are handled automatically",
                  "Upgrade to Pro for batch of 50+ images",
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-amber-700">
                    · {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── SEO Content Section ── */}
        <div className="mt-16 border-t border-stone-200 pt-12">
          <div className="max-w-2xl">
            <h2 className="text-lg font-medium text-stone-900 mb-3">
              AI Background Remover for Creators
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-6">
              Creator Hub's background remover uses advanced AI to detect
              subjects and remove backgrounds with pixel-perfect precision. No
              more manual masking in Photoshop — upload your image, get a
              transparent PNG in seconds. Perfect for product photos, profile
              pictures, YouTube thumbnails, and social media graphics.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Formats supported", value: "JPG, PNG, WebP" },
                { label: "Max file size", value: "10 MB" },
                { label: "Output format", value: "Transparent PNG" },
                { label: "Processing time", value: "3–8 seconds" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-stone-100 rounded-xl p-3"
                >
                  <p className="text-xs text-stone-400 mb-1">{stat.label}</p>
                  <p className="text-sm font-medium text-stone-800">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
