import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ScanFace } from "lucide-react";

import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { BeforeAfterSlider } from "../components/before-after-slider";
import {
  DIFFERENTIATORS,
  FACE_STUDIO_FAQ,
  FACE_STUDIO_FULL_NAME,
  FACE_STUDIO_STEPS,
  FACE_SWAP_CREDITS,
  FACE_SWAP_USD,
  FACTS_VERIFIED,
  FREE_ALLOWANCE_SHORT,
  FREE_RENDERS_PER_TOPUP,
  HEAD_SWAP_CREDITS,
  HEAD_SWAP_USD,
  PERFORMANCE,
  usd,
} from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES, FREE_TOPUP_CREDITS, FREE_TOPUP_FREQUENCY } from "@/lib/facestudio";
import { FACE_STUDIO_OG, SHOWCASE, SHOWCASE_IMAGES, type ShowImage } from "@/lib/face-studio-showcase";

/**
 * /face-studio — the public, indexable landing page for Nano FaceStudio Online.
 *
 * Not auth-gated: the console is (see /face-studio/launch and the
 * `/face-studio/` middleware prefix), but this page has to be readable by
 * search engines and assistants without a session.
 *
 * Numbers come from lib/face-studio-facts.ts and pictures from
 * lib/face-studio-showcase.ts, so the copy, the JSON-LD, /llms.txt and the
 * image sitemap cannot drift apart. The pictures are real renders and real
 * screenshots of the console.
 */

const PAGE_URL = "https://nanopocket.ai/face-studio";
const CONSOLE_URL = "/face-studio/launch";
const abs = (path: string) => `https://nanopocket.ai${path}`;

// The site template appends " | NanoPocket", so this stays short.
const TITLE = "Nano FaceStudio Online: Multi-Face Swap That Keeps Hair & Hands";
const DESCRIPTION = `Swap up to ${FACESTUDIO_MAX_FACES} faces in one photo, or a whole head, and keep the hair, hands, glasses and jewellery that cross the face. Full resolution, no watermark. ${usd(
  FACE_SWAP_USD,
)} per face, ${FREE_ALLOWANCE_SHORT}, no subscription.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "multi face swap",
    "group photo face swap",
    "head swap online",
    "face swap keep hair",
    "face swap keep glasses",
    "face swap occlusion",
    "full resolution face swap",
    "face swap no watermark",
    "pay per face swap",
    "face swap no subscription",
    "ai face swap online",
  ],
  alternates: { canonical: "/face-studio" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: `${FACE_STUDIO_FULL_NAME}: swap every face, keep everything else`,
    description: DESCRIPTION,
    images: [{ url: abs(FACE_STUDIO_OG.src), width: FACE_STUDIO_OG.width, height: FACE_STUDIO_OG.height, alt: FACE_STUDIO_OG.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${FACE_STUDIO_FULL_NAME}: swap every face, keep everything else`,
    description: DESCRIPTION,
    images: [abs(FACE_STUDIO_OG.src)],
  },
};

