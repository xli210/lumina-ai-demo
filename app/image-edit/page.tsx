import type { Metadata } from "next";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Check } from "lucide-react";

import { SpotEditNav } from "@/app/components/spotedit-nav";
import { Footer } from "@/app/components/footer";
import { BeforeAfterSlider } from "@/app/components/before-after-slider";
import {
  IMAGE_EDIT_FAQ,
  IMAGE_EDIT_KEY_FACTS,
  IMAGE_EDIT_LAUNCHED,
  IMAGE_EDIT_LIMITS,
  IMAGE_EDIT_MAX_MP,
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_STEPS,
  IMAGE_EDIT_URL,
  IMAGE_EDIT_WELCOME_CREDITS,
} from "@/lib/image-edit-facts";
import { SPOTEDIT_EXAMPLES, SPOTEDIT_HERO, SPOTEDIT_PROOF } from "@/lib/image-edit-examples";

/**
 * /image-edit: the public, indexable page for SpotEdit.
 *
 * The editor itself is at /image-edit/launch behind sign-in (middleware
 * protects the `/image-edit/` prefix, not this page, so crawlers can read it).
 * Every figure comes from lib/image-edit-facts.ts and lib/image-edit-examples.ts,
 * so this page, its JSON-LD and /llms.txt cannot disagree. The cases are real
 * edits; the request shown under each is the one that was run.
 */

const LAUNCH = "/image-edit/launch";
// The site template appends " | NanoPocket", so keep this short enough to survive it (~60 characters shown in results).
const TITLE = `Full-Resolution AI Photo Retouching: ${IMAGE_EDIT_NAME}`;
const TAGLINE = "only the spot you name changes";
const DESCRIPTION = `Retouch photos by describing the change. Results come back at full size, up to ${IMAGE_EDIT_MAX_MP} MP, and every pixel outside the edit is identical to your original. From ${IMAGE_EDIT_PRICE_CREDITS} credits per edit, no subscription, ${IMAGE_EDIT_WELCOME_CREDITS} free credits on sign-up.`;
const OG = { src: SPOTEDIT_HERO.after, width: SPOTEDIT_HERO.width, height: SPOTEDIT_HERO.height, alt: `${IMAGE_EDIT_NAME}: ${SPOTEDIT_HERO.title}` };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "full resolution AI photo editing",
    "AI retouching for professionals",
    "edit part of a photo with AI",
    "generative fill alternative",
    "remove objects from high resolution photos",
    "SpotEdit",
  ],
  alternates: { canonical: "/image-edit", languages: hreflangAlternates("https://nanopocket.ai", "/image-edit", TRANSLATED_PAGES["/image-edit"]) },
  openGraph: {
    type: "website",
    url: IMAGE_EDIT_URL,
    title: `${IMAGE_EDIT_NAME}: ${TAGLINE}`,
    description: DESCRIPTION,
    images: [{ url: OG.src, width: OG.width, height: OG.height, alt: OG.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${IMAGE_EDIT_NAME}: ${TAGLINE}`,
    description: DESCRIPTION,
    images: [OG.src],
  },
};

const abs = (path: string) => `https://nanopocket.ai${path}`;

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${IMAGE_EDIT_URL}#software`,
  name: IMAGE_EDIT_NAME,
  alternateName: "Nano ImageEdit 2.0 Online",
  url: IMAGE_EDIT_URL,
  description: DESCRIPTION,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Photo editor",
  operatingSystem: "Web browser",
  datePublished: IMAGE_EDIT_LAUNCHED,
  inLanguage: "en",
  featureList: [`Full-resolution output up to ${IMAGE_EDIT_MAX_MP} MP`, "Pixels outside the edit stay identical", "Edit by text instruction, with an optional brush"],
  screenshot: [SPOTEDIT_HERO, ...SPOTEDIT_EXAMPLES].map((e) => abs(e.after)),
  image: abs(OG.src),
  offers: [
    {
      "@type": "Offer",
      // Free to start with the welcome credits; the per-edit price is given in credits only.
      name: "Free to start",
      price: "0",
      priceCurrency: "USD",
      description: `New accounts get free credits. Then from ${IMAGE_EDIT_PRICE_CREDITS} credits per finished edit, prepaid in credits that never expire. A failed edit is not charged.`,
      url: IMAGE_EDIT_URL,
    },
  ],
  provider: { "@type": "Organization", "@id": "https://nanopocket.ai#organization", name: "NanoPocket", url: "https://nanopocket.ai" },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": IMAGE_EDIT_URL,
  url: IMAGE_EDIT_URL,
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: "en",
  datePublished: IMAGE_EDIT_LAUNCHED,
  dateModified: "2026-11-08",
  primaryImageOfPage: { "@type": "ImageObject", url: abs(OG.src), width: OG.width, height: OG.height },
  about: { "@id": `${IMAGE_EDIT_URL}#software` },
  isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: IMAGE_EDIT_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: `How to edit a photo by describing the change with ${IMAGE_EDIT_NAME}`,
  description:
    "Add a photo, describe the edit in plain words, and download the full-resolution result.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A photo" }],
  tool: [{ "@type": "HowToTool", name: "A modern web browser" }],
  step: IMAGE_EDIT_STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
    url: `${IMAGE_EDIT_URL}#how-it-works`,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
    { "@type": "ListItem", position: 2, name: IMAGE_EDIT_NAME, item: IMAGE_EDIT_URL },
  ],
};

