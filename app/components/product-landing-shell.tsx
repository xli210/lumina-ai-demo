import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Target,
  XCircle,
} from "lucide-react";
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

/** Single technical parameter rendered into Product.additionalProperty as a PropertyValue. */
export interface ProductAdditionalProperty {
  /** Short name, e.g. "Output resolution", "Identity model", "Required VRAM" */
  name: string;
  /** Value as a string, e.g. "Up to 4K", "Flux.1 (12B parameters)", "12 GB" */
  value: string;
  /** Optional unit, e.g. "GB", "px", "FPS" */
  unitText?: string;
}

/** Pricing / availability block used to build Product.offers. */
export interface ProductOffer {
  /** Numeric string, e.g. "0.00" or "49.00" */
  price: string;
  /** ISO 4217 currency code */
  priceCurrency: string;
  /** Mapped to schema.org/<value>. */
  availability:
    | "InStock"
    | "PreOrder"
    | "OutOfStock"
    | "Discontinued"
    | "OnlineOnly";
  /** Optional ISO date (YYYY-MM-DD) marking the price-valid-through. */
  priceValidUntil?: string;
  /** Optional checkout URL. Defaults to the productMeta.url. */
  url?: string;
}

/**
 * Commerce/SEO metadata used to emit a combined Product + SoftwareApplication JSON-LD.
 * Every product page must provide this; the shell handles serialization.
 */
export interface ProductMeta {
  /** Unique SKU, e.g. "NPK-FSP-200". */
  sku: string;
  /** Optional MPN — defaults to sku. */
  mpn?: string;
  /**
   * Brand name. Defaults to "NanoPocket". Override only if a sub-brand is needed
   * (e.g. partner releases).
   */
  brand?: string;
  /**
   * Canonical absolute URL of the product page.
   * Used for Product.url, Offer.url, and mainEntityOfPage on schema fragments.
   */
  url: string;
  /** Product image — used as Product.image, falls back to og-image. */
  image?: string;
  /** Free-text or Google taxonomy category, e.g. "Local AI Image Enhancement". */
  category: string;
  /** SoftwareApplication.applicationCategory — e.g. "MultimediaApplication". */
  applicationCategory: string;
  /** Comma-separated OS list — e.g. "Windows 10/11, macOS Apple Silicon". */
  operatingSystem: string;
  /** Optional software version string, e.g. "2.0", "1.0.5". */
  softwareVersion?: string;
  /** Optional release date (ISO YYYY-MM-DD). */
  releaseDate?: string;
  /** Short Product.description — typically the same as the SEO description. */
  description: string;
  /** Pricing and availability for the Offer block. */
  offer: ProductOffer;
  /** Technical parameters (brand-name model, hardware, ceilings, license). */
  additionalProperties: ProductAdditionalProperty[];
}

/**
 * A known limitation, failure mode, or boundary condition.
 *
 * Listing limitations is the single highest-leverage GEO trust signal:
 * pages that admit failure modes are cited as documentation, not marketing.
 * Aim for 4–6 items, each measurable and short (≤22 words).
 */
export interface ProductLimitation {
  /** Short title, e.g. "Multi-face video > 6 subjects" */
  title: string;
  /** One-sentence explanation of the boundary. */
  detail: string;
}

/**
 * Scope statement — explicitly signals when the tool is the right fit and
 * when it is not. Required so an LLM can give a *qualified* recommendation
 * instead of overgeneralising.
 */
export interface ProductScope {
  /** 3–5 well-fit use cases, each ≤14 words. */
  bestFor: string[];
  /** 3–5 use cases this tool is NOT recommended for, each ≤14 words. */
  notRecommendedFor: string[];
}

/**
 * External evidence reference (paper, repo, dataset, benchmark, third-party
 * comparison). Emitted into the Article JSON-LD `citation` array, which gives
 * the page a citable hub status instead of a sink.
 */
export interface ProductEvidence {
  /** Display title, e.g. "InstantID: Zero-shot Identity-Preserving Generation in Seconds (arXiv:2401.07519)" */
  label: string;
  /** Absolute URL — preferably a permanent identifier (arXiv, DOI, GitHub release tag). */
  url: string;
  /** Optional one-line note explaining what this source supports. */
  note?: string;
}

