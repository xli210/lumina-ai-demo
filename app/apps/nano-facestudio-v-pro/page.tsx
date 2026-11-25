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
import { BeforeAfterVideo } from "./before-after-video";

/**
 * Nano FaceStudio V Pro 1.0.2: product introduction (English only for now).
 * 1.0.2 ships a CUDA 12.8 runtime, so RTX 50-series (Blackwell) cards run; 1.0.1 failed on them. No speed is claimed
 * for those cards: only an RTX 4080 SUPER has been measured. The media and screenshots are still from 1.0.1 (MEDIA_VERSION).
 *
 * Every product fact on this page comes from the app repo's docs/WEBSITE_FACTS_1.0.1.md, and only
 * from lines marked [tested], [code] or [docs]. Rules from that file, kept here on purpose:
 * - no promise of automatic updates (the update feed is not live yet);
 * - no number of faces per video ("replace a person");
 * - Windows x64 only, Windows 11 tested, Windows 10 not yet tested; no Mac;
 * - no head swap;
 * - pictures: only the media made for this page with the signed 1.0.1 build (public/facestudio-v-pro/).
 *   The bodies are the site's own stock demo clips; every face put on them is AI-generated. No
 *   "Enhance only" mode: 1.0.1 does not offer it;
 * - speed only as measured on one RTX 4080 SUPER 16 GB.
 *
 * Price: read from PRODUCTS at render time. $84.90 is a launch price that rises to $119.90 after the
 * Black Friday sale ends. $119.90 is shown struck through next to it (the owner's choice, 2026-11-23),
 * always with the date it applies from. The page re-renders every 10 minutes so the price changes on time.
 */

export const revalidate = 600;

const PRODUCT_ID = "nano-facestudio-v-pro";
const PATH = "/apps/nano-facestudio-v-pro";
const CANONICAL = `https://nanopocket.ai${PATH}`;
const CHECKOUT_HREF = `/checkout?product=${PRODUCT_ID}`;
const DOWNLOAD_HREF = `/download#${PRODUCT_ID}`;
const ONLINE_HREF = "/facestudio-v";
const BLACK_FRIDAY_HREF = "/black-friday";
const SOFTWARE_VERSION = "1.0.2";
/** The build the clips and screenshots on this page were made with. */
const MEDIA_VERSION = "1.0.1";

