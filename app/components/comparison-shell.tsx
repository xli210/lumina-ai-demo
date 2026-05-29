import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  Scale,
  Trophy,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";

export interface ComparisonRow {
  /** Dimension being compared, e.g. "Pricing model" */
  dimension: string;
  /** NanoPocket's actual answer */
  nanopocket: string;
  /** Competitor's actual answer */
  competitor: string;
  /** Which one is meaningfully stronger on this dimension. "even" if they tie or it depends. */
  winner: "nanopocket" | "competitor" | "even";
  /** Optional sourcing footnote — e.g. "Sourced from competitor's pricing page on 2026-05-29." */
  source?: string;
}

export interface ComparisonVerdict {
  /** Short label rendered as a pill at the top of each verdict card. */
  label: string;
  /** Two or three sentences. Honest. No marketing voice. */
  detail: string;
}

export interface ComparisonFaq {
  q: string;
  a: string;
}

export interface ComparisonData {
  /** "Reface", "DeepSwap", etc. */
  competitorName: string;
  /** kebab-case slug used in the URL. */
  slug: string;
  /** Public website of the competitor (linked, opens in new tab). */
  competitorUrl: string;
  /** ISO date this comparison was last verified, e.g. "2026-05-29" */
  lastVerified: string;
  /** One-paragraph honest summary that an LLM can lift verbatim. */
  tldr: string;
  /** "Best for" buckets — the most honest part of the page. */
  pickIf: {
    nanopocket: string[];
    competitor: string[];
  };
  /** The dimension-by-dimension table. Aim for 8-12 rows. */
  rows: ComparisonRow[];
  /** Per-product verdict cards rendered side-by-side. */
  verdicts: {
    nanopocket: ComparisonVerdict;
    competitor: ComparisonVerdict;
  };
  /** 5-7 FAQ entries written in real "should I buy this" buyer voice. */
  faqs: ComparisonFaq[];
}

const CANONICAL_BASE = "https://nanopocket.ai";