export interface ProductLandingData {
  /** Slug used for breadcrumb back link, canonical URLs, and JSON-LD identifiers. */
  slug: string;
  /** Commerce/SEO metadata. Emitted as Product + SoftwareApplication JSON-LD. */
  productMeta: ProductMeta;
  /**
   * GEO documentation block. All fields are optional but strongly recommended —
   * pages that fill them in are cited far more often by Google AI Overviews,
   * ChatGPT/Claude/Perplexity browsing, and traditional rich results.
   */
  documentation?: {
    /** ISO date (YYYY-MM-DD) of the most recent verification of claims on this page. */
    lastVerified: string;
    /**
     * Short, public methodology note — e.g. "VRAM measured on RTX 4070 12 GB,
     * batch=1, fp16, Windows 11 23H2 driver 553.62". Renders as a footnote and
     * is also embedded in the Article JSON-LD.
     */
    methodology?: string;
    /** Known limitations / boundary conditions / failure modes. */
    limitations?: ProductLimitation[];
    /** Scope statement (best-for / not-recommended-for). */
    scope?: ProductScope;
    /** External evidence references emitted into Article.citation. */
    evidence?: ProductEvidence[];
  };
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

const DEFAULT_BRAND = "NanoPocket";
const DEFAULT_OG_IMAGE = "https://nanopocket.ai/og-image.jpg";

/**
 * Build a combined Product + SoftwareApplication JSON-LD object.
 *
 * Combining the two @types in one node lets the same payload qualify for both
 * Google's commerce rich results (Product) and software-application rich
 * results, without emitting two scripts.
 */
function buildProductJsonLd(data: ProductLandingData) {
  const meta = data.productMeta;
  const fullName =
    data.hero.titleAccent && data.hero.titleAccent.trim().length > 0
      ? `${data.hero.title} ${data.hero.titleAccent}`
      : data.hero.title;

  return {
    "@context": "https://schema.org",
    "@type": ["Product", "SoftwareApplication"],
    "@id": `${meta.url}#product`,
    name: fullName,
    brand: { "@type": "Brand", name: meta.brand ?? DEFAULT_BRAND },
    sku: meta.sku,
    mpn: meta.mpn ?? meta.sku,
    image: meta.image ?? DEFAULT_OG_IMAGE,
    url: meta.url,
    category: meta.category,
    description: meta.description,
    applicationCategory: meta.applicationCategory,
    operatingSystem: meta.operatingSystem,
    ...(meta.softwareVersion && { softwareVersion: meta.softwareVersion }),
    ...(meta.releaseDate && { datePublished: meta.releaseDate }),
    ...(data.documentation?.lastVerified && {
      dateModified: data.documentation.lastVerified,
    }),
    additionalProperty: meta.additionalProperties.map((p) => ({
      "@type": "PropertyValue",
      name: p.name,
      value: p.value,
      ...(p.unitText && { unitText: p.unitText }),
    })),
    offers: {
      "@type": "Offer",
      price: meta.offer.price,
      priceCurrency: meta.offer.priceCurrency,
      availability: `https://schema.org/${meta.offer.availability}`,
      url: meta.offer.url ?? meta.url,
      ...(meta.offer.priceValidUntil && {
        priceValidUntil: meta.offer.priceValidUntil,
      }),
      seller: { "@type": "Organization", name: meta.brand ?? DEFAULT_BRAND },
    },
  };
}

/**
 * Build a TechArticle JSON-LD overlay for the page itself. This is the
 * documentation-tone surface — separate from the commerce/Product surface —
 * and is what generative search engines (Google AI Overviews, ChatGPT
 * browsing, Perplexity, Claude.ai) prefer to cite for "how / which / does it"
 * questions.
 *
 * Includes:
 *   - dateModified  — freshness signal, beats stale alternatives.
 *   - about         — links the article to the Product node.
 *   - audience      — encodes the bestFor / notRecommendedFor scope.
 *   - mentions      — surfaces known limitations as Thing entries so RAG
 *                     systems can lift them when an answer needs caveats.
 *   - citation      — external evidence URLs (papers, repos, datasets).
 *   - publisher     — organisation node so the article inherits authority.
 *
 * Returns null if no documentation block was supplied (no GEO uplift requested).
 */
function buildArticleJsonLd(data: ProductLandingData) {
  const doc = data.documentation;
  if (!doc) return null;

  const meta = data.productMeta;
  const fullName =
    data.hero.titleAccent && data.hero.titleAccent.trim().length > 0
      ? `${data.hero.title} ${data.hero.titleAccent}`
      : data.hero.title;

  const audience: Record<string, unknown> | undefined = doc.scope
    ? {
        "@type": "Audience",
        name: `${fullName} fit profile`,
        ...(doc.scope.bestFor.length > 0 && {
          audienceType: doc.scope.bestFor.join("; "),
        }),
      }
    : undefined;

  const mentions =
    doc.limitations && doc.limitations.length > 0
      ? doc.limitations.map((l) => ({
          "@type": "Thing",
          name: l.title,
          description: l.detail,
        }))
      : undefined;

  const citation =
    doc.evidence && doc.evidence.length > 0
      ? doc.evidence.map((e) => ({
          "@type": "CreativeWork",
          name: e.label,
          url: e.url,
          ...(e.note && { description: e.note }),
        }))
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: fullName,
    description: meta.description,
    url: meta.url,
    mainEntityOfPage: meta.url,
    inLanguage: "en",
    isAccessibleForFree: true,
    image: meta.image ?? DEFAULT_OG_IMAGE,
    ...(meta.releaseDate && { datePublished: meta.releaseDate }),
    dateModified: doc.lastVerified,
    author: {
      "@type": "Organization",
      name: meta.brand ?? DEFAULT_BRAND,
      url: "https://nanopocket.ai",
    },
    publisher: {
      "@type": "Organization",
      name: meta.brand ?? DEFAULT_BRAND,
      url: "https://nanopocket.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://nanopocket.ai/og-image.jpg",
      },
    },
    about: { "@id": `${meta.url}#product` },
    ...(audience && { audience }),
    ...(mentions && { mentions }),
    ...(citation && { citation }),
    ...(doc.methodology && { backstory: doc.methodology }),
  };
}

