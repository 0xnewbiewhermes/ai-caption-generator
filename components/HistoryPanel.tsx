"use client";

import { useState, useEffect } from "react";
import type { Platform, Tone } from "@/lib/mimo";
import { getHistory, toggleFavorite, deleteFromHistory, clearHistory, type HistoryItem } from "@/lib/history";
import { IconCopy, IconCheck, IconRefresh, IconArrowRight } from "./icons";

interface HistoryPanelProps {
  onSelect: (item: HistoryItem) => void;
  isLoading: boolean;
}

export default function HistoryPanel({ onSelect, isLoading }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "favorite">("all");
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const refresh = () => setHistory(getHistory());

  const filtered = filter === "favorite" ? history.filter((h) => h.favorite) : history;

  const handleCopy = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.caption);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = item.caption;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); } finally { document.body.removeChild(textarea); }
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    refresh();
  };

  const handleClear = () => {
    clearHistory(true);
    refresh();
  };

  if (history.length === 0) return null;

  const platformLabel: Record<Platform, string> = {
    instagram: "IG",
    twitter: "X",
    tiktok: "TT",
  };

  return (
    <div className="card border border-[var(--border)]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-warm)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="label">History</span>
          <span
            className="text-[10px] text-[var(--subtle)] tabular-nums"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {history.length} caption
          </span>
        </div>
        <span
          className={`text-[var(--subtle)] transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          →
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-[var(--border)]">
          {/* Tabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
            <div className="flex gap-1">
              {(["all", "favorite"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                    filter === f
                      ? "bg-[var(--fg)] text-[var(--bg)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  }`}
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {f === "all" ? "Semua" : "Favorit"}
                </button>
              ))}
            </div>
            <button
              onClick={handleClear}
              className="text-[10px] text-[var(--subtle)] hover:text-[var(--accent)] transition-colors"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              Hapus semua
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--subtle)]">
                {filter === "favorite" ? "Belum ada favorit" : "Belum ada history"}
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-warm)] transition-colors group"
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="tag text-[8px] px-1.5 py-0.5">
                        {platformLabel[item.platform]}
                      </span>
                      <span className="text-[9px] text-[var(--subtle)]" style={{ fontFamily: "var(--font-space-mono)" }}>
                        {item.tone === "custom" ? "custom" : item.tone}
                      </span>
                      <span className="text-[9px] text-[var(--subtle)] tabular-nums" style={{ fontFamily: "var(--font-space-mono)" }}>
                        {item.charCount} char
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mb-1 truncate">
                      {item.topic}
                    </p>
                    <p className="text-xs text-[var(--fg-dim)] line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1.5 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                      title="Copy"
                    >
                      {copiedId === item.id ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className={`p-1.5 transition-colors ${
                        item.favorite ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--accent)]"
                      }`}
                      title="Favorite"
                    >
                      {item.favorite ? "★" : "☆"}
                    </button>
                    <button
                      onClick={() => onSelect(item)}
                      className="p-1.5 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                      title="Pakai lagi"
                    >
                      <IconArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-[var(--subtle)] hover:text-[var(--accent)] transition-colors"
                      title="Hapus"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