/* -------------------------------------------------------------------------- */
/* Structured data                                                             */
/* -------------------------------------------------------------------------- */

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${PAGE_URL}#software`,
  name: FACE_STUDIO_FULL_NAME,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "AI face swap",
  operatingSystem: "Any (web browser)",
  url: PAGE_URL,
  description: `Hosted AI face swap that replaces up to ${FACESTUDIO_MAX_FACES} faces in one photo, or an entire head, at source resolution with no watermark, with per-face control over which original regions survive the swap.`,
  featureList: DIFFERENTIATORS.map((d) => d.title),
  image: abs(FACE_STUDIO_OG.src),
  screenshot: SHOWCASE_IMAGES.map(({ image }) => abs(image.src)),
  offers: [
    {
      "@type": "Offer",
      name: "Face swap",
      price: FACE_SWAP_USD.toFixed(2),
      priceCurrency: "USD",
      description: `${FACE_SWAP_CREDITS} credits per face replaced, because the model runs one pass per face. Faces left alone are free. Credits never expire and there is no subscription.`,
      url: PAGE_URL,
    },
    {
      "@type": "Offer",
      name: "Head swap",
      price: HEAD_SWAP_USD.toFixed(2),
      priceCurrency: "USD",
      description: `${HEAD_SWAP_CREDITS} credits, for whole-head replacement. Head swap operates on exactly one face.`,
      url: PAGE_URL,
    },
    {
      "@type": "Offer",
      name: "Free allowance",
      price: "0",
      priceCurrency: "USD",
      description: `A signed-in account is topped up to ${FREE_TOPUP_CREDITS} credits when it runs low (${FREE_TOPUP_FREQUENCY} for an account that has never bought credits), which is ${FREE_RENDERS_PER_TOPUP} full-resolution unwatermarked face swaps. Face detection is always free.`,
      url: PAGE_URL,
    },
  ],
  provider: { "@type": "Organization", "@id": "https://nanopocket.ai#organization", name: "NanoPocket", url: "https://nanopocket.ai" },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
  about: { "@id": `${PAGE_URL}#software` },
  primaryImageOfPage: abs(FACE_STUDIO_OG.src),
  dateModified: "2026-10-06",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FACE_STUDIO_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to swap several faces in one photo with Nano FaceStudio Online",
  description: `Detect up to ${FACESTUDIO_MAX_FACES} faces in a photo, give each one its own reference, choose what to keep from the original, and render at full resolution.`,
  image: abs(SHOWCASE.group.after.src),
  totalTime: "PT2M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: FACE_SWAP_USD.toFixed(2) },
  step: FACE_STUDIO_STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
    { "@type": "ListItem", position: 2, name: "Online face swap", item: "https://nanopocket.ai/face-swap" },
    { "@type": "ListItem", position: 3, name: FACE_STUDIO_FULL_NAME, item: PAGE_URL },
  ],
};

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

const eyebrow = "mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary";
const h2 = "text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl";
const lede = "mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

