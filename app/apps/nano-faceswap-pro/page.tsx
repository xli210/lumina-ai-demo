import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Video,
  ShieldCheck,
  Cpu,
  Zap,
  Layers,
  Eye,
  Lock,
  Gauge,
  CheckCircle2,
  Users,
  Atom,
  FlaskConical,
  Award,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "Nano FaceSwap Pro — Free Online Diffusion Face Swap, Runs 100% Local",
  description:
    "Try Nano FaceSwap Pro free — the best diffusion-based local face swap for photos and videos. Built on InstantID, PuLID, IP-Adapter FaceID and InsightFace research. A private, GPU-accelerated alternative to Roop, FaceFusion, Rope, Deep-Live-Cam, Reactor, DeepSwap, Akool, and HeyGen — no cloud uploads, no subscription.",
  keywords: [
    // Core product terms
    "Nano FaceSwap Pro",
    "NanoPocket face swap",
    "free face swap",
    "free online face swap",
    "best face swap AI",
    "face swap free trial",
    "face swap demo",

    // Local / privacy angle
    "local face swap",
    "offline face swap",
    "private face swap",
    "face swap no cloud",
    "face swap desktop app",
    "GPU face swap",

    // Diffusion tech angle
    "diffusion face swap",
    "diffusion model face swap",
    "stable diffusion face swap",
    "InstantID face swap",
    "PuLID face swap",
    "IP-Adapter FaceID",
    "PhotoMaker face swap",
    "ACE face swap",
    "InsightFace swapper",
    "inswapper alternative",

    // Competitor / alternative terms
    "Roop alternative",
    "Roop Unleashed alternative",
    "FaceFusion alternative",
    "Rope alternative",
    "Rope Live alternative",
    "Reactor face swap alternative",
    "Deep-Live-Cam alternative",
    "deepfacelive alternative",
    "DeepSwap alternative",
    "DeepFaceLab alternative",
    "SimSwap alternative",
    "Akool alternative",
    "HeyGen face swap alternative",
    "Reface alternative",
    "DeepBrain alternative",

    // Video / image face swap
    "video face swap AI",
    "image face swap AI",
    "face swap video free",
    "AI face swap photo",
    "temporal consistent face swap",
  ],
  alternates: { canonical: "/apps/nano-faceswap-pro" },
  openGraph: {
    title: "Nano FaceSwap Pro — Free Online Diffusion Face Swap",
    description:
      "Best-in-class diffusion face swap for images and videos. 100% local. Free trial — no sign-up fees, no cloud uploads. A private alternative to Roop, FaceFusion, Rope, Reactor, and DeepSwap.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano FaceSwap Pro — Free Online Diffusion Face Swap",
    description:
      "Diffusion-based face swap that runs 100% on your GPU. Free online trial. Alternative to Roop, FaceFusion, Rope, Deep-Live-Cam, DeepSwap, and Akool.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano FaceSwap Pro",
  operatingSystem: "Web (online demo) · Windows 10/11 · macOS (Apple Silicon)",
  applicationCategory: "MultimediaApplication",
  description:
    "Diffusion-based AI face swap for images and videos. 100% local, GPU-accelerated, private. A free-trial alternative to Roop, FaceFusion, Rope, Deep-Live-Cam, Reactor, DeepSwap, Akool, and HeyGen.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Nano FaceSwap Pro really free to try?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The online Image FaceSwap Pro and Video FaceSwap Pro demos are free for every signed-in NanoPocket account — no credit card, no watermarks on test outputs. The Pro desktop app also includes a free trial.",
      },
    },
    {
      "@type": "Question",
      name: "What makes Nano FaceSwap Pro a 'diffusion' face swap?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most open-source tools (Roop, FaceFusion, Rope, Reactor, Deep-Live-Cam) are built on the InsightFace inswapper_128 model — a GAN with fixed 128×128 identity output. Nano FaceSwap Pro uses a diffusion-based identity pipeline inspired by InstantID, PuLID, IP-Adapter FaceID, and PhotoMaker research, combined with our own identity encoder. The result is higher resolution, better lighting adaptation, and far more natural skin texture.",
      },
    },
    {
      "@type": "Question",
      name: "Does Nano FaceSwap Pro run locally?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The desktop app runs 100% on your own GPU — NVIDIA CUDA on Windows and Apple Silicon (M2–M5) Metal on macOS. Your photos and videos never leave your machine. The free online demo is hosted by us for quick testing.",
      },
    },
    {
      "@type": "Question",
      name: "How is Nano FaceSwap Pro different from Roop, FaceFusion, or Rope?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Roop, Roop-Unleashed, FaceFusion, Rope, Rope-Live, and Deep-Live-Cam all share the same underlying inswapper_128 GAN, which caps output quality at 128×128 before upscaling. Nano FaceSwap Pro uses a native high-resolution diffusion pipeline, giving sharper skin detail, better lighting match, and stronger identity preservation — with a polished desktop UI instead of a Gradio script.",
      },
    },
    {
      "@type": "Question",
      name: "Is this a DeepSwap, Akool, or HeyGen alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DeepSwap, Akool, HeyGen, DeepBrain, and Reface are cloud-based — they upload your video to their servers and charge per minute. Nano FaceSwap Pro runs entirely on your own hardware, with a one-time license, no per-minute fees, and no uploads.",
      },
    },
    {
      "@type": "Question",
      name: "Does it handle video face swap with temporal consistency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Video FaceSwap Pro uses a temporally-aware pipeline with optical-flow-guided identity propagation, similar in spirit to DeepFaceLab and Rope-Live but built on a diffusion backbone. Faces stay stable frame-to-frame, even with strong head motion.",
      },
    },
    {
      "@type": "Question",
      name: "What hardware do I need?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any modern NVIDIA GPU with 8 GB+ VRAM on Windows, or Apple Silicon (M2 and newer) with 16 GB+ unified memory on macOS. For the online demo, any modern browser works — the compute runs on our server.",
      },
    },
    {
      "@type": "Question",
      name: "Is diffusion-based face swap legal and ethical?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nano FaceSwap Pro is a creative tool for consented use — portrait photography, film VFX, concept art, and personal projects. Non-consensual use of anyone's likeness is prohibited by our Terms of Use. Because it runs locally, you retain full control of every output.",
      },
    },
  ],
};

