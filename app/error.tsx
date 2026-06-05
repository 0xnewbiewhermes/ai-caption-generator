"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error("Application error:", error);
    // Focus the error heading so keyboard users know where they are
    headingRef.current?.focus();
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-5 max-w-xs">
        <div className="w-14 h-14 mx-auto bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl flex items-center justify-center">
          <svg
            className="w-7 h-7 text-[var(--accent)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-base font-bold text-[var(--fg)] outline-none"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Terjadi kesalahan
        </h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {error.message ||
            "Aplikasi mengalami masalah. Coba muat ulang halaman."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary text-xs">
            Coba lagi
          </button>
          <Link href="/" className="btn btn-secondary text-xs">
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}
