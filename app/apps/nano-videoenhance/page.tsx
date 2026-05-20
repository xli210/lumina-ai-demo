import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano VideoEnhance — Local AI Video Upscaler with NVIDIA GPU Acceleration",
  description:
    "Nano VideoEnhance is a local desktop AI video upscaler and enhancer that runs on a single NVIDIA GPU. It removes color-bleeding artifacts, ships a side-by-side comparison view, and processes footage offline with no per-minute fees and no cloud upload.",
  keywords: [
    "Nano VideoEnhance",
    "AI video upscaler",
    "local video upscaler",
    "AI video enhancer",
    "NVIDIA GPU video upscaler",
    "Topaz Video AI alternative",
    "Topaz Labs alternative",
    "video upscale 4K",
    "video upscale offline",
    "remove color bleeding video",
    "video deinterlacer AI",
    "video enhancement no cloud",
  ],
  alternates: { canonical: "/apps/nano-videoenhance" },
  openGraph: {
    title: "Nano VideoEnhance — Local AI Video Upscaler",
    description:
      "Local AI video upscaler running on a single NVIDIA GPU. No per-minute fees, no cloud upload, side-by-side compare view.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-videoenhance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano VideoEnhance — Local AI Video Upscaler",
    description:
      "Local NVIDIA-accelerated video upscaling and enhancement. No per-minute fees, no cloud upload.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano VideoEnhance",
  softwareVersion: "1.0.5",
  operatingSystem: "Windows 10/11",
  applicationCategory: "MultimediaApplication",
  description:
    "Local AI video upscaler and enhancer with side-by-side comparison view. Runs on a single NVIDIA GPU. Source video never uploaded.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
};

