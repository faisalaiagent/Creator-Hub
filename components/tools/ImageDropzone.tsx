"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
  maxSizeMB?: number;
  maxFiles?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function ImageDropzone({
  onFilesSelected,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 10,
  maxFiles = 5,
  label = "Drag & drop images here",
  sublabel,
  className,
  disabled = false,
}: ImageDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback(
    (incoming: File[]) => {
      setError(null);
      const maxBytes = maxSizeMB * 1024 * 1024;

      const valid: File[] = [];
      const errors: string[] = [];

      for (const f of incoming) {
        if (!accept.includes(f.type)) {
          errors.push(`${f.name}: unsupported format`);
          continue;
        }
        if (f.size > maxBytes) {
          errors.push(`${f.name}: exceeds ${maxSizeMB}MB`);
          continue;
        }
        valid.push(f);
      }

      if (errors.length > 0) setError(errors[0]);

      if (valid.length === 0) return;

      const newPreviews = valid.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
      }));

      setPreviews((prev) => {
        const combined = [...prev, ...newPreviews].slice(0, maxFiles);
        onFilesSelected(combined.map((p) => p.file));
        return combined;
      });
    },
    [accept, maxSizeMB, maxFiles, onFilesSelected]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      validateAndAdd(Array.from(e.dataTransfer.files));
    },
    [validateAndAdd]
  );

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onFilesSelected(next.map((p) => p.file));
      return next;
    });
  };

  const acceptStr = accept.join(",");
  const defaultSublabel = `${accept
    .map((a) => a.split("/")[1].toUpperCase())
    .join(", ")} · max ${maxSizeMB}MB · up to ${maxFiles} images`;

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-200 select-none",
          disabled
            ? "opacity-50 cursor-not-allowed border-stone-200 bg-stone-50"
            : dragActive
            ? "border-violet-400 bg-violet-50 cursor-copy"
            : "border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50/30 cursor-pointer"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptStr}
          multiple={maxFiles > 1}
          disabled={disabled}
          onChange={(e) => validateAndAdd(Array.from(e.target.files ?? []))}
        />

        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
            dragActive ? "bg-violet-200" : "bg-violet-100"
          )}
        >
          <Upload size={22} className="text-violet-600" />
        </div>

        <p className="text-sm font-medium text-stone-800 mb-1">{label}</p>
        <p className="text-xs text-stone-400 text-center">
          {sublabel ?? defaultSublabel}
        </p>

        {dragActive && (
          <div className="absolute inset-2 rounded-xl border-2 border-violet-400 pointer-events-none" />
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {previews.length > 0 && (
        <ul className="mt-3 space-y-2">
          {previews.map(({ file, url }, i) => (
            <li
              key={url}
              className="flex items-center gap-3 bg-white border border-stone-100 rounded-xl px-4 py-3"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-stone-400">
                  {file.size > 1024 * 1024
                    ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.round(file.size / 1024)} KB`}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="text-stone-300 hover:text-red-400 transition-colors p-1"
                aria-label={`Remove ${file.name}`}
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
