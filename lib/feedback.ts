// Simple client-side feedback tracker (like/dislike)
// Stores state in localStorage and fires GA4 events for analytics

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Feedback = "like" | "dislike";

const STORAGE_PREFIX = "feedback:";

function hashCaption(caption: string): string {
  let hash = 0;
  for (let i = 0; i < caption.length; i++) {
    const char = caption.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function storageKey(caption: string): string {
  return `${STORAGE_PREFIX}${hashCaption(caption)}`;
}

/** Get stored feedback for a caption, or null if not rated */
export function getFeedback(caption: string): Feedback | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(storageKey(caption));
  if (val === "like" || val === "dislike") return val;
  return null;
}

/** Save feedback and fire GA4 event */
export function setFeedback(
  caption: string,
  feedback: Feedback,
  meta?: { platform?: string; tone?: string; charCount?: number }
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(storageKey(caption), feedback);

  // Fire GA4 event — gtag is loaded globally via next/script
  if (typeof window.gtag === "function") {
    window.gtag("event", "caption_feedback", {
      feedback,
      platform: meta?.platform ?? "unknown",
      tone: meta?.tone ?? "unknown",
      charCount: meta?.charCount ?? 0,
    });
  }
}

/** Clear feedback for a caption */
export function clearFeedback(caption: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(caption));
}
