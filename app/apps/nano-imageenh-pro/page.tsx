import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano ImageEnh Pro 3.0 — Local AI Image Upscaler for Windows & Apple Silicon",
  description:
    "Nano ImageEnh Pro 3.0 is a local desktop AI image upscaler and enhancer for Windows (NVIDIA CUDA) and Apple Silicon (M2–M5). It batch-processes folders, supports crop and AI background matting, and runs every operation on the user's GPU with no cloud upload.",
  keywords: [
    "Nano ImageEnh Pro 3.0",
    "local AI image upscaler",
    "AI image enhancer Mac",
    "Apple Silicon image AI",
    "M2 M3 M4 M5 image upscaler",
    "batch image upscaler",
    "AI background matting",
    "AI photo enhancer Windows",
    "Topaz Photo AI alternative",
    "Magnific AI alternative",
    "Gigapixel AI alternative",
    "image enhancer no cloud",
  ],
  alternates: { canonical: "/apps/nano-imageenh-pro" },
  openGraph: {
    title: "Nano ImageEnh Pro 3.0 — Local AI Image Upscaler",
    description:
      "Local AI image upscaling and enhancement for Windows and Apple Silicon. Batch folders, crop, AI background matting — all on the user's GPU.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-imageenh-pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano ImageEnh Pro 3.0 — Local AI Image Upscaler",
    description:
      "Local AI image upscaler and enhancer. Native Apple Silicon (M2–M5) and NVIDIA CUDA. Batch folders, crop, background matting.",
  },
};