export const metadata: Metadata = {
  title: { absolute: "Video Face Swap App for Windows | Nano FaceStudio V Pro" },
  description:
    "Replace a person's face in a video on your own NVIDIA RTX GPU, RTX 20 to 50 series (Blackwell included). Fast or Best quality, 1080p or 4K MP4, optional lip sync. One-time license for one Windows PC.",
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
  processorRequirements:
    "NVIDIA GeForce RTX 20, 30, 40 or 50 series GPU (including Blackwell cards such as the RTX 5070, 5080 and 5090, from version 1.0.2), 8 GB video memory minimum",
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
    a: "It replaces a person's face in a video. You click the person to replace and add a photo of the face you want; everything else stays as filmed. You choose Fast or Best quality and export an MP4 at 1080p or 4K. It can also lip-sync to an audio file (optional download), and it swaps faces in photos.",
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
    a: "Windows 64-bit with an NVIDIA GeForce RTX 20, 30, 40 or 50 series GPU (including Blackwell cards such as the RTX 5070, 5080 and 5090). 8 GB of video memory is the minimum and 16 GB is recommended (12 GB is advised for Best quality at 4K). 16 GB of system memory is the minimum and 32 GB is recommended. Setup needs about 38 GB free disk space while it runs and about 25 GB afterwards.",
  },
  {
    q: "Does it work on RTX 50-series (Blackwell) cards?",
    a: "Yes, from version 1.0.2. Version 1.0.1 did not support them; if you installed 1.0.1, download 1.0.2 from the download page and install it over the old one. Only the AI runtime (about 5.5 GB) is downloaded again.",
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

/** Media made with the signed 1.0.1 build: see public/facestudio-v-pro/README in the app repo's website_media. */
const MEDIA = "/facestudio-v-pro";

const steps: { n: string; icon: LucideIcon; title: string; body: string; points?: string[]; img: string; alt: string }[] = [
  {
    n: "1",
    icon: Scissors,
    title: "Add a video, keep the part you need.",
    body: "Drag the start and end handles, or stop on a frame and use it. Faces are looked for only in that part, and the result is only that part.",
    points: ["Frame-exact: ±1 frame buttons", "Videos up to 100 GB"],
    img: "ui/ui_trim.jpg",
    alt: "The trim screen of Nano FaceStudio V Pro with start and end handles under a video of three friends",
  },
  {
    n: "2",
    icon: MousePointerClick,
    title: "Click the person to replace.",
    body: "The app finds everyone in the video and lists them with how long each one is on screen. Click one in the video or in the list; only that person changes.",
    points: ["Everyone else stays as filmed", "Faces you used before are one click away"],
    img: "ui/ui_pick_person.jpg",
    alt: "Three people boxed and listed in the app, each with their time on screen",
  },
  {
    n: "3",
    icon: ImagePlus,
    title: "Add the face. Choose Fast or Best.",
    body: "Add a photo of the face you want, or up to five of the same person. Before you start, the app tells you how long Fast and Best will take for this video on your computer.",
    points: ["Output size 1080p or 4K", "File: Plays everywhere (H.264) or Smaller file (H.265)"],
    img: "ui/ui_modes_size.jpg",
    alt: "Person 2 marked to be replaced, an AI-generated face chosen, and the Fast or Best quality choice with time estimates",
  },
  {
    n: "4",
    icon: Film,
    title: "Compare, then export.",
    body: "Drag the divider over the result to compare it with the original, then download the MP4 or open its folder. The original sound is kept. Everything stays on your computer.",
    points: ["Retouch and Fix a spot right there", "Every file is marked as AI-made"],
    img: "ui/ui_result_export.jpg",
    alt: "The result screen with a before and after divider, the export details and the Download video button",
  },
];

const results: { id: string; title: string; meta: string; wide?: boolean }[] = [
  { id: "elder", title: "Grey hair and beard, outdoors", meta: "Best · 1080p" },
  { id: "blonde", title: "Studio portrait", meta: "Best · 1080p" },
  { id: "group", title: "Three friends: only the one in the middle is replaced", meta: "Best · 1080p", wide: true },
];

const controls: { icon: LucideIcon; title: string; body: string; chips: string[]; img: string; alt: string }[] = [
  {
    icon: SlidersHorizontal,
    title: "Adjust the look",
    body: "Sliders and switches for how the new face sits on the person, set before you start.",
    chips: [
      "Swap strength",
      "Soft edge",
      "Match skin and lips",
      "Fine detail",
      "Keep own mouth",
      "Keep own eyes",
      "Eye direction",
      "Keep own beard",
      "Far side angles",
      "Visible AI label",
    ],
    img: "ui/ui_adjust_look.jpg",
    alt: "The Adjust the look panel with its sliders and switches",
  },
  {
    icon: Brush,
    title: "Fix a spot, or Retouch",
    body: "Pause the finished video and paint over a place. Fix a spot puts the original back there, or brings the new face there, and follows the face through the clip. Retouch wipes out what you paint and fills it in from around it.",
    chips: ["Put the original back", "Bring the new face here", "Around this moment or whole video", "Undo"],
    img: "ui/ui_fix_a_spot.jpg",
    alt: "The Fix a spot panel open over a finished video, with brush size and the two fix choices",
  },
  {
    icon: ListVideo,
    title: "Several videos in a row",
    body: "Add many videos with one face and one set of choices. They are made one after another, and the line keeps going after you close the page.",
    chips: ["Same choices as one video", "Queue of up to 50 jobs"],
    img: "ui/ui_batch_queue.jpg",
    alt: "Three videos queued with one AI-generated face; the first is 71% made",
  },
];

const features: { icon: LucideIcon; title: string; body: string }[] = [
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
    icon: Volume2,
    title: "Sound kept",
    body: "The original sound stays in the export. The app tells you when the original has no sound.",
  },
  {
    icon: Clapperboard,
    title: "Two file types",
    body: "MP4 as H.264, which plays everywhere, or H.265 at about half the size (some older players can't open it).",
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
  ["Fast 4K", "about 25 s"],
  ["Best 1080p", "about 3 min"],
  ["Best 4K", "about 6 min"],
];

const requirements: { icon: LucideIcon; term: string; min: string; rec: string }[] = [
  { icon: Monitor, term: "Operating system", min: "Windows 64-bit (tested on Windows 11; Windows 10 not yet tested)", rec: "Windows 11 64-bit" },
  { icon: Cpu, term: "GPU", min: "NVIDIA GeForce RTX 20, 30, 40 or 50 series", rec: "RTX 50 series (Blackwell, such as the RTX 5070, 5080 and 5090) from version 1.0.2" },
  { icon: Gauge, term: "Video memory", min: "8 GB (a 6 GB card runs Fast 1080p only)", rec: "16 GB (12 GB advised for Best at 4K)" },
  { icon: MemoryStick, term: "System memory", min: "16 GB (Best takes about twice as long)", rec: "32 GB" },
  { icon: HardDrive, term: "Free disk space", min: "About 38 GB during setup, about 25 GB after", rec: "Installed on the drive that holds your user profile" },
  { icon: Download, term: "Download", min: "189 MB installer, then about 14.6 GB at first start", rec: "Lip sync is 2.8 GB more, only if you want it" },
];

const specs: [string, string][] = [
  ["Version", SOFTWARE_VERSION],
  ["Platform", "Windows x64 only. No Mac version. AMD, Intel and older NVIDIA GPUs are not supported."],
  ["Quality modes", "Fast and Best, each at 1080p or 4K"],
  ["Output", "MP4 (H.264, or H.265 for a smaller file), at most 4K (3840 on the long side) and 60 fps; photos as PNG"],
  ["Uploads", "Videos up to 100 GB; no hard limit on length (long videos take long)"],
  ["Batch", "Queue of up to 50 jobs"],
  ["Installer", "189 MB, digitally signed by NanoPocket AI LLC"],
  ["First setup", "About 18 minutes on a fast connection in our test; the engine was ready about 5 minutes after first launch"],
  ["Updates", "Not automatic yet; new versions are a new installer from the download page"],
  ["Not included", "Head swap (a different product)"],
];

/** A screenshot of the app, framed. */
function Shot({ src, alt, light = false }: { src: string; alt: string; light?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-2xl ${
        light ? "border-neutral-300 shadow-neutral-900/15" : "border-white/15 shadow-black/60"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${MEDIA}/${src}`} alt={alt} width={1680} height={1050} loading="lazy" className="block h-auto w-full" />
    </div>
  );
}

/** Where the example clips come from, said plainly. */
function MediaNote({ className = "" }: { className?: string }) {
  return (
    <p className={`mx-auto max-w-3xl text-center text-xs leading-relaxed text-white/45 ${className}`}>
      Every example on this page was made with Nano FaceStudio V Pro {MEDIA_VERSION} on an NVIDIA RTX
      4080 SUPER and scaled down to 720p for the web, with no other editing. The people filmed are from
      stock footage; every face put on them is AI-generated, not a real person&rsquo;s.
    </p>
  );
}

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
            <span>Available now · Windows · NVIDIA RTX 20–50</span>
          </p>

          <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Nano FaceStudio V Pro.
            <br />
            <span className="text-white/50">Video face swap on your own GPU.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-balance text-lg leading-relaxed text-white/70 sm:text-xl md:text-2xl">
            Replace a person in a video with the face from a photo. Everything else stays as filmed.
            Choose Fast or Best, and export a 1080p or 4K MP4, on a Windows PC with an NVIDIA RTX 20, 30, 40 or 50 series card.
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
              {p.launch && (
                <span className="pb-1 text-2xl font-medium leading-none text-white/40 line-through decoration-white/50 sm:text-3xl">{p.regular}</span>
              )}
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

        {/* The hero clip: made with the app, compared with the original. */}
        <figure className="relative mx-auto mt-20 max-w-5xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 rounded-[3rem] opacity-60 blur-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(52, 211, 153, 0.22) 0%, rgba(120, 120, 255, 0.14) 45%, transparent 70%)" }}
          />
          <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-black/70">
            <BeforeAfterVideo
              before={`${MEDIA}/hero_before.mp4`}
              after={`${MEDIA}/hero_after.mp4`}
              beforePoster={`${MEDIA}/hero_before_poster.jpg`}
              afterPoster={`${MEDIA}/hero_after_poster.jpg`}
            />
          </div>
          <figcaption className="relative mt-4 text-center text-xs text-white/45">
            Drag to compare · Best quality, 1080p · stock footage with an AI-generated face, made with V Pro {MEDIA_VERSION}
          </figcaption>
        </figure>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          01 · HOW IT WORKS: the real app, screen by screen. */}
      <section className="relative border-t border-white/10 bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="01" label="How it works" />
          <BigHeadline>Four screens, one video.</BigHeadline>
          <Sub className="text-white/60">
            Add a video, click the person, add the face, choose how it is made. The app does the rest on
            your graphics card. These are screenshots of version {MEDIA_VERSION}.
          </Sub>

          <ol className="mt-20 space-y-24 sm:space-y-32">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const flip = i % 2 === 1;
              return (
                <li key={step.n} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
                  <div className={`lg:col-span-4 ${flip ? "lg:order-2" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-white/85">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Step {step.n}</span>
                    </div>
                    <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{step.title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">{step.body}</p>
                    {step.points && (
                      <ul className="mt-6 space-y-2.5">
                        {step.points.map((pt) => (
                          <li key={pt} className="flex gap-3 text-sm leading-relaxed text-white/70">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <figure className={`lg:col-span-8 ${flip ? "lg:order-1" : ""}`}>
                    <Shot src={step.img} alt={step.alt} />
                  </figure>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02 · RESULTS: before/after clips made with the app. */}
      <section className="relative bg-neutral-950 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="02" label="Results" />
          <BigHeadline>Same video. New face.</BigHeadline>
          <Sub className="text-white/60">
            Drag the line to compare. The hair, the clothes, the light and the background stay as
            filmed; only the face changes.
          </Sub>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            {results.map((r) => (
              <figure key={r.id} className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] ${r.wide ? "md:col-span-2" : ""}`}>
                <BeforeAfterVideo
                  before={`${MEDIA}/${r.id}_before.mp4`}
                  after={`${MEDIA}/${r.id}_after.mp4`}
                  beforePoster={`${MEDIA}/${r.id}_before_poster.jpg`}
                  afterPoster={`${MEDIA}/${r.id}_after_poster.jpg`}
                />
                <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
                  <span className="text-sm font-medium text-white">{r.title}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{r.meta}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <MediaNote className="mt-10" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03 · FAST OR BEST, and measured speed */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="03" label="Fast or Best" />
          <BigHeadline>Two modes. Measured, not guessed.</BigHeadline>
          <Sub className="text-white/60">
            Both export 1080p or 4K. Best is much slower, because it also restores and upscales the
            whole picture, and it shows: lashes, brows and skin come out sharper.
          </Sub>

          {/* Same clip, same face, both modes. */}
          <figure className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/fast_vs_best_face_crops.jpg`}
                alt="The same frame three times: the original woman, the Fast result and the Best quality result with an AI-generated face"
                width={1350}
                height={510}
                loading="lazy"
                className="block h-auto w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-3 text-center">
                {[
                  ["Original", ""],
                  ["Fast", "20 s"],
                  ["Best quality", "2 min 56 s"],
                ].map(([label, time]) => (
                  <span key={label} className="bg-gradient-to-t from-black/75 to-transparent px-2 pb-3 pt-10">
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white sm:text-sm">{label}</span>
                    {time && <span className="mt-0.5 block font-mono text-[11px] text-white/70 sm:text-xs">{time}</span>}
                  </span>
                ))}
              </div>
            </div>
            <figcaption className="px-5 py-4 text-sm leading-relaxed text-white/55">
              One 4-second clip, one AI-generated face, 1080p output. Close-up of the same frame; the
              times are the whole job on an RTX 4080 SUPER.
            </figcaption>
          </figure>

          <figure className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="relative">
              <video
                src={`${MEDIA}/fast_vs_best_side_by_side.mp4`}
                poster={`${MEDIA}/fast_vs_best_side_by_side_poster.jpg`}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="block h-auto w-full"
                aria-label="Fast on the left and Best quality on the right, playing side by side"
              />
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                Fast
              </span>
              <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-emerald-400/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                Best quality
              </span>
            </div>
          </figure>

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

          {/* 4K output: a crop of the native frame (Best quality; Fast at 4K is softer at 1:1, shown below). */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
            <figure className="overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/best4k_face_crop.jpg`}
                alt="A 1440 by 1440 pixel crop, unscaled, from a 3840 by 2160 frame made in Best quality with 4K output"
                width={1440}
                height={1440}
                loading="lazy"
                className="block h-auto w-full"
              />
            </figure>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Output up to 4K</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">3840 × 2160, pixel for pixel.</h3>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Choose 1080p or 4K before you start. This is an unscaled 1440 × 1440 crop of a 4K frame
                made in Best quality, with an AI-generated face.
              </p>
            </div>
          </div>

          {/* The same spot of the same 4K frame in both modes, unscaled. */}
          <figure className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/4k_fast_vs_best_detail.jpg`}
                alt="The same 600 by 600 pixel spot of one 4K frame, unscaled: Fast on the left, Best quality on the right"
                width={1200}
                height={600}
                loading="lazy"
                className="block h-auto w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-2 text-center">
                {["Fast · 4K", "Best quality · 4K"].map((label) => (
                  <span key={label} className="bg-gradient-to-t from-black/75 to-transparent px-2 pb-3 pt-10 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:text-sm">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <figcaption className="px-5 py-4 text-sm leading-relaxed text-white/55">
              The same 600 × 600 spot of one 4K frame, unscaled. Best quality keeps the lashes, the skin texture
              and a sharp edge on the nose; Fast is softer up close and much quicker.
            </figcaption>
          </figure>

          <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-white/50">
            All times measured on one NVIDIA RTX 4080 SUPER with 16 GB of video memory and 32 GB of RAM.
            Slower cards take longer; we have not measured other GPUs yet. With 16 GB of RAM, Best takes
            about twice as long. The first 4K video after switching modes takes longer while its models load. Before you start, the app tells you how long each mode will take for
            your video on your computer.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          04 · CONTROL (light): adjust, fix, batch, each with its screen. */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="04" label="Control" />
          <BigHeadline>Fine-tune it. Fix it. Queue it.</BigHeadline>
          <Sub className="text-neutral-600">
            Adjust how the new face sits, repair a spot on the finished video, or line up a whole
            folder of videos with the same face.
          </Sub>

          <div className="mt-16 space-y-6">
            {controls.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 lg:grid-cols-12 lg:gap-12"
                >
                  <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-neutral-600">{c.body}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {c.chips.map((chip) => (
                        <li key={chip} className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700">
                          {chip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <figure className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <Shot src={c.img} alt={c.alt} light />
                  </figure>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          05 · AND MORE (dark): what has no picture yet. */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="05" label="And more" />
          <BigHeadline>Everything else in the box.</BigHeadline>

          <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <Icon className="h-5 w-5 text-white/80" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
                </li>
              );
            })}
          </ul>

          <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-white/45">
            Only use faces you have the right to use. The app asks you to tick a box confirming it before it makes anything.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          06 · REQUIREMENTS (light) */}
      <section className="relative bg-white px-6 py-24 text-neutral-950 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <EyebrowChapter n="06" label="Requirements" />
          <BigHeadline>Check your PC first.</BigHeadline>
          <Sub className="text-neutral-600">
            Windows x64 with an NVIDIA GeForce RTX 20, 30, 40 or 50 series card; RTX 50 series (Blackwell)
            cards are supported from version 1.0.2. There is no Mac version, and AMD, Intel and older NVIDIA
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
          07 · LICENSE (dark) */}
      <section className="relative bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <EyebrowChapter n="07" label="License" />
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
