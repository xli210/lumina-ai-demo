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

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano ImageEnh Pro 3.0",
  softwareVersion: "3.0",
  operatingSystem: "Windows 10/11, macOS Apple Silicon (M2/M3/M4/M5)",
  applicationCategory: "MultimediaApplication",
  description:
    "Local AI image upscaler and enhancer with batch processing, crop, and AI background matting. Runs on NVIDIA CUDA on Windows and Apple Silicon Metal on macOS.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
};

const data: ProductLandingData = {
  slug: "nano-imageenh-pro",
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
      q: "What hardware does Nano ImageEnh Pro 3.0 require?",
      a: "Windows 10 or 11 with an NVIDIA GPU (8 GB+ VRAM recommended), or macOS on Apple Silicon (M2, M3, M4, or M5) with 16 GB+ unified memory recommended. Intel Macs are not supported in the v3.0 native build.",
    },
    {
      q: "Does it run locally or in the cloud?",
      a: "Locally. Every operation — upscale, denoise, matting, crop — runs on the user's GPU. Source photos are not uploaded or retained on any server. The only network traffic is a one-time license-activation handshake.",
    },
    {
      q: "How is this different from Topaz Photo AI or Magnific?",
      a: "Topaz Photo AI runs locally and charges per app or per cloud credit; Magnific and Let's Enhance are cloud-only and charge per generation. Nano ImageEnh Pro 3.0 runs locally on Windows and macOS with a single license, ships native Apple Silicon support, and bundles batch processing, crop, and AI background matting in one Electron app with no per-image charge.",
    },
    {
      q: "Can I batch-process an entire folder?",
      a: "Yes. The batch pipeline accepts a single image or a complete directory of source images. The selected upscale model is applied to the whole batch, output is written to a separate user-chosen folder, and a per-file progress view supports cancellation mid-run.",
    },
    {
      q: "Is there a free trial?",
      a: "The original Nano ImageEnh ships with a 7-day free trial that carries forward into Pro 3.0 for new accounts. Existing licensees receive the v3.0 upgrade as part of the same product license.",
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
