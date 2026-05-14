import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { FaceSwapFeatureRows } from "./feature-rows";

export const metadata: Metadata = {
  title:
    "Inside Nano FaceSwap Pro — Multi-Face Swap, 4K Detail, Mask Control & Expression Edit",
  description:
    "A complete tour of Nano FaceSwap Pro: multi-face precision, full-resolution output (4K stays 4K), face-vs-head swap modes, pixel-level mask control, a built-in license-free virtual face library, head-to-head benchmarks against leading apps, and Pro-exclusive facial expression editing.",
  keywords: [
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
    title: "Inside Nano FaceSwap Pro — Feature Tour",
    description:
      "Multi-face precision, full-resolution output, mask-level control, virtual face library, and Pro-exclusive expression editing — the complete product tour.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inside Nano FaceSwap Pro — Feature Tour",
    description:
      "Multi-face. 4K-preserving. Mask control. Virtual face library. Expression editing. The complete product tour.",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Inside Nano FaceSwap Pro — A Complete Product Tour",
  description:
    "A walkthrough of the seven core capabilities that make Nano FaceSwap Pro the most professional local face-swap app on the market: multi-face precision, full-resolution output, face-vs-head modes, mask-level control, a license-free virtual face library, head-to-head benchmarks, and Pro-exclusive expression editing.",
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

export default function NanoFaceSwapProFeaturesPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
            Product Tour · Seven Core Capabilities
          </span>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Inside Nano FaceSwap Pro.
          </h1>

          <p className="mb-10 max-w-3xl text-balance text-base leading-relaxed text-white/60 sm:text-lg md:text-xl">
            A complete, professional face-swap workflow — engineered for
            creators who need pixel-perfect control, full-resolution output,
            and a license-free path to production.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/#announcement"
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
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              Download desktop app
            </Link>
          </div>

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

      {/* Seven feature rows — alternating, monochrome, with real product images */}
      <FaceSwapFeatureRows />

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
            Ready for production-grade face swap?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Try the online demos in your browser, or download the desktop Pro
            app for the complete workflow — including the virtual face library
            and expression editor.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#announcement"
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
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              Download desktop Pro
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
