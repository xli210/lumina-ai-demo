import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  AudioLines,
  Brush,
  Clapperboard,
  Cpu,
  Download,
  Film,
  Gauge,
  HardDrive,
  Image as ImageIcon,
  ImagePlus,
  Images,
  KeyRound,
  Languages,
  ListVideo,
  MemoryStick,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Users,
  Volume2,
  WifiOff,
} from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { PRODUCTS } from "@/lib/products";
import {
  BLACK_FRIDAY_ENDS_LABEL,
  FACESTUDIO_V_PRO_REGULAR_PRICE_CENTS,
  facestudioVProLaunchPriceOn,
  formatUsdCents,
} from "@/lib/black-friday";
import { VProLaunchCountdown } from "./launch-countdown";

/**
 * Nano FaceStudio V Pro 1.0.1: product introduction (English only for now).
 *
 * Every product fact on this page comes from the app repo's docs/WEBSITE_FACTS_1.0.1.md, and only
 * from lines marked [tested], [code] or [docs]. Rules from that file, kept here on purpose:
 * - no promise of automatic updates (the update feed is not live yet);
 * - no number of faces per video ("replace a person");
 * - Windows x64 only, Windows 11 tested, Windows 10 not yet tested; no Mac;
 * - no head swap;
 * - no pictures of real faces: there are no publishable examples, so the page uses text, icons and
 *   CSS diagrams only;
 * - speed only as measured on one RTX 4080 SUPER 16 GB.
 *
 * Price: read from PRODUCTS at render time. $84.90 is a launch price that rises to $119.90 after the
 * Black Friday sale ends. It was never sold at $119.90, so it is never struck through or called a
 * discount. The page re-renders every 10 minutes so the price changes on time.
 */

export const revalidate = 600;

const PRODUCT_ID = "nano-facestudio-v-pro";
const PATH = "/apps/nano-facestudio-v-pro";
const CANONICAL = `https://nanopocket.ai${PATH}`;
const CHECKOUT_HREF = `/checkout?product=${PRODUCT_ID}`;
const DOWNLOAD_HREF = `/download#${PRODUCT_ID}`;
const ONLINE_HREF = "/facestudio-v";
const BLACK_FRIDAY_HREF = "/black-friday";
const SOFTWARE_VERSION = "1.0.1";

