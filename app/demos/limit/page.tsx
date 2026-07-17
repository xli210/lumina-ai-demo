import type { Metadata } from "next";
import Link from "next/link";
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Cpu,
  ImageIcon,
  Info,
  Palette,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import {
  DEMO_DAILY_LIMIT,
  hoursUntilNextUtcMidnight,
} from "@/lib/demo-quota";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ kind?: string }>;
}

/**
 * /demos/limit
 *
 * Landing page a user is redirected to when they hit their per-kind daily
 * quota on the three online demos (see /api/demos/open). Intentionally
 * excluded from search indexes — the URL should only ever be reached
 * organically by the redirect. The page turns quota friction into an
 * upsell for Nano FaceStudio Pro (local, no daily limit).
 */
export const metadata: Metadata = {
  title: "Daily demo quota reached — NanoPocket",
  description:
    "You've used today's free online demo quota. Come back tomorrow, or install Nano FaceStudio Pro to run every model locally on your GPU with no daily limit.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/demos/limit" },
};

type Kind = "image" | "video";
function normalizeKind(raw: string | undefined): Kind {
  return raw === "video" ? "video" : "image";
}

interface KindCopy {
  chip: string;
  headline: string;
  sub: string;
  demos: string;
  Icon: typeof ImageIcon;
  accentChip: string;
  accentText: string;
}

const KIND_COPY: Record<Kind, KindCopy> = {
  image: {
    chip: "IMAGE DEMOS",
    headline: `You've used today's ${DEMO_DAILY_LIMIT} free image swaps`,
    sub: "The image quota is shared between Image FaceSwap Pro 2.0 and NanoFace Vivid. It resets at 00:00 UTC.",
    demos: "Image FaceSwap Pro 2.0 · NanoFace Vivid",
    Icon: ImageIcon,
    accentChip: "border-violet-400/30 bg-violet-500/15 text-violet-200",
    accentText: "text-violet-200",
  },
  video: {
    chip: "VIDEO DEMOS",
    headline: `You've used today's ${DEMO_DAILY_LIMIT} free video swaps`,
    sub: "Video FaceSwap Pro is the highest-cost demo we host — that's why the video quota is separate from the image one. It resets at 00:00 UTC.",
    demos: "Video FaceSwap Pro",
    Icon: Video,
    accentChip: "border-sky-400/30 bg-sky-500/15 text-sky-200",
    accentText: "text-sky-200",
  },
};

export default async function DemoLimitPage({ searchParams }: PageProps) {
  const { kind: kindParam } = await searchParams;
  const kind = normalizeKind(kindParam);
  const copy = KIND_COPY[kind];
  const Icon = copy.Icon;
  const hours = hoursUntilNextUtcMidnight();

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero + quota-reached explainer */}
      <section className="relative px-6 pt-28 pb-16 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(16,185,129,0.15),transparent_60%),radial-gradient(circle_at_20%_120%,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="mx-auto max-w-4xl">
          <div
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${copy.accentChip}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {copy.chip}
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {copy.headline}
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            {copy.sub} That means the counter for{" "}
            <span className={copy.accentText}>{copy.demos}</span> will roll
            back over in roughly {hours} hour{hours === 1 ? "" : "s"}. You can
            come back then, or take the local path below.
          </p>

          <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/50">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              <AlarmClock className="h-3.5 w-3.5" />
              Resets in ~{hours}h
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              10 image + 10 video / user / day
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/face-swap">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to the free demos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The upsell — local run, no quota */}
      <section className="border-y border-white/10 bg-gradient-to-b from-emerald-950/40 via-emerald-900/20 to-black px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/[0.06] p-8 ring-1 ring-emerald-400/20 sm:p-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-200">
              <Palette className="h-3.5 w-3.5" />
              No daily limit — runs on your GPU
            </div>

            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Want unlimited? Run every model locally with{" "}
              <span className="text-emerald-300">Nano FaceStudio Pro</span>.
            </h2>
            <p className="mb-6 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
              The daily quota only exists because the online demos share
              NanoPocket-hosted GPUs. Nano FaceStudio Pro is the same identity
              stack (InstantID + PuLID + IP-Adapter FaceID) plus six other
              tools — face swap, mask edit, expression editing, face vivid,
              2×/3×/4× upscale, light adjust, precision crop — bundled into
              one desktop app that runs 100% on your machine. No queue, no
              quota, no monthly bill.
            </p>

            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold sm:text-5xl">$49.90</span>
              <span className="text-lg text-white/50 line-through">$69.90</span>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-200">
                Launch promo · one-time
              </span>
            </div>

            <ul className="mb-8 grid grid-cols-1 gap-2 text-sm text-white/80 sm:grid-cols-2">
              {[
                "Multi-face swap up to 16 faces per image",
                "Face Vivid — de-plasticize AI-smoothed skin",
                "2×, 3×, 4× full-image upscale",
                "Expression, mask, light, crop tools in one app",
                "100% local — NVIDIA CUDA or Apple Silicon Metal",
                "One-time license covers Windows + macOS",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              >
                <Link href="/apps/nano-facestudio-pro">
                  See the full feature tour
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/download#nano-facestudio-pro">
                  Buy &amp; download for Windows
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why the quota exists — trust / honest disclosure */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight sm:text-lg">
            <Info className="h-5 w-5 text-white/50" />
            Why we cap the online demos
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70 sm:text-base">
            <li>
              The three online demos are free, no watermark, no per-image fee.
              To keep them that way for everyone, each signed-in user is
              limited to {DEMO_DAILY_LIMIT} image opens/day and{" "}
              {DEMO_DAILY_LIMIT} video opens/day.
            </li>
            <li>
              The counter is per-account, not per-IP, so switching networks
              won&apos;t reset it. It rolls over automatically at 00:00 UTC.
            </li>
            <li>
              If your workflow needs more than that — regulated content,
              batch jobs, agency work — the desktop app is the intended path
              and it runs entirely on your own hardware, with no per-open
              limit at all.
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
