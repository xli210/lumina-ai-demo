import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, Check } from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { BeforeAfterSlider } from "@/app/components/before-after-slider";
import { BLOG_POSTS } from "@/lib/blog-posts";
import {
  IMAGE_EDIT_FAQ,
  IMAGE_EDIT_GUIDES,
  IMAGE_EDIT_KEY_FACTS,
  IMAGE_EDIT_LAUNCHED,
  IMAGE_EDIT_LIMITS,
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_USD,
  IMAGE_EDIT_PRICE_USD_TEXT,
  IMAGE_EDIT_STEPS,
  IMAGE_EDIT_TOOLS,
  IMAGE_EDIT_URL,
  IMAGE_EDIT_WARM_SECONDS,
} from "@/lib/image-edit-facts";
import { IMAGE_EDIT_EXAMPLES, IMAGE_EDIT_OG } from "@/lib/image-edit-examples";
import { IMAGE_EDIT_USE_CASES } from "@/lib/image-edit-use-cases";

/**
 * /image-edit: the public, indexable page for Nano ImageEdit 2.0 Online.
 *
 * The editor itself is at /image-edit/launch behind sign-in (middleware
 * protects the `/image-edit/` prefix, not this page, so crawlers can read it).
 * Every figure comes from lib/image-edit-facts.ts, so this page, its JSON-LD,
 * /llms.txt and the guides under /blog cannot disagree. The before/after
 * examples are real edits made with the product; the prompt shown under each
 * is the one that was run. See docs/image-edit.md and docs/GEO-PLAYBOOK.md.
 */

const LAUNCH = "/image-edit/launch";
// The site template appends " | NanoPocket", so keep this short enough to survive it (~60 characters shown in results).
const TITLE = `${IMAGE_EDIT_NAME}: AI Photo Editor by Prompt`;
const DESCRIPTION = `Remove, replace or add objects, change text on signs, relight, change the season or restore old photos by describing the edit. Full-resolution PNG, the rest of the photo stays identical. ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per edit, no subscription.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI photo editor online",
    "edit photos with text prompts",
    "remove objects from photos AI",
    "replace object in photo AI",
    "change text in image AI",
    "restore old photos AI",
    "colorize old photos online",
    "change season in photo AI",
    "AI photo editor no subscription",
    "Nano ImageEdit",
  ],
  alternates: { canonical: "/image-edit" },
  openGraph: {
    type: "website",
    url: IMAGE_EDIT_URL,
    title: `${IMAGE_EDIT_NAME}: describe the edit, keep the rest of the photo`,
    description: DESCRIPTION,
    images: [{ url: IMAGE_EDIT_OG.src, width: IMAGE_EDIT_OG.width, height: IMAGE_EDIT_OG.height, alt: IMAGE_EDIT_OG.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${IMAGE_EDIT_NAME}: describe the edit, keep the rest of the photo`,
    description: DESCRIPTION,
    images: [IMAGE_EDIT_OG.src],
  },
};