export const metadata: Metadata = {
  title: { absolute: "Video Face Swap App for Windows | Nano FaceStudio V Pro" },
  description:
    "Replace a person's face in a video on your own NVIDIA RTX GPU. Fast or Best quality, 1080p or 4K MP4, optional lip sync. One-time license for one Windows PC.",
  keywords: [
    "Nano FaceStudio V Pro",
    "video face swap app",
    "local video face swap",
    "video face swap Windows",
    "4K video face swap",
    "desktop video face swap",
    "video face swap NVIDIA GPU",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: "Nano FaceStudio V Pro: video face swap for Windows",
    description:
      "Pick the person, add a photo of the new face, choose Fast or Best, export a 1080p or 4K MP4. Runs on your own NVIDIA RTX GPU.",
    type: "website",
    url: CANONICAL,
    images: [{ url: "https://nanopocket.ai/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano FaceStudio V Pro: video face swap for Windows",
    description:
      "Replace a person in a video on your own NVIDIA RTX GPU. 1080p or 4K MP4. One-time license.",
  },
};

/** The price as it stands at this render. */
function pricing() {
  const product = PRODUCTS.find((p) => p.id === PRODUCT_ID);
  const launch = facestudioVProLaunchPriceOn();
  const currentCents = product?.priceInCents ?? FACESTUDIO_V_PRO_REGULAR_PRICE_CENTS;
  const regularCents = product?.originalPriceInCents ?? currentCents;
  return {
    launch,
    current: formatUsdCents(currentCents),
    currentNumber: (currentCents / 100).toFixed(2),
    regular: formatUsdCents(regularCents),
    validUntil: launch ? product?.promoValidUntil : undefined,
  };
}

type Pricing = ReturnType<typeof pricing>;

/** "Launch price $84.90 until Dec 24, 11:59 pm PT. $119.90 after." or just "$119.90". */
function priceSentence(p: Pricing): string {
  return p.launch
    ? `Launch price ${p.current} until ${BLACK_FRIDAY_ENDS_LABEL}. ${p.regular} after.`
    : p.current;
}

const softwareJsonLd = (p: Pricing) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${CANONICAL}#software`,
  name: "Nano FaceStudio V Pro",
  url: CANONICAL,
  image: "https://nanopocket.ai/og-image.jpg",
  description:
    "Windows desktop app for video face swap: pick the person to replace, add a photo of the new face, choose Fast or Best quality, and export a 1080p or 4K MP4. Runs on the user's own NVIDIA RTX GPU.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Windows 11 (64-bit)",
  processorRequirements: "NVIDIA RTX 20 series or newer GPU, 8 GB video memory minimum",
  memoryRequirements: "16 GB RAM minimum, 32 GB recommended",
  storageRequirements: "About 38 GB free during setup, about 25 GB after",
  fileSize: "189 MB installer; about 14.6 GB downloaded at first start",
  softwareVersion: SOFTWARE_VERSION,
  publisher: { "@type": "Organization", name: "NanoPocket AI LLC", url: "https://nanopocket.ai" },
  offers: {
    "@type": "Offer",
    price: p.currentNumber,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    ...(p.launch && p.validUntil ? { priceValidUntil: p.validUntil } : {}),
    url: CANONICAL,
    seller: { "@type": "Organization", name: "NanoPocket AI LLC" },
    eligibleQuantity: { "@type": "QuantitativeValue", value: 1 },
  },
});

const faqs = (p: Pricing): { q: string; a: string }[] => [
  {
    q: "What does Nano FaceStudio V Pro do?",
    a: "It replaces a person's face in a video. You click the person to replace and add a photo of the face you want; everything else stays as filmed. You choose Fast or Best quality and export an MP4 at 1080p or 4K. It also enhances videos without swapping, lip-syncs to an audio file (optional download), and swaps faces in photos.",
  },
  {
    q: "How much does it cost?",
    a: p.launch
      ? `${priceSentence(p)} It is a one-time payment for a license on one PC: no subscription and no credits. There is no free trial.`
      : `${p.current}, one time, for a license on one PC: no subscription and no credits. There is no free trial.`,
  },
  {
    q: "Can I try it before I buy?",
    a: "There is no trial of the desktop app. You can try video face swap in your browser first with Nano FaceStudio-V Online at /facestudio-v.",
  },
  {
    q: "What PC do I need?",
    a: "Windows 64-bit with an NVIDIA RTX 20 series or newer GPU. 8 GB of video memory is the minimum and 16 GB is recommended (12 GB is advised for Best quality at 4K). 16 GB of system memory is the minimum and 32 GB is recommended. Setup needs about 38 GB free disk space while it runs and about 25 GB afterwards.",
  },
  {
    q: "Does it run on a Mac, an AMD or Intel GPU, or Windows 10?",
    a: "There is no Mac version, and AMD, Intel and older NVIDIA GPUs are not supported. The app is Windows x64 only. It has been tested on Windows 11; Windows 10 64-bit has not been tested yet.",
  },
  {
    q: "How long does a video take?",
    a: "On an NVIDIA RTX 4080 SUPER with 16 GB of video memory and 32 GB of RAM, Fast at 4K takes about 9 minutes per minute of video, and Best at 4K about 100 minutes per minute of video. Slower cards take longer; we have not measured other GPUs yet.",
  },
  {
    q: "What is the difference between Fast and Best?",
    a: "Both output 1080p or 4K. Best is much slower and also restores and upscales the whole picture, not only the face.",
  },
  {
    q: "How many PCs can I use it on?",
    a: "One. The license is bound to one PC. You can move it to another PC from inside the app: deactivating frees the seat, and when you activate on a new PC the app offers to move the license from the old one.",
  },
  {
    q: "Does it need an internet connection?",
    a: "Yes, for setup: about 14.6 GB of runtime and models is downloaded at first start (lip sync is 2.8 GB more, only if you want it). After that the app checks the license online every 7 days and keeps working for 7 days offline; after that it asks you to activate again.",
  },
  {
    q: "Does it update itself?",
    a: "Not yet. When a new version is released, download the new installer from the download page.",
  },
  {
    q: "Can it swap a whole head?",
    a: "No. This version swaps faces, not heads.",
  },
  {
    q: "Is the sound kept?",
    a: "Yes. The original sound is kept in the exported MP4. If the original has no sound, the app says so.",
  },
  {
    q: "Are the results marked as AI-made?",
    a: "Yes. Every video and PNG it makes carries metadata saying it is AI-made, and you can add a visible label as well. Only use faces you have the right to use.",
  },
];

