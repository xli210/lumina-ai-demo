import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cloud,
  ExternalLink,
  FileCheck2,
  Globe,
  ImageIcon,
  Info,
  ShieldCheck,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { DemoStatusBadge } from "../components/demo-status-badge";
import { DEMOS, demoUrl, type DemoId } from "@/lib/demos";
import { hreflangAlternates } from "@/lib/i18n/locales";

const PAGE_URL = "https://nanopocket.ai/face-swap";
const LAST_VERIFIED = "2026-06-03";

export const metadata: Metadata = {
  title:
    "Free Online AI Face Swap — No Install, No Subscription | NanoPocket",
  description:
    "Free online AI face swap that runs in your browser. No install, no subscription, no GPU required. Three diffusion-grade demos: Image FaceSwap Pro 2.0, Video FaceSwap Pro, and NanoFace Vivid. Sign in once with a free account and start swapping.",
  keywords: [
    "free online face swap",
    "ai face swap online",
    "face swap in browser",
    "free face swap no install",
    "face swap no signup",
    "best free ai face swap",
    "browser face swap",
    "online face swap diffusion",
    "free face swap website 2026",
  ],
  alternates: {
    canonical: "/face-swap",
    languages: hreflangAlternates("https://nanopocket.ai", "/face-swap", [
      "zh-CN",
    ]),
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Free Online AI Face Swap — runs in your browser",
    description:
      "Three diffusion-grade face-swap demos that run in your browser. Free, no install, no subscription.",
    images: ["/images/vivid/gemini-after.jpg"],
  },
  other: {
    "article:modified_time": LAST_VERIFIED,
  },
};

interface OnlineDemoCopy {
  id: DemoId;
  blurb: string;
  bullets: string[];
  Icon: React.ComponentType<{ className?: string }>;
  accent: "violet" | "sky" | "rose";
}

const ONLINE_DEMO_COPY: OnlineDemoCopy[] = [
  {
    id: "image",
    blurb:
      "Photo-to-photo face swap with a diffusion identity stack (InstantID + PuLID + IP-Adapter FaceID). Highest fidelity for stills.",
    bullets: [
      "Upload a target photo and a reference face — get a swap in a few seconds",
      "Diffusion identity stack — handles hard angles, low light, occlusion better than GAN swappers",
      "Free, browser-based, no install",
    ],
    Icon: ImageIcon,
    accent: "violet",
  },
  {
    id: "video",
    blurb:
      "Same identity stack extended to video with temporal smoothing. Drop in a clip, get a swapped clip — no frame-by-frame work.",
    bullets: [
      "Short-clip video swap straight from the browser",
      "Temporal-consistent — no flicker between frames",
      "Free, browser-based, no install",
    ],
    Icon: Video,
    accent: "sky",
  },
  {
    id: "vivid",
    blurb:
      "Identity-locked face-detail restorer. Fixes the over-smoothed, plastic look that Gemini, Firefly, Roop, FaceFusion, and cloud face-swap services leave on portraits.",
    bullets: [
      "Drop in any over-smoothed AI face — get a realistic-skin version back",
      "Identity-locked: only restores texture and lighting, never changes the face",
      "Free, browser-based, no install",
    ],
    Icon: Wand2,
    accent: "rose",
  },
];

const ONLINE_DEMOS = ONLINE_DEMO_COPY.map((c) => {
  const demo = DEMOS.find((d) => d.id === c.id)!;
  return {
    ...c,
    name: demo.name,
    href: demoUrl(demo),
    password: demo.password ?? undefined,
  };
});