const data: ProductLandingData = {
  slug: "nano-imageenh-pro",
  productMeta: {
    sku: "NPK-IEN-300",
    mpn: "NPK-IEN-300",
    brand: "NanoPocket",
    url: "https://nanopocket.ai/apps/nano-imageenh-pro",
    image: "https://nanopocket.ai/og-image.jpg",
    category: "Local AI Image Upscaler & Enhancer",
    applicationCategory: "MultimediaApplication",
    operatingSystem:
      "Windows 10/11 (NVIDIA CUDA); macOS Apple Silicon (M2/M3/M4/M5, Metal)",
    softwareVersion: "3.0",
    releaseDate: "2026-04-22",
    description:
      "Nano ImageEnh Pro 3.0 — local AI image upscaler and enhancer for Windows (NVIDIA CUDA) and Apple Silicon (M2–M5, Metal). Native arm64 build, batch folder processing, AI background matting, crop. All inference on the user's GPU. A local alternative to Topaz Photo AI, Gigapixel AI, Magnific, and Let's Enhance.",
    offer: {
      price: "0.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2027-12-31",
    },
    additionalProperties: [
      { name: "Apple Silicon support", value: "Native arm64 build for M2, M3, M4, M5 (Metal, no Rosetta)" },
      { name: "Windows GPU support", value: "NVIDIA CUDA, 8 GB VRAM minimum" },
      { name: "Batch processing", value: "Single image or full directory" },
      { name: "AI background matting", value: "Transparent PNG cutouts, alpha-clean edges" },
      { name: "Crop tool", value: "Pre-upscale crop with aspect-ratio presets" },
      { name: "UI runtime", value: "Electron desktop UI" },
      { name: "Data handling", value: "100% local; no upload, no server-side retention" },
      { name: "Network requirement", value: "Only for one-time license activation" },
      { name: "Bundled models", value: "Upscale, denoise, restoration, matting" },
      { name: "License model", value: "One-time, machine-bound; covers Windows + macOS" },
    ],
  },
  hero: {
    eyebrow: "AI Image Enhancement",
    versionChip: "v3.0",
    title: "Nano ImageEnh",
    titleAccent: "Pro 3.0",
    lead: "Nano ImageEnh Pro 3.0 is a local AI image upscaler and enhancer that runs on NVIDIA CUDA on Windows and Apple Silicon Metal on macOS, batch-processes entire folders, and produces upscaled output, transparent-background cutouts, and cropped exports without uploading any photo to the cloud.",
    parameters: [
      { value: "Native M2–M5", label: "Apple Silicon Metal acceleration" },
      { value: "Batch folders", label: "Drop a directory and run" },
      { value: "Local-only", label: "No upload · no cloud retention" },
    ],
    primaryCta: { label: "Download for Windows & macOS", href: "/download" },
    secondaryCta: {
      label: "Read the v3.0 release notes",
      href: "/release-notes/nano-imageenh",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Apple Silicon (M2, M3, M4, M5)" },
    { label: "Windows 10/11 NVIDIA CUDA" },
    { label: "100% local, no cloud upload" },
    { label: "Electron desktop UI" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Native Apple Silicon",
      title: "M2 to M5, on Metal.",
      lead: "Nano ImageEnh Pro 3.0 runs natively on Apple Silicon — M2, M3, M4, and M5 — using Metal acceleration on the unified memory architecture, with no Rosetta translation step and no required NVIDIA hardware.",
      bullets: [
        "Native arm64 build for M2, M3, M4, and M5 Macs",
        "Metal acceleration on unified memory",
        "No Rosetta, no x86 emulation",
        "Same model weights as the Windows build",
      ],
      hint: "Native macOS · M2–M5",
    },
    {
      index: "02",
      eyebrow: "Batch processing",
      title: "Drop a folder, walk away.",
      lead: "The batch pipeline accepts a single image or a complete directory of source images, processes every file with the selected upscale model, and writes results to a chosen output folder — no per-file interaction, no GUI loop, no manual reshoots.",
      bullets: [
        "Single-image and folder-level batch input",
        "One upscale model selection applied to the whole batch",
        "Output written to a separate user-chosen folder",
        "Progress visible per file with cancel control",
      ],
      hint: "One folder in · one folder out",
    },
    {
      index: "03",
      eyebrow: "AI background matting",
      title: "Transparent PNG cutouts, in one click.",
      lead: "An AI background matting model produces transparent PNG cutouts for product photography, marketplace listings, and design composites — running on the same local GPU as the upscaler with no manual masking, no green screen, and no cloud upload.",
      bullets: [
        "Single-click foreground extraction",
        "Transparent PNG export with clean alpha edges",
        "Works on portraits, products, and arbitrary subjects",
        "No green screen and no manual masking required",
      ],
      hint: "Transparent PNG · alpha-clean",
    },
    {
      index: "04",
      eyebrow: "Crop tool",
      title: "Precision crop with the upscale.",
      lead: "A high-precision crop tool sits inside the same desktop app, so a source image can be tightened to a region of interest before the upscale model runs, with no Photoshop round-trip required.",
      bullets: [
        "High-precision selection grid",
        "Pre-upscale crop pipeline",
        "Aspect-ratio presets for prints, posters, and social",
        "No external editor required",
      ],
      hint: "Crop in · upscale out",
    },
    {
      index: "05",
      eyebrow: "Local inference",
      title: "Photos never leave the machine.",
      lead: "Every model — upscale, denoise, restoration, matting — runs on the user's GPU. Source photos are not uploaded, not retained server-side, and not used to train any model; the network is only contacted for license activation.",
      bullets: [
        "All inference local on the user's GPU",
        "Source photos never uploaded",
        "No server-side retention, ever",
        "Network used only for license activation",
      ],
      hint: "Local-only · GDPR-friendly",
    },
    {
      index: "06",
      eyebrow: "How it compares",
      title: "Topaz Photo AI workflow, locally.",
      lead: "Topaz Photo AI and Gigapixel AI run locally and are paid per app; cloud platforms like Magnific and Let's Enhance run server-side and charge per credit. Nano ImageEnh Pro 3.0 runs locally on Windows and macOS with a single license, native Apple Silicon support, and no per-image charge.",
      bullets: [
        "Local processing on a single license",
        "Native Apple Silicon, not just Intel-Mac translation",
        "No per-credit or per-image charges",
        "Bundled batch + crop + matting in one app",
      ],
      hint: "vs Topaz Photo AI · vs Magnific",
    },
  ],
  faqs: [
    {
      q: "Will it run on my M2 (or M3 / M4 / M5) MacBook?",
      a: "Yes. The v3.0 release ships a native arm64 build that runs on Apple Silicon using Metal acceleration on the unified memory architecture. M2, M3, M4, and M5 are all supported. Intel Macs are not supported.",
    },
    {
      q: "What about Windows — do I need an NVIDIA card?",
      a: "Yes. On Windows 10/11 the upscale, denoise, and matting models run on NVIDIA CUDA. 8 GB of VRAM is the recommended minimum; RTX 30 / 40 / 50-series cards are tested.",
    },
    {
      q: "Can I batch-process a whole folder of photos?",
      a: "Yes. Point the batch pipeline at a directory of source images, pick one upscale model, and the app writes every result to a separate user-chosen output folder. There is a per-file progress view with a cancel button mid-run.",
    },
    {
      q: "Do my photos get uploaded to your server?",
      a: "No. Every operation — upscale, denoise, restoration, matting, crop — runs on the user's GPU. Source photos are never uploaded and never retained server-side. The only network traffic is a one-time license-activation handshake.",
    },
    {
      q: "How is this different from Topaz Photo AI, Gigapixel, or Magnific?",
      a: "Topaz Photo AI and Gigapixel AI run locally but split features across multiple paid apps. Magnific and Let's Enhance run server-side and charge per generation. Nano ImageEnh Pro 3.0 bundles upscale + denoise + crop + AI background matting + batch into one local app, with a single license that covers Windows and macOS, and no per-image charge.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes. The original Nano ImageEnh ships with a 7-day free trial that carries forward into Pro 3.0 for new accounts. Existing licensees get the v3.0 upgrade as part of the same product license — no re-purchase.",
    },
    {
      q: "Can I use the output for client / commercial work?",
      a: "Yes. The license is one-time and machine-bound, with no per-image fees. Upscaled photos, transparent PNG cutouts, and crops can be used in commercial deliverables — e-commerce listings, prints, posters, marketing — under the standard Terms of Use.",
    },
  ],
  closing: {
    title: "Install Nano ImageEnh Pro 3.0.",
    body: "Native Apple Silicon, batch folders, AI background matting, and a single license that covers Windows and macOS. Photos never leave your machine.",
    primaryCta: { label: "Download for Windows & macOS", href: "/download" },
    secondaryCta: {
      label: "Read the v3.0 release notes",
      href: "/release-notes/nano-imageenh",
      variant: "secondary",
    },
  },
};

export default function NanoImageEnhProPage() {
  return <ProductLandingShell data={data} />;
}