const features = [
  {
    icon: Atom,
    title: "Diffusion-based identity pipeline",
    description:
      "Not another inswapper_128 GAN. Our pipeline draws on InstantID, PuLID, IP-Adapter FaceID, and PhotoMaker research — delivering native high-resolution output, stronger identity lock-in, and natural skin texture.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Lock,
    title: "100% local, 100% private",
    description:
      "The desktop app runs entirely on your GPU. No cloud uploads, no telemetry, no per-minute fees. Unlike DeepSwap, Akool, HeyGen, or Reface, your photos and videos never leave your machine.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Video,
    title: "Temporally-consistent video",
    description:
      "Video FaceSwap Pro uses optical-flow-guided identity propagation for frame-to-frame stability — smoother motion than Roop-Unleashed, FaceFusion, or Rope, even on long clips and fast head motion.",
    gradient: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: Gauge,
    title: "Fast on consumer hardware",
    description:
      "Tuned for 8 GB NVIDIA GPUs and Apple Silicon (M2–M5). Batch a folder of images, swap a full-length video, or run the online demo in your browser — no data-center required.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Eye,
    title: "Better lighting & color match",
    description:
      "Most GAN-based swappers paste a face on; diffusion re-synthesizes it in context. Lighting, shadow direction, white balance, and film grain are preserved far better than Roop, Reactor, or SimSwap.",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    icon: Layers,
    title: "Image + video in one app",
    description:
      "Most tools pick a lane — Roop for video, FaceFusion for both, InstantID for single images. Nano FaceSwap Pro unifies image and video swap in a single polished desktop app, with a shared identity model.",
    gradient: "from-primary to-blue-400",
  },
];

const competitors = [
  {
    name: "Roop / Roop-Unleashed",
    stack: "InsightFace inswapper_128 GAN · Gradio UI",
    ours: "Diffusion pipeline · native HD · desktop app",
  },
  {
    name: "FaceFusion",
    stack: "inswapper_128 + face-enhancer upscale",
    ours: "Single-pass HD diffusion, no artifact-prone upscale chain",
  },
  {
    name: "Rope / Rope-Live",
    stack: "inswapper_128, real-time webcam swap",
    ours: "Higher fidelity video swap with temporal consistency",
  },
  {
    name: "Reactor (ComfyUI)",
    stack: "inswapper_128 as a ComfyUI node",
    ours: "Polished standalone app, no workflow wiring required",
  },
  {
    name: "Deep-Live-Cam / deepfacelive",
    stack: "Real-time GAN-based webcam swap",
    ours: "Higher-quality offline image + video, identity-stable",
  },
  {
    name: "SimSwap / DeepFaceLab",
    stack: "GAN, training-heavy workflow",
    ours: "No training — one reference photo is enough",
  },
  {
    name: "DeepSwap / Akool / Reface",
    stack: "Cloud SaaS, per-minute pricing, upload required",
    ours: "Local GPU, one-time license, no uploads",
  },
  {
    name: "HeyGen / DeepBrain",
    stack: "Cloud avatar & face-swap, subscription",
    ours: "Private, offline, no subscription",
  },
];

const researchCredits = [
  {
    name: "InstantID",
    note: "Zero-shot diffusion identity conditioning",
  },
  { name: "PuLID", note: "Pure and lightning identity embedding" },
  { name: "IP-Adapter FaceID", note: "Identity adapter for diffusion models" },
  { name: "PhotoMaker", note: "Stacked ID embeddings for portraits" },
  { name: "InsightFace ArcFace", note: "Face identity encoding" },
  { name: "ControlNet / T2I-Adapter", note: "Structure-preserving conditioning" },
];

