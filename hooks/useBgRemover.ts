"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RemoverState = "idle" | "uploading" | "processing" | "done" | "error";

export interface ProcessedImage {
  id: string;
  originalUrl: string;
  resultUrl: string;
  filename: string;
  originalSize: number;
  resultSize: number;
  width?: number;
  height?: number;
}

interface UseBgRemoverReturn {
  files: File[];
  state: RemoverState;
  processed: ProcessedImage[];
  error: string | null;
  addFiles: (incoming: File[]) => void;
  removeFile: (index: number) => void;
  process: () => Promise<void>;
  reset: () => void;
  downloadSingle: (img: ProcessedImage) => void;
  downloadAll: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBgRemover(): UseBgRemoverReturn {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<RemoverState>("idle");
  const [processed, setProcessed] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...incoming].slice(0, 5));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const process = useCallback(async () => {
    if (files.length === 0) return;
    setState("uploading");
    setError(null);
    setProcessed([]);

    const results: ProcessedImage[] = [];

    try {
      for (const file of files) {
        setState("processing");

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/tools/background-remover", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Processing failed");
        }

        results.push({
          id: crypto.randomUUID(),
          originalUrl: URL.createObjectURL(file),
          resultUrl: data.resultUrl,
          filename: file.name.replace(/\.[^.]+$/, "") + "_no_bg.png",
          originalSize: file.size,
          resultSize: data.resultSize ?? 0,
          width: data.width,
          height: data.height,
        });
      }

      setProcessed(results);
      setState("done");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setState("error");
    }
  }, [files]);

  const reset = useCallback(() => {
    setFiles([]);
    setProcessed([]);
    setState("idle");
    setError(null);
  }, []);

  const downloadSingle = useCallback((img: ProcessedImage) => {
    const a = document.createElement("a");
    a.href = img.resultUrl;
    a.download = img.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAll = useCallback(() => {
    // Stagger downloads to avoid browser blocking
    processed.forEach((img, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = img.resultUrl;
        a.download = img.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 300);
    });
  }, [processed]);

  return {
    files,
    state,
    processed,
    error,
    addFiles,
    removeFile,
    process,
    reset,
    downloadSingle,
    downloadAll,
  };
}