const faqJsonLd = (p: Pricing) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs(p).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const pipeline: { n: string; icon: LucideIcon; title: string; body: string }[] = [
  { n: "1", icon: Scissors, title: "Trim", body: "Pick the part of the video to process, frame-exact." },
  { n: "2", icon: MousePointerClick, title: "Pick the person", body: "Click the person to replace." },
  { n: "3", icon: ImagePlus, title: "Add a face photo", body: "One photo, or up to five of the same face." },
  { n: "4", icon: Gauge, title: "Fast or Best", body: "Fast for speed, Best for whole-picture restoration." },
  { n: "5", icon: Film, title: "1080p or 4K MP4", body: "H.264 MP4 with the original sound." },
];

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Clapperboard,
    title: "Face swap in video",
    body: "Click the person to replace and add a photo of the face you want. Everything else stays as filmed.",
  },
  {
    icon: Sparkles,
    title: "Enhance only",
    body: "Make a video sharper and cleaner without swapping any face.",
  },
  {
    icon: AudioLines,
    title: "Lip sync (optional)",
    body: "Add an audio file and the mouth follows it. A separate 2.8 GB download, offered inside the app.",
  },
  {
    icon: Images,
    title: "Several source photos",
    body: "Up to five photos of the same face, which match closer than one.",
  },
  {
    icon: Users,
    title: "Group photos as the source",
    body: "If your face photo has several faces in it, you pick which one is used.",
  },
  {
    icon: ImageIcon,
    title: "Photos as well as videos",
    body: "A separate Photo page swaps faces in still images; the result is a PNG.",
  },
  {
    icon: ListVideo,
    title: "Several videos in a row",
    body: "A batch page with a queue of up to 50 jobs.",
  },
  {
    icon: Brush,
    title: "Fix a spot, or retouch",
    body: "Paint over a spot of the result. Fix a spot brings the original back there; Retouch fills it in from around it.",
  },
  {
    icon: SlidersHorizontal,
    title: "Adjust the look",
    body: "Swap strength, soft edge, skin and lip colour match, and an option to keep the person's own mouth.",
  },
  {
    icon: Volume2,
    title: "Sound kept",
    body: "The original sound stays in the export. The page tells you when the original has no sound.",
  },
  {
    icon: Tag,
    title: "AI label",
    body: "Every video and PNG carries metadata saying it is AI-made. A visible label is optional.",
  },
  {
    icon: Languages,
    title: "Eight languages",
    body: "English, Chinese (Simplified), German, Spanish, French, Japanese, Korean and Portuguese (Brazil).",
  },
];

/** A 4-second 720p clip on an RTX 4080 SUPER 16 GB, whole job. */
const shortClipTimes: [string, string][] = [
  ["Fast 1080p", "about 20 to 23 s"],
  ["Fast 4K", "about 26 s"],
  ["Best 1080p", "about 3 min"],
  ["Best 4K", "about 6 min"],
];

