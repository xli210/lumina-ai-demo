import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  CreditCard,
  FileCheck2,
  Fingerprint,
  Globe2,
  Lock,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/trust";
const LAST_VERIFIED = "2026-05-29";

export const metadata: Metadata = {
  title:
    "Trust & Transparency — Pricing, Privacy, System Requirements, Limitations",
  description:
    "Verifiable, dated documentation for every NanoPocket app: pricing terms (one-time, no auto-renewal), what we collect (license activation only), system requirements per product, known limitations, refund policy, security posture, and external citations. Last verified 2026-05-29.",
  keywords: [
    "NanoPocket trust",
    "NanoPocket privacy",
    "NanoPocket system requirements",
    "NanoPocket pricing terms",
    "NanoPocket refund policy",
    "NanoPocket known limitations",
    "is NanoPocket safe",
    "is NanoPocket legit",
    "NanoPocket security",
    "NanoPocket data collection",
    "NanoPocket telemetry",
    "NanoPocket open source attribution",
    "local AI no cloud",
    "no subscription AI software",
    "one-time purchase AI app",
  ],
  alternates: { canonical: "/trust" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "NanoPocket — Trust & Transparency",
    description:
      "Pricing, privacy, system requirements, known limitations, refund policy, and external references for every NanoPocket app.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NanoPocket — Trust & Transparency",
    description:
      "Pricing, privacy, system requirements, limitations, refund policy.",
  },
};

interface SystemReq {
  product: string;
  href: string;
  os: string;
  gpu: string;
  vram: string;
  status: "Stable" | "Beta" | "Coming soon";
}

const SYSTEM_REQS: SystemReq[] = [
  {
    product: "Nano FaceSwap Pro 2.0 (online)",
    href: "/apps/nano-faceswap-pro",
    os: "Any modern browser (Chrome, Edge, Safari, Firefox)",
    gpu: "Hosted GPU (no local hardware required)",
    vram: "—",
    status: "Stable",
  },
  {
    product: "Nano FaceSwap Pro 2.0 (desktop)",
    href: "/apps/nano-faceswap-pro/features",
    os: "Windows 10/11; macOS Apple Silicon (M2/M3/M4/M5)",
    gpu: "NVIDIA CUDA (Win) or Apple Silicon Metal (Mac)",
    vram: "8 GB minimum",
    status: "Coming soon",
  },
  {
    product: "Nano Video FaceSwap Pro (online)",
    href: "/apps/nano-faceswap-pro/video",
    os: "Any modern browser, signed-in NanoPocket account",
    gpu: "Hosted GPU (no local hardware required)",
    vram: "—",
    status: "Stable",
  },
  {
    product: "Nano ImageEnh Pro 3.0",
    href: "/apps/nano-imageenh-pro",
    os: "Windows 10/11; macOS Apple Silicon (M2/M3/M4/M5, native arm64)",
    gpu: "NVIDIA CUDA (Win) or Apple Silicon Metal (Mac)",
    vram: "8 GB minimum (Win); 16 GB unified memory recommended (Mac)",
    status: "Stable",
  },
  {
    product: "Nano VideoEnhance",
    href: "/apps/nano-videoenhance",
    os: "Windows 10/11",
    gpu: "NVIDIA CUDA, RTX 30/40/50 series tested",
    vram: "8 GB minimum",
    status: "Stable",
  },
  {
    product: "Nano VideoGen",
    href: "/apps/nano-videogen",
    os: "Windows 10/11",
    gpu: "NVIDIA CUDA",
    vram: "12 GB minimum (streaming DiT path)",
    status: "Stable",
  },
  {
    product: "Nano ImageEdit",
    href: "/apps/nano-imageedit",
    os: "Windows 10/11",
    gpu: "NVIDIA CUDA",
    vram: "12 GB recommended; 8 GB via streaming DiT",
    status: "Stable",
  },
  {
    product: "Nano FacialEdit",
    href: "/apps/nano-facialedit",
    os: "Windows 10/11",
    gpu: "NVIDIA CUDA",
    vram: "8 GB minimum",
    status: "Stable",
  },
  {
    product: "Nano ImageTryon",
    href: "/apps/nano-imagetryon",
    os: "Windows 10/11",
    gpu: "NVIDIA CUDA",
    vram: "8 GB minimum",
    status: "Stable",
  },
  {
    product: "Nano FaceSwap (legacy desktop)",
    href: "/apps/nano-faceswap",
    os: "Windows 10/11",
    gpu: "NVIDIA CUDA, GTX 1660 / RTX 30+ tested",
    vram: "6 GB minimum",
    status: "Stable",
  },
];

