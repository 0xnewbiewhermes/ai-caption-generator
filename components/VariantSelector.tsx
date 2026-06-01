"use client";

import { useState } from "react";
import type { GenerateResponse } from "@/lib/mimo";
import { IconCopy, IconCheck } from "./icons";

interface VariantSelectorProps {
  variants: GenerateResponse[];
  selected: number | null;
  onSelect: (index: number) => void;
  isLoading: boolean;
  streamingVariants: { index: number; text: string }[];
}

export default function VariantSelector({
  variants,
  selected,
  onSelect,
  isLoading,
  streamingVariants,
}: VariantSelectorProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); } finally { document.body.removeChild(textarea); }
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Show streaming cards for variants being generated
  const allCards = Array.from({ length: 3 }, (_, i) => {
    const variant = variants[i];
    const streaming = streamingVariants.find((s) => s.index === i);
    return { index: i, variant, streaming };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="label">3 Variasi</span>
        {selected !== null && (
          <span className="text-[10px] text-[var(--accent)]" style={{ fontFamily: "var(--font-space-mono)" }}>
            Varian {selected + 1} dipilih
          </span>
        )}
      </div>

      <div className="grid gap-3">
        {allCards.map(({ index, variant, streaming }) => {
          const isSelected = selected === index;
          const hasContent = variant || streaming;
          const displayText = variant?.caption || streaming?.text || "";
          const isStreaming = !variant && streaming && isLoading;

          return (
            <div
              key={index}
              className={`
                card p-4 border-l-[3px] cursor-pointer transition-all
                ${isSelected ? "border-l-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-l-[var(--border)] hover:border-l-[var(--yellow)]"}
                ${!hasContent ? "opacity-40" : ""}
              `}
              onClick={() => variant && onSelect(index)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold tracking-wide uppercase"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  Varian {index + 1}
                </span>
                {variant && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--subtle)] tabular-nums" style={{ fontFamily: "var(--font-space-mono)" }}>
                      {variant.charCount} char
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(variant.caption, index);
                      }}
                      className="p-1 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                    >
                      {copiedIndex === index ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              {hasContent ? (
                <pre className="whitespace-pre-wrap text-sm text-[var(--fg)] font-sans leading-relaxed">
                  {displayText}
                  {isStreaming && <span className="streaming-cursor" />}
                </pre>
              ) : (
                <div className="text-sm text-[var(--subtle)] italic">
                  Menunggu...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