const requirements: { icon: LucideIcon; term: string; min: string; rec: string }[] = [
  { icon: Monitor, term: "Operating system", min: "Windows 64-bit (tested on Windows 11; Windows 10 not yet tested)", rec: "Windows 11 64-bit" },
  { icon: Cpu, term: "GPU", min: "NVIDIA RTX 20 series or newer", rec: "NVIDIA RTX 20 series or newer" },
  { icon: Gauge, term: "Video memory", min: "8 GB (a 6 GB card runs Fast 1080p only)", rec: "16 GB (12 GB advised for Best at 4K)" },
  { icon: MemoryStick, term: "System memory", min: "16 GB (Best takes about twice as long)", rec: "32 GB" },
  { icon: HardDrive, term: "Free disk space", min: "About 38 GB during setup, about 25 GB after", rec: "Installed on the drive that holds your user profile" },
  { icon: Download, term: "Download", min: "189 MB installer, then about 14.6 GB at first start", rec: "Lip sync is 2.8 GB more, only if you want it" },
];

const specs: [string, string][] = [
  ["Version", SOFTWARE_VERSION],
  ["Platform", "Windows x64 only. No Mac version. AMD, Intel and older NVIDIA GPUs are not supported."],
  ["Quality modes", "Fast and Best, each at 1080p or 4K"],
  ["Output", "MP4 (H.264), at most 4K (3840 on the long side) and 60 fps; photos as PNG"],
  ["Uploads", "Videos up to 100 GB; no hard limit on length (long videos take long)"],
  ["Batch", "Queue of up to 50 jobs"],
  ["Installer", "189 MB, digitally signed by NanoPocket AI LLC"],
  ["First setup", "About 18 minutes on a fast connection in our test; the engine was ready about 5 minutes after first launch"],
  ["Updates", "Not automatic yet; new versions are a new installer from the download page"],
  ["Not included", "Head swap (a different product)"],
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
    <p className={`mx-auto mt-6 max-w-2xl text-balance text-center text-lg leading-relaxed sm:text-xl ${className}`}>
      {children}
    </p>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
      <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Ctas({ p }: { p: Pricing }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={CHECKOUT_HREF}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
        >
          Buy for {p.current}
          <Arrow />
        </Link>
        <Link
          href={DOWNLOAD_HREF}
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
        >
          Download for Windows
          <Arrow />
        </Link>
      </div>
      <p className="text-sm text-white/55">
        Want to see video face swap first?{" "}
        <Link href={ONLINE_HREF} className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
          Try Nano FaceStudio-V Online in your browser
        </Link>
      </p>
    </div>
  );
}