interface PricingTerm {
  label: string;
  value: string;
}

const PRICING_TERMS: PricingTerm[] = [
  { label: "Pricing model", value: "One-time license per product. No subscriptions, no auto-renewal." },
  { label: "Trial", value: "7-day free trial on every paid app. No credit card during trial." },
  { label: "Free apps", value: "Permanent free license at no cost. No upsell, no time limit." },
  { label: "Activations per license", value: "1 machine per license by default. Force-takeover is supported on the user's account page." },
  { label: "Hidden charges", value: "None. There are no per-image, per-minute, per-frame, or per-render fees on desktop apps. Online demos are free for signed-in NanoPocket accounts." },
  { label: "Recurring fees", value: "None. The license does not expire and does not require a yearly renewal." },
  { label: "Future updates", value: "Minor and patch updates (e.g. 1.0.4 → 1.0.5) are included free for life. Major version upgrades (e.g. 3.0 → 4.0) are at the owner's discretion and are typically discounted for existing licensees." },
  { label: "Refund policy", value: "Because every paid app ships with a full 7-day trial, purchases are non-refundable after activation. The trial is the canonical evaluation window." },
  { label: "Tax", value: "Stripe handles VAT/GST/sales tax based on the buyer's region at checkout." },
  { label: "Payment processor", value: "Stripe. NanoPocket never sees or stores raw payment-card data." },
];

interface PrivacyClaim {
  question: string;
  answer: string;
}

const PRIVACY_CLAIMS: PrivacyClaim[] = [
  {
    question: "Is my source media uploaded?",
    answer:
      "Desktop apps: No. Every photo, video, and prompt stays on the user's local disk; the model runs on the user's GPU. Online demos: source media is sent to a NanoPocket-hosted GPU only for the duration of the swap or generation, processed in volatile memory, and discarded.",
  },
  {
    question: "Is content used to train models?",
    answer:
      "No. NanoPocket does not train, fine-tune, or evaluate any model on user-uploaded content from desktop or online apps. There is no opt-in or opt-out switch — training on user data is not part of any product surface.",
  },
  {
    question: "What is sent over the network?",
    answer:
      "Desktop: only license-activation handshakes (license key, hashed machine ID, app version). Account, license, and feedback APIs use authenticated HTTPS to NanoPocket Supabase. No content telemetry. Online demos send the source file to the demo GPU and return the result.",
  },
  {
    question: "Are there third-party trackers?",
    answer:
      "Web analytics use Google Analytics (GA4) for aggregate page-view counts only. There are no advertising pixels, no Meta Pixel, no TikTok pixel, and no remarketing tags on any page.",
  },
  {
    question: "How long is data retained?",
    answer:
      "Account data (email, license, machine activation records) is retained while the account exists; deletion on request is supported via tech@nanopocket.ai. Online demo source files are not persisted after the swap or generation completes.",
  },
  {
    question: "Where are servers located?",
    answer:
      "Account and licensing infrastructure runs on Supabase (US-East). Online demo GPUs are hosted on US and EU regions. The desktop apps do not depend on any of this once activated.",
  },
];

interface SecurityNote {
  title: string;
  detail: string;
}

const SECURITY: SecurityNote[] = [
  {
    title: "Code-signed installers",
    detail:
      "Windows builds are Authenticode-signed; macOS builds are signed and notarised by Apple. Unsigned builds are not distributed.",
  },
  {
    title: "License activation",
    detail:
      "Activation is bound to a hashed machine identifier; the raw machine ID never leaves the device. Force-takeover is rate-limited per account.",
  },
  {
    title: "Telemetry",
    detail:
      "There is no automatic content-level telemetry. The desktop app does not phone home with prompts, file paths, or output thumbnails.",
  },
  {
    title: "Update channel",
    detail:
      "Updates are fetched over HTTPS from the NanoPocket update server, with a signed manifest. Users can opt out of automatic updates.",
  },
  {
    title: "Open dependencies",
    detail:
      "The model layer is built on open-weight models (Flux.1, LTX-2.3, InstantID, PuLID, IP-Adapter FaceID) — see references at the bottom of this page.",
  },
];

