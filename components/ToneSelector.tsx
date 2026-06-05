"use client";

import { useState } from "react";
import type { Tone } from "@/lib/mimo";

interface ToneSelectorProps {
  selected: Tone;
  onSelect: (tone: Tone) => void;
  customTone: string;
  onCustomToneChange: (value: string) => void;
}

const tones: { id: Tone; label: string }[] = [
  { id: "casual", label: "Santai" },
  { id: "professional", label: "Profesional" },
  { id: "funny", label: "Lucu" },
  { id: "motivational", label: "Motivasi" },
  { id: "storytelling", label: "Cerita" },
  { id: "genz", label: "Gen Z" },
  { id: "poetic", label: "Puitis" },
  { id: "educational", label: "Edukatif" },
  { id: "promo", label: "Promo" },
  { id: "custom", label: "Custom" },
];

export default function ToneSelector({
  selected,
  onSelect,
  customTone,
  onCustomToneChange,
}: ToneSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const next = e.key === "ArrowRight" || e.key === "ArrowDown";
    const prev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!next && !prev) return;
    e.preventDefault();
    const newIndex = next
      ? (index + 1) % tones.length
      : (index - 1 + tones.length) % tones.length;
    onSelect(tones[newIndex].id);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {tones.map((t, index) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                tone-pill px-4 py-2 text-xs font-semibold tracking-wide
                ${
                  isSelected
                    ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
                    : "bg-transparent border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--subtle)]"
                }
              `}
              aria-checked={isSelected}
              role="radio"
              tabIndex={isSelected ? 0 : -1}
              aria-label={t.label}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Custom tone textarea */}
      {selected === "custom" && (
        <div className="animate-in">
          <textarea
            value={customTone}
            onChange={(e) => onCustomToneChange(e.target.value)}
            placeholder="Deskripsikan gaya bahasa yang kamu mau… contoh: 'Saya influencer skincare, target cewek 20-30, friendly tapi edukatif'"
            maxLength={200}
            rows={2}
            className="input resize-none text-sm"
          />
          <span
            className="text-[10px] text-[var(--subtle)] tabular-nums mt-1 block text-right"
            style={{ fontFamily: "var(--font-space-mono)" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {customTone.length}/200
          </span>
        </div>
      )}
    </div>
  );
}
