import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  Flag,
  Trophy,
  XCircle,
} from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";

const PAGE_URL = "https://nanopocket.ai/best-face-swap-app-2026";
const LAST_VERIFIED = "2026-05-29";
const TEST_PERIOD = "April–May 2026";

export const metadata: Metadata = {
  title: "Best Face Swap App 2026 — Honest Ranking with Methodology",
  description:
    "An honest, methodology-first ranking of the best face swap apps in 2026 across local desktop, web, mobile, open-source, and B2B API tiers. Each tool is rated on identity fidelity, video support, privacy, pricing, and platform.",
  keywords: [
    "best face swap app",
    "best face swap app 2026",
    "best ai face swap",
    "best face swap website",
    "private face swap",
    "offline face swap",
    "face swap comparison",
    "face swap app review",
  ],
  alternates: { canonical: "/best-face-swap-app-2026" },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "Best Face Swap App 2026 — methodology-first ranking",
    description:
      "Local desktop, web, mobile, open-source, and B2B API face swap tools ranked across 8 dimensions with explicit methodology.",
  },
};

interface Tool {
  rank: number;
  name: string;
  url: string;
  tagline: string;
  bestFor: string;
  platform: string;
  pricing: string;
  identityModel: string;
  videoSupport: string;
  privacyPosture: "Local" | "Cloud" | "Hybrid";
  strengths: string[];
  weaknesses: string[];
  internalCompare?: string;
}