interface KnownIssue {
  title: string;
  detail: string;
  product: string;
  href: string;
}

const KNOWN_ISSUES: KnownIssue[] = [
  {
    title: "Apple Silicon support is partial",
    product: "Nano VideoEnhance, VideoGen, ImageEdit, FacialEdit, ImageTryon",
    detail:
      "Five apps are Windows + NVIDIA only at the time of last verification. Apple Silicon (Metal) ports are on the roadmap but not shipped.",
    href: "/trust#sysreqs",
  },
  {
    title: "Pro 2.0 desktop app is pre-release",
    product: "Nano FaceSwap Pro 2.0",
    detail:
      "Online demo (image and video) is live and free for signed-in accounts; the 100% local desktop app launches shortly after the public feature tour. The chip on the homepage shows 'Coming soon' until then.",
    href: "/apps/nano-faceswap-pro",
  },
  {
    title: "Inswapper-class identity ceiling on Nano FaceSwap (legacy)",
    product: "Nano FaceSwap 1.0.4",
    detail:
      "Identity is rendered at 128×128 then upscaled (same pipeline as Roop / FaceFusion / Rope). The diffusion-grade replacement ships with Pro 2.0.",
    href: "/apps/nano-faceswap",
  },
  {
    title: "Online demo capacity at peak hours",
    product: "Nano Video FaceSwap Pro (online)",
    detail:
      "Free demo queues lengthen during UTC 14-22. Most submissions clear in ≤2 min, but a 5-10 min wait is possible on busy weekends.",
    href: "/apps/nano-faceswap-pro/video",
  },
  {
    title: "Hands and fine articulation on diffusion video",
    product: "Nano VideoGen 1.1.2",
    detail:
      "Like all current open-weight video diffusion models, occasional finger-count and articulation errors persist. We do not claim parity with closed cloud models on hands.",
    href: "/apps/nano-videogen",
  },
];

interface Citation {
  label: string;
  url: string;
  note: string;
}

const CITATIONS: Citation[] = [
  {
    label: "Wang et al. — InstantID: Zero-shot Identity-Preserving Generation in Seconds (arXiv:2401.07519, 2024)",
    url: "https://arxiv.org/abs/2401.07519",
    note: "Identity backbone in Nano FaceSwap Pro 2.0 and FacialEdit.",
  },
  {
    label: "Guo et al. — PuLID: Pure and Lightning ID Customization via Contrastive Alignment (arXiv:2404.16022, 2024)",
    url: "https://arxiv.org/abs/2404.16022",
    note: "Skin-detail / contrast objective layered on top of InstantID.",
  },
  {
    label: "Ye et al. — IP-Adapter: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models (arXiv:2308.06721, 2023)",
    url: "https://arxiv.org/abs/2308.06721",
    note: "Reference-image conditioning module across the diffusion stack.",
  },
  {
    label: "Black Forest Labs — Flux.1 model card",
    url: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
    note: "Backbone model behind Nano ImageEdit.",
  },
  {
    label: "Lightricks — LTX-Video model card",
    url: "https://huggingface.co/Lightricks/LTX-Video",
    note: "Backbone model behind Nano VideoGen.",
  },
  {
    label: "Wang et al. — Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data (arXiv:2107.10833, 2021)",
    url: "https://arxiv.org/abs/2107.10833",
    note: "Foundational degradation model behind ImageEnh Pro.",
  },
  {
    label: "Liang et al. — VRT: A Video Restoration Transformer (arXiv:2201.12288, 2022)",
    url: "https://arxiv.org/abs/2201.12288",
    note: "Architecture lineage for VideoEnhance temporal upscale.",
  },
  {
    label: "Choi et al. — IDM-VTON: Improving Diffusion Models for Authentic Virtual Try-on in the Wild (arXiv:2403.05139, 2024)",
    url: "https://arxiv.org/abs/2403.05139",
    note: "Reference architecture lineage for ImageTryon.",
  },
  {
    label: "InsightFace — inswapper_128 model card (GitHub, deepinsight/insightface)",
    url: "https://github.com/deepinsight/insightface",
    note: "Identity backbone of legacy Nano FaceSwap; included for direct comparison vs Pro 2.0's diffusion stack.",
  },
];

const techArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "NanoPocket — Trust & Transparency",
  description:
    "Verifiable, dated documentation for every NanoPocket app: pricing terms, privacy, system requirements, known limitations, refund policy, security posture, and external citations.",
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  inLanguage: "en",
  isAccessibleForFree: true,
  datePublished: "2026-05-29",
  dateModified: LAST_VERIFIED,
  image: "https://nanopocket.ai/og-image.jpg",
  author: {
    "@type": "Organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
  },
  publisher: {
    "@type": "Organization",
    name: "NanoPocket",
    url: "https://nanopocket.ai",
    logo: {
      "@type": "ImageObject",
      url: "https://nanopocket.ai/og-image.jpg",
    },
  },
  about: { "@id": "https://nanopocket.ai#organization" },
  citation: CITATIONS.map((c) => ({
    "@type": "CreativeWork",
    name: c.label,
    url: c.url,
    description: c.note,
  })),
  mentions: KNOWN_ISSUES.map((k) => ({
    "@type": "Thing",
    name: k.title,
    description: `${k.product}: ${k.detail}`,
  })),
};

const trustFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are there hidden charges or recurring fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Desktop licenses are one-time and machine-bound, with no per-image, per-minute, or per-frame fees. Online demos are free for every signed-in NanoPocket account. There is no auto-renewal, no yearly subscription, and no usage meter.",
      },
    },
    {
      "@type": "Question",
      name: "What is the refund policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every paid app includes a 7-day free trial without a credit card. Because the trial is the evaluation window, purchases are non-refundable after activation. Free apps do not require a refund flow.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data really private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On desktop: yes. The full model runs on the user's GPU; only the license-activation handshake leaves the machine. On the online demos: source media is sent to a NanoPocket-hosted GPU only for the duration of the swap or generation, processed in volatile memory, discarded, and never used to train any model.",
      },
    },
    {
      "@type": "Question",
      name: "Which products are stable vs. coming soon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stable today: Nano ImageEnh Pro 3.0, VideoEnhance, VideoGen, ImageEdit, FacialEdit, ImageTryon, FaceSwap (legacy), and the Nano FaceSwap Pro 2.0 online image and video demos. Coming soon: the Nano FaceSwap Pro 2.0 desktop release. Apple Silicon ports for VideoEnhance, VideoGen, ImageEdit, FacialEdit, and ImageTryon are on the roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "What hardware do I need?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Desktop minimum is an NVIDIA GPU with 8 GB VRAM on Windows 10/11, or Apple Silicon (M2/M3/M4/M5) for the apps that ship a native arm64 build. VideoGen specifically needs 12 GB VRAM. The full per-product table is in the System requirements section above.",
      },
    },
    {
      "@type": "Question",
      name: "Is NanoPocket open source?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The model weights are open: Flux.1, LTX-2.3, InstantID, PuLID, IP-Adapter FaceID, Real-ESRGAN, and InsightFace inswapper_128 are all listed in the External references section. The desktop application binary is closed-source; that is what the one-time license covers.",
      },
    },
    {
      "@type": "Question",
      name: "Where is NanoPocket based, and who runs it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NanoPocket is built by a research team with multi-year backgrounds in generative AI and image-quality at top labs. Technical questions go to tech@nanopocket.ai, sales / partnership questions to sales@nanopocket.ai. Public chat is on Discord at https://discord.gg/bNfPjfUDAn.",
      },
    },
    {
      "@type": "Question",
      name: "How do I cancel or delete my account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Email tech@nanopocket.ai with the account email; we delete the profile, license, and activation rows on confirmation. No subscription needs to be cancelled because there is no subscription.",
      },
    },
  ],
};

