import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { facestudioProPrice, type FacestudioProPrice } from "@/lib/facestudio-pro-price";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";

/**
 * Nano FaceStudio Pro (1.2: batch face swap and the Apple Silicon Mac build) — product introduction.
 * The 1.2 launch page is a static file, public/facestudio-pro-1-2/, served at /apps/nano-facestudio-pro-1-2.
 *
 * Bespoke Apple-style page (not the generic ProductLandingShell) so the actual
 * feature screenshots from the internal spec doc drive every section.
 * Emits three JSON-LD payloads at the top for GEO / rich-result eligibility:
 *   - Product + SoftwareApplication (commerce)
 *   - TechArticle (documentation-tone overlay for LLM citation)
 *   - FAQPage
 */

/** Re-rendered every 10 minutes, so the Black Friday price appears and leaves soon after the sale starts and ends. */
export const revalidate = 600;
const CANONICAL = "https://nanopocket.ai/apps/nano-facestudio-pro";
const LAUNCH_1_2 = "/apps/nano-facestudio-pro-1-2";

export const metadata: Metadata = {
  // Leads with "local face swap": people search for it, and this is our current desktop face swap.
  title: { absolute: "Local Face Swap App for Windows and Mac | Nano FaceStudio Pro" },
  description:
    "Local face swap on your own NVIDIA GPU or Apple Silicon Mac, with a one-time license and no uploads. Nano FaceStudio Pro is a local desktop AI face studio that bundles seven capabilities — multi-face swap with per-region protection, brush-level mask edit, identity-preserving expression editing, face-vivid restoration, 2×/3×/4× upscale, auto light adjust, and precision crop. Version 1.2 adds batch face swap and a native Mac version.",
  keywords: [
    "Nano FaceStudio Pro",
    "Nano FaceStudio Pro 1.2",
    "batch face swap",
    "face swap app for Mac",
    "local face swap",
    "offline face swap",
    "local AI face studio",
    "AI face swap desktop app",
    "facial expression editor",
    "face vivid restoration",
    "de-plasticize AI face",
    "local image upscaler",
    "brush face inpainting",
    "Windows AI face editor",
    "Apple Silicon face editor",
    "FaceFusion alternative",
    "Topaz Photo AI alternative",
    "DeepSwap alternative",
  ],
  alternates: {
    canonical: "/apps/nano-facestudio-pro",
    languages: hreflangAlternates("https://nanopocket.ai", "/apps/nano-facestudio-pro", TRANSLATED_PAGES["/apps/nano-facestudio-pro"]),
  },
  openGraph: {
    title: "Nano FaceStudio Pro 1.2 — Local AI Face Studio",
    description:
      "Seven tools in one local desktop app: face swap, mask edit, expression editor, face vivid, upscale, light adjust, crop. 1.2 adds batch face swap. Windows + Apple Silicon Mac.",
    type: "website",
    url: CANONICAL,
    images: [{ url: "https://nanopocket.ai/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano FaceStudio Pro 1.2 — Local AI Face Studio",
    description:
      "One desktop app: face swap + batch face swap + mask edit + expression editor + face vivid + upscale + light adjust + crop. Windows and Mac.",
  },
};

const productJsonLd = (pr: FacestudioProPrice) => ({
  "@context": "https://schema.org",
  "@type": ["Product", "SoftwareApplication"],
  "@id": `${CANONICAL}#product`,
  name: "Nano FaceStudio Pro",
  brand: { "@type": "Brand", name: "NanoPocket" },
  sku: "NPK-NFS-100",
  mpn: "NPK-NFS-100",
  image: "https://nanopocket.ai/og-image.jpg",
  url: CANONICAL,
  category: "Local AI Face & Portrait Studio",
  description:
    "Nano FaceStudio Pro is a unified local desktop AI face studio bundling seven capabilities — auto multi-face swap with per-region preservation, brush-level mask edit, identity-preserving expression editing, face vivid restoration, 2×/3×/4× upscale, auto light adjust, and precision crop. Version 1.2 adds batch face swap and a native Apple Silicon Mac build.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Windows 10/11 (NVIDIA CUDA); macOS 14+ on Apple Silicon",
  softwareVersion: "1.2.0",
  datePublished: "2026-07-31",
  dateModified: "2026-11-23",
  additionalProperty: [
    ...(pr.sale
      ? [
          { "@type": "PropertyValue", name: "Black Friday price", value: `USD ${pr.price} until ${pr.validUntil}` },
          { "@type": "PropertyValue", name: "Regular price", value: `USD ${pr.regular}` },
        ]
      : []),
    { "@type": "PropertyValue", name: "Batch face swap", value: "One reference face across a whole set of photos (since 1.2)" },
    { "@type": "PropertyValue", name: "Bundled capabilities", value: "7 tools: face swap, mask edit, expression edit, face vivid, upscale, light adjust, crop" },
    { "@type": "PropertyValue", name: "Face swap engine", value: "GAN and diffusion models" },
    { "@type": "PropertyValue", name: "Multi-face swap", value: "Up to 16 detected faces per image; per-face targeting or one-click swap-all" },
    { "@type": "PropertyValue", name: "Upscale factors", value: "2×, 3×, 4× (input-preserving; native resolution output)" },
    { "@type": "PropertyValue", name: "Windows GPU support", value: "NVIDIA CUDA, 8 GB VRAM minimum, 40 GB free disk" },
    { "@type": "PropertyValue", name: "Apple Silicon support", value: "Native arm64 build (Metal, no Rosetta) for M1 or newer, M4 or newer recommended; macOS 14 Sonoma or newer; 16 GB memory minimum, 24 GB or more recommended; 40 GB free during setup, about 25 GB after" },
    { "@type": "PropertyValue", name: "Data handling", value: "100% local; images never uploaded, no server-side retention" },
    { "@type": "PropertyValue", name: "Network", value: "Setup download (about 25 GB); license checked online every 7 days; works up to 14 days offline" },
    { "@type": "PropertyValue", name: "License model", value: "One-time, machine-bound; covers Windows + macOS" },
  ],
  offers: {
    "@type": "Offer",
    price: pr.price,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    ...(pr.validUntil ? { priceValidUntil: pr.validUntil } : {}),
    url: CANONICAL,
    seller: { "@type": "Organization", name: "NanoPocket" },
    priceSpecification: {
      "@type": "PriceSpecification",
      price: pr.price,
      priceCurrency: "USD",
      valueAddedTaxIncluded: false,
    },
    eligibleQuantity: { "@type": "QuantitativeValue", value: 1 },
  },
  // During the Black Friday sale, additionalProperty states the regular price and the last day of
  // the sale price, so the discount is discoverable in structured data.
});

const faqs = (pr: FacestudioProPrice): { q: string; a: string }[] => [
  {
    q: "How is Nano FaceStudio Pro different from Nano FaceStudio Online?",
    a: "Nano FaceStudio Online is the browser edition: it swaps faces and whole heads, billed per face in prepaid credits with a free allowance, on NanoPocket-hosted GPUs. Nano FaceStudio Pro is the local desktop edition, a one-time license that runs 100% on your own GPU with no per-image fee, and it is the broader studio: multi-face swap with per-region protection, mask edit, expression editing, face vivid restoration, full-image upscale, auto light adjust, and precision crop in one unified desktop UI. Both use the same diffusion identity stack.",
  },
  {
    q: "What are the seven bundled tools?",
    a: "Face Swap (auto multi-face detection with per-region preservation), Mask Edit (brush-level restoration), Facial Expression Edit (slider control plus learn-from-reference), Face Vivid (de-plasticize AI-smoothed skin), Full Image Upscale (2×, 3×, 4×), Light Adjust (auto brightness / contrast / saturation), and Crop (aspect-ratio presets).",
  },
  pr.sale
    ? {
        q: "How much does it cost?",
        a: `The Black Friday price is USD $${pr.price}, one time, until ${pr.endsLabel}. The regular price is USD $${pr.regular}. The license is machine-bound — no subscription, no per-image fee. A license bought at the sale price is yours to keep.`,
      }
    : {
        q: "How much does it cost?",
        a: `USD $${pr.regular}, one time. The license is machine-bound — no subscription, no per-image fee.`,
      },
  {
    q: "Do my photos get uploaded to your server?",
    a: "No. Every model — swap, mask, expression, vivid, upscale, light, crop — runs on your own computer. Source photos are never uploaded and never retained server-side. The app needs the internet for setup (a one-time download of about 25 GB) and checks the license online every 7 days; it keeps working for up to 14 days offline. Your images are never part of that traffic.",
  },
  {
    q: "What hardware do I need?",
    a: "Windows: Windows 10 or 11 with an NVIDIA GPU (8 GB VRAM minimum; RTX 30 / 40 / 50 series tested) and 40 GB of free disk. Mac: Apple Silicon, M1 or newer (M4 or newer recommended), macOS 14 Sonoma or newer, 16 GB of memory minimum (24 GB or more recommended), and 40 GB free during setup, about 25 GB after. The Mac build is a native arm64 app that runs on Metal — no Rosetta translation. Intel Macs are not supported.",
  },
  {
    q: "Can I try it before I buy?",
    a: "Yes. The free browser demos at /face-swap cover the two most common capabilities — Nano FaceStudio Online (the same swap engine bundled here) and NanoFace Vivid (the same restoration model). The full seven-tool studio is the desktop app; the online demos are single-purpose previews.",
  },
  {
    q: "What is new in version 1.2?",
    a: "Version 1.2 adds batch face swap — add a whole set of photos, pick one reference face, and the app swaps them one after another — and a native Mac version for Apple Silicon. Both the Windows and Mac builds are on /download, and the one-time license covers both platforms. Measured on a Mac, a face swap takes about 10 seconds per photo on an M5 with 24 GB, and 20–23 seconds on an M4 with 16 GB (2816 × 1536 photos). Already on 1.x? Install over it.",
  },
  {
    q: "Can I use the output for commercial or client work?",
    a: "Yes. The license is one-time and machine-bound, with no per-image fees. Swapped photos, expression-edited portraits, upscaled deliverables, and Vivid-restored images can be used in commercial work under the standard Terms of Use. Non-consensual likeness use is explicitly prohibited.",
  },
];

const faqJsonLd = (pr: FacestudioProPrice) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs(pr).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Nano FaceStudio Pro 1.2 — feature reference",
  description:
    "Reference documentation for the seven capabilities bundled in Nano FaceStudio Pro desktop, with per-feature screenshots, scope, and limitations. Version 1.2 adds batch face swap and a native Apple Silicon Mac build.",
  url: CANONICAL,
  mainEntityOfPage: CANONICAL,
  inLanguage: "en",
  isAccessibleForFree: true,
  image: "https://nanopocket.ai/og-image.jpg",
  datePublished: "2026-07-31",
  dateModified: "2026-11-23",
  author: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
  publisher: {
    "@type": "Organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
    logo: { "@type": "ImageObject", url: "https://nanopocket.ai/og-image.jpg" },
  },
  about: { "@id": `${CANONICAL}#product` },
  citation: [
    { "@type": "CreativeWork", name: "InstantID (arXiv:2401.07519)", url: "https://arxiv.org/abs/2401.07519" },
    { "@type": "CreativeWork", name: "PuLID (arXiv:2404.16022)", url: "https://arxiv.org/abs/2404.16022" },
    { "@type": "CreativeWork", name: "IP-Adapter (arXiv:2308.06721)", url: "https://arxiv.org/abs/2308.06721" },
    { "@type": "CreativeWork", name: "Real-ESRGAN (arXiv:2107.10833)", url: "https://arxiv.org/abs/2107.10833" },
    { "@type": "CreativeWork", name: "DiffBIR (arXiv:2308.15070)", url: "https://arxiv.org/abs/2308.15070" },
  ],
};

const IMG = "/images/nano-facestudio";

const capabilities = [
  { n: "01", title: "Face Swap" },
  { n: "02", title: "Mask Edit" },
  { n: "03", title: "Expression Edit" },
  { n: "04", title: "Image Upscale" },
  { n: "05", title: "Face Vivid" },
  { n: "06", title: "Light Adjust" },
  { n: "07", title: "Crop" },
];

function EyebrowChapter({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em]">
      <span className="font-mono opacity-50">{n}</span>
      <span className="h-3 w-px bg-current opacity-30" />
      <span className="opacity-70">{label}</span>
    </div>
  );
}

