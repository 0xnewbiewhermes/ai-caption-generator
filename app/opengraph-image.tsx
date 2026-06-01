import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "AI Caption - Generator Caption Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#faf8f4",
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "6px",
            background: "#c9371a",
          }}
        />

        {/* Watermark */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "60px",
            fontSize: "200px",
            fontWeight: 900,
            color: "#e8e4de",
            fontFamily: "sans-serif",
            letterSpacing: "-0.06em",
            lineHeight: 1,
          }}
        >
          AI
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative", zIndex: 1 }}>
          {/* Logo mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "12px", height: "12px", background: "#c9371a" }} />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1a1816",
                letterSpacing: "-0.02em",
                fontFamily: "sans-serif",
              }}
            >
              aicaption
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#1a1816",
              fontFamily: "sans-serif",
              textTransform: "uppercase",
            }}
          >
            Tulis caption,
            <br />
            bukan cuma
            <br />
            <span style={{ color: "#c9371a" }}>generate.</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              color: "#4a443c",
              fontStyle: "italic",
              fontFamily: "serif",
              maxWidth: "500px",
              lineHeight: 1.4,
            }}
          >
            Ketik topik apa aja. AI buatkan caption yang natural untuk Instagram, Twitter, dan TikTok.
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {["Instagram", "TikTok", "Twitter/X"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "#fef0ec",
                  color: "#c9371a",
                  border: "1px solid rgba(201, 55, 26, 0.15)",
                  fontFamily: "monospace",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#8a8078", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            aicaption.pro
          </span>
          <span style={{ fontSize: "14px", color: "#b5aea5" }}>•</span>
          <span style={{ fontSize: "14px", color: "#8a8078", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Gratis • Tanpa Login
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