const eyebrow = "mb-3 text-sm font-medium uppercase tracking-widest text-primary";
const h2 = "mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl";
const lede = "max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default function ImageEditLanding() {
  return (
    <main className="relative min-h-screen">
      {[softwareJsonLd, webPageJsonLd, faqJsonLd, howToJsonLd, breadcrumbJsonLd].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
      <SpotEditNav sections />

      {/* Hero */}
      <section className="px-6 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className={eyebrow}>{IMAGE_EDIT_NAME}</p>
          <h1 className="mx-auto mb-5 max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Retouch at full resolution. Only the spot you name changes.
          </h1>
          <p className={`${lede} mx-auto mb-8`}>
            Describe the change and get your photo back at its original size, up to {IMAGE_EDIT_MAX_MP} MP. Every pixel
            outside the edit is identical to the file you uploaded, so the result is ready to deliver.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href={LAUNCH} className={primaryButton}>
              Edit your photo <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#proof" className={textLink}>
              See the pixel check ↓
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            From {IMAGE_EDIT_PRICE_CREDITS} credits per edit · free credits for new accounts · failed edits not charged
            · no subscription
          </p>
          <figure className="glass-strong mt-12 overflow-hidden rounded-3xl border border-primary/10 text-left">
            <BeforeAfterSlider
              before={SPOTEDIT_HERO.before}
              after={SPOTEDIT_HERO.after}
              alt={SPOTEDIT_HERO.title}
              width={SPOTEDIT_HERO.width}
              height={SPOTEDIT_HERO.height}
            />
            <figcaption className="p-5 sm:p-6">
              <p className="mb-1 text-sm font-medium text-foreground">&ldquo;{SPOTEDIT_HERO.prompt}&rdquo;</p>
              <p className="text-xs text-muted-foreground">Original {SPOTEDIT_HERO.size} · same size out</p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Key facts: the short, quotable block */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="sr-only">Key facts</h2>
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-primary/10 bg-border sm:grid-cols-2">
            {IMAGE_EDIT_KEY_FACTS.map((f) => (
              <div key={f.label} className="glass-strong p-5">
                <dt className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                <dd className="text-sm text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The pixel check */}
      <section id="proof" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className={eyebrow}>The pixel check</p>
            <h2 className={h2}>Don&apos;t take our word for it. Subtract the two images.</h2>
            <p className={`${lede} mx-auto`}>
              A real result compared with its original, pixel by pixel. White marks every pixel that differs by even one
              level. Black pixels are exactly the same.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { src: SPOTEDIT_PROOF.before, label: "Original" },
              { src: SPOTEDIT_PROOF.after, label: "Result" },
              { src: SPOTEDIT_PROOF.diff, label: "Changed pixels" },
            ].map((p) => (
              <figure key={p.label} className="glass-strong overflow-hidden rounded-3xl border border-primary/10">
                <Image
                  src={p.src}
                  alt={`${p.label}: ${SPOTEDIT_PROOF.prompt}`}
                  width={SPOTEDIT_PROOF.width}
                  height={SPOTEDIT_PROOF.height}
                  unoptimized
                  className="h-auto w-full"
                />
                <figcaption className="p-4 text-center text-sm font-medium text-foreground">{p.label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
            Request: &ldquo;{SPOTEDIT_PROOF.prompt}&rdquo;. The editor reported {SPOTEDIT_PROOF.reportedEditedPct}% of the
            photo as edited, and {SPOTEDIT_PROOF.identicalPct}% of its pixels came back identical to the original.
          </p>
        </div>
      </section>

      {/* Cases */}
      <section id="examples" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className={eyebrow}>Real photos</p>
            <h2 className={h2}>One request each. Drag to compare.</h2>
            <p className={`${lede} mx-auto`}>Every result came back at the photo&apos;s original size.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {SPOTEDIT_EXAMPLES.map((e, i) => (
              <figure
                key={e.id}
                className={`glass-strong overflow-hidden rounded-3xl border border-primary/10 ${
                  i === 0 ? "md:col-span-2" : ""
                }`}
              >
                <BeforeAfterSlider before={e.before} after={e.after} alt={e.title} width={e.width} height={e.height} />
                <figcaption className="p-5 sm:p-6">
                  <h3 className="mb-1 font-semibold text-foreground">{e.title}</h3>
                  <p className="mb-2 text-sm text-foreground">&ldquo;{e.prompt}&rdquo;</p>
                  <p className="text-xs text-muted-foreground">Original {e.size} · same size out</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Sample photos from Unsplash, shown resized. Each edit was made by {IMAGE_EDIT_NAME} with the request shown.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>How it works</p>
          <h2 className={h2}>Upload, describe, deliver.</h2>
          <ol className="mt-8 space-y-6">
            {IMAGE_EDIT_STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{s.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Limits, said plainly */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Honest limits</p>
          <h2 className={h2}>What it won&apos;t do.</h2>
          <ul className="mt-6 space-y-3">
            {IMAGE_EDIT_LIMITS.map((l) => (
              <li key={l} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ: every answer is in the DOM, so the FAQPage schema matches what is on the page */}
      <section id="faq" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Questions</p>
          <h2 className={h2}>Frequently asked.</h2>
          <div className="mt-6 divide-y divide-border rounded-3xl border border-primary/10">
            {IMAGE_EDIT_FAQ.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  <h3 className="text-base">{f.q}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-6 pb-24">
        <div className="glass-strong mx-auto max-w-3xl rounded-3xl border border-primary/10 p-8 text-center sm:p-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Check it on your own photo.
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground sm:text-base">
            Sign in, drop in a photo and describe the change. From {IMAGE_EDIT_PRICE_CREDITS} credits per edit; an edit
            that fails costs nothing.
          </p>
          <Link href={LAUNCH} className={primaryButton}>
            Edit your photo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
