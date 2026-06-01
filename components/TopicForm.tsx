"use client";

import { useState, useEffect, useRef } from "react";
import { IconSpinner, IconArrowRight } from "./icons";

interface TopicFormProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  topic: string;
  onTopicChange: (topic: string) => void;
}

const examples = [
  "caption galau",
  "promo skincare",
  "tips produktif",
  "review kopi",
  "liburan bali",
  "motivasi pagi",
];

export default function TopicForm({
  onSubmit,
  isLoading,
  topic,
  onTopicChange,
}: TopicFormProps) {
  const setTopic = onTopicChange;
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isLoading) return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      clearInterval(interval);
      setElapsed(0);
    };
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  const handleExample = (example: string) => {
    setTopic(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="label mb-1.5 block">Topik</label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Tulis topik apa aja..."
          maxLength={500}
          rows={3}
          className="input resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="sr-only">Jumlah karakter</span>
          <span
            className="text-[10px] text-[var(--subtle)] tabular-nums"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {topic.length}/500
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!topic.trim() || isLoading}
        className="btn btn-primary w-full"
      >
        {isLoading ? (
          <>
            <IconSpinner className="w-4 h-4" />
            <span>
              Sedang membuat
              {elapsed > 0 && (
                <span
                  className="ml-1 opacity-70"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {elapsed}s
                </span>
              )}
              ...
            </span>
          </>
        ) : (
          <>
            Buat Caption
            <IconArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => handleExample(ex)}
            disabled={isLoading}
            className="example-chip text-[11px] px-3 py-1.5 bg-transparent border border-[var(--border)] text-[var(--subtle)] disabled:opacity-40 whitespace-nowrap"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