interface CompareRow {
  tool: string;
  setup: string;
  signup: string;
  pricing: string;
  identity: string;
  privacy: string;
  highlight?: boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  {
    tool: "NanoPocket — free online demos",
    setup: "Browser only — open and go",
    signup: "Free NanoPocket account (email + password)",
    pricing: "Free for the demo tier",
    identity: "Diffusion stack (InstantID + PuLID + IP-Adapter FaceID)",
    privacy: "Cloud GPU for the demo, volatile only, not used for training",
    highlight: true,
  },
  {
    tool: "DeepSwap",
    setup: "Browser",
    signup: "Account + payment for full features",
    pricing: "Free trial then subscription",
    identity: "Cloud GAN pipeline (vendor-described)",
    privacy: "Cloud upload",
  },
  {
    tool: "WaveSpeed AI (face swap among AI suite)",
    setup: "Browser",
    signup: "Account",
    pricing: "Credit / subscription tiers",
    identity: "Multi-model AI suite — face swap is one feature",
    privacy: "Cloud upload",
  },
  {
    tool: "Magic Hour",
    setup: "Browser",
    signup: "Account",
    pricing: "Credit / subscription tiers",
    identity: "Cloud pipeline (vendor-described)",
    privacy: "Cloud upload",
  },
  {
    tool: "Reface",
    setup: "Mobile app (iOS / Android)",
    signup: "Account; watermark on free tier",
    pricing: "Free tier with watermark + subscription",
    identity: "Mobile-tuned GAN",
    privacy: "Cloud upload",
  },
  {
    tool: "Akool",
    setup: "Browser + REST API",
    signup: "Account, B2B onboarding for API",
    pricing: "Subscription + per-API-call",
    identity: "Cloud pipeline (vendor-described)",
    privacy: "Cloud upload",
  },
];

const FAQS = [
  {
    q: "Is the online face swap really free?",
    a: "Yes. The three online demos on this page (Image FaceSwap Pro 2.0, Video FaceSwap Pro, NanoFace Vivid) are free for any signed-in NanoPocket account. There is no per-image fee, no per-minute fee, no credit pack, and no subscription gating the demo tier. The desktop FaceSwap Pro 2.0 release is a separate, optional, one-time-purchase product.",
  },
  {
    q: "Do I need an account?",
    a: "Yes — a free NanoPocket account (email + password). The login screen accepts the password listed under each demo. The account is required so we can rate-limit abuse, not so we can sell anything. You can sign up at /auth/sign-up.",
  },
  {
    q: "Do I need a GPU on my machine?",
    a: "No. The online demos run on NanoPocket's GPUs in the cloud. Anything that can open a browser — laptop, desktop, tablet — can use them. The desktop FaceSwap Pro 2.0 release (separate product) is the option for users who specifically want local-only processing on their own GPU.",
  },
  {
    q: "How does the privacy work for the online demos?",
    a: "The source files are sent to NanoPocket's GPU only for the duration of the swap, processed in volatile memory, and discarded. They are not used for training. The full data-handling policy is at /privacy and the verifiable claims hub is at /verify. If you specifically want zero-cloud processing, the desktop FaceSwap Pro 2.0 is the right product — it runs entirely on your own machine.",
  },
  {
    q: "How does this compare to DeepSwap or Reface?",
    a: "The online demos here use a diffusion identity stack (InstantID + PuLID + IP-Adapter FaceID), which preserves identity better on hard angles, low light, and occlusion than the GAN-based pipelines that DeepSwap, Reface, and most cloud face-swap services use. The trade-off is that NanoPocket is younger as a brand and has less mass-market name recognition. See the side-by-side at /compare/nanopocket-vs-deepswap and the full ranking at /best-face-swap-app-2026.",
  },
  {
    q: "What is the difference between the three demos?",
    a: "Image FaceSwap Pro 2.0 is for still-image swaps with the strongest identity preservation. Video FaceSwap Pro is the same identity stack extended to short video clips with temporal smoothing. NanoFace Vivid is a face-detail restorer that fixes the over-smoothed look that Gemini 2.5 Flash Image (Nano Banana), Firefly, Roop, and cloud face-swap services leave on portraits — it is identity-locked and is meant to run after another face-swap step (or after any AI portrait generator).",
  },
  {
    q: "Is there a desktop version?",
    a: "Yes — NanoPocket FaceSwap Pro 2.0 is shipping for Windows and macOS with the same diffusion identity stack, plus the NanoFace Vivid post-processor stage built in. Desktop is a separate, optional purchase for users who want fully-local processing. The online demos are free either way.",
  },
];

