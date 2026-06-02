"use client";

import type { Platform } from "@/lib/mimo";
import { IconInstagram, IconTwitter, IconTiktok } from "./icons";

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

const platforms: {
  id: Platform;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    icon: <IconInstagram />,
    desc: "Aesthetic & engaging",
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: <IconTwitter />,
    desc: "Singkat & impactful",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: <IconTiktok />,
    desc: "Hook kuat, bahasa gaul",
  },
];

export default function PlatformSelector({
  selected,
  onSelect,
}: PlatformSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const next = e.key === "ArrowRight" || e.key === "ArrowDown";
    const prev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!next && !prev) return;
    e.preventDefault();
    const newIndex = next
      ? (index + 1) % platforms.length
      : (index - 1 + platforms.length) % platforms.length;
    onSelect(platforms[newIndex].id);
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {platforms.map((p, index) => {
        const isSelected = selected === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              platform-card relative flex flex-col items-center gap-2 py-4 sm:py-5 px-2 sm:px-3 text-center
              ${
                isSelected
                  ? "bg-[var(--accent)] text-white shadow-[var(--shadow-md)]"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--subtle)] hover:text-[var(--fg)] shadow-[var(--shadow-sm)]"
              }
            `}
            data-selected={isSelected}
            aria-checked={isSelected}
            role="radio"
            tabIndex={isSelected ? 0 : -1}
            aria-label={p.label}
          >
            <span className={isSelected ? "text-white" : "text-[var(--muted)]"}>
              {p.icon}
            </span>
            <span
              className="font-bold text-xs tracking-tight"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {p.label}
            </span>
            <span
              className={`text-[8px] sm:text-[10px] leading-tight ${
                isSelected ? "text-white/70" : "text-[var(--subtle)]"
              }`}
            >
              {p.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
