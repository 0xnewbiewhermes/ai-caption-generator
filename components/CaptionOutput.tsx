"use client";

import { useState, useRef, useEffect } from "react";
import type { GenerateResponse } from "@/lib/mimo";
import { IconCopy, IconCheck, IconRefresh } from "./icons";

interface CaptionOutputProps {
  result: GenerateResponse;
  onRegenerate: () => void;
  isLoading: boolean;
}

export default function CaptionOutput({
  result,
  onRegenerate,
  isLoading,
}: CaptionOutputProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.caption);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.caption;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCopied(true);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const platformLabel = {
    instagram: "Instagram",
    twitter: "Twitter / X",
    tiktok: "TikTok",
  }[result.platform];

  const isOverLimit = result.platform === "twitter" && result.charCount > 280;

  return (
    <div className="space-y-4 animate-in">
      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className="label">
          Hasil untuk {platformLabel}
        </span>
        <span
          className={`text-[10px] tabular-nums ${
            isOverLimit
              ? "text-[var(--red)] font-bold"
              : "text-[var(--subtle)]"
          }`}
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {result.charCount}
          {result.platform === "twitter" && " / 280"}
        </span>
      </div>

      {/* Caption */}
      <div className="card p-5 border-l-[3px] border-l-[var(--accent)]">
        <pre className="whitespace-pre-wrap text-sm text-[var(--fg)] leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
          {result.caption}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleCopy} className="btn btn-primary flex-1">
          {copied ? (
            <>
              <IconCheck className="w-4 h-4" />
              Tersalin
            </>
          ) : (
            <>
              <IconCopy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          <IconRefresh
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Ulang
        </button>
      </div>
    </div>
  );
}