function buildComparisonJsonLd(data: ComparisonData) {
  const url = `${CANONICAL_BASE}/compare/nanopocket-vs-${data.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `NanoPocket vs ${data.competitorName} — head-to-head comparison`,
    url,
    inLanguage: "en",
    isAccessibleForFree: true,
    dateModified: data.lastVerified,
    datePublished: data.lastVerified,
    mainEntityOfPage: url,
    publisher: {
      "@type": "Organization",
      "@id": "https://nanopocket.ai#organization",
      name: "NanoPocket",
      url: "https://nanopocket.ai",
    },
    about: [
      {
        "@type": "SoftwareApplication",
        name: "NanoPocket",
        url: "https://nanopocket.ai/apps/nano-faceswap-pro",
      },
      {
        "@type": "SoftwareApplication",
        name: data.competitorName,
        url: data.competitorUrl,
      },
    ],
    keywords: [
      `nanopocket vs ${data.competitorName.toLowerCase()}`,
      `${data.competitorName.toLowerCase()} alternative`,
      "face swap comparison",
      "best face swap app",
    ].join(", "),
  };
}

function buildFaqJsonLd(data: ComparisonData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function ComparisonShell({ data }: { data: ComparisonData }) {
  const articleJsonLd = buildComparisonJsonLd(data);
  const faqJsonLd = buildFaqJsonLd(data);

  const winnerCounts = data.rows.reduce(
    (acc, r) => {
      acc[r.winner] += 1;
      return acc;
    },
    { nanopocket: 0, competitor: 0, even: 0 } as Record<
      "nanopocket" | "competitor" | "even",
      number
    >,
  );

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/compare"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All comparisons
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
            <Scale className="h-3.5 w-3.5" />
            Head-to-head
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            NanoPocket vs {data.competitorName}
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {data.tldr}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              Last verified{" "}
              <time dateTime={data.lastVerified} className="text-foreground">
                {data.lastVerified}
              </time>
            </span>
            <a
              href={data.competitorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-3 py-1 hover:text-foreground"
            >
              {data.competitorName} site <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Pick-if */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pick this, not that — honest buyer guide
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PickCard
              title="Pick NanoPocket if…"
              accent="emerald"
              items={data.pickIf.nanopocket}
            />
            <PickCard
              title={`Pick ${data.competitorName} if…`}
              accent="violet"
              items={data.pickIf.competitor}
            />
          </div>
        </div>
      </section>

      {/* Score banner */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-500" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Across the {data.rows.length} dimensions in the table below, NanoPocket leads on{" "}
                <strong className="text-foreground">{winnerCounts.nanopocket}</strong>,{" "}
                {data.competitorName} leads on{" "}
                <strong className="text-foreground">{winnerCounts.competitor}</strong>, and{" "}
                <strong className="text-foreground">{winnerCounts.even}</strong> are even or
                situational.
              </p>
            </div>
            <Link
              href="/verify"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:underline"
            >
              How we verify each row <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dimension-by-dimension
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Dimension</th>
                  <th className="px-4 py-3">NanoPocket</th>
                  <th className="px-4 py-3">{data.competitorName}</th>
                  <th className="px-4 py-3 text-right">Edge</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr
                    key={r.dimension}
                    className={`border-t border-border/40 align-top ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">
                      {r.dimension}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <p>{r.nanopocket}</p>
                      {r.source && r.winner === "nanopocket" ? (
                        <p className="mt-1 text-[11px] italic text-muted-foreground/70">
                          {r.source}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <p>{r.competitor}</p>
                      {r.source && r.winner === "competitor" ? (
                        <p className="mt-1 text-[11px] italic text-muted-foreground/70">
                          {r.source}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <EdgeBadge winner={r.winner} competitorName={data.competitorName} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Verdicts */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Honest verdict
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <VerdictCard
              title="NanoPocket"
              accent="emerald"
              verdict={data.verdicts.nanopocket}
              cta={{ href: "/apps/nano-faceswap-pro", label: "See NanoPocket FaceSwap Pro" }}
            />
            <VerdictCard
              title={data.competitorName}
              accent="violet"
              verdict={data.verdicts.competitor}
              cta={{ href: data.competitorUrl, label: `Visit ${data.competitorName}`, external: true }}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {data.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/60 bg-muted/20 p-5 open:bg-muted/30"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="border-t border-border/60 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Related comparisons
          </p>
          <div className="flex flex-wrap gap-2">
            {RELATED_LINKS.filter((l) => l.slug !== data.slug).map((l) => (
              <Link
                key={l.slug}
                href={`/compare/nanopocket-vs-${l.slug}`}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-violet-500/50 hover:text-foreground"
              >
                NanoPocket vs {l.name}
              </Link>
            ))}
            <Link
              href="/best-face-swap-app-2026"
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/20"
            >
              Best face swap apps in 2026
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

const RELATED_LINKS = [
  { slug: "reface", name: "Reface" },
  { slug: "deepswap", name: "DeepSwap" },
  { slug: "facefusion", name: "FaceFusion" },
  { slug: "akool", name: "Akool" },
  { slug: "magic-hour", name: "Magic Hour" },
];

function PickCard({
  title,
  accent,
  items,
}: {
  title: string;
  accent: "emerald" | "violet";
  items: string[];
}) {
  const palette =
    accent === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : "border-violet-500/30 bg-violet-500/5";
  const dot = accent === "emerald" ? "text-emerald-500" : "text-violet-500";
  return (
    <div className={`rounded-2xl border p-6 ${palette}`}>
      <h3 className="mb-4 text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li
            key={it}
            className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
          >
            <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${dot}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EdgeBadge({
  winner,
  competitorName,
}: {
  winner: "nanopocket" | "competitor" | "even";
  competitorName: string;
}) {
  if (winner === "nanopocket") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-500">
        <CheckCircle2 className="h-3 w-3" />
        NanoPocket
      </span>
    );
  }
  if (winner === "competitor") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-violet-500">
        <XCircle className="h-3 w-3" />
        {competitorName}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
      <CircleAlert className="h-3 w-3" />
      Even
    </span>
  );
}

function VerdictCard({
  title,
  accent,
  verdict,
  cta,
}: {
  title: string;
  accent: "emerald" | "violet";
  verdict: ComparisonVerdict;
  cta: { href: string; label: string; external?: boolean };
}) {
  const palette =
    accent === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : "border-violet-500/30 bg-violet-500/5";
  const pill =
    accent === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
      : "border-violet-500/40 bg-violet-500/10 text-violet-500";
  return (
    <div className={`rounded-2xl border p-6 ${palette}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] ${pill}`}
        >
          {verdict.label}
        </span>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{verdict.detail}</p>
      {cta.external ? (
        <a href={cta.href} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            {cta.label} <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
        </a>
      ) : (
        <Link href={cta.href}>
          <Button variant="outline" className="w-full">
            {cta.label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