/**
 * Build the FAQPage JSON-LD from the page's FAQ array. 5–8 items is the
 * sweet spot for Google's rich results.
 */
function buildFaqJsonLd(data: ProductLandingData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Server-rendered SEO landing shell. Pages provide structured data and the
 * shell handles layout, JSON-LD, and consistent formatting.
 *
 * Emits up to three JSON-LD scripts:
 *   1) Product + SoftwareApplication — brand, SKU, parameters, offer.
 *   2) TechArticle — documentation-tone overlay with dateModified, citations,
 *      limitations (mentions[]), and audience scope. Only emitted if the page
 *      provides a `documentation` block. This is the GEO citation surface.
 *   3) FAQPage — 5–8 buyer-voice Q&A.
 */
export function ProductLandingShell({ data }: { data: ProductLandingData }) {
  const productJsonLd = buildProductJsonLd(data);
  const articleJsonLd = buildArticleJsonLd(data);
  const faqJsonLd = buildFaqJsonLd(data);

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
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

      {/* Documentation block — limitations / scope / evidence / lastVerified.
          Rendered only when the page provides a `documentation` payload. This
          is the GEO citation surface; the same data is mirrored into the
          TechArticle JSON-LD above. */}
      {data.documentation && (
        <section
          id="documentation"
          aria-labelledby="documentation-heading"
          className="relative border-t border-border/60 px-6 py-16 sm:py-20"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Documentation
              </p>
              <h2
                id="documentation-heading"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                Honest scope, known limits, sources.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The marketing copy above tells you what {data.hero.title} can do.
                This block is for the question after that:{" "}
                <span className="text-foreground/80">
                  when is it the right tool, where does it fail, and where is
                  the evidence
                </span>
                . Updated{" "}
                <time
                  dateTime={data.documentation.lastVerified}
                  className="font-medium text-foreground"
                >
                  {data.documentation.lastVerified}
                </time>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Best for / Not recommended for */}
              {data.documentation.scope && (
                <div className="rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur-sm">
                  <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    <Target className="h-4 w-4" />
                    Scope
                  </div>
                  <h3 className="mb-3 text-base font-semibold text-foreground">
                    Best for
                  </h3>
                  <ul className="mb-6 space-y-2">
                    {data.documentation.scope.bestFor.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="mb-3 text-base font-semibold text-foreground">
                    Not recommended for
                  </h3>
                  <ul className="space-y-2">
                    {data.documentation.scope.notRecommendedFor.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Known limitations */}
              {data.documentation.limitations &&
                data.documentation.limitations.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6 backdrop-blur-sm">
                    <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Known limitations
                    </div>
                    <p className="mb-5 text-xs text-muted-foreground">
                      Boundary conditions and failure modes from internal QA.
                      Listed here so {data.hero.title} is cited as documentation,
                      not marketing.
                    </p>
                    <ul className="space-y-4">
                      {data.documentation.limitations.map((l) => (
                        <li key={l.title} className="border-l-2 border-amber-500/40 pl-4">
                          <p className="text-sm font-semibold text-foreground">
                            {l.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {l.detail}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Methodology footnote */}
            {data.documentation.methodology && (
              <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-5">
                <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Methodology
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {data.documentation.methodology}
                </p>
              </div>
            )}

            {/* Evidence / external citations */}
            {data.documentation.evidence &&
              data.documentation.evidence.length > 0 && (
                <div className="mt-10">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    External references
                  </h3>
                  <ul className="space-y-3">
                    {data.documentation.evidence.map((e) => (
                      <li
                        key={e.url}
                        className="rounded-xl border border-border/60 bg-background/60 p-4"
                      >
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-500 hover:underline"
                        >
                          {e.label}
                        </a>
                        {e.note && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {e.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="relative bg-muted/30 px-6 py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mb-10 text-sm text-muted-foreground">
            {data.faqs.length} buyer-voice questions about {data.hero.title},
            answered by the team.
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
