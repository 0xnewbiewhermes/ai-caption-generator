"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Platform, Tone, GenerateResponse } from "@/lib/mimo";
import PlatformSelector from "./PlatformSelector";
import ToneSelector from "./ToneSelector";
import TopicForm from "./TopicForm";
import CaptionOutput from "./CaptionOutput";

export default function CaptionGenerator() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [tone, setTone] = useState<Tone>("casual");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(
    async (inputTopic: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);
      setStreamingText("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: inputTopic,
            platform,
            tone,
            stream: true,
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
            let event: { type: string; content: string; charCount?: number };
            try {
              event = JSON.parse(line);
            } catch {
              continue;
            }

            if (event.type === "chunk") {
              setStreamingText((prev) => prev + event.content);
            } else if (event.type === "done") {
              setResult({
                caption: event.content,
                charCount: event.charCount ?? 0,
                platform,
                tone,
              });
            } else if (event.type === "error") {
              throw new Error(event.content);
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
      } finally {
        setIsLoading(false);
      }
    },
    [platform, tone]
  );

  useEffect(() => {
    if (result || streamingText) {
      outputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [result, streamingText]);

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

  return (
    <section
      id="main-content"
      className="w-full max-w-xl mx-auto space-y-8"
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
          <ToneSelector selected={tone} onSelect={setTone} />
        </div>
      </div>

      {/* Topic */}
      <div className="space-y-3">
        <TopicForm
          onSubmit={handleGenerate}
          isLoading={isLoading}
          topic={topic}
          onTopicChange={setTopic}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-sm text-[var(--accent)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Streaming output */}
      {isLoading && streamingText && (
        <div ref={outputRef} className="space-y-3 animate-in" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="label">Sedang menulis...</span>
            <span
              className="text-[10px] text-[var(--accent)]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              streaming
            </span>
          </div>
          <div className="card p-5 border-l-[3px] border-l-[var(--yellow)]">
            <pre className="whitespace-pre-wrap text-sm text-[var(--fg)] font-sans leading-relaxed">
              {streamingText}
              <span className="streaming-cursor" />
            </pre>
          </div>
        </div>
      )}

      {/* Final output */}
      {result && !isLoading && (
        <div ref={outputRef} aria-live="polite">
          <CaptionOutput
            result={result}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
          />
        </div>
      )}
    </section>
  );
}