const trustHighlights = [
  "Built by GenAI & image-quality PhDs with 10+ years of research",
  "Free online demo — no credit card required",
  "One-time desktop license — no subscriptions",
  "7-day desktop free trial on Windows and macOS",
  "100% local execution — your face data never leaves your machine",
];

export default function NanoFaceSwapProPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[320px] w-[320px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/#announcement"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to demos
          </Link>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            <Sparkles className="h-3.5 w-3.5" />
            Free online demo · Diffusion face swap
          </div>

          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Nano FaceSwap{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>

          <p className="mb-4 max-w-3xl text-balance text-lg text-muted-foreground sm:text-xl">
            The best diffusion-based face swap for photos and videos — running 100% locally on your GPU. Try it free online, no sign-up fees.
          </p>

          <p className="mb-8 max-w-3xl text-sm text-muted-foreground/80 sm:text-base">
            A private, offline alternative to{" "}
            <span className="font-medium text-foreground/80">Roop</span>,{" "}
            <span className="font-medium text-foreground/80">FaceFusion</span>,{" "}
            <span className="font-medium text-foreground/80">Rope</span>,{" "}
            <span className="font-medium text-foreground/80">Reactor</span>,{" "}
            <span className="font-medium text-foreground/80">Deep-Live-Cam</span>,{" "}
            <span className="font-medium text-foreground/80">DeepSwap</span>,{" "}
            <span className="font-medium text-foreground/80">Akool</span>, and{" "}
            <span className="font-medium text-foreground/80">HeyGen</span> — built on the latest diffusion research (InstantID, PuLID, IP-Adapter FaceID, PhotoMaker, InsightFace).
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/#announcement">
              <Button
                size="lg"
                className="group gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-8 text-white border-0 shadow-lg shadow-indigo-500/25 hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Try Free Online
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/apps/nano-faceswap-pro/features">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                See all features
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/download">
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                Download desktop app
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {trustHighlights.map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Why a diffusion face swap is different
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Most popular open-source face swap tools — Roop, FaceFusion, Rope, Reactor, Deep-Live-Cam — share the same underlying GAN (InsightFace <code className="font-mono text-[13px]">inswapper_128</code>). Nano FaceSwap Pro is built on a modern diffusion stack.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg"
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

      {/* Comparison / "best players" section */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              How it compares to the best face-swap tools in the world
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              We have deep respect for the open-source and commercial tools that built this field. Here&apos;s an honest, technical view of how Nano FaceSwap Pro differs.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-border/50 bg-muted/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-4">Tool</div>
              <div className="col-span-4">Their stack</div>
              <div className="col-span-4">Our difference</div>
            </div>
            {competitors.map((c, i) => (
              <div
                key={c.name}
                className={`grid grid-cols-12 gap-4 px-5 py-4 text-sm ${
                  i !== competitors.length - 1
                    ? "border-b border-border/30"
                    : ""
                }`}
              >
                <div className="col-span-12 font-semibold text-foreground sm:col-span-4">
                  {c.name}
                </div>
                <div className="col-span-12 text-muted-foreground sm:col-span-4">
                  {c.stack}
                </div>
                <div className="col-span-12 text-foreground/90 sm:col-span-4">
                  {c.ours}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground/70">
            All trademarks belong to their respective owners. We reference these tools purely for technical comparison.
          </p>
        </div>
      </section>

      {/* Research credits */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Built on modern diffusion research
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              We stand on the shoulders of the open research community. Nano FaceSwap Pro integrates ideas from these landmark papers and models:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {researchCredits.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-indigo-500" />
                  <p className="text-sm font-semibold text-foreground">
                    {r.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / privacy */}
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
                    Desktop app runs on your own GPU. Your face data never touches a server.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    GPU-accelerated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    NVIDIA CUDA on Windows · Metal on Apple Silicon (M2–M5).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    Built by researchers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Made by Generative AI and image-quality PhDs with 10+ years of industry research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[100px]" />
            </div>
            <div className="relative">
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                Try Nano FaceSwap Pro — free
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-sm text-slate-300 sm:text-base">
                Two online demos, one for images and one for videos. Sign in with a free NanoPocket account and swap a face in under a minute.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/#announcement">
                  <Button
                    size="lg"
                    className="group gap-2 rounded-full bg-white text-slate-900 hover:bg-white/90 shadow-lg"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Try Image FaceSwap Pro
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/#announcement">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group gap-2 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Video className="h-4 w-4" />
                    Try Video FaceSwap Pro
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                <Users className="mb-[2px] mr-1 inline h-3 w-3" />
                Free for every signed-in account · no credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              Technical details on our diffusion face-swap pipeline and how it stacks up against the best tools in the world.
            </p>
          </div>

          <div className="space-y-3">
            {faqJsonLd.mainEntity.map((item) => (
              <details
                key={item.name}
                className="group rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm transition-all hover:border-indigo-500/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                  {item.name}
                  <Zap className="h-4 w-4 shrink-0 text-indigo-500 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.acceptedAnswer.text}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