function Shot({ image, caption, className = "" }: { image: ShowImage; caption?: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/30 shadow-sm">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-auto w-full"
        />
      </div>
      {caption && <figcaption className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Slider({ before, after, caption }: { before: ShowImage; after: ShowImage; caption?: string }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-2xl border border-border/70 shadow-lg">
        <BeforeAfterSlider before={before.src} after={after.src} alt={after.alt} width={after.width} height={after.height} />
      </div>
      {caption && <figcaption className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Chapter({
  id,
  index,
  kicker,
  title,
  body,
  points,
  children,
  flip = false,
}: {
  id: string;
  index: string;
  kicker: string;
  title: string;
  body: string;
  points: string[];
  children: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-6 py-16 sm:py-20">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 lg:gap-14 ${
          flip ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        }`}
      >
        <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <p className={eyebrow}>
            <span className="mr-2 tabular-nums text-muted-foreground">{index}</span>
            {kicker}
          </p>
          <h2 className={h2}>{title}</h2>
          <p className={lede}>{body}</p>
          <ul className="mt-6 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-foreground/90 sm:text-base">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className={`min-w-0 ${flip ? "lg:order-1" : ""}`}>{children}</div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export default function FaceStudioLandingPage() {
  const stats = [
    { value: String(FACESTUDIO_MAX_FACES), label: "faces in one photo" },
    { value: "4080 px", label: "output, no watermark" },
    { value: usd(FACE_SWAP_USD), label: "per face swapped" },
    { value: String(FREE_RENDERS_PER_TOPUP), label: `free swaps, topped up ${FREE_TOPUP_FREQUENCY}` },
  ];

  return (
    <main className="relative min-h-screen">
      {[softwareJsonLd, webPageJsonLd, faqJsonLd, howToJsonLd, breadcrumbJsonLd].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 px-6 pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-600/25 blur-[140px]" />
          <div className="absolute -bottom-48 right-0 h-[480px] w-[480px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80">
              <ScanFace className="h-3.5 w-3.5" />
              {FACE_STUDIO_FULL_NAME} · in your browser
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Swap every face.
              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                Keep everything else.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base text-white/70 sm:text-lg">
              Replace up to {FACESTUDIO_MAX_FACES} faces in one photo, or a whole head, and choose what stays from the
              original: the hair across an eye, a hand on a cheek, glasses, a nose ring. Back at full resolution, with no
              watermark.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={CONSOLE_URL}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg transition-all hover:bg-neutral-100"
              >
                Try it free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                See what it does ↓
              </a>
            </div>
            <p className="mt-5 text-xs text-white/50">
              {FREE_ALLOWANCE_SHORT} for any signed-in account · then {usd(FACE_SWAP_USD)} per face ·
              credits never expire · failed renders refunded
            </p>
          </div>
          <figure className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-violet-950/50">
              <BeforeAfterSlider
                before={SHOWCASE.hero.before.src}
                after={SHOWCASE.hero.after.src}
                alt={SHOWCASE.hero.after.alt}
                width={SHOWCASE.hero.after.width}
                height={SHOWCASE.hero.after.height}
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-white/50">
              Drag to compare · a real render with Keep occluders on: new face, same nose ring, beanie and hair
            </figcaption>
          </figure>
        </div>

        {/* Stats */}
        <dl className="relative mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-neutral-950/80 px-5 py-5 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-2xl font-bold tabular-nums sm:text-3xl">{s.value}</span>
                <span className="mt-1 block text-xs text-white/60">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div id="features" className="scroll-mt-20" />

      <Chapter
        id="multi-face"
        index="01"
        kicker="Group photos"
        title="Swap one face, or all of them."
        body={`One upload finds up to ${FACESTUDIO_MAX_FACES} faces. Give each its own reference and they are all swapped in a single render; faces you leave without a reference are not touched, and not charged.`}
        points={[
          "A numbered card for every detected face",
          "A different reference for each person, in one pass",
          `${usd(FACE_SWAP_USD)} per face you swap, nothing for the rest`,
        ]}
      >
        <div className="space-y-5">
          <Slider
            before={SHOWCASE.group.before}
            after={SHOWCASE.group.after}
            caption="One render: five faces given a reference and swapped; the brushes, flowers and the other faces unchanged."
          />
          <Shot image={SHOWCASE.groupUi} caption="The face picker: a reference slot for each detected face." />
        </div>
      </Chapter>

      <div className="bg-muted/30">
        <Chapter
          id="keep-occluders"
          index="02"
          kicker="Keep occluders"
          title="Keep what crosses the face."
          body="A plain face swap paints over whatever is in front of the face. Here you pick, per face, what survives: hair, hands, glasses, jewellery, a microphone, a cup."
          points={[
            "Each face gets its own map of what is in front of it",
            "Toggle hair, clothing and accessories independently",
            "The rest of the photo stays as it was",
          ]}
          flip
        >
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {(
                [
                  [SHOWCASE.keep.original, "Original"],
                  [SHOWCASE.keep.lost, "Plain swap: ring lost"],
                  [SHOWCASE.keep.kept, "Keep on: ring stays"],
                ] as const
              ).map(([image, label], i) => (
                <figure key={label} className="min-w-0">
                  <div
                    className={`overflow-hidden rounded-2xl border-2 ${
                      i === 2 ? "border-primary" : "border-border/70"
                    }`}
                  >
                    {/* Zoomed on the nose ring, which is the whole point of the comparison */}
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 220px, 33vw"
                      className="aspect-square h-auto w-full scale-[1.6] object-cover object-[45%_34%]"
                      style={{ transformOrigin: "45% 34%" }}
                    />
                  </div>
                  <figcaption
                    className={`mt-2 text-center text-[11px] font-medium sm:text-xs ${
                      i === 2 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="grid grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] items-center gap-5 rounded-2xl border border-border/70 p-4">
              <Image
                src={SHOWCASE.keepUi.src}
                alt={SHOWCASE.keepUi.alt}
                width={SHOWCASE.keepUi.width}
                height={SHOWCASE.keepUi.height}
                sizes="180px"
                className="h-auto w-full rounded-xl"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                The Keep occluders panel. Each face gets a colour map of what is in front of it, and a switch for each
                region. Turn one on and those pixels come from your original instead of the swap.
              </p>
            </div>
          </div>
        </Chapter>
      </div>

      <Chapter
        id="head-swap"
        index="03"
        kicker="Two modes"
        title="Just the face, or the whole head."
        body={`Face swap changes the face and keeps the original hair and head shape. Head swap replaces the whole head, hair included, for a closer likeness to the reference. Face swap is ${FACE_SWAP_CREDITS} credits per face; head swap ${HEAD_SWAP_CREDITS}.`}
        points={["Choose the mode before you upload a reference", "Head swap works on one face per render", "Same full-resolution output either way"]}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                [SHOWCASE.modes.target, "Original"],
                [SHOWCASE.modes.face, "Face swap"],
                [SHOWCASE.modes.head, "Head swap"],
              ] as const
            ).map(([image, label]) => (
              <figure key={label} className="min-w-0">
                <div className="overflow-hidden rounded-xl border border-border/70">
                  <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 1024px) 220px, 33vw" className="h-auto w-full" />
                </div>
                <figcaption className="mt-2 text-center text-xs font-medium text-muted-foreground">{label}</figcaption>
              </figure>
            ))}
          </div>
          <Shot image={SHOWCASE.modesUi} />
        </div>
      </Chapter>

      <div className="bg-muted/30">
        <Chapter
          id="brush"
          index="04"
          kicker="Brush back"
          title="Paint back anything the swap lost."
          body="If a swap eats part of a lip brush, a strand of hair or an earring, paint over it in the result viewer and press Bring back masked region. Those pixels return from your original, as many times as you like."
          points={["Adjustable brush, zoom and undo", "Works on either side of the compare view", "Free: no new render, no credits"]}
          flip
        >
          <div className="space-y-5">
            <Slider before={SHOWCASE.pen.before} after={SHOWCASE.pen.after} caption="Before the fix: the tip of the lip brush is gone in the swap." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Shot image={SHOWCASE.penUi} caption="Paint over the missing part." />
              <Shot image={SHOWCASE.penRestored} caption="Bring back masked region: the tip is back." />
            </div>
          </div>
        </Chapter>
      </div>

      <Chapter
        id="full-resolution"
        index="05"
        kicker="Full resolution"
        title="What goes in at 4K comes out at 4K."
        body="Results come back at the size you uploaded, up to 4080×4080, as PNG with no watermark, on the free allowance too. Close-ups keep their skin texture, freckles and fine hair."
        points={["Same size out as in", "No watermark at any tier", "Photo metadata, including GPS, is removed in your browser before upload"]}
      >
        <div className="grid grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)] items-start gap-4">
          <Shot image={SHOWCASE.resolution.reference} caption="Reference" />
          <Slider before={SHOWCASE.resolution.before} after={SHOWCASE.resolution.after} caption="Original and result, at source resolution." />
        </div>
      </Chapter>

      <div className="bg-muted/30">
        <Chapter
          id="virtual-faces"
          index="06"
          kicker="Virtual faces"
          title="No reference photo? Pick a virtual face."
          body="A built-in library of AI-generated identities, so you can try a swap, or make a stock-style image, without using anyone's real photo."
          points={["Twelve identities across ages and backgrounds", "Click one to fill the next empty face", "Nothing to upload"]}
          flip
        >
          <Shot image={SHOWCASE.library} caption="The virtual face library in the console." />
        </Chapter>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className={eyebrow}>How it works</p>
            <h2 className={h2}>From upload to download in about a minute.</h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACE_STUDIO_STEPS.map((s, i) => (
              <li key={s.name} className="rounded-2xl border border-border/70 bg-background p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 px-6 pb-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-neutral-950 text-white">
          <div className="grid gap-px bg-white/10 md:grid-cols-3">
            {[
              { name: "Free allowance", price: "$0", note: `Topped up to ${FREE_TOPUP_CREDITS} credits when you run low, ${FREE_TOPUP_FREQUENCY}: ${FREE_RENDERS_PER_TOPUP} face swaps at full resolution, no watermark. Accounts that have bought credits are topped up whenever they run low.` },
              { name: "Face swap", price: usd(FACE_SWAP_USD), note: `${FACE_SWAP_CREDITS} credits per face you replace. Faces you leave alone are free.` },
              { name: "Head swap", price: usd(HEAD_SWAP_USD), note: `${HEAD_SWAP_CREDITS} credits, one head per render.` },
            ].map((p) => (
              <div key={p.name} className="bg-neutral-950 p-7">
                <p className="text-sm text-white/60">{p.name}</p>
                <p className="mt-2 text-4xl font-bold tabular-nums">{p.price}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{p.note}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 p-7 sm:flex-row">
            <p className="text-sm text-white/70">Credit packs from $5. No subscription, credits never expire, a failed render costs nothing.</p>
            <Link href={CONSOLE_URL} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Measured */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className={eyebrow}>Measured, not estimated</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Speed and limits</h2>
            <p className="mt-2 text-sm text-muted-foreground">Render times are for a 4000-pixel source on a warm NVIDIA A40.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PERFORMANCE.map((p) => (
              <div key={p.label} className="rounded-2xl border border-border/70 p-5">
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{p.value}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ: every answer is in the DOM, so the FAQPage schema matches the page */}
      <section id="faq" className="scroll-mt-24 px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Questions</p>
          <h2 className={h2}>Frequently asked.</h2>
          <div className="mt-8 divide-y divide-border rounded-3xl border border-border/70">
            {FACE_STUDIO_FAQ.map((f) => (
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

      {/* Online vs desktop, and where to go next */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border/70 p-7">
            <h2 className="text-xl font-bold text-foreground">Online, or on your own GPU?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {FACE_STUDIO_FULL_NAME} runs on our GPUs and is paid per face in credits. Nano FaceStudio Pro 1.0 is the
              desktop edition: a one-time license that runs offline on your own NVIDIA GPU, with no metering. They are
              bought separately.{" "}
              <Link href="/apps/nano-facestudio-pro" className={textLink}>
                About the desktop edition
              </Link>
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 p-7">
            <h2 className="text-xl font-bold text-foreground">Keep going</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/image-edit" className={textLink}>Nano ImageEdit 2.0 Online</Link>
                <span className="text-muted-foreground"> to fix anything else in the photo by describing it</span>
              </li>
              <li>
                <Link href="/docs/face-swap-pipeline" className={textLink}>How the face-swap pipeline works</Link>
              </li>
              <li>
                <Link href="/compare" className={textLink}>Comparisons with other face swap tools</Link>
              </li>
              <li>
                <Link href="/face-swap" className={textLink}>All online face swap tools</Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-neutral-950 px-8 py-14 text-center text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[120px]" />
          </div>
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Try it on a group photo.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              That is where the difference shows: {FACESTUDIO_MAX_FACES} faces in one pass, each with its own reference,
              each keeping whatever was in front of it.
            </p>
            <Link href={CONSOLE_URL} className={`${primaryButton} mt-8 bg-white text-neutral-950 shadow-none hover:bg-neutral-100`}>
              Open {FACE_STUDIO_FULL_NAME} <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-5 text-xs text-white/40">Facts on this page verified {FACTS_VERIFIED}.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
