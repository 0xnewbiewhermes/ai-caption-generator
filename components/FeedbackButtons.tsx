"use client";

import { useEffect, useState } from "react";
import type { GenerateResponse } from "@/lib/mimo";
import { getFeedback, setFeedback, clearFeedback } from "@/lib/feedback";

interface FeedbackButtonsProps {
  result: GenerateResponse;
}

type Feedback = "like" | "dislike";

export default function FeedbackButtons({ result }: FeedbackButtonsProps) {
  const [feedback, setFeedbackState] = useState<Feedback | null>(null);

  // Load stored feedback on mount
  useEffect(() => {
    setFeedbackState(getFeedback(result.caption));
  }, [result.caption]);

  const handleFeedback = (value: Feedback) => {
    // Toggle: if same button clicked, undo
    if (feedback === value) {
      clearFeedback(result.caption);
      setFeedbackState(null);
      return;
    }

    setFeedback(result.caption, value, {
      platform: result.platform,
      tone: result.tone,
      charCount: result.charCount,
    });
    setFeedbackState(value);
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className="label text-[10px]"
        style={{ fontFamily: "var(--font-space-mono)" }}
      >
        Bermanfaat?
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => handleFeedback("like")}
          className={`feedback-btn ${feedback === "like" ? "feedback-btn--active-like" : ""}`}
          aria-label="Bermanfaat"
          aria-pressed={feedback === "like"}
          title="Bermanfaat"
        >
          {/* Thumbs up */}
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={feedback === "like" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
        </button>
        <button
          onClick={() => handleFeedback("dislike")}
          className={`feedback-btn ${feedback === "dislike" ? "feedback-btn--active-dislike" : ""}`}
          aria-label="Tidak bermanfaat"
          aria-pressed={feedback === "dislike"}
          title="Tidak bermanfaat"
        >
          {/* Thumbs down */}
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={feedback === "dislike" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
