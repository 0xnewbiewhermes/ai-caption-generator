"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Platform, Tone, GenerateResponse } from "@/lib/mimo";
import { saveToHistory, type HistoryItem } from "@/lib/history";
import { canGenerate, incrementUsage, getRemainingGenerations, getDailyLimit } from "@/lib/usage";
import PlatformSelector from "./PlatformSelector";
import ToneSelector from "./ToneSelector";
import TopicForm from "./TopicForm";
import CaptionOutput from "./CaptionOutput";
import VariantSelector from "./VariantSelector";
import HistoryPanel from "./HistoryPanel";

export default function CaptionGenerator() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState<Tone>("casual");
  const [customTone, setCustomTone] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Variants state
  const [variantCount, setVariantCount] = useState(1);
  const [variants, setVariants] = useState<GenerateResponse[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [streamingVariants, setStreamingVariants] = useState<{ index: number; text: string }[]>([]);

  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(
    async (inputTopic: string) => {
      // Check usage limit
      if (!canGenerate()) {
        setError(`Batas ${getDailyLimit()}x generate per hari sudah habis. Coba lagi besok.`);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);
      setStreamingText("");
      setVariants([]);
      setSelectedVariant(null);
      setStreamingVariants([]);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: inputTopic,
            platform,
            tone,
            customTone: tone === "custom" ? customTone : undefined,
            stream: true,
            count: variantCount,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await res.json();
            throw new Error(data.error || "Gagal membuat caption");
          }
          throw new Error(`Server error (${res.status}). Coba lagi.`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Gagal membaca response stream.");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let event: { type: string; content: string; charCount?: number; index?: number };
            try {
              event = JSON.parse(line);
            } catch {
              continue;
            }

            if (variantCount === 1) {
              // Single variant mode — original behavior
              if (event.type === "chunk") {
                setStreamingText((prev) => prev + event.content);
              } else if (event.type === "done") {
                const finalResult = {
                  caption: event.content,
                  charCount: event.charCount ?? 0,
                  platform,
                  tone,
                };
                setResult(finalResult);
                incrementUsage();
                saveToHistory({
                  topic: inputTopic,
                  platform,
                  tone,
                  caption: finalResult.caption,
                  charCount: finalResult.charCount,
                });
              } else if (event.type === "error") {
                throw new Error(event.content);
              }
            } else {
              // Multi-variant mode
              const idx = event.index ?? 0;

              if (event.type === "variant_start") {
                setStreamingVariants((prev) => [...prev.filter((v) => v.index !== idx), { index: idx, text: "" }]);
              } else if (event.type === "chunk") {
                setStreamingVariants((prev) =>
                  prev.map((v) => (v.index === idx ? { ...v, text: v.text + event.content } : v))
                );
              } else if (event.type === "variant_done") {
                const variant: GenerateResponse = {
                  caption: event.content,
                  charCount: event.charCount ?? 0,
                  platform,
                  tone,
                };
                setVariants((prev) => {
                  const next = [...prev];
                  next[idx] = variant;
                  return next;
                });
                setStreamingVariants((prev) => prev.filter((v) => v.index !== idx));

                // Save first variant to history
                if (idx === 0) {
                  saveToHistory({
                    topic: inputTopic,
                    platform,
                    tone,
                    caption: variant.caption,
                    charCount: variant.charCount,
                  });
                }
              } else if (event.type === "all_done") {
                // Auto-select first variant
                setSelectedVariant(0);
              } else if (event.type === "error") {
                throw new Error(event.content);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError(
            "Request timeout. Coba lagi atau gunakan topik yang lebih singkat."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan. Coba lagi."
          );
        }
        setResult(null);
        setStreamingText("");
        setVariants([]);
        setStreamingVariants([]);
      } finally {
        setIsLoading(false);
      }
    },
    [platform, tone, customTone, variantCount]
  );

  useEffect(() => {
    if (result || streamingText || variants.length > 0) {
      outputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [result, streamingText, variants]);

  // Cleanup: abort fetch on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleRegenerate = useCallback(() => {
    if (topic.trim()) {
      handleGenerate(topic.trim());
    }
  }, [topic, handleGenerate]);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setTopic(item.topic);
    setPlatform(item.platform);
    if (item.tone !== "custom") setTone(item.tone);
    setResult({
      caption: item.caption,
      charCount: item.charCount,
      platform: item.platform,
      tone: item.tone,
    });
    setVariants([]);
    setSelectedVariant(null);
  }, []);

  const handleVariantSelect = useCallback(
    (index: number) => {
      setSelectedVariant(index);
      const variant = variants[index];
      if (variant) {
        setResult(variant);
        saveToHistory({
          topic,
          platform,
          tone,
          caption: variant.caption,
          charCount: variant.charCount,
        });
      }
    },
    [variants, topic, platform, tone]
  );

  return (
    <section
      id="main-content"
      tabIndex={-1}
      className="w-full max-w-xl mx-auto space-y-8 outline-none"
      aria-label="Caption Generator"
    >
      {/* Platform */}
      <div className="space-y-3">
        <span className="label">Platform</span>
        <div role="radiogroup" aria-label="Platform social media">
          <PlatformSelector selected={platform} onSelect={setPlatform} />
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-3">
        <span className="label">Gaya bahasa</span>
        <div role="radiogroup" aria-label="Gaya bahasa caption">
          <ToneSelector selected={tone} onSelect={setTone} customTone={customTone} onCustomToneChange={setCustomTone} />
        </div>
      </div>

      {/* Topic */}
      <div className="space-y-3">
        <TopicForm
          onSubmit={handleGenerate}
          isLoading={isLoading}
          topic={topic}
          onTopicChange={setTopic}
          variantCount={variantCount}
          onVariantCountChange={setVariantCount}
        />
        {/* Usage counter */}
        <div className="flex items-center justify-between">
          <span className="label">Sisa generate hari ini</span>
          <span
            className={`text-[11px] font-bold tabular-nums ${
              getRemainingGenerations() <= 1 ? "text-[var(--red)]" : "text-[var(--muted)]"
            }`}
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {getRemainingGenerations()} / {getDailyLimit()}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 bg-[var(--red-light)] border border-[var(--red)]/20 rounded-xl text-sm text-[var(--red)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Streaming output — single variant */}
      {variantCount === 1 && isLoading && streamingText && (
        <div ref={outputRef} className="space-y-3 animate-in" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="label">Sedang menulis…</span>
            <span
              className="text-[10px] text-[var(--muted)]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              streaming
            </span>
          </div>
          <div className="card p-5 border-l-[3px] border-l-[var(--yellow-fg)]">
            <pre className="whitespace-pre-wrap text-sm text-[var(--fg)] font-sans leading-relaxed">
              {streamingText}
              <span className="streaming-cursor" />
            </pre>
          </div>
        </div>
      )}

      {/* Multi-variant output */}
      {variantCount > 1 && (variants.length > 0 || streamingVariants.length > 0 || isLoading) && (
        <div ref={outputRef} aria-live="polite">
          <VariantSelector
            variants={variants}
            selected={selectedVariant}
            onSelect={handleVariantSelect}
            isLoading={isLoading}
            streamingVariants={streamingVariants}
          />
        </div>
      )}

      {/* Final output — single variant */}
      {variantCount === 1 && result && !isLoading && (
        <div ref={outputRef} aria-live="polite">
          <CaptionOutput
            result={result}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Final output — selected variant */}
      {variantCount > 1 && selectedVariant !== null && !isLoading && result && (
        <div ref={outputRef} aria-live="polite">
          <CaptionOutput
            result={result}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* History */}
      <HistoryPanel onSelect={handleHistorySelect} isLoading={isLoading} />
    </section>
  );
}