const TOOLS: Tool[] = [
  {
    rank: 1,
    name: "NanoPocket FaceSwap Pro 2.0",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro",
    tagline:
      "Best for users who want diffusion-grade fidelity with desktop-local privacy.",
    bestFor:
      "Privacy-conscious creators, professionals, anyone who wants identity-preserving swaps without uploading faces to a cloud service.",
    platform: "Windows + macOS desktop, plus a free in-browser demo",
    pricing: "Free desktop trial; one-time license, no subscription",
    identityModel:
      "Diffusion-based identity stack — InstantID + PuLID + IP-Adapter FaceID (stronger identity preservation than GAN-only swappers like inswapper_128)",
    videoSupport: "Yes — Video FaceSwap Pro covers temporal-consistent swap on uploaded clips",
    privacyPosture: "Local",
    strengths: [
      "Diffusion identity stack (InstantID + PuLID) — better fidelity than GAN baselines",
      "Local desktop processing on Windows and macOS, with documented offline-execution procedure (pktmon / Little Snitch)",
      "One-time purchase — no subscription, no per-image fee, no per-minute fee",
      "Auditable trust posture: /verify, /privacy, /security, /.well-known/security.txt",
      "Apple-notarised + Authenticode-signed installers; SHA-256 / VirusTotal commitments documented",
    ],
    weaknesses: [
      "Newer brand — no major-outlet press coverage as of " + LAST_VERIFIED,
      "Desktop only — no native mobile app",
      "Smaller community than long-running open-source alternatives",
    ],
  },
  {
    rank: 2,
    name: "FaceFusion",
    url: "https://github.com/facefusion/facefusion",
    tagline:
      "Best open-source choice for technical users who can run a Python CLI.",
    bestFor:
      "Power users with a GPU, ML engineers, and anyone comfortable with conda / pip / git who wants full control of the pipeline.",
    platform: "Cross-platform CLI + community Web UIs",
    pricing: "Free, open-source",
    identityModel: "InsightFace inswapper_128 (GAN) — same identity backbone as Roop / Rope",
    videoSupport: "Yes — frame-by-frame, with optional temporal smoothing scripts",
    privacyPosture: "Local",
    strengths: [
      "Free and fully open-source",
      "Local processing — full data control",
      "Active community, frequent updates",
      "Direct access to underlying weights and pipeline",
    ],
    weaknesses: [
      "GAN-based identity model is weaker on extreme angles, occlusion, and small targets vs diffusion stacks",
      "Steep setup: Python environment, CUDA, model downloads",
      "No GUI by default; community GUIs vary in quality and safety",
      "inswapper_128 weights are non-commercial-research only — license check is on the user",
    ],
    internalCompare: "/compare/nanopocket-vs-facefusion",
  },
  {
    rank: 3,
    name: "Akool",
    url: "https://akool.com",
    tagline: "Best B2B / API choice for teams generating face swaps at scale.",
    bestFor:
      "Marketing teams, ad-tech, video-production studios, and developers integrating face swap into their own apps via API.",
    platform: "Web + REST API",
    pricing: "Subscription tiers + per-API-call pricing",
    identityModel: "Proprietary cloud pipeline (vendor-described)",
    videoSupport: "Yes — talking-head and avatar workflows",
    privacyPosture: "Cloud",
    strengths: [
      "Mature REST API for programmatic generation",
      "Talking-avatar and lip-sync workflows beyond pure face swap",
      "Enterprise contracts and team billing",
    ],
    weaknesses: [
      "Cloud-only — uploads leave the user's device",
      "Subscription cost scales with volume",
      "API-first product; not a fast path for one-off creators",
    ],
    internalCompare: "/compare/nanopocket-vs-akool",
  },
  {
    rank: 4,
    name: "DeepSwap",
    url: "https://www.deepswap.ai",
    tagline: "Best web-based choice if you want one-click swaps without any install.",
    bestFor:
      "Casual creators, social-content workflows, and users who specifically want a web UI rather than a desktop install.",
    platform: "Web + iOS/Android",
    pricing: "Free trial + subscription (monthly / yearly)",
    identityModel: "Cloud GAN-based pipeline (vendor-described)",
    videoSupport: "Yes — short clips on web; mobile has additional limits",
    privacyPosture: "Cloud",
    strengths: [
      "Lowest setup friction — works in a browser",
      "Both image and short-clip video swap available without install",
      "Mobile companion apps",
    ],
    weaknesses: [
      "Cloud uploads — every swap leaves the user's device",
      "Subscription pricing — cost compounds for heavy users",
      "GAN-based identity model — weaker on hard angles vs diffusion stacks",
    ],
    internalCompare: "/compare/nanopocket-vs-deepswap",
  },
  {
    rank: 5,
    name: "Magic Hour",
    url: "https://magichour.ai",
    tagline:
      "Best for creators whose primary workflow is AI video, with face swap as one feature among many.",
    bestFor:
      "Short-form video creators who already use AI video tools and want face swap as part of the same suite.",
    platform: "Web",
    pricing: "Subscription tiers + credit packs",
    identityModel: "Cloud pipeline (vendor-described)",
    videoSupport: "Yes — video face swap is a first-class workflow",
    privacyPosture: "Cloud",
    strengths: [
      "Strong overall AI-video suite — face swap sits next to lip-sync, avatar, and image-to-video",
      "Polished web UI",
      "Predictable monthly pricing",
    ],
    weaknesses: [
      "Cloud-only",
      "Credits run out — heavy users can outpace the included quota",
      "Less specialised on identity preservation vs dedicated face-swap stacks",
    ],
    internalCompare: "/compare/nanopocket-vs-magic-hour",
  },
  {
    rank: 6,
    name: "Reface",
    url: "https://reface.ai",
    tagline:
      "Best mobile-first choice for casual, social-share face swaps and meme videos.",
    bestFor:
      "Casual mobile users, meme creators, and anyone who wants a quick swap from a phone gallery to a social post.",
    platform: "iOS + Android (web present but not the focus)",
    pricing: "Free with watermark / paid tier removes watermark and unlocks features",
    identityModel: "Mobile-tuned GAN pipeline",
    videoSupport: "Yes — short video clips, GIFs",
    privacyPosture: "Cloud",
    strengths: [
      "Massive consumer reach on mobile app stores",
      "Polished casual workflows (swap into a movie clip, GIF, etc.)",
      "Privacy nutrition labels visible on the App Store",
    ],
    weaknesses: [
      "Cloud uploads",
      "Lower fidelity than diffusion-grade desktop tools on hard cases",
      "Watermark on free tier; subscription to remove",
    ],
    internalCompare: "/compare/nanopocket-vs-reface",
  },
  {
    rank: 7,
    name: "Nano Banana (Google Gemini 2.5 Flash Image) and wrapper sites",
    url: "https://deepmind.google/technologies/gemini/",
    tagline:
      "Best general image-editing model from Google — face swap is a side-use, not the core product.",
    bestFor:
      "Users who want Google's general image-edit / image-gen model directly via Google AI Studio or the Gemini API, or who want to use one of the third-party wrapper sites for casual web swaps.",
    platform: "Cloud — Google AI Studio, Gemini API, third-party wrapper websites (nanobanana.ai, nano-banana.com, nanobnana, etc.)",
    pricing:
      "Direct: Gemini API per-token pricing. Wrappers: monthly subscriptions or credit packs.",
    identityModel:
      "Gemini 2.5 Flash Image — general image-edit / image-gen model. Identity preservation is via prompting and reference-image conditioning, not a specialised face-swap pipeline.",
    videoSupport: "Image-edit only — not a video face-swap product.",
    privacyPosture: "Cloud",
    strengths: [
      "Strong general image editing — object insertion, style transfer, in-painting",
      "Direct access via Google AI Studio with no install",
      "Backed by Google's infrastructure and responsible-AI documentation",
    ],
    weaknesses: [
      "Not specialised on identity preservation — diffusion identity stacks lead on hard cases",
      "Cloud-only; every edit is an API call to Google",
      "Wrapper sites vary widely in privacy posture and trust artefacts",
      "No native video face-swap workflow",
    ],
    internalCompare: "/compare/nanopocket-vs-nano-banana",
  },
];