export default function NanoFaceStudioVProPage() {
  const p = pricing();
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd(p)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(p)) }} />
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────
          HERO */}
      <section className="relative overflow-hidden bg-black px-6 pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at 50% 15%, rgba(120, 120, 255, 0.18) 0%, transparent 55%)" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-200">
            <span className="font-mono text-emerald-300/80">v{SOFTWARE_VERSION}</span>
            <span className="h-3 w-px bg-emerald-400/30" />
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/70 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            <span>Available now · Windows · NVIDIA RTX</span>
          </p>

          <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Nano FaceStudio V Pro.
            <br />
            <span className="text-white/50">Video face swap on your own GPU.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-balance text-lg leading-relaxed text-white/70 sm:text-xl md:text-2xl">
            Replace a person in a video with the face from a photo. Everything else stays as filmed.
            Choose Fast or Best, and export a 1080p or 4K MP4, on a Windows PC with an NVIDIA RTX card.
          </p>

          {/* Price. During the launch: the launch price, the end time, and the price after, with
              nothing struck through ($119.90 was never charged before). After: just the price. */}
          <div className="mx-auto mt-10 inline-flex flex-col items-center gap-1">
            {p.launch && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                Launch price
                <VProLaunchCountdown prefix="· " />
              </div>
            )}
            <div className="mt-3 flex items-end justify-center gap-3">
              <span className="text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl">{p.current}</span>
              <span className="pb-1 text-xs uppercase tracking-[0.18em] text-white/50 sm:text-sm">one-time · one PC</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              {p.launch ? priceSentence(p) : "One-time license."} No subscription, no credits, no trial.
            </p>
          </div>

          <div className="mt-10">
            <Ctas p={p} />
          </div>
          {p.launch && (
            <p className="mt-6 text-xs text-white/40">
              <Link href={BLACK_FRIDAY_HREF} className="underline decoration-white/20 underline-offset-4 hover:text-white/70 hover:decoration-white/60">
                See all Black Friday offers
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          01 · HOW IT WORKS: the pipeline as a CSS diagram (no example pictures). */}
      <section className="relative border-t border-white/10 bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="01" label="How it works" />
          <BigHeadline>Five steps, one video.</BigHeadline>
          <Sub className="text-white/60">
            Trim the clip, click the person, add the face, pick a quality mode, export. The app does the
            rest on your graphics card.
          </Sub>

          <ol className="mt-16 grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-0">
            {pipeline.map((step, i) => {
              const Icon = step.icon;
              const last = i === pipeline.length - 1;
              return (
                <li key={step.n} className="relative flex md:flex-col md:items-stretch">
                  <div
                    className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-5 md:mx-2 md:w-auto md:flex-col md:items-center md:gap-3 md:px-4 md:py-7 md:text-center ${
                      last ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        last ? "bg-emerald-400/15 text-emerald-200" : "bg-white/[0.06] text-white/85"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Step {step.n}</span>
                      <h3 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/55">{step.body}</p>
                    </div>
                  </div>
                  {!last && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 items-center justify-center text-white/35 md:flex"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M8 3l3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-white/45">
            Only use faces you have the right to use. Every output carries metadata saying it is
            AI-made, and you can add a visible label too.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02 · WHAT IT DOES (light) */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="02" label="What it does" />
          <BigHeadline>More than the swap.</BigHeadline>
          <Sub className="text-neutral-600">
            Enhance, lip-sync, fix a spot, run a batch, or work on photos, all in the same desktop app.
          </Sub>

          <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03 · FAST OR BEST, and measured speed (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="03" label="Fast or Best" />
          <BigHeadline>Two modes. Measured, not guessed.</BigHeadline>
          <Sub className="text-white/60">
            Both export 1080p or 4K. Best is much slower, because it also restores and upscales the
            whole picture.
          </Sub>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Fast</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">~9 min</p>
              <p className="mt-1 text-sm text-white/55">per minute of video, at 4K</p>
              <p className="mt-6 text-sm leading-relaxed text-white/60">
                The face swap at 1080p or 4K. In our test, a 5-minute video took 46 minutes at 4K.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Best</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">~100 min</p>
              <p className="mt-1 text-sm text-white/55">per minute of video, at 4K</p>
              <p className="mt-6 text-sm leading-relaxed text-white/60">
                Adds whole-picture restoration and upscaling. In our test, a 60-second video took 104
                minutes at 4K.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <p className="text-sm font-medium text-white/85">A 4-second 720p clip, whole job</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {shortClipTimes.map(([mode, time]) => (
                <div key={mode} className="border-t border-white/10 pt-4">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/45">{mode}</dt>
                  <dd className="mt-1.5 text-base text-white">{time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-white/50">
            All times measured on one NVIDIA RTX 4080 SUPER with 16 GB of video memory and 32 GB of RAM.
            Slower cards take longer; we have not measured other GPUs yet. With 16 GB of RAM, Best takes
            about twice as long.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          04 · REQUIREMENTS (light) */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <EyebrowChapter n="04" label="Requirements" />
          <BigHeadline>Check your PC first.</BigHeadline>
          <Sub className="text-neutral-600">
            Windows x64 with an NVIDIA RTX card. There is no Mac version, and AMD, Intel and older NVIDIA
            GPUs are not supported.
          </Sub>

          <div className="mt-16 overflow-hidden rounded-3xl border border-neutral-200">
            <div className="hidden grid-cols-[1.1fr_1.4fr_1.4fr] gap-6 bg-neutral-100 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 md:grid">
              <span />
              <span>Minimum</span>
              <span>Recommended</span>
            </div>
            <ul>
              {requirements.map((r) => {
                const Icon = r.icon;
                return (
                  <li
                    key={r.term}
                    className="grid grid-cols-1 gap-2 border-t border-neutral-200 px-6 py-5 first:border-t-0 md:grid-cols-[1.1fr_1.4fr_1.4fr] md:gap-6 md:first:border-t"
                  >
                    <span className="flex items-center gap-3 font-medium text-neutral-900">
                      <Icon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                      {r.term}
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-700">
                      <span className="mr-2 text-xs uppercase tracking-[0.14em] text-neutral-400 md:hidden">Minimum</span>
                      {r.min}
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-700">
                      <span className="mr-2 text-xs uppercase tracking-[0.14em] text-neutral-400 md:hidden">Recommended</span>
                      {r.rec}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-neutral-500">
            The app does not start on a card with less than 5.5 GB of video memory.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          05 · LICENSE (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="05" label="License" />
          <BigHeadline>Pay once. One PC.</BigHeadline>
          <Sub className="text-white/60">
            {p.launch ? priceSentence(p) : `${p.current}, one time.`} No subscription, no credits, no
            trial. After purchase, your license key is on the download page.
          </Sub>

          <ul className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                [KeyRound, "One PC", "The license is bound to one PC, by its hardware and your Windows account."],
                [ArrowRightLeft, "Move it", "Deactivate in the app to free the seat, or let a new PC take the license over from the old one."],
                [RefreshCw, "Checked every 7 days", "The app checks the license online once a week."],
                [WifiOff, "7 days offline", "It keeps working for 7 days without a connection, then asks you to activate again."],
              ] as [LucideIcon, string, string][]
            ).map(([Icon, title, body]) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <Icon className="h-5 w-5 text-white/80" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
              </li>
            ))}
          </ul>

          <div className="mx-auto mt-10 flex max-w-3xl items-start gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-white/70">
              <span className="font-medium text-white">Only use faces you have the right to use.</span>{" "}
              Every video and PNG the app makes carries metadata saying it is AI-made, and you can add a
              visible label as well. See the{" "}
              <Link href="/terms" className="text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Terms of Use
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TECH SPECS (light) */}
      <section className="relative bg-neutral-50 px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">Tech Specs</p>
          <BigHeadline className="text-neutral-950">The details.</BigHeadline>

          <dl className="mt-16 grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
            {[["Price", p.launch ? priceSentence(p) : `${p.current}, one time`] as [string, string], ...specs].map(([term, def]) => (
              <div key={term} className="border-t border-neutral-200 pt-6">
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">{term}</dt>
                <dd className="mt-2 text-base leading-relaxed text-neutral-900">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FAQ (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">Answers</p>
          <BigHeadline>Frequently asked.</BigHeadline>

          <div className="mt-16 space-y-3">
            {faqs(p).map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 transition-colors open:border-white/25 open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-6 text-base font-medium text-white sm:text-lg">
                  <span>{f.q}</span>
                  <span className="mt-1 shrink-0 font-mono text-lg text-white/40 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">{f.a}</p>
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
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(120, 120, 255, 0.18) 0%, transparent 55%)" }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <BigHeadline>Nano FaceStudio V Pro.</BigHeadline>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-white/70 sm:text-xl">
            Replace a person in a video, on your own NVIDIA RTX GPU.
          </p>

          <div className="mt-12">
            <Ctas p={p} />
          </div>

          <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-white/40">
            {p.launch ? priceSentence(p) : p.current} · one-time license · one Windows PC
          </p>
          {p.launch && (
            <p className="mt-4 text-xs text-white/40">
              <Link href={BLACK_FRIDAY_HREF} className="underline decoration-white/20 underline-offset-4 hover:text-white/70 hover:decoration-white/60">
                See all Black Friday offers
              </Link>
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