const abs = (path: string) => `https://nanopocket.ai${path}`;

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${IMAGE_EDIT_URL}#software`,
  name: IMAGE_EDIT_NAME,
  alternateName: "Nano ImageEdit Online",
  url: IMAGE_EDIT_URL,
  description: DESCRIPTION,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Photo editor",
  operatingSystem: "Web browser",
  softwareVersion: "2.0",
  datePublished: IMAGE_EDIT_LAUNCHED,
  inLanguage: "en",
  featureList: IMAGE_EDIT_TOOLS.map((t) => `${t.name}: ${t.summary}`),
  screenshot: IMAGE_EDIT_EXAMPLES.map((e) => abs(e.after)),
  image: abs(IMAGE_EDIT_OG.src),
  offers: [
    {
      "@type": "Offer",
      name: "Per edit",
      price: IMAGE_EDIT_PRICE_USD.toFixed(2),
      priceCurrency: "USD",
      description: `${IMAGE_EDIT_PRICE_CREDITS} credits per finished edit, prepaid in credits that never expire. Failed and cancelled edits are refunded.`,
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
  dateModified: IMAGE_EDIT_EXAMPLES.length ? "2026-10-05" : IMAGE_EDIT_LAUNCHED,
  primaryImageOfPage: { "@type": "ImageObject", url: abs(IMAGE_EDIT_OG.src), width: IMAGE_EDIT_OG.width, height: IMAGE_EDIT_OG.height },
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
    "Add a photo, choose a tool, describe the edit in plain words, and download the full-resolution result.",
  totalTime: "PT2M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: IMAGE_EDIT_PRICE_USD.toFixed(2) },
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

const SAMPLE_CREDITS: { file: string; title: string; url: string; license: string }[] = [
  { file: "lake2", title: "Glencoe Lochan reflections 3 20211022.jpg", url: "https://commons.wikimedia.org/wiki/File:Glencoe_Lochan_reflections_3_20211022.jpg", license: "CC BY-SA 3.0" },
  { file: "park2", title: "Dülmen, Merfeld, Von-Galen-Park -- 2013 -- 2367.jpg", url: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Merfeld,_Von-Galen-Park_--_2013_--_2367.jpg", license: "CC BY-SA 4.0" },
  { file: "room", title: "A table in The Round Table Cafe at Winchester Great Hall 2026-07-12.jpg", url: "https://commons.wikimedia.org/wiki/File:A_table_in_The_Round_Table_Cafe_at_Winchester_Great_Hall_2026-07-12.jpg", license: "CC0" },
  { file: "fruit", title: "Fruit Bowl (4880797613).jpg", url: "https://commons.wikimedia.org/wiki/File:Fruit_Bowl_(4880797613).jpg", license: "CC BY 2.0" },
  { file: "cars", title: "Parked Panek car, Batuty street, Warsaw.jpg", url: "https://commons.wikimedia.org/wiki/File:Parked_Panek_car,_Batuty_street,_Warsaw.jpg", license: "CC BY-SA 4.0" },
  { file: "barber", title: "Barber Storefront with Flag - panoramio.jpg", url: "https://commons.wikimedia.org/wiki/File:Barber_Storefront_with_Flag_-_panoramio.jpg", license: "CC BY-SA 3.0" },
  { file: "trends", title: "Citi Trends Storefront Logo.jpg", url: "https://commons.wikimedia.org/wiki/File:Citi_Trends_Storefront_Logo.jpg", license: "CC BY-SA 4.0" },
  { file: "houses", title: "Cape Town (ZA), Wale Street -- 2024 -- 3544.jpg", url: "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Wale_Street_--_2024_--_3544.jpg", license: "CC BY-SA 4.0" },
  { file: "park", title: "A garden path and lawn Gibberd Garden Essex England.JPG", url: "https://commons.wikimedia.org/wiki/File:A_garden_path_and_lawn_Gibberd_Garden_Essex_England.JPG", license: "CC BY-SA 4.0" },
  { file: "glassplate", title: "Five photographs of Center Street looking east, Monroe, Ohio, 1910 (DPLA)", url: "https://commons.wikimedia.org/wiki/File:Five_photographs_of_Center_Street_looking_east,_Monroe,_Ohio,_1910_February_18_-_DPLA_-_2d4294c2bedb8ac377730ee383ef4b1b_(page_1).jpg", license: "Public domain" },
  { file: "sepia", title: "Jerald Schaitberger … Columbus Circle, October 8, 1910 (LOC cph.3a01149)", url: "https://commons.wikimedia.org/wiki/File:Jerald_Schaitberger_of_416_W._57th_St._N.Y._who_helps_an_older_boy_sell_papers_until_10_P.M._on_Columbus_Circle._7_yrs._old._9-30_P.M.,_October_8,_1910._LOC_cph.3a01149.jpg", license: "Public domain" },
  { file: "hangar", title: "Bazalgette Lancaster FM-159 (51067883253).jpg", url: "https://commons.wikimedia.org/wiki/File:Bazalgette_Lancaster_FM-159_(51067883253).jpg", license: "CC BY 2.0" },
];

const eyebrow = "mb-3 text-sm font-medium uppercase tracking-widest text-primary";
const h2 = "mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl";
const lede = "max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default function ImageEditLanding() {
  const guides = IMAGE_EDIT_GUIDES.filter((g) => BLOG_POSTS.some((p) => p.slug === g.slug));

  return (
    <main className="relative min-h-screen">
      {[softwareJsonLd, webPageJsonLd, faqJsonLd, howToJsonLd, breadcrumbJsonLd].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
      <Navbar />

      {/* Hero */}
      <section className="px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className={eyebrow}>{IMAGE_EDIT_NAME}</p>
          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Edit photos by describing the change.
          </h1>
          <p className={`${lede} mx-auto mb-8`}>
            An AI photo editor in your browser. Remove or replace objects, rewrite the text on a sign, relight a scene,
            change the season or restore an old print, then download the full-resolution PNG. Everything you don&apos;t
            ask to change stays pixel-identical.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href={LAUNCH} className={primaryButton}>
              Open the editor <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#examples" className={textLink}>
              See real examples ↓
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            {IMAGE_EDIT_PRICE_CREDITS} credits ({IMAGE_EDIT_PRICE_USD_TEXT}) per edit · free credits for new accounts · failed
            edits refunded · no subscription
          </p>
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

      {/* Real examples */}
      <section id="examples" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className={eyebrow}>Real results</p>
            <h2 className={h2}>Drag to compare. Every one is a real edit.</h2>
            <p className={`${lede} mx-auto`}>
              Each pair is a photo edited with the instruction under it, unretouched. The percentage is how much of the
              image the editor reports as changed; for object edits it confirms the rest is identical.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {IMAGE_EDIT_EXAMPLES.map((e, i) => (
              <figure
                key={e.id}
                className={`glass-strong overflow-hidden rounded-3xl border border-primary/10 ${
                  i === IMAGE_EDIT_EXAMPLES.length - 1 && IMAGE_EDIT_EXAMPLES.length % 2 === 1 ? "md:col-span-2" : ""
                }`}
              >
                <BeforeAfterSlider
                  before={e.before}
                  after={e.after}
                  alt={e.alt}
                  width={e.width}
                  height={e.height}
                />
                <figcaption className="p-5 sm:p-6">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <a
                      href={`#${e.toolId}`}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {e.toolName}
                    </a>
                    {e.editedPct !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {e.editedPct}% of the image changed · the rest identical
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-sm font-medium text-foreground">&ldquo;{e.prompt}&rdquo;</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Photo:{" "}
                    <a href={e.credit.url} target="_blank" rel="noopener noreferrer" className={textLink}>
                      {e.credit.title}
                    </a>
                    , {e.credit.license}.
                    {e.credit.license.startsWith("CC BY-SA") && " The edited version is shared under the same licence."}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className={eyebrow}>Eight tools</p>
            <h2 className={h2}>Say what you want in plain words.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {IMAGE_EDIT_TOOLS.map((t) => (
              <article key={t.id} id={t.id} className="glass-strong scroll-mt-28 rounded-3xl border border-primary/10 p-6">
                <h3 className="mb-2 text-lg font-bold text-foreground">{t.name}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{t.summary}</p>
                <p className="mb-3 rounded-xl bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
                  {t.example}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t.scope === "region" ? "Rest of the photo stays identical" : "Changes the whole photo"}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>How it works</p>
          <h2 className={h2}>From photo to result in about {IMAGE_EDIT_WARM_SECONDS}.</h2>
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

      {/* Audience pages: the long-tail routes into this product */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <p className={eyebrow}>Who it is for</p>
          <h2 className={h2}>Made for work where the rest of the photo must stay put.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {IMAGE_EDIT_USE_CASES.map((u) => (
              <Link
                key={u.slug}
                href={`/use-cases/${u.slug}`}
                className="glass-strong rounded-3xl border border-primary/10 p-5 transition-shadow hover:shadow-lg"
              >
                <h3 className="mb-1 text-base font-semibold text-foreground">{u.name}</h3>
                <p className="text-sm text-muted-foreground">{u.whoFor}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides + related: the internal links this page needs */}
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          {guides.length > 0 && (
            <div>
              <p className={eyebrow}>Guides</p>
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Step-by-step</h2>
              <ul className="space-y-3 text-sm sm:text-base">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/blog/${g.slug}`} className={textLink}>
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className={eyebrow}>Also from NanoPocket</p>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Related tools</h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <Link href="/facestudio-v" className={textLink}>
                  Nano FaceStudio-V Online
                </Link>
                <span className="text-muted-foreground"> for swapping a face in a video (limited 3-day preview)</span>
              </li>
              <li>
                <Link href="/face-studio" className={textLink}>
                  Nano FaceStudio Online
                </Link>
                <span className="text-muted-foreground"> for swapping up to six faces in one photo</span>
              </li>
              <li>
                <Link href="/apps/nano-imageedit" className={textLink}>
                  Nano ImageEdit (desktop)
                </Link>
                <span className="text-muted-foreground"> to generate and edit images locally on your own GPU</span>
              </li>
              <li>
                <Link href="/apps/nano-imageenh-pro" className={textLink}>
                  Nano ImageEnh Pro
                </Link>
                <span className="text-muted-foreground"> for upscaling and restoring images locally</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-6 pb-24">
        <div className="glass-strong mx-auto max-w-3xl rounded-3xl border border-primary/10 p-8 text-center sm:p-10">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Try it on your own photo.
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted-foreground sm:text-base">
            Sign in, drop in a photo and describe the change. {IMAGE_EDIT_PRICE_CREDITS} credits
            ({IMAGE_EDIT_PRICE_USD_TEXT}) per edit; an edit that fails costs nothing.
          </p>
          <Link href={LAUNCH} className={primaryButton}>
            Open the editor <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="sample-credits" className="scroll-mt-24 px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-lg font-bold tracking-tight text-foreground">Photo credits</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            The sample photos in the editor and the examples above come from Wikimedia Commons and are shown resized.
            Edited versions of CC BY-SA images are shared under the same licence.
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {SAMPLE_CREDITS.map((c) => (
              <li key={c.file}>
                <a href={c.url} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  {c.title}
                </a>{" "}
                — {c.license}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