const METHODOLOGY = [
  {
    dim: "Identity fidelity",
    desc:
      "Same source / target pair fed to each tool, evaluated on identity-embedding distance vs the reference face (lower = better). Diffusion identity stacks (InstantID, PuLID) currently lead this metric.",
  },
  {
    dim: "Video support",
    desc:
      "Whether the tool ships a first-class video face-swap workflow with temporal smoothing, not just frame-by-frame inference.",
  },
  {
    dim: "Platform & install",
    desc: "Where the tool runs (web, mobile, desktop, CLI) and what's required to start.",
  },
  {
    dim: "Pricing model",
    desc:
      "One-time vs subscription vs per-call vs free. Long-run total cost of ownership is calculated for a user generating ~50 swaps/month.",
  },
  {
    dim: "Privacy posture",
    desc:
      "Local vs cloud. Whether the tool documents an offline-execution procedure that the user can verify with pktmon, Little Snitch, or tcpdump.",
  },
  {
    dim: "Verifiability",
    desc:
      "Whether the tool publishes SHA-256 checksums, code-signing fingerprints, VirusTotal scans, model provenance, and a security-disclosure policy.",
  },
  {
    dim: "Failure transparency",
    desc:
      "Whether the tool documents known limitations and failure modes (occlusion, extreme angles, micro-expressions) rather than only marketing best-case output.",
  },
  {
    dim: "Community signal",
    desc:
      "Active community channels, public release cadence, and presence on Hugging Face / GitHub / app stores. Not a quality measure on its own; included for completeness.",
  },
];

