import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { FaceSwapFeatureRows, FACESWAP_PRO_DEMO_URL } from "./feature-rows";

const DEMO_URL = FACESWAP_PRO_DEMO_URL;

export const metadata: Metadata = {
  title:
    "Nano FaceSwap Pro 2.0 — Feature Tour: Multi-Face, 4K, Mask Control, Expression Edit",
  description:
    "Eight-section feature tour for Nano FaceSwap Pro 2.0: multi-face targeting, input-resolution-preserving output up to 4K, face-versus-head modes, region-level mask control, a magic pen brush, a virtual identity library, an in-app benchmark gallery, and identity-preserving expression editing.",
  keywords: [
    "Nano FaceSwap Pro 2.0",
    "Nano FaceSwap Pro features",
    "multi-face swap",
    "4K face swap",
    "high resolution face swap",
    "face swap mask control",
    "head swap vs face swap",
    "magic pen face swap",
    "occlusion face swap",
    "virtual face library",
    "AI generated reference faces",
    "facial expression editing",
    "face swap benchmark",
    "best face swap app",
    "professional face swap",
    "diffusion face swap features",
  ],
  alternates: { canonical: "/apps/nano-faceswap-pro/features" },
  openGraph: {
    title: "Inside Nano FaceSwap Pro 2.0 — Feature Tour",
    description:
      "Nano FaceSwap Pro 2.0: multi-face precision, full-resolution output, mask-level control, virtual face library, and Pro-exclusive expression editing — the complete product tour.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inside Nano FaceSwap Pro 2.0 — Feature Tour",
    description:
      "Multi-face. 4K-preserving. Mask control. Virtual face library. Expression editing. The complete product tour.",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Nano FaceSwap Pro 2.0 — Eight-Section Feature Tour",
  description:
    "Walkthrough of the eight capabilities in Nano FaceSwap Pro 2.0: multi-face targeting, input-resolution-preserving output, face-versus-head modes, region-level mask control, the magic pen, a license-free virtual identity library, an in-app benchmark gallery, and identity-preserving expression editing.",
  author: { "@type": "Organization", name: "NanoPocket" },
  publisher: {
    "@type": "Organization",
    name: "NanoPocket",
    logo: {
      "@type": "ImageObject",
      url: "https://nanopocket.ai/og-image.jpg",
    },
  },
  mainEntityOfPage: "https://nanopocket.ai/apps/nano-faceswap-pro/features",
};

const featuresFaqs = [
  {
    q: "How many capabilities are covered in this tour?",
    a: "Eight: multi-face targeting, input-resolution-preserving output, face-versus-head modes, region-level mask control, the magic pen brush, a license-free virtual identity library, an in-app benchmark gallery, and identity-preserving expression editing. The last two ship with the Pro Local desktop release.",
  },
  {
    q: "What is the maximum output resolution?",
    a: "Output matches the input resolution up to 4K. Identity is rendered natively at the input size, with no 128×128 upsample step that the inswapper_128 GAN used by Roop, FaceFusion, Rope, and Reactor relies on.",
  },
  {
    q: "Can multiple faces be swapped at once?",
    a: "Yes. Every detected face is targetable individually with a numbered face picker, and the tool supports a single-click swap-all path for group portraits. The same fidelity is applied to a single face or to six.",
  },
  {
    q: "Does mask control work on accessories like glasses and jewelry?",
    a: "Yes. The mask panel exposes per-region toggles for hair, clothing, apparel, the lower lip, and accessories such as nose rings and earrings. Toggling a region tells the diffusion swap to preserve those pixels in the output.",
  },
  {
    q: "Do I have to upload my own photos to use the tool?",
    a: "No. The desktop app ships with an in-app virtual identity library — hundreds of synthetic, royalty-free reference faces curated for gender and ethnicity balance — so the workflow can be tested without uploading any external photo.",
  },
];

const featuresFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: featuresFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function NanoFaceSwapProFeaturesPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuresFaqJsonLd) }}
      />
      <Navbar />

      {/* Hero — pure black, white typography, single subtle radial */}
      <section className="relative overflow-hidden bg-black px-6 pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, hsl(225, 60%, 25%) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/apps/nano-faceswap-pro"
            className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11 7H3M6 3L3 7l3 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Nano FaceSwap Pro
          </Link>

          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            <span className="font-mono text-white/40">v2.0</span>
            <span className="h-3 w-px bg-white/15" />
            <span>Product Tour · Eight Core Capabilities</span>
          </span>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Nano FaceSwap Pro 2.0 — feature tour.
          </h1>

          <p className="mb-8 max-w-3xl text-balance text-base leading-relaxed text-white/60 sm:text-lg md:text-xl">
            Nano FaceSwap Pro 2.0 is an eight-capability diffusion face-swap
            pipeline that targets multiple faces in one frame, preserves input
            resolution up to 4K, and provides region-level mask control over
            hair, clothing, and accessories.
          </p>

          {/* 3 verifiable parameters — the "params chip strip" called out in the LLM-citation profile */}
          <div className="mb-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="font-mono text-base font-semibold text-white sm:text-lg">
                8 capabilities
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/40">
                Multi-face → expression edit
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="font-mono text-base font-semibold text-white sm:text-lg">
                Up to 4K
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/40">
                Output keeps input resolution
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="font-mono text-base font-semibold text-white sm:text-lg">
                InstantID + PuLID
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/40">
                Diffusion identity stack
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-6 py-2.5 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
            >
              Try free online
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M3 7h8M8 3l3 4-3 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed select-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-white/40"
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/70" />
              </span>
              Desktop app coming soon
            </span>
          </div>

          <p className="mt-3 text-[11px] text-white/40">
            Sign in on the landing page to grab the free access password.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
            <span>Free online demo</span>
            <span className="h-3 w-px bg-white/20" />
            <span>100% local processing</span>
            <span className="h-3 w-px bg-white/20" />
            <span>NVIDIA & Apple Silicon</span>
            <span className="h-3 w-px bg-white/20" />
            <span>Built by AI researchers</span>
          </div>
        </div>
      </section>

      {/* Eight feature rows — alternating, monochrome, with real product images */}
      <FaceSwapFeatureRows />

      {/* FAQ — five questions, also emitted as FAQPage JSON-LD above */}
      <section className="relative overflow-hidden bg-black px-6 py-20 sm:py-24">
        <div className="relative mx-auto max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mb-10 text-sm uppercase tracking-[0.18em] text-white/40">
            Five common questions about the feature tour
          </p>

          <div className="grid grid-cols-1 gap-4">
            {featuresFaqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors open:border-white/20"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-white">
                  <span>{f.q}</span>
                  <span className="mt-1 shrink-0 text-white/50 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA — same monochrome treatment as landing-page CTASection */}
      <section className="relative overflow-hidden bg-black px-6 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(225, 55%, 30%) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Get a head start on Nano FaceSwap Pro 2.0.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Try the online demos in your browser today. The full Nano FaceSwap
            Pro 2.0 desktop app — virtual face library, expression editor, and
            benchmark gallery — is coming soon.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
            >
              Try free online
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M3 7h8M8 3l3 4-3 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed select-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3 text-sm font-medium text-white/40"
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/70" />
              </span>
              Desktop app coming soon
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
