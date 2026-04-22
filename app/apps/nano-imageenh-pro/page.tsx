import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Sparkles,
  Apple,
  Monitor,
  Layers,
  Crop,
  Scissors,
  Zap,
  ShieldCheck,
  Cpu,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nano ImageEnh Pro 3.0 — AI Image Enhancement for Windows & Apple Silicon",
  description:
    "Nano ImageEnh Pro 3.0 — a brand-new Electron desktop app for AI image upscaling, denoising, and restoration. Native Apple Silicon (M2–M5) support, batch processing, crop, and AI background matting. 100% local, no cloud.",
  keywords: [
    "Nano ImageEnh Pro",
    "AI image enhancement",
    "AI upscaler Mac",
    "Apple Silicon image AI",
    "M2 M3 M4 image upscaler",
    "batch image enhancement",
    "AI background matting",
    "local AI image upscaling",
    "Electron AI app",
    "Topaz Photo AI alternative",
  ],
  alternates: { canonical: "/apps/nano-imageenh-pro" },
  openGraph: {
    title: "Nano ImageEnh Pro 3.0 — Grand Release",
    description:
      "Brand-new Electron desktop app. Native Apple Silicon support. Batch processing, crop, and AI background matting — all running 100% locally on your GPU.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-imageenh-pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano ImageEnh Pro 3.0 — Grand Release",
    description:
      "Smooth Electron app with native macOS (M2–M5), batch processing, crop, and AI background matting.",
  },
};

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano ImageEnh Pro",
  operatingSystem: "Windows 10/11, macOS (Apple Silicon M2/M3/M4/M5)",
  applicationCategory: "MultimediaApplication",
  softwareVersion: "3.0.0",
  offers: { "@type": "Offer", price: "29.90", priceCurrency: "USD" },
  description:
    "AI image enhancement Pro version — Electron desktop app with batch processing, crop, AI background matting, and native Apple Silicon support.",
};

const features = [
  {
    icon: Zap,
    title: "Smooth Electron desktop app",
    description:
      "Rebuilt from the ground up as a native-feeling Electron app. Instant startup, fluid animations, drag-and-drop everywhere — no more clunky console windows.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Apple,
    title: "Native Apple Silicon (M2–M5)",
    description:
      "First-class macOS support optimized for Apple Silicon — M2, M3, M4, and M5. Runs entirely on your Mac's GPU/Neural Engine, no Rosetta required.",
    gradient: "from-slate-400 to-slate-600",
  },
  {
    icon: Layers,
    title: "Batch processing",
    description:
      "Drop in a single image or an entire folder. Nano ImageEnh Pro processes them sequentially with smart memory management — perfect for large photo libraries.",
    gradient: "from-primary to-blue-400",
  },
  {
    icon: Crop,
    title: "Precision crop tool",
    description:
      "Crop with pixel-perfect control before enhancement. Save time and VRAM by enhancing only the region you care about.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: Scissors,
    title: "AI background matting",
    description:
      "One-click subject extraction with clean, hair-accurate edges. Export transparent PNGs for design, e-commerce, or further compositing.",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    icon: Cpu,
    title: "Faster, smarter inference",
    description:
      "Memory-efficient pipeline with smart tiling. Enhance massive images on consumer hardware without out-of-memory crashes.",
    gradient: "from-violet-400 to-purple-500",
  },
];

const platforms = [
  {
    icon: Monitor,
    label: "Windows 10/11",
    detail: "NVIDIA GPU recommended (8 GB+ VRAM)",
    file: "NanoImageEnh-3.0.0-windows.zip",
    size: "89.2 MB",
  },
  {
    icon: Apple,
    label: "macOS (Apple Silicon)",
    detail: "M2, M3, M4, or M5 — 16 GB+ unified memory",
    file: "NanoImageEnh-3.0.0-macos.zip",
    size: "113.8 MB",
  },
];

const proHighlights = [
  "Run entirely on your own GPU — no cloud, no telemetry, no uploads",
  "One-time license — no subscriptions, ever",
  "7-day free trial included",
  "All 3.x updates included with your purchase",
];

export default function NanoImageEnhProPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/download#nnanoimageenh"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Downloads
          </Link>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-500">
            <Sparkles className="h-3.5 w-3.5" />
            Grand Release · Version 3.0.0
          </div>

          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Nano ImageEnh{" "}
            <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            A complete reimagining of our flagship image enhancement app — smooth Electron desktop UI, native Apple Silicon power, batch processing, crop, and AI background matting. All running 100% on your machine.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/download#nnanoimageenh">
              <Button
                size="lg"
                className="group gap-2 rounded-full bg-gradient-to-r from-primary to-blue-400 px-8 text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download Pro 3.0
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/release-notes/nano-imageenh">
              <Button variant="outline" size="lg" className="gap-2 rounded-full px-8">
                Full release notes
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {proHighlights.map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              What&apos;s new in 3.0
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              The biggest update to Nano ImageEnh ever — built for the way professional creators actually work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                >
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Now on Mac.
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
              For the first time, Nano ImageEnh runs natively on Apple Silicon — alongside our trusted Windows build.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {p.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.detail}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                    <code className="font-mono">{p.file}</code>
                    <span className="ml-2 opacity-70">· {p.size}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/download#nnanoimageenh">
              <Button
                size="lg"
                className="group gap-2 rounded-full bg-gradient-to-r from-primary to-blue-400 px-8 text-white border-0 shadow-lg shadow-primary/25 hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Get Pro 3.0
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy/local promise */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-card/60 to-card/20 p-8 backdrop-blur-sm sm:p-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    100% local
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your photos never leave your machine.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    GPU-accelerated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    NVIDIA CUDA on Windows · Metal on Apple Silicon.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    Made by AI experts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Built by a team of Generative AI and image quality PhDs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