const data: ProductLandingData = {
  slug: "nano-videoenhance",
  hero: {
    eyebrow: "AI Video Enhancement",
    versionChip: "v1.0.5",
    title: "Nano",
    titleAccent: "VideoEnhance",
    lead: "Nano VideoEnhance is a local desktop AI video upscaler that runs on a single NVIDIA GPU on Windows, removes color-bleeding and chroma artifacts, and writes upscaled output to disk with a side-by-side comparison view — no per-minute fees, no cloud upload, and no external SaaS subscription.",
    parameters: [
      { value: "NVIDIA CUDA", label: "Single-GPU local inference" },
      { value: "Side-by-side", label: "In-app before/after compare view" },
      { value: "No per-minute fees", label: "One-time license · offline" },
    ],
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-videoenhance",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Single-GPU NVIDIA CUDA" },
    { label: "100% local · no upload" },
    { label: "One-time license" },
    { label: "Side-by-side compare view" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Local NVIDIA pipeline",
      title: "One GPU, full pipeline.",
      lead: "Nano VideoEnhance runs the full upscale pipeline on a single NVIDIA GPU on Windows 10 or 11, with optimised throughput on consumer cards (RTX 30 / 40 / 50 series) and no requirement for a multi-GPU rig or external render farm.",
      bullets: [
        "Single-GPU local inference (CUDA)",
        "Optimised for RTX 30 / 40 / 50 cards",
        "No multi-GPU or render-farm setup required",
        "Offline operation — no internet during inference",
      ],
      hint: "Single GPU · Windows 10/11",
    },
    {
      index: "02",
      eyebrow: "Color-bleeding fix",
      title: "Stable chroma across frames.",
      lead: "The v1.0.4 release introduced a chroma-stability fix that removed the color-bleeding artifacts seen on saturated areas — red signage, neon, lit edges — restoring the original chroma channel without smearing into adjacent regions.",
      bullets: [
        "Chroma-stability fix for saturated regions",
        "No bleeding on red signage, neon, and lit edges",
        "Original color channel preserved across frames",
        "Verifiable in the side-by-side compare view",
      ],
      hint: "Chroma fix · v1.0.4",
    },
    {
      index: "03",
      eyebrow: "Compare view",
      title: "Friendly before/after, in-app.",
      lead: "A side-by-side compare view ships inside the app so the user can verify the upscale and chroma fix on each clip before exporting, with a wipe slider, frame-step controls, and synchronised playback between the source and enhanced streams.",
      bullets: [
        "Side-by-side wipe slider",
        "Synchronised source / enhanced playback",
        "Frame-step controls for spot inspection",
        "Verify the fix before committing the export",
      ],
      hint: "In-app compare · wipe slider",
    },
    {
      index: "04",
      eyebrow: "Stabilization & denoise",
      title: "Cleaner motion, less grain.",
      lead: "Optional stabilization and denoise stages run in the same pipeline, so a noisy hand-held clip can be upscaled, stabilized, and denoised in a single pass without round-tripping through DaVinci Resolve, Premiere, or After Effects.",
      bullets: [
        "Single-pass upscale + stabilize + denoise",
        "No round-trip through Resolve / Premiere / After Effects",
        "Tuned for hand-held and low-light footage",
        "Optional toggles per clip",
      ],
      hint: "One-pass enhancement",
    },
    {
      index: "05",
      eyebrow: "Privacy & ownership",
      title: "Footage never leaves your disk.",
      lead: "Source video stays on the user's local drive. The application performs no cloud upload, no proxy generation on a remote server, and no telemetry on clip content. Output rights are retained 100% by the user.",
      bullets: [
        "No cloud upload of source footage",
        "No remote proxy generation",
        "No content-level telemetry",
        "User retains full output rights",
      ],
      hint: "Local-only · GDPR-friendly",
    },
    {
      index: "06",
      eyebrow: "How it compares",
      title: "Topaz Video AI workflow, no per-minute charge.",
      lead: "Topaz Video AI is the long-time benchmark for local video upscaling and runs locally with a paid license. Cloud platforms like AVCLabs and HitPaw charge per minute. Nano VideoEnhance runs locally on a single NVIDIA GPU with a one-time license and bundles the chroma fix, stabilization, and the compare view in one Windows install.",
      bullets: [
        "Local processing on a single license",
        "No per-minute or per-frame charges",
        "Chroma fix verifiable in the compare view",
        "Single Windows installer, no plugin chain",
      ],
      hint: "vs Topaz Video AI · vs AVCLabs",
    },
  ],
  faqs: [
    {
      q: "What hardware does Nano VideoEnhance need?",
      a: "Windows 10 or 11 with an NVIDIA GPU. The pipeline is optimized for RTX 30, 40, and 50 series cards. The application runs on a single GPU and does not require a multi-GPU rig or remote render farm.",
    },
    {
      q: "Does it support macOS or Apple Silicon?",
      a: "Not in v1.0.5. The current build is Windows + NVIDIA CUDA. Apple Silicon support is on the roadmap and shares the model architecture with the macOS-native Nano ImageEnh Pro 3.0 release.",
    },
    {
      q: "How is this different from Topaz Video AI?",
      a: "Topaz Video AI is the long-running benchmark for local video upscaling and is sold as a paid app with optional cloud credits. Nano VideoEnhance runs locally on a single NVIDIA GPU with a one-time license, ships a chroma-bleeding fix verifiable in the in-app compare view, and bundles upscale, stabilization, and denoise in a single pass with no per-minute charge.",
    },
    {
      q: "Does the source video leave my machine?",
      a: "No. Source footage stays on the local disk; there is no cloud upload, no remote proxy generation, and no content-level telemetry. Network is contacted only for license activation.",
    },
    {
      q: "What changed in v1.0.4?",
      a: "v1.0.4 brought three named changes: optimized processing speed on NVIDIA GPUs, a fix for color-bleeding artifacts in saturated regions, and the new side-by-side comparison view. v1.0.5 followed with stability and performance improvements.",
    },
  ],
  closing: {
    title: "Install Nano VideoEnhance.",
    body: "Single-GPU NVIDIA CUDA, chroma-stable upscale, in-app compare view, one-time license. Footage stays on your disk.",
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-videoenhance",
      variant: "secondary",
    },
  },
};

export default function NanoVideoEnhancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <ProductLandingShell data={data} />
    </>
  );
}
