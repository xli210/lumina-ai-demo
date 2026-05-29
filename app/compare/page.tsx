import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileCheck2, Scale } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/compare";
const LAST_VERIFIED = "2026-05-29";

export const metadata: Metadata = {
  title: "Compare NanoPocket — Face Swap App Comparisons",
  description:
    "Head-to-head comparisons of NanoPocket vs Reface, DeepSwap, FaceFusion, Akool, and Magic Hour. Each comparison covers identity model, video support, privacy posture, pricing, and verifiability with an honest verdict.",
  keywords: [
    "nanopocket vs reface",
    "nanopocket vs deepswap",
    "nanopocket vs facefusion",
    "nanopocket vs akool",
    "nanopocket vs magic hour",
    "reface alternative",
    "deepswap alternative",
    "facefusion alternative",
    "face swap comparison",
  ],
  alternates: { canonical: "/compare" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket comparisons — face swap head-to-heads",
    description:
      "NanoPocket vs Reface / DeepSwap / FaceFusion / Akool / Magic Hour with full dimension tables.",
  },
};

interface CompareLink {
  slug: string;
  name: string;
  category: string;
  oneLiner: string;
  competitorUrl: string;
}

const COMPARES: CompareLink[] = [
  {
    slug: "facefusion",
    name: "FaceFusion",
    category: "Open-source / CLI",
    oneLiner:
      "Open-source GAN pipeline (inswapper_128) vs NanoPocket's diffusion stack — install friction vs identity fidelity.",
    competitorUrl: "https://github.com/facefusion/facefusion",
  },
  {
    slug: "deepswap",
    name: "DeepSwap",
    category: "Cloud web + mobile",
    oneLiner:
      "Cloud-web convenience (subscription) vs local desktop one-time license, with privacy and TCO trade-offs.",
    competitorUrl: "https://www.deepswap.ai",
  },
  {
    slug: "reface",
    name: "Reface",
    category: "Consumer mobile",
    oneLiner:
      "Mobile-first cloud meme tool with App Store reach vs desktop diffusion stack with verifiable offline execution.",
    competitorUrl: "https://reface.ai",
  },
  {
    slug: "akool",
    name: "Akool",
    category: "B2B / API",
    oneLiner:
      "API-first B2B platform with avatar workflows vs creator-first desktop tool with no per-call fees.",
    competitorUrl: "https://akool.com",
  },
  {
    slug: "magic-hour",
    name: "Magic Hour",
    category: "AI video suite",
    oneLiner:
      "Multi-tool AI video suite (face swap as one feature) vs identity-specialised desktop pipeline.",
    competitorUrl: "https://magichour.ai",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "NanoPocket head-to-head comparisons",
  url: PAGE_URL,
  itemListElement: COMPARES.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `NanoPocket vs ${c.name}`,
    url: `https://nanopocket.ai/compare/nanopocket-vs-${c.slug}`,
  })),
};

export default function ComparePage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Navbar />

      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
            <Scale className="h-3.5 w-3.5" />
            Comparisons
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How NanoPocket compares
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Five honest, dimension-by-dimension comparisons covering the most-asked
            face-swap-tool questions in 2026. Each page includes a strengths-and-weaknesses
            table, a written verdict for both sides, and a &ldquo;pick this if&rdquo; buyer
            guide. We have a conflict of interest — we name it on every page.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            Last verified{" "}
            <time dateTime={LAST_VERIFIED} className="text-foreground">
              {LAST_VERIFIED}
            </time>
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {COMPARES.map((c) => (
              <li
                key={c.slug}
                className="group rounded-2xl border border-border/60 bg-muted/20 p-6 transition-colors hover:border-violet-500/50 hover:bg-muted/40"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    NanoPocket <span className="text-muted-foreground/80">vs</span> {c.name}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-violet-500">
                  {c.category}
                </p>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{c.oneLiner}</p>
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/compare/nanopocket-vs-${c.slug}`}
                    className="inline-flex items-center gap-1 font-medium text-emerald-500 hover:underline"
                  >
                    Open comparison <ArrowRight className="h-3 w-3" />
                  </Link>
                  <a
                    href={c.competitorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {c.name} site <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <h2 className="mb-2 text-lg font-bold text-foreground sm:text-xl">
              Want the full ranking instead of pairwise?
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              The methodology-first ranking covers the same six tools across eight dimensions.
            </p>
            <Link
              href="/best-face-swap-app-2026"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-500 hover:underline"
            >
              Best face swap app 2026 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