const accentClasses: Record<OnlineDemo["accent"], { ring: string; chip: string; cta: string }> = {
  violet: {
    ring: "ring-violet-500/30",
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-500",
    cta: "bg-violet-500 hover:bg-violet-400",
  },
  sky: {
    ring: "ring-sky-500/30",
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-500",
    cta: "bg-sky-500 hover:bg-sky-400",
  },
  rose: {
    ring: "ring-rose-500/30",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-500",
    cta: "bg-rose-500 hover:bg-rose-400",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": PAGE_URL,
  url: PAGE_URL,
  name: "Free Online AI Face Swap — NanoPocket",
  description:
    "Free online AI face swap, runs in any browser, no install, no subscription. Three diffusion-grade demos powered by InstantID + PuLID + IP-Adapter FaceID.",
  inLanguage: "en",
  isAccessibleForFree: true,
  dateModified: LAST_VERIFIED,
  isPartOf: { "@id": "https://nanopocket.ai#website" },
  about: {
    "@type": "SoftwareApplication",
    "@id": "https://nanopocket.ai/face-swap#app",
    name: "NanoPocket Face Swap (online demos)",
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Face swap",
    operatingSystem: "Browser (any modern OS)",
    browserRequirements: "Modern browser; WebGL not required",
    softwareVersion: "Pro 2.0",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Photo face swap",
      "Video face swap",
      "Over-smoothed AI-face restoration (NanoFace Vivid)",
      "Diffusion identity stack — InstantID + PuLID + IP-Adapter FaceID",
      "Browser-only — no install, no GPU required on user's device",
    ],
    publisher: { "@id": "https://nanopocket.ai#organization" },
  },
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

export default function FaceSwapPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Free online — runs in your browser
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Free online AI face swap. No install. No subscription.
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Three diffusion-grade face-swap demos that run in your browser.
            Sign in once with a free NanoPocket account, upload a target and
            a reference face, and get a swap in seconds. No GPU required on
            your machine, no per-image fee, no per-minute fee, no credit pack.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              Last verified <time dateTime={LAST_VERIFIED} className="text-foreground">{LAST_VERIFIED}</time>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-500">
              <Clock className="h-3.5 w-3.5" />
              Open in browser in under 10 seconds
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background">
              <a href={ONLINE_DEMOS[0].href} target="_blank" rel="noopener noreferrer">
                Try the photo demo <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/auth/sign-up">
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Three online demos */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Three free online demos
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each demo is a separate browser tool. Pick the one that matches
            what you want to do — still photo, short video clip, or fixing the
            over-smoothed AI look on an existing portrait.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ONLINE_DEMOS.map((d) => {
              const a = accentClasses[d.accent];
              const Icon = d.Icon;
              return (
                <div
                  key={d.id}
                  className={`flex flex-col rounded-2xl border border-border/60 bg-background/60 p-6 ring-1 ${a.ring}`}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${a.chip}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {/* @ts-expect-error Async Server Component */}
                    <DemoStatusBadge demoId={d.id} size="sm" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{d.name}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {d.blurb}
                  </p>
                  <ul className="mb-5 space-y-2 text-sm text-muted-foreground">
                    {d.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {d.password ? (
                    <p className="mb-4 text-xs text-muted-foreground">
                      Demo password:{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                        {d.password}
                      </code>
                    </p>
                  ) : null}
                  <div className="mt-auto">
                    <Button asChild className={`w-full rounded-full text-white ${a.cta}`}>
                      <a href={d.href} target="_blank" rel="noopener noreferrer">
                        Open in browser <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="border-y border-border/60 bg-muted/20 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            How it works — three steps
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                n: 1,
                title: "Open the demo",
                body: "Click any of the three demo buttons above. Each opens a new browser tab — nothing to install.",
              },
              {
                n: 2,
                title: "Sign in once",
                body: "Enter the demo password shown on the card. If you don't have a NanoPocket account yet, create one free in 30 seconds.",
              },
              {
                n: 3,
                title: "Upload + swap",
                body: "Drop in a target photo or video and a reference face. The diffusion identity stack handles the swap. Download the result in seconds.",
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border/60 bg-background/60 p-5">
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  {s.n}
                </span>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browser-first comparison */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How it compares to other browser face-swap sites
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sorted by what actually matters when you just want to do a swap
            today — setup time, sign-up friction, what you pay for the demo
            tier, and the underlying identity model.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">Setup</th>
                  <th className="px-4 py-3">Sign-up</th>
                  <th className="px-4 py-3">Free-tier pricing</th>
                  <th className="px-4 py-3">Identity model</th>
                  <th className="px-4 py-3">Privacy</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r, i) => (
                  <tr
                    key={r.tool}
                    className={`border-t border-border/40 align-top ${
                      r.highlight
                        ? "bg-emerald-500/5"
                        : i % 2 === 0
                          ? "bg-background/40"
                          : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{r.tool}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{r.setup}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{r.signup}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{r.pricing}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{r.identity}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{r.privacy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Read the full methodology and head-to-head pages at{" "}
            <Link href="/best-face-swap-app-2026" className="text-foreground underline-offset-2 hover:underline">
              /best-face-swap-app-2026
            </Link>{" "}and{" "}
            <Link href="/compare" className="text-foreground underline-offset-2 hover:underline">
              /compare
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Why diffusion (kept brief) */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/20 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Why the swaps look better here
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Most cloud face-swap sites use a GAN identity backbone (typically
            InsightFace inswapper_128 or a derivative). It is fast and cheap
            but loses fidelity on hard angles, occlusion, and small target
            faces. NanoPocket runs a diffusion identity stack — InstantID,
            PuLID, and IP-Adapter FaceID combined — which is the current
            state of the art for identity preservation in 2026.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            The same stack powers the desktop FaceSwap Pro 2.0 build, so
            results in the browser demos and on the desktop are byte-aligned
            on equivalent inputs.
          </p>
        </div>
      </section>

      {/* Going further (NOT the lead) */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            If you want to go fully offline
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The free browser demos cover the vast majority of casual and
            professional use cases. If your use case specifically requires
            zero cloud upload — regulated content, signed legal media, NDA
            work — the optional desktop release runs the same identity stack
            entirely on your own GPU.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/apps/nano-faceswap-pro">
                See FaceSwap Pro 2.0 (desktop) <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/verify">
                Auditable claims <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/60 bg-background/60 p-5 open:bg-muted/30"
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

      {/* Honest disclosure */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/60 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            Honest disclosure
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Cloud GPU on the demo tier.</strong>{" "}
              The online demos run on NanoPocket-hosted GPUs, not on your
              device. Files are processed in volatile memory and not used for
              training. If your use case requires zero-cloud, the desktop app
              is the right choice.
            </li>
            <li>
              <strong className="text-foreground">Younger brand.</strong>{" "}
              NanoPocket has less name recognition than DeepSwap or Reface as
              of {LAST_VERIFIED}. The verifiable trust artefacts at{" "}
              <Link href="/verify" className="underline">/verify</Link> are
              what to evaluate instead of brand history.
            </li>
            <li>
              <strong className="text-foreground">Demo URLs are tunnelled.</strong>{" "}
              The three demo URLs are served via Cloudflare tunnels and may
              rotate as we update infrastructure. The canonical entry point
              is always this page (<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/face-swap</code>).
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
