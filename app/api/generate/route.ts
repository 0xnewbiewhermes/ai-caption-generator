import { NextRequest, NextResponse } from "next/server";
import { generateCaption, generateCaptionStream, type Platform, type Tone } from "@/lib/mimo";

const VALID_PLATFORMS: Platform[] = ["instagram", "twitter", "tiktok"];
const VALID_TONES: Tone[] = ["casual", "professional", "funny", "motivational", "storytelling", "genz", "poetic", "educational", "promo", "custom"];

// In-memory rate limiting (per instance on serverless)
// Note: On Vercel, each serverless instance has its own memory.
// This provides best-effort rate limiting. For strict limits, use Redis/Upstash.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function getRateLimitKey(req: NextRequest): string {
  // On Vercel, x-real-ip is set by the platform and cannot be spoofed
  // x-vercel-forwarded-for is also reliable on Vercel
  const ip = req.headers.get("x-real-ip")
    || req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (ip) return ip;
  // Fallback: use User-Agent hash so different clients get separate buckets
  const ua = req.headers.get("user-agent") || "no-ua";
  return `fallback:${ua}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();

  // Periodic cleanup: remove expired entries every 100 requests
  if (rateLimitMap.size > 100) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi dalam 1 menit." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { topic, platform, tone, customTone, stream: useStream, count: variantCount } = body;
    const count = Math.min(Math.max(Number(variantCount) || 1, 1), 3);

    // Validation
    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topik wajib diisi." },
        { status: 400 }
      );
    }

    if (topic.length > 500) {
      return NextResponse.json(
        { error: "Topik maksimal 500 karakter." },
        { status: 400 }
      );
    }

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: "Platform tidak valid. Pilih: instagram, twitter, tiktok." },
        { status: 400 }
      );
    }

    if (!tone || !VALID_TONES.includes(tone)) {
      return NextResponse.json(
        { error: "Tone tidak valid. Pilih: casual, professional, funny, motivational, storytelling, genz, poetic, educational, promo, custom." },
        { status: 400 }
      );
    }

    // Validate custom tone
    if (tone === "custom") {
      if (!customTone || typeof customTone !== "string" || customTone.trim().length === 0) {
        return NextResponse.json(
          { error: "Deskripsi gaya bahasa wajib diisi untuk tone custom." },
          { status: 400 }
        );
      }
      if (customTone.length > 200) {
        return NextResponse.json(
          { error: "Deskripsi gaya bahasa maksimal 200 karakter." },
          { status: 400 }
        );
      }
    }

    // Streaming mode
    if (useStream) {
      const encoder = new TextEncoder();
      const abortController = new AbortController();
      req.signal.addEventListener("abort", () => abortController.abort());

      const reqData = { topic, platform, tone, customTone: tone === "custom" ? customTone : undefined };

      const stream = new ReadableStream({
        async start(controller) {
          try {
            if (count === 1) {
              // Single variant — original streaming behavior
              for await (const event of generateCaptionStream(reqData)) {
                if (abortController.signal.aborted) break;
                controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
              }
            } else {
              // Multiple variants — generate sequentially (to avoid rate limits)
              for (let i = 0; i < count; i++) {
                if (abortController.signal.aborted) break;
                controller.enqueue(encoder.encode(JSON.stringify({ type: "variant_start", index: i }) + "\n"));
                for await (const event of generateCaptionStream(reqData)) {
                  if (abortController.signal.aborted) break;
                  if (event.type === "chunk") {
                    controller.enqueue(encoder.encode(JSON.stringify({ ...event, index: i }) + "\n"));
                  } else if (event.type === "done") {
                    controller.enqueue(encoder.encode(JSON.stringify({ ...event, type: "variant_done", index: i }) + "\n"));
                  }
                }
              }
              controller.enqueue(encoder.encode(JSON.stringify({ type: "all_done" }) + "\n"));
            }
            controller.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Stream error";
            controller.enqueue(encoder.encode(JSON.stringify({ type: "error", content: msg }) + "\n"));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming mode
    const result = await generateCaption({ topic, platform, tone });

    return NextResponse.json(result);
  } catch (error: unknown) {
    // Sanitize error message to avoid logging API keys
    const rawMessage = error instanceof Error ? error.message : "Unknown error";
    // Redact API keys (any key-like pattern: sk-*, tp-*, or long alphanumeric tokens)
    const errorMessage = rawMessage.replace(/(?:sk|tp)-[a-zA-Z0-9]{10,}/g, "[REDACTED]");
    console.error("Generate caption error:", errorMessage);

    // Handle MiMo API errors
    if (errorMessage.includes("API key") || errorMessage.includes("401")) {
      return NextResponse.json(
        { error: "Konfigurasi API bermasalah. Hubungi admin." },
        { status: 500 }
      );
    }

    if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      return NextResponse.json(
        { error: "Server sedang sibuk. Coba lagi dalam beberapa detik." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat caption. Coba lagi." },
      { status: 500 }
    );
  }
}
