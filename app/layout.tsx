import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Mono, Syne, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  fallback: ["monospace"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["sans-serif"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

const SITE_URL = "https://aicaption.id";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#faf8f4" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Caption — Tulis Caption, Bukan Cuma Generate",
    template: "%s | AI Caption",
  },
  description:
    "Ketik topik apa aja. AI buatkan caption yang natural untuk Instagram, Twitter, dan TikTok. Gratis.",
  keywords: [
    "caption generator",
    "caption Instagram",
    "caption TikTok",
    "caption Twitter",
    "AI caption Indonesia",
    "buat caption gratis",
  ],
  authors: [{ name: "AI Caption" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "AI Caption",
    title: "AI Caption — Tulis Caption, Bukan Cuma Generate",
    description: "Ketik topik apa aja. AI buatkan caption yang natural. Gratis.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Caption — Tulis Caption, Bukan Cuma Generate",
    description: "Ketik topik apa aja. AI buatkan caption yang natural. Gratis.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${spaceMono.variable} ${syne.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-[var(--accent-fg)] focus:text-sm"
        >
          Langsung ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
