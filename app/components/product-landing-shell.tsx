import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";

export interface ProductParameter {
  /** Numeric or short categorical value, e.g. "8K", "v3.0", "12 GB" */
  value: string;
  /** Short label explaining the value, e.g. "max output resolution" */
  label: string;
}

export interface ProductCta {
  label: string;
  /** Internal route (rendered with next/link) or external URL */
  href: string;
  /** Open in a new tab when external. */
  external?: boolean;
  /** Render as a non-clickable disabled-looking pill (used for "coming soon"). */
  disabled?: boolean;
  /** Visual style. "primary" = filled, "secondary" = outline. */
  variant?: "primary" | "secondary";
}

export interface ProductSection {
  /** Two-digit chapter index, e.g. "01" */
  index: string;
  /** Short eyebrow label above the H2, e.g. "MULTI-FACE" */
  eyebrow: string;
  /** H2 — declarative, ≤9 words */
  title: string;
  /** Lead sentence — ≤30 words, name-drops at least one entity (model, vertical, integration) */
  lead: string;
  /** 3-5 short bullets, each 6-14 words */
  bullets: string[];
  /** Hint label rendered as a pill at the bottom of the section */
  hint?: string;
}

export interface ProductFaq {
  q: string;
  a: string;
}

export interface ProductTrustItem {
  /** Short claim, e.g. "100% local processing" */
  label: string;
}

export interface ProductLandingData {
  /** Slug used for breadcrumb back link, canonical URLs, and JSON-LD identifiers. */
  slug: string;
  /** Optional parent app (rendered as the breadcrumb back-link). */
  parent?: { label: string; href: string };
  hero: {
    /** Short eyebrow above H1, e.g. "FREE ONLINE · DIFFUSION FACE SWAP" */
    eyebrow: string;
    /** Optional version chip, e.g. "v3.0" or "Coming Soon" */
    versionChip?: string;
    /** H1, e.g. "Nano FaceSwap Pro 2.0" */
    title: string;
    /** Optional gradient-colored final word/phrase, rendered after `title` */
    titleAccent?: string;
    /**
     * First sentence — must be a complete conclusion (Type-A or Type-C structure):
     * "[Brand] is the [category] [thing] that [verb] [outcome] with [proof]."
     * No marketing adjectives — every claim should be measurable.
     */
    lead: string;
    /** 3 verifiable parameters rendered as a chip strip */
    parameters: ProductParameter[];
    /** 1–2 CTAs */
    primaryCta: ProductCta;
    secondaryCta?: ProductCta;
  };
  trust: ProductTrustItem[];
  sections: ProductSection[];
  faqs: ProductFaq[];
  closing: {
    /** Short closing H2, ≤8 words */
    title: string;
    /** ≤45 words */
    body: string;
    primaryCta: ProductCta;
    secondaryCta?: ProductCta;
  };
}

/**
 * Render a single CTA button. Resolves to:
 * - <span> for disabled "coming soon" pills,
 * - <a target=_blank> for external links,
 * - <Link> for internal links.
 */
function CtaButton({ cta }: { cta: ProductCta }) {
  const isPrimary = (cta.variant ?? "primary") === "primary";

  if (cta.disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex cursor-not-allowed select-none items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.03] px-7 py-2.5 text-sm font-medium text-muted-foreground/70"
      >
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/50" />
        </span>
        {cta.label}
      </span>
    );
  }

  const inner = (
    <Button
      asChild={false}
      size="lg"
      variant={isPrimary ? "default" : "outline"}
      className={`gap-2 rounded-full px-8 ${
        isPrimary
          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white border-0 shadow-lg shadow-indigo-500/25 hover:opacity-90"
          : ""
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Button>
  );

  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link href={cta.href}>{inner}</Link>;
}

/**
 * Server-rendered SEO landing shell. Pages provide structured data and the
 * shell handles layout, JSON-LD, and consistent formatting.
 */
export function ProductLandingShell({ data }: { data: ProductLandingData }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-14 sm:pt-32 sm:pb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[320px] w-[320px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {data.parent && (
            <Link
              href={data.parent.href}
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {data.parent.label}
            </Link>
          )}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
            {data.hero.eyebrow}
            {data.hero.versionChip && (
              <>
                <span className="h-3 w-px bg-indigo-500/40" />
                <span className="font-mono">{data.hero.versionChip}</span>
              </>
            )}
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {data.hero.title}
            {data.hero.titleAccent && (
              <>
                {" "}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                  {data.hero.titleAccent}
                </span>
              </>
            )}
          </h1>

          <p className="mb-8 max-w-3xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {data.hero.lead}
          </p>

          {/* Parameters chip strip — verifiable, scannable, SEO-rich */}
          <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.hero.parameters.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 backdrop-blur-sm"
              >
                <div className="font-mono text-base font-semibold text-foreground sm:text-lg">
                  {p.value}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {p.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CtaButton cta={data.hero.primaryCta} />
            {data.hero.secondaryCta && (
              <CtaButton cta={data.hero.secondaryCta} />
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {data.trust.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-y-14 md:gap-y-16">
            {data.sections.map((s) => (
              <article key={s.index} className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm text-muted-foreground/70">
                      {s.index}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                      {s.eyebrow}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-9">
                  <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {s.title}
                  </h2>
                  <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {s.lead}
                  </p>
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/80" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {s.hint && (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      {s.hint}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-muted/30 px-6 py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mb-10 text-sm text-muted-foreground">
            Five common questions about {data.hero.title}, answered by the team.
          </p>

          <div className="grid grid-cols-1 gap-5">
            {data.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-border/60 bg-background/60 p-5 backdrop-blur-sm transition-colors open:border-indigo-500/30"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-foreground">
                  <span>{f.q}</span>
                  <span className="mt-1 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {data.closing.title}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {data.closing.body}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <CtaButton cta={data.closing.primaryCta} />
            {data.closing.secondaryCta && (
              <CtaButton cta={data.closing.secondaryCta} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
