"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type OutputFormat = "jpeg" | "png" | "webp" | "original";
export type ItemStatus = "pending" | "processing" | "done" | "error";
export type CompressorState = "idle" | "processing" | "done" | "error";

export interface CompressedItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ItemStatus;
  originalSize: number;
  compressedSize?: number;
  compressedUrl?: string;
  compressedFilename?: string;
  savingsPercent?: number;
  width?: number;
  height?: number;
  error?: string;
}

interface UseImageCompressorReturn {
  items: CompressedItem[];
  state: CompressorState;
  quality: number;
  format: OutputFormat;
  error: string | null;
  doneItems: CompressedItem[];
  totalOriginal: number;
  totalCompressed: number;
  totalSavedPct: number;
  pendingCount: number;
  isProcessing: boolean;
  setQuality: (q: number) => void;
  setFormat: (f: OutputFormat) => void;
  addFiles: (files: File[]) => void;
  removeItem: (id: string) => void;
  compress: () => Promise<void>;
  downloadSingle: (item: CompressedItem) => void;
  downloadAll: () => void;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useImageCompressor(): UseImageCompressorReturn {
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [state, setState] = useState<CompressorState>("idle");
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [error, setError] = useState<string | null>(null);

  const MAX_FILES = 10;
  const MAX_SIZE = 20 * 1024 * 1024;
  const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const addFiles = useCallback(
    (incoming: File[]) => {
      setError(null);
      const valid = incoming.filter(
        (f) => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE
      );
      if (valid.length === 0) {
        setError("No valid images. Use JPG, PNG, or WebP under 20 MB.");
        return;
      }
      const newItems: CompressedItem[] = valid
        .slice(0, MAX_FILES - items.length)
        .map((f) => ({
          id: crypto.randomUUID(),
          file: f,
          previewUrl: URL.createObjectURL(f),
          status: "pending",
          originalSize: f.size,
        }));
      setItems((prev) => [...prev, ...newItems].slice(0, MAX_FILES));
      if (state === "done") setState("idle");
    },
    [items.length, state]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = (id: string, patch: Partial<CompressedItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const compress = useCallback(async () => {
    setItems((prev) => {
      // snapshot pending IDs for this run
      return prev;
    });

    const currentItems = items.filter((i) => i.status === "pending");
    if (currentItems.length === 0) return;

    setState("processing");
    setError(null);

    for (const item of currentItems) {
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

        updateItem(item.id, {
          status: "done",
          compressedSize: data.compressedSize,
          compressedUrl: data.url,
          compressedFilename: data.filename,
          savingsPercent: data.savingsPercent,
          width: data.width,
          height: data.height,
        });
      } catch (err: unknown) {
        updateItem(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Failed",
        });
      }
    }

    setState("done");
  }, [items, quality, format]);

  const downloadSingle = useCallback((item: CompressedItem) => {
    if (!item.compressedUrl || !item.compressedFilename) return;
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = item.compressedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAll = useCallback(() => {
    const done = items.filter((i) => i.status === "done");
    done.forEach((item, idx) => {
      setTimeout(() => downloadSingle(item), idx * 250);
    });
  }, [items, downloadSingle]);

  const reset = useCallback(() => {
    setItems([]);
    setState("idle");
    setError(null);
  }, []);

  // Derived
  const doneItems = items.filter((i) => i.status === "done");
  const totalOriginal = doneItems.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = doneItems.reduce((s, i) => s + (i.compressedSize ?? 0), 0);
  const totalSaved = totalOriginal - totalCompressed;
  const totalSavedPct =
    totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const isProcessing = state === "processing";

  return {
    items,
    state,
    quality,
    format,
    error,
    doneItems,
    totalOriginal,
    totalCompressed,
    totalSavedPct,
    pendingCount,
    isProcessing,
    setQuality,
    setFormat,
    addFiles,
    removeItem,
    compress,
    downloadSingle,
    downloadAll,
    reset,
  };
}