function BigHeadline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`mx-auto max-w-4xl text-balance text-center text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${className}`}
    >
      {children}
    </h2>
  );
}

function Sub({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mx-auto mt-6 max-w-2xl text-balance text-center text-lg leading-relaxed sm:text-xl ${className}`}
    >
      {children}
    </p>
  );
}

function Shot({
  src,
  alt,
  caption,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`w-full ${className}`}>
      <div className="overflow-hidden rounded-3xl bg-neutral-100 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.04] dark:bg-neutral-900 dark:ring-white/[0.05]">
        <Image
          src={src}
          alt={alt}
          width={2400}
          height={1500}
          priority={priority}
          className="h-auto w-full"
          sizes="(min-width: 1280px) 1200px, (min-width: 768px) 90vw, 100vw"
        />
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-neutral-500">{caption}</figcaption>
      )}
    </figure>
  );
}

export default function NanoFaceStudioProPage() {
  const pr = facestudioProPrice();
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(pr)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(pr)) }}
      />
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────
          HERO
          Editorial, dark, minimal. No gradient text. Massive H1. */}
      <section className="relative overflow-hidden bg-black px-6 pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 50% 15%, rgba(120, 120, 255, 0.18) 0%, transparent 55%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <Link
            href={LAUNCH_1_2}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-200 transition-colors hover:border-emerald-300/60"
          >
            <span className="font-mono text-emerald-300/80">v1.2</span>
            <span className="h-3 w-px bg-emerald-400/30" />
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/70 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            <span>New: batch face swap · now on Mac and Windows</span>
          </Link>

          <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Nano FaceStudio Pro.
            <br />
            <span className="text-white/50">The whole face, in one studio.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-balance text-lg leading-relaxed text-white/70 sm:text-xl md:text-2xl">
            Local face swap and face editing on your own GPU, on Windows or Mac.
            Seven capabilities. One desktop app.
            Face swap, mask edit, expression editing, face vivid, upscale, light
            adjust, and crop — designed to finish a portrait without ever
            leaving the machine.
          </p>

          {/* Pricing block. During the Black Friday sale the regular price
              sits struck through beside the sale price, with the real last
              day; otherwise just the price. */}
          <div className="mx-auto mt-10 inline-flex flex-col items-center gap-1">
            {pr.sale && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                Black Friday price until {pr.endsLabel}
              </div>
            )}
            <div className="mt-3 flex items-end justify-center gap-3">
              {pr.sale && (
                <span className="text-2xl font-medium text-white/40 line-through decoration-white/40 sm:text-3xl">
                  ${pr.regular}
                </span>
              )}
              <span className="text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl">
                ${pr.price}
              </span>
              <span className="pb-1 text-xs uppercase tracking-[0.18em] text-white/50 sm:text-sm">
                one-time · Windows + macOS
              </span>
            </div>
            {pr.sale && (
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">
                Regular ${pr.regular} ·{" "}
                <Link href="/black-friday" className="underline decoration-emerald-300/40 underline-offset-4 hover:decoration-emerald-300">
                  See all Black Friday offers
                </Link>
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/download#nano-facestudio-pro"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
            >
              Buy &amp; download for Windows or Mac
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/face-swap"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              Try free online demos first
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CAPABILITIES STRIP
          Small typography, 7 chapter titles, editorial index. */}
      <section className="relative border-y border-white/10 bg-black px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">
            Seven capabilities · one desktop
          </p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 text-center sm:grid-cols-4 md:grid-cols-7">
            {capabilities.map((c) => (
              <li key={c.n} className="flex flex-col items-center gap-1">
                <span className="font-mono text-xs text-white/40">{c.n}</span>
                <span className="text-sm font-medium text-white/90 sm:text-base">{c.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          NEW IN 1.2  (batch face swap + Mac). Details on the launch page. */}
      <section className="relative bg-black px-6 pt-20 sm:pt-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-300/80">New in version 1.2</p>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Batch face swap.</h2>
              <p className="mt-3 text-base leading-relaxed text-white/60">
                Add a whole set of photos, pick one reference face, and press
                Start. The app swaps them one after another while you keep
                editing. In group photos you choose who gets the new face.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Now on Mac.</h2>
              <p className="mt-3 text-base leading-relaxed text-white/60">
                A native Apple Silicon app on Metal, signed and notarized by
                Apple. M1 or newer (M4 or newer recommended), macOS 14 Sonoma
                or newer. Face Swap takes about 10 s per photo on an M5 with
                24 GB, 20–23 s on an M4 with 16 GB (2816 × 1536 photos).
              </p>
            </div>
          </div>
          <Link
            href={LAUNCH_1_2}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            See what&apos;s new in 1.2
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          01 · FACE SWAP  (dark, four sub-shots) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="01" label="Face Swap" />
          <BigHeadline>Detect. Swap. Preserve.</BigHeadline>
          <Sub className="text-white/60">
            Every face in the frame becomes its own target. Auto-detected,
            auto-swapped, and — with per-region toggles — every accessory left
            exactly where it was.
          </Sub>

          <div className="mt-16 grid grid-cols-1 gap-16 md:gap-20">
            <div>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Auto face detection.
                </h3>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  01 · a
                </span>
              </div>
              <Shot
                src={`${IMG}/face-swap-detection.png`}
                alt="Nano FaceStudio Pro — automatic face detection in a multi-person photo"
                caption="Every detected face gets its own selectable slot. Pick one, pick all."
                priority
              />
            </div>

            <div>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Auto face swap.
                </h3>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  01 · b
                </span>
              </div>
              <Shot
                src={`${IMG}/face-swap-auto.png`}
                alt="Nano FaceStudio Pro — one-click auto face swap output"
                caption="Same diffusion identity stack as Nano FaceStudio Online. Full input resolution — no 128-pixel bottleneck."
              />
            </div>

            <div>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Protect the ring, the hat, the earring.
                </h3>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  01 · c
                </span>
              </div>
              <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
                Per-region toggles for hair, apparel, and accessories tell the
                diffusion swap which pixels to leave alone. Turn off{" "}
                <span className="text-white/90">Apparel</span>, and the ring
                survives.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Shot
                  src={`${IMG}/face-swap-protect-before.png`}
                  alt="Nano FaceStudio Pro — face swap without region protection loses accessories"
                  caption="Default swap — the ring is regenerated."
                />
                <Shot
                  src={`${IMG}/face-swap-protect-after.png`}
                  alt="Nano FaceStudio Pro — Apparel toggle disabled, ring preserved"
                  caption={`Apparel toggled off — the ring is preserved pixel-for-pixel.`}
                />
              </div>
            </div>

            <div>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Multi-face. Same fidelity.
                </h3>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  01 · d
                </span>
              </div>
              <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
                Up to 16 detected faces per image, each individually targetable
                — or the whole group with one click.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Shot src={`${IMG}/face-swap-multi-1.png`} alt="Multi-face swap example 1" />
                <Shot src={`${IMG}/face-swap-multi-2.png`} alt="Multi-face swap example 2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02 · MASK EDIT  (light section) */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="02" label="Mask Edit" />
          <BigHeadline>Bring anything back with a brush.</BigHeadline>
          <Sub className="text-neutral-600">
            The swap looks good but the healthy tooth is gone, the freckle is
            missing, the earring frame is redrawn. Paint over it. The pixels
            come back from the source, the rest of the swap stays intact.
          </Sub>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Shot
              src={`${IMG}/mask-edit-1.png`}
              alt="Mask Edit — starting from the swap result"
              caption="1. Start from the swap result."
              className="[&_.rounded-3xl]:bg-neutral-100"
            />
            <Shot
              src={`${IMG}/mask-edit-2.png`}
              alt="Mask Edit — brushing the region to restore"
              caption="2. Brush the region to restore."
              className="[&_.rounded-3xl]:bg-neutral-100"
            />
            <Shot
              src={`${IMG}/mask-edit-3.png`}
              alt="Mask Edit — restored result"
              caption="3. Restored — healthy tooth returned, swap untouched elsewhere."
              className="[&_.rounded-3xl]:bg-neutral-100"
            />
          </div>

          <p className="mx-auto mt-14 max-w-2xl text-center text-sm leading-relaxed text-neutral-500">
            Non-destructive. Undo the brush and the swap is unchanged. Works
            after Face Vivid too, if you need to preserve a specific feature
            through a restoration pass.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03 · EXPRESSION EDIT  (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="03" label="Facial Expression Edit" />
          <BigHeadline>Sliders — or a reference face.</BigHeadline>
          <Sub className="text-white/60">
            Dial head orientation, eyes, and mouth with explicit sliders. Or
            drop in a reference face and transfer its expression — a smile, a
            wink, closed eyes — onto the current subject without touching
            identity.
          </Sub>

          <div className="mt-16 grid grid-cols-1 gap-16">
            <div>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Slider control.
                </h3>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  03 · a
                </span>
              </div>
              <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
                Head yaw, pitch, roll. Eye openness. Mouth shape. Identity
                preserved across every move.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Shot src={`${IMG}/expression-sliders-1.png`} alt="Expression sliders — starting state" caption="Neutral start." />
                <Shot src={`${IMG}/expression-sliders-2.png`} alt="Expression sliders — eyes closed" caption="Eyes closed with a single slider." />
              </div>
            </div>

            <div>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Learn from a reference.
                </h3>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                  03 · b
                </span>
              </div>
              <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
                Drop in a smiling reference face. The smile transfers. The
                identity stays put.
              </p>
              <Shot
                src={`${IMG}/expression-reference.png`}
                alt="Expression edit — learning a smile from a reference face"
                caption="Reference face on the left, transferred expression on the right."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          04 · FULL IMAGE UPSCALE  (light) */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="04" label="Full Image Upscale" />
          <BigHeadline>2×, 3×, 4× — the whole frame.</BigHeadline>
          <Sub className="text-neutral-600">
            Not just faces. The full image, sharpened and re-detailed at your
            chosen factor. Print-ready. 4K-ready. Local.
          </Sub>

          <div className="mx-auto mt-16 max-w-5xl">
            <Shot
              src={`${IMG}/upscale.png`}
              alt="Nano FaceStudio Pro — full image upscale with 2×/3×/4× factor selector"
              caption="GAN-based upscaler on NVIDIA CUDA or Apple Silicon Metal."
              className="[&_.rounded-3xl]:bg-neutral-100"
            />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-4 text-center">
            {["2×", "3×", "4×"].map((f) => (
              <div key={f} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-6">
                <div className="text-4xl font-semibold tracking-tight sm:text-5xl">{f}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  input-preserving
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          05 · FACE VIVID  (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="05" label="Face Vivid" />
          <BigHeadline>De-plasticize the AI face.</BigHeadline>
          <Sub className="text-white/60">
            Gemini 2.5 Flash Image, Adobe Firefly, and every GAN swap leave a
            wax-skin look. Face Vivid is an identity-locked restoration pass
            tuned to bring pores, specular highlights, and micro-texture back —
            without ever shifting the person.
          </Sub>

          <div className="mx-auto mt-16 max-w-5xl">
            <Shot
              src={`${IMG}/face-vivid.png`}
              alt="Nano FaceStudio Pro — Face Vivid before/after showing de-plasticized skin"
              caption="Left: over-smoothed AI output. Right: Face Vivid restored. Same identity."
            />
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-white/50">
            Same pipeline as the free browser demo at{" "}
            <Link href="/apps/nanoface-vivid" className="text-white/80 underline decoration-white/30 hover:decoration-white">
              /apps/nanoface-vivid
            </Link>{" "}
            — running locally on your own GPU.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          06 · LIGHT ADJUST  (light) */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="06" label="Light Adjust" />
          <BigHeadline>Brightness. Contrast. Saturation. Auto.</BigHeadline>
          <Sub className="text-neutral-600">
            One click fixes exposure, punches up contrast, and balances
            saturation — before or after any AI step. Non-destructive, and out
            of the way when you don&apos;t need it.
          </Sub>

          <div className="mx-auto mt-16 max-w-5xl">
            <Shot
              src={`${IMG}/light-adjust.png`}
              alt="Nano FaceStudio Pro — automatic light adjust panel"
              caption="Auto brightness / contrast / saturation. Manual override any time."
              className="[&_.rounded-3xl]:bg-neutral-100"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          07 · CROP  (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="07" label="Crop" />
          <BigHeadline>Any size. No Photoshop round-trip.</BigHeadline>
          <Sub className="text-white/60">
            Precision crop with aspect-ratio presets for print, social, and
            posters. The last mile of a deliverable, inside the same studio.
          </Sub>

          <div className="mx-auto mt-16 max-w-5xl">
            <Shot
              src={`${IMG}/crop.png`}
              alt="Nano FaceStudio Pro — precision crop with aspect-ratio presets"
              caption="Precision crop grid with print, social, and poster presets."
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TECH SPECS  (light, Apple-style bullets) */}
      <section className="relative bg-neutral-50 px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
            Tech Specs
          </p>
          <BigHeadline className="text-neutral-950">
            What&apos;s inside the box.
          </BigHeadline>

          <dl className="mt-16 grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
            {[
              ["Face swap engine", "GAN and diffusion models"],
              ["Multi-face", "Up to 16 detected faces per image; per-face or one-click swap-all"],
              ["Upscale factors", "2×, 3×, 4× (input-preserving; native resolution output)"],
              ["Face vivid", "Identity-locked restoration; removes over-smoothed / plastic-skin artefacts"],
              ["Batch face swap", "One reference face across a whole set of photos · new in 1.2"],
              ["Windows", "Windows 10/11 · NVIDIA CUDA · 8 GB VRAM minimum · RTX 30/40/50 series tested · 40 GB free disk"],
              ["Mac chip", "Apple Silicon Metal · native arm64 · M1 or newer, M4 or newer recommended · no Rosetta · Intel Macs not supported"],
              ["Mac system", "macOS 14 Sonoma or newer · 16 GB memory minimum, 24 GB or more recommended · 40 GB free during setup, about 25 GB after"],
              ["Data handling", "100% local · no upload · no server-side retention · no training on user photos"],
              ["Network", "Setup download (about 25 GB) · license checked online every 7 days · works up to 14 days offline · images never uploaded"],
              ["License", `${pr.sale ? `USD $${pr.price} Black Friday price until ${pr.endsLabel} (regular USD $${pr.regular})` : `USD $${pr.regular}`} · one-time · machine-bound · covers Windows + macOS`],
              ["UI runtime", "Electron desktop shell"],
            ].map(([term, def]) => (
              <div key={term as string} className="border-t border-neutral-200 pt-6">
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                  {term}
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-neutral-900">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FAQ  (dark, Apple-style clean disclosure) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">
            Answers
          </p>
          <BigHeadline>Frequently asked.</BigHeadline>

          <div className="mt-16 space-y-3">
            {faqs(pr).map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 transition-colors open:border-white/25 open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-6 text-base font-medium text-white sm:text-lg">
                  <span>{f.q}</span>
                  <span className="mt-1 shrink-0 font-mono text-lg text-white/40 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CLOSING CTA */}
      <section className="relative overflow-hidden bg-black px-6 py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(120, 120, 255, 0.18) 0%, transparent 55%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <BigHeadline>Nano FaceStudio Pro.</BigHeadline>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-white/70 sm:text-xl">
            One desktop app. Seven tools. Every model on your GPU.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/download#nano-facestudio-pro"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
            >
              Buy &amp; download for Windows or Mac
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/face-swap"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-8 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              Try free online demos
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-white/40">
            {pr.sale ? (
              <>
                <span className="text-white/40 line-through">${pr.regular}</span>{" "}
                → <span className="text-white/80">${pr.price}</span> Black Friday price, until {pr.endsLabel}
              </>
            ) : (
              <span className="text-white/80">${pr.regular}</span>
            )}{" "}
            · one-time license · Windows and macOS
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