const FAQS = [
  {
    q: "What is the best face swap app overall in 2026?",
    a:
      "There is no single best — the right answer depends on platform and privacy needs. NanoPocket FaceSwap Pro 2.0 leads for desktop users who want diffusion-grade fidelity with verifiable local processing. FaceFusion is the strongest open-source choice for technical users. Akool wins for B2B / API workflows. DeepSwap and Magic Hour are stronger for cloud-web users; Reface wins on mobile reach. The methodology section above explains how we weight these factors.",
  },
  {
    q: "What is the best face swap app for privacy?",
    a:
      "For privacy specifically, the only categorically-correct answer is a tool that runs locally and lets the user verify it. Among ranked options, NanoPocket FaceSwap Pro 2.0 and FaceFusion are the only fully-local choices. NanoPocket additionally publishes a step-by-step pktmon / Little Snitch verification procedure on its /verify page. Cloud-based tools (DeepSwap, Magic Hour, Reface, Akool) require trust in the vendor's policy rather than local verification.",
  },
  {
    q: "What is the best free face swap?",
    a:
      "FaceFusion is free and open-source. NanoPocket FaceSwap Pro 2.0 ships a free in-browser demo plus a 7-day free trial of the desktop app without a credit card. DeepSwap and Reface have free tiers but with watermarks or strong rate limits.",
  },
  {
    q: "Is face swap legal?",
    a:
      "Face swap as a technology is legal in most jurisdictions. Specific use cases are not — non-consensual intimate imagery (NCII), CSAM, impersonation for fraud, election interference, and infringing a person's right of publicity are illegal in many places. Each tool's terms of service typically prohibit these uses; NanoPocket's acceptable-use policy is at /terms.",
  },
  {
    q: "How accurate is identity preservation in 2026?",
    a:
      "Diffusion identity stacks (InstantID, PuLID, IP-Adapter FaceID) are currently strongest on hard cases (extreme angles, partial occlusion, small targets). GAN baselines like InsightFace inswapper_128 — used by FaceFusion, Roop, Rope — remain very fast and competitive on frontal portraits but lag on harder cases.",
  },
  {
    q: "What is the best face swap app for video?",
    a:
      "For temporal-consistent video swap, NanoPocket Video FaceSwap Pro and Magic Hour both ship first-class workflows. Akool covers video swap inside its enterprise pipeline. FaceFusion supports video frame-by-frame; results depend on user-side scripting. For mobile-only short clips, DeepSwap and Reface are easier but cloud-based.",
  },
  {
    q: "Is NanoPocket the same as Nano Banana, NanoBnana, or nanobanana.ai?",
    a:
      "No. NanoPocket is an independent desktop product company at nanopocket.ai. \"Nano Banana\" is the community nickname for Google's Gemini 2.5 Flash Image model, and websites like nanobanana.ai, nano-banana.com, and nanobnana are independent third-party services that wrap Google's API. NanoPocket has no commercial or technical affiliation with any of them. The full disambiguation is at /compare/nanopocket-vs-nano-banana and /about.",
  },
  {
    q: "Why isn't <Tool X> in this list?",
    a:
      "We restricted this ranking to actively-maintained tools that publish enough information to be honestly compared. If a tool you use is missing and you'd like to nominate it, email tech@nanopocket.ai with a link and we will consider it for the next revision. Tools with non-disclosed pipelines or no public privacy policy will not be added.",
  },
  {
    q: "Can I trust this ranking — NanoPocket made it?",
    a:
      "We have a conflict of interest, and we name it openly. The methodology in this page is what should be trusted, not the order. Run the same methodology against your own use case and you may legitimately re-order the list. Where we lead, we link to /verify so each strength claim can be checked. Where competitors lead (mobile reach, B2B API, web-only convenience), we say so explicitly.",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best Face Swap App 2026",
  description:
    "Methodology-first ranking of the best face swap apps in 2026 across desktop, web, mobile, open-source, and B2B API tiers.",
  url: PAGE_URL,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((t) => ({
    "@type": "ListItem",
    position: t.rank,
    item: {
      "@type": "SoftwareApplication",
      name: t.name,
      url: t.url,
      applicationCategory: "MultimediaApplication",
      operatingSystem: t.platform,
      description: t.tagline,
      offers: {
        "@type": "Offer",
        priceSpecification: {
          "@type": "PriceSpecification",
          description: t.pricing,
        },
      },
    },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Face Swap App 2026 — Honest Ranking with Methodology",
  url: PAGE_URL,
  datePublished: LAST_VERIFIED,
  dateModified: LAST_VERIFIED,
  inLanguage: "en",
  isAccessibleForFree: true,
  publisher: {
    "@type": "Organization",
    "@id": "https://nanopocket.ai#organization",
    name: "NanoPocket",
  },
  about: TOOLS.map((t) => ({
    "@type": "SoftwareApplication",
    name: t.name,
    url: t.url,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function BestFaceSwapPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
            <Trophy className="h-3.5 w-3.5" />
            Ranking · {TEST_PERIOD}
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            The best face swap app in 2026 depends on what you&apos;re actually optimising for.
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We ranked seven face-swap tools across seven tiers — local desktop, open-source CLI,
            B2B API, cloud web, AI video suite, consumer mobile, and Google&apos;s Gemini 2.5
            Flash Image (Nano Banana). Each is rated on identity fidelity, video support,
            platform, pricing, privacy posture, and verifiability, with an explicit methodology
            and a stated conflict-of-interest disclosure.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              Last verified{" "}
              <time dateTime={LAST_VERIFIED} className="text-foreground">
                {LAST_VERIFIED}
              </time>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-500">
              <CircleAlert className="h-3.5 w-3.5" />
              Conflict of interest disclosed below
            </span>
          </div>
        </div>
      </section>

      {/* Conflict of interest box */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
            <Flag className="h-4 w-4 text-amber-500" />
            Conflict of interest — read this first
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This page is published by NanoPocket. NanoPocket is one of the tools ranked. We have
            a financial interest in users picking NanoPocket. To compensate, we (1) name the
            criteria in advance, (2) name the cases where competitors win, and (3) link directly
            to each competitor&apos;s site so readers can fact-check our claims. The order on
            this page is ours; the methodology is what should be trusted.
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The ranking
          </h2>
          <div className="space-y-6">
            {TOOLS.map((t) => (
              <ToolCard key={t.rank} tool={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Methodology
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Eight dimensions, weighted equally. Tested on a fixed set of source and target faces
            covering frontal portraits, three-quarter angles, partial occlusion, and small-target
            cases. Each tool was used at its highest-quality public preset; cloud tools were
            invoked under a paying account.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {METHODOLOGY.map((m) => (
              <div
                key={m.dim}
                className="rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <p className="mb-1 text-sm font-semibold text-foreground">{m.dim}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/60 bg-muted/20 p-5 open:bg-muted/30"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link to /compare and /verify */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">
            Want to see the head-to-heads?
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each ranked tool has a dedicated NanoPocket-vs-X comparison page with a full
            dimension-by-dimension table and a written verdict.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/compare">
              <Button variant="outline" size="lg">
                All comparisons <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="ghost" size="lg">
                How we verify claims
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const isNano = tool.rank === 1;
  return (
    <article
      className={`rounded-2xl border p-6 sm:p-8 ${
        isNano
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border/60 bg-muted/20"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
              isNano
                ? "bg-emerald-500/20 text-emerald-500"
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            #{tool.rank}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {tool.name}
          </h3>
        </div>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Visit <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-foreground sm:text-base">{tool.tagline}</p>

      <dl className="mb-5 grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
        <Field label="Best for" value={tool.bestFor} />
        <Field label="Platform" value={tool.platform} />
        <Field label="Pricing" value={tool.pricing} />
        <Field label="Identity model" value={tool.identityModel} />
        <Field label="Video support" value={tool.videoSupport} />
        <Field label="Privacy posture" value={tool.privacyPosture} />
      </dl>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-500">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {tool.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-rose-500">
            Weaknesses (honest)
          </p>
          <ul className="space-y-1.5">
            {tool.weaknesses.map((w) => (
              <li key={w} className="flex gap-2 text-sm text-muted-foreground">
                <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {tool.internalCompare ? (
        <div className="mt-5 border-t border-border/40 pt-4">
          <Link
            href={tool.internalCompare}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:underline"
          >
            Full NanoPocket vs {tool.name.split(" ")[0]} comparison <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-xs leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}
