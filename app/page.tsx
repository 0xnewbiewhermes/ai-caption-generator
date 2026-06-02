import CaptionGenerator from "@/components/CaptionGenerator";
import { IconArrowRight } from "@/components/icons";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Caption",
  description:
    "Generator caption AI gratis untuk Instagram, Twitter, dan TikTok. Ketik topik, AI tuliskan caption yang natural.",
  url: "https://www.aicaption.pro",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
  inLanguage: "id",
  author: {
    "@type": "Organization",
    name: "AI Caption",
    url: "https://www.aicaption.pro",
  },
  potentialAction: {
    "@type": "UseAction",
    target: "https://www.aicaption.pro",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header ── */}
      <header>
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold tracking-tight text-[var(--fg)]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              aicaption
            </span>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-24">
          <div className="max-w-2xl">
            <div className="accent-line mb-6 sm:mb-8" />
            <h1 className="display text-[var(--fg)] animate-in">
              Tulis caption, bukan cuma <span className="text-[var(--accent)]">generate.</span>
            </h1>
            <p
              className="mt-6 sm:mt-8 text-[var(--fg-dim)] text-base sm:text-lg leading-relaxed max-w-md animate-in-delayed"
              style={{ fontFamily: "var(--font-instrument-serif)", fontStyle: "italic" }}
            >
              Ketik topik apa aja, bahkan cuma 1 kata. AI buatkan brief
              detail, lalu tulis caption yang natural dan siap post.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 animate-in-delayed">
              <a href="#generator" className="btn btn-primary w-full sm:w-auto justify-center">
                Coba sekarang
                <IconArrowRight className="w-4 h-4" />
              </a>
              <span className="label">Gratis &middot; Tanpa login</span>
            </div>
          </div>
        </section>

        {/* ── Generator ── */}
        <section id="generator" className="max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
          <div className="relative">
            {/* Watermark — hidden on small screens */}
            <div
              className="watermark absolute -top-16 -left-8 sm:-top-24 sm:-left-16 select-none pointer-events-none hidden sm:block"
              aria-hidden="true"
            >
              AI
            </div>
            <div className="relative z-10">
              <CaptionGenerator />
            </div>
          </div>
        </section>

        {/* ── Explanation ── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
          <div className="card-accent p-6 sm:p-10">
            <div className="flex items-start gap-4 sm:gap-5 mb-6">
              <span className="section-number leading-none text-[3rem] sm:text-[clamp(4rem,10vw,8rem)]">?</span>
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold text-[var(--fg)] tracking-tight"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  Kenapa hasilnya beda?
                </h2>
                <div className="accent-line mt-3" />
              </div>
            </div>
            <div className="space-y-4 text-sm text-[var(--fg-dim)] leading-relaxed">
              <p>
                Kebanyakan generator caption cuma ambil input lalu langsung
                keluarin teks. Hasilnya generik, template-like, dan sering
                terasa &ldquo;tidak manusiawi&rdquo;.
              </p>
              <p>
                AI Caption pakai pendekatan berbeda, namanya{" "}
                <strong className="text-[var(--accent)] font-bold">
                  prompt chaining
                </strong>
                . Sebelum nulis caption, AI duluan bikin brief detail: siapa
                audience-nya, angle apa yang dipake, struktur kayak gimana,
                emoji dan hashtag strategy.
              </p>
              <p>
                Brief itu lalu jadi dasar nulis caption. Hasilnya? Caption yang
                terasa ditulis orang, bukan mesin.
              </p>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                {
                  before: '"caption galau"',
                  after:
                    "Brief: target audience 16-28, angle healing through words, struktur hook → body → CTA...",
                },
                {
                  before: '"promo jumat"',
                  after:
                    "Brief: tone profesional, CTA urgency, diskon strategy, hashtag campuran...",
                },
              ].map((ex, i) => (
                <div
                  key={i}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 text-xs space-y-3"
                >
                  <div>
                    <span className="label">Input</span>
                    <p
                      className="text-[var(--accent)] mt-2 text-sm"
                      style={{ fontFamily: "var(--font-instrument-serif)", fontStyle: "italic" }}
                    >
                      {ex.before}
                    </p>
                  </div>
                  <div className="divider" />
                  <div>
                    <span className="label">Brief yang dibuat AI</span>
                    <p className="text-[var(--muted)] mt-2 leading-relaxed">
                      {ex.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
          <div className="label mb-8">Fitur</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                num: "01",
                title: "3 platform",
                desc: "Instagram, Twitter/X, dan TikTok. Masing-masing punya aturan karakter, hashtag, dan gaya bahasa yang berbeda.",
              },
              {
                num: "02",
                title: "9 gaya bahasa",
                desc: "Santai, profesional, lucu, motivasi, cerita, Gen Z, puitis, edukatif, promo. Pilih yang sesuai dengan mood konten-mu.",
              },
              {
                num: "03",
                title: "Input minimalis",
                desc: "Ketik 1-2 kata, AI yang kembangin. Nggak perlu brief panjang atau prompt engineering.",
              },
              {
                num: "04",
                title: "Tanpa akun",
                desc: "Langsung pakai. Tidak perlu daftar, tidak perlu login, tidak ada batasan.",
              },
            ].map((f) => (
              <div
                key={f.num}
                className="card p-6 group hover:border-[var(--accent)]/20 transition-colors"
              >
                <span
                  className="text-[var(--accent)] text-xs font-bold tabular-nums mb-3 block"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {f.num}
                </span>
                <h3
                  className="text-base font-bold text-[var(--fg)] tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-28">
          <div className="label mb-8">FAQ</div>
          <div className="space-y-0">
            {[
              {
                q: "Ini beneran gratis?",
                a: "Ya. Tanpa login, tanpa batasan, tanpa watermark.",
              },
              {
                q: "Bedanya sama ChatGPT langsung?",
                a: "Prompt chaining. AI mikir dulu sebelum nulis. Hasilnya lebih terstruktur dan konsisten. Plus, udah diatur buat setiap platform.",
              },
              {
                q: "Bisa untuk bisnis?",
                a: 'Pilih gaya bahasa "Profesional". Cocok untuk brand, startup, atau UMKM.',
              },
              {
                q: "Hasilnya unik setiap kali?",
                a: "Ya. Setiap kali generate, brief dan caption-nya beda. Tekan \"Ulang\" buat variasi lain.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group border-b border-[var(--border)] last:border-0"
              >
                <summary className="flex items-center justify-between py-5 cursor-pointer text-sm font-semibold text-[var(--fg)] list-none hover:text-[var(--accent)] transition-colors">
                  {faq.q}
                  <span className="text-[var(--subtle)] text-lg ml-4 shrink-0 group-open:hidden transition-transform">
                    +
                  </span>
                  <span className="text-[var(--accent)] text-lg ml-4 shrink-0 hidden group-open:inline transition-transform">
                    &minus;
                  </span>
                </summary>
                <p className="pb-5 text-sm text-[var(--muted)] leading-relaxed max-w-lg">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] py-8 sm:py-10 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-bold text-[var(--muted)]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              aicaption
            </span>
          </div>
          <span className="label">Bahasa Indonesia</span>
        </div>
      </footer>
    </>
  );
}