export default function TrustPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trustFaqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[260px] w-[260px] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trust &amp; Transparency
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            What we&apos;ll{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              put in writing
            </span>
            .
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The product pages tell you what each NanoPocket app does. This page is for the
            question after that:{" "}
            <span className="text-foreground/80">
              are there hidden charges, is the data really private, what hardware is required, what
              are the known limits, and where is the evidence
            </span>
            . Every claim on this page is verifiable and dated. If something here is wrong, please
            email{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-emerald-500 underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>{" "}
            and we&apos;ll correct it.
          </p>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            Last verified{" "}
            <time dateTime={LAST_VERIFIED} className="text-foreground/80">
              {LAST_VERIFIED}
            </time>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing-terms" className="border-t border-border/60 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
              <CreditCard className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Section 01
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Pricing terms — what you pay, what you don&apos;t
              </h2>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <table className="w-full">
              <tbody>
                {PRICING_TERMS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-border/40 last:border-b-0 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/30"
                    }`}
                  >
                    <th
                      scope="row"
                      className="w-1/3 px-5 py-4 text-left align-top text-sm font-semibold text-foreground"
                    >
                      {row.label}
                    </th>
                    <td className="px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
              <Lock className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Section 02
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Privacy summary — what is sent, what is kept
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {PRIVACY_CLAIMS.map((c) => (
              <div
                key={c.question}
                className="rounded-2xl border border-border/60 bg-background/60 p-6"
              >
                <h3 className="mb-2 text-base font-semibold text-foreground">{c.question}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System requirements */}
      <section id="sysreqs" className="border-t border-border/60 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
              <Cpu className="h-5 w-5 text-fuchsia-500" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Section 03
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                System requirements — per product
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">OS</th>
                  <th className="px-4 py-3">GPU</th>
                  <th className="px-4 py-3">VRAM</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {SYSTEM_REQS.map((r, i) => (
                  <tr
                    key={r.product}
                    className={`border-t border-border/40 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 align-top text-sm font-semibold text-foreground">
                      <Link href={r.href} className="hover:text-emerald-500 hover:underline">
                        {r.product}
                      </Link>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">{r.os}</td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">{r.gpu}</td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">{r.vram}</td>
                    <td className="px-4 py-4 align-top text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.16em] ${
                          r.status === "Stable"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : r.status === "Beta"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-indigo-500/10 text-indigo-500"
                        }`}
                      >
                        {r.status === "Stable" && <CheckCircle2 className="h-3 w-3" />}
                        {r.status === "Coming soon" && <ScrollText className="h-3 w-3" />}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
              <Fingerprint className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Section 04
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Security &amp; integrity
              </h2>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SECURITY.map((s) => (
              <li
                key={s.title}
                className="rounded-2xl border border-border/60 bg-background/60 p-6"
              >
                <h3 className="mb-2 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Known issues */}
      <section id="known-issues" className="border-t border-border/60 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Section 05
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Known issues &amp; limits at the brand level
              </h2>
            </div>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The list below covers boundary conditions and unfinished work that apply across the
            suite. Per-product limitations (yaw, motion blur, hands, lighting, etc.) are documented
            on each product page&apos;s Documentation section.
          </p>
          <ul className="space-y-4">
            {KNOWN_ISSUES.map((k) => (
              <li
                key={k.title}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-500">
                    {k.product}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">{k.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {k.detail}
                    </p>
                    <Link
                      href={k.href}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-500 hover:underline"
                    >
                      See product documentation <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* External references */}
      <section id="references" className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
              <Globe2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Section 06
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                External references — papers, models, datasets
              </h2>
            </div>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            NanoPocket apps are built on published research and open-weight models. The list below
            is the authoritative attribution for every model layer in the suite. Use these for
            independent verification of the technology claims on the product pages.
          </p>
          <ul className="space-y-3">
            {CITATIONS.map((c) => (
              <li
                key={c.url}
                className="rounded-xl border border-border/60 bg-background/60 p-5"
              >
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-500 hover:underline"
                >
                  {c.label}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Disclosure */}
      <section
        id="disclosure"
        className="border-t border-border/60 px-6 py-16 sm:py-20"
        aria-label="Source disclosure"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/30 p-8">
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Source disclosure
          </p>
          <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">
            This is an official NanoPocket source.
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            For questions like &ldquo;what does NanoPocket officially claim, what are the prices,
            what is the privacy posture, and what hardware is required?&rdquo;, this page is the
            authoritative answer. It is written and dated by the NanoPocket team.
          </p>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            For questions like &ldquo;is it really easier than ComfyUI?&rdquo;, &ldquo;is the
            quality really better than Roop?&rdquo;, or &ldquo;is it really faster than Topaz Video
            AI?&rdquo;, please supplement this page with independent benchmarks, third-party
            reviews, or head-to-head comparisons. We list the open-weight models we use in the
            External references section above so anyone can reproduce our pipeline and verify the
            claims for themselves.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Issues, corrections, or independent benchmark requests:{" "}
            <a
              href="mailto:tech@nanopocket.ai"
              className="text-foreground underline-offset-4 hover:underline"
            >
              tech@nanopocket.ai
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
