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

const SITE_URL = "https://www.aicaption.pro";

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
    default: "AI Caption — Generator Caption Instagram, TikTok & Twitter Gratis",
    template: "%s | AI Caption",
  },
  description:
    "Buat caption Instagram, TikTok, dan Twitter yang natural dalam hitungan detik. Ketik topik apa aja, AI tuliskan captionnya. Gratis, tanpa login.",
  keywords: [
    "caption generator",
    "caption Instagram",
    "caption TikTok",
    "caption Twitter",
    "AI caption Indonesia",
    "buat caption gratis",
    "generator caption AI",
    "caption otomatis",
    "social media caption",
    "copywriting AI",
  ],
  authors: [{ name: "AI Caption" }],
  creator: "AI Caption",
  publisher: "AI Caption",
  category: "Technology",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "AI Caption",
    title: "AI Caption — Generator Caption Instagram, TikTok & Twitter Gratis",
    description: "Buat caption yang natural dalam hitungan detik. Ketik topik, AI tuliskan. Gratis, tanpa login.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Caption - Generator Caption Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Caption — Generator Caption Instagram, TikTok & Twitter Gratis",
    description: "Buat caption yang natural dalam hitungan detik. Ketik topik, AI tuliskan. Gratis, tanpa login.",
    images: ["/og-image.png"],
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
        <meta name="google-site-verification" content="vq8wUNbqD5UZSc0PYsZudJdE_l_ltVgCXH9NFTgemtY" />
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
