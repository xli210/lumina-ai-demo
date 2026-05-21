import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";
import { FACESWAP_PRO_DEMO_URL } from "./features/feature-rows";

export const metadata: Metadata = {
  title:
    "Nano FaceSwap Pro 2.0 — Free Online Diffusion Face Swap, 100% Local Desktop",
  description:
    "Nano FaceSwap Pro 2.0 is a diffusion-based face swap with a free online demo and a 100% local desktop pipeline. Built on InstantID, PuLID, and IP-Adapter FaceID research; preserves accessories, runs at full input resolution, and ships with a virtual identity library.",
  keywords: [
    "Nano FaceSwap Pro 2.0",
    "free online face swap",
    "diffusion face swap",
    "local face swap",
    "InstantID face swap",
    "PuLID face swap",
    "IP-Adapter FaceID",
    "Roop alternative",
    "FaceFusion alternative",
    "Rope alternative",
    "DeepSwap alternative",
    "Akool alternative",
    "HeyGen face swap alternative",
    "private face swap",
    "GPU face swap",
  ],
  alternates: { canonical: "/apps/nano-faceswap-pro" },
  openGraph: {
    title: "Nano FaceSwap Pro 2.0 — Free Online Diffusion Face Swap",
    description:
      "Diffusion face swap with free online demo and 100% local desktop pipeline. Built on InstantID, PuLID, and IP-Adapter FaceID research. A private alternative to Roop, FaceFusion, Rope, DeepSwap, and Akool.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano FaceSwap Pro 2.0 — Free Online Diffusion Face Swap",
    description:
      "Diffusion-based face swap that runs in your browser for testing and on your GPU for production.",
  },
};

const data: ProductLandingData = {
  slug: "nano-faceswap-pro",
  productMeta: {
    sku: "NPK-FSP-200",
    mpn: "NPK-FSP-200",
    brand: "NanoPocket",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro",
    image: "https://nanopocket.ai/og-image.jpg",
    category: "Local AI Face Swap (Image & Video)",
    applicationCategory: "MultimediaApplication",
    operatingSystem:
      "Web (online demo); Windows 10/11; macOS Apple Silicon (M2/M3/M4/M5)",
    softwareVersion: "2.0",
    releaseDate: "2026-05-14",
    description:
      "Nano FaceSwap Pro 2.0 — diffusion-based AI face swap with a free online demo and a 100% local desktop pipeline. Built on InstantID, PuLID, and IP-Adapter FaceID research. A private alternative to Roop, FaceFusion, Rope, DeepSwap, Akool, and HeyGen.",
    offer: {
      price: "0.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2027-12-31",
    },
    additionalProperties: [
      { name: "Identity model", value: "InstantID + PuLID + IP-Adapter FaceID diffusion stack" },
      { name: "Maximum output resolution", value: "Up to 4K (input-preserving)" },
      { name: "Modes", value: "Face-only swap, Full-head swap" },
      { name: "Mask control", value: "Per-region toggles (hair, clothing, apparel, accessories)" },
      { name: "Magic pen", value: "Brush-level region restoration" },
      { name: "Reference library", value: "Built-in royalty-free virtual identity library" },
      { name: "Online demo", value: "Free for every signed-in NanoPocket account" },
      { name: "Desktop GPU support", value: "NVIDIA CUDA (Windows) + Apple Silicon Metal (macOS)" },
      { name: "Minimum desktop VRAM", value: "8 GB", unitText: "GB" },
      { name: "License", value: "One-time, machine-bound; no per-minute or per-frame fees" },
      { name: "Data handling", value: "100% local on desktop; no source upload; no model training on user data" },
    ],
  },
  hero: {
    eyebrow: "Free online · Diffusion face swap",
    versionChip: "v2.0",
    title: "Nano FaceSwap",
    titleAccent: "Pro 2.0",
    lead: "Nano FaceSwap Pro 2.0 is a diffusion-based face swap that runs in your browser for free testing and on a local NVIDIA or Apple Silicon GPU for production, preserving the input resolution and every accessory in the frame.",
    parameters: [
      { value: "Up to 4K", label: "Output keeps the input resolution" },
      {
        value: "InstantID + PuLID",
        label: "Diffusion identity stack (with IP-Adapter FaceID)",
      },
      {
        value: "Free online + local",
        label: "Browser demo · NVIDIA CUDA · Apple Silicon Metal",
      },
    ],
    primaryCta: {
      label: "Try free online",
      href: FACESWAP_PRO_DEMO_URL,
      external: true,
    },
    secondaryCta: {
      label: "See all features",
      href: "/apps/nano-faceswap-pro/features",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Free online demo" },
    { label: "100% local on the desktop" },
    { label: "InstantID / PuLID / IP-Adapter FaceID research" },
    { label: "No cloud upload required" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Diffusion identity stack",
      title: "A diffusion pipeline, not an inswapper_128 GAN.",
      lead: "The identity head is a diffusion model trained on top of InstantID, PuLID, IP-Adapter FaceID, and PhotoMaker research, which produces native high-resolution output and preserves skin texture without the 128-pixel bottleneck used by Roop, FaceFusion, Rope, and Reactor.",
      bullets: [
        "Native high-resolution diffusion output — no 128×128 upsample step",
        "Identity preservation across lighting and exposure changes",
        "Skin texture, pores, and specular highlights kept intact",
        "Built on published research (InstantID, PuLID, IP-Adapter FaceID, PhotoMaker)",
      ],
      hint: "Diffusion identity head · 1024+ pixel native",
    },
    {
      index: "02",
      eyebrow: "Free online demo",
      title: "Try every signed-in account, free.",
      lead: "The Image FaceSwap Pro and Video FaceSwap Pro online demos are open to every signed-in NanoPocket account at no cost; no credit card, no per-minute charge, no watermark on test outputs.",
      bullets: [
        "Image and video face swap demos available in the browser",
        "No credit card and no per-minute fees",
        "Test outputs are watermark-free",
        "Demo runs on NanoPocket-hosted GPUs, not the user's machine",
      ],
      hint: "Free for signed-in users",
    },
    {
      index: "03",
      eyebrow: "Local desktop (Pro)",
      title: "Same model, on your hardware.",
      lead: "The desktop release runs the full diffusion pipeline locally on a single GPU — NVIDIA CUDA on Windows or Apple Silicon Metal on macOS — so source photos and videos never leave the user's machine.",
      bullets: [
        "Single-GPU local inference on Windows 10/11 (NVIDIA CUDA)",
        "Apple Silicon (M2, M3, M4, M5) Metal acceleration on macOS",
        "Source media stays on the local disk",
        "One-time license, no per-minute or per-frame fees",
      ],
      hint: "100% local · GDPR-friendly",
    },
    {
      index: "04",
      eyebrow: "Two modes",
      title: "Face only or full head, one toggle.",
      lead: "A single mode toggle decides whether identity transfer is restricted to the face region or extended to the whole head — including hair, hairline, and jawline — without re-uploading or reconfiguring the job.",
      bullets: [
        "Face-only mode: original hair, ears, and head shape preserved",
        "Full-head mode: hair and jawline transferred from reference",
        "Mode switch is per image, no re-upload required",
      ],
      hint: "Single toggle · per-image control",
    },
    {
      index: "05",
      eyebrow: "Mask control",
      title: "Accessories survive the swap.",
      lead: "A panel of region toggles (hair, clothing, apparel, lower lip, accessories) tells the diffusion swap which pixels to leave alone, so jewelry, hats, glasses, and makeup brushes that cross the face region remain in the output.",
      bullets: [
        "Per-region preservation (hair, clothing, apparel, accessories)",
        "Toggle once, applied to every face in the image",
        "Works with the magic pen for pixel-level brush correction",
      ],
      hint: "Region-level mask + magic pen",
    },
    {
      index: "06",
      eyebrow: "Virtual identity library",
      title: "License-free reference faces, in-app.",
      lead: "Every desktop release ships with an in-app gallery of synthetic identities — gender- and ethnicity-balanced, royalty-free, and usable with no third-party model release — so creative briefs can be matched without uploading an external photo.",
      bullets: [
        "Hundreds of curated synthetic reference identities",
        "Gender- and ethnicity-balanced for casting",
        "Royalty-free for personal and commercial work",
        "Test the tool privately without uploading anyone's photo",
      ],
      hint: "Royalty-free · in-app gallery",
    },
  ],
  faqs: [
    {
      q: "Is it really free to try?",
      a: "Yes. Both the Image FaceSwap Pro and Video FaceSwap Pro online demos are free for every signed-in NanoPocket account — no credit card, no watermark on test outputs, and no per-minute charge. The desktop Pro 2.0 app launches with a free trial at release.",
    },
    {
      q: "How is this different from Roop, FaceFusion, or Rope?",
      a: "Roop, Roop-Unleashed, FaceFusion, Rope, Rope-Live, Reactor, and Deep-Live-Cam all wrap the InsightFace inswapper_128 GAN, which renders identity at 128×128 and then upscales. Nano FaceSwap Pro 2.0 uses a native high-resolution diffusion identity stack (InstantID, PuLID, IP-Adapter FaceID), so identity is rendered at the input resolution and skin detail is preserved without an upscaling step.",
    },
    {
      q: "Will my photos get uploaded to your server?",
      a: "On the desktop release, no — every frame is processed on the user's local GPU and source media stays on disk. On the free online demo, the source file is sent to a NanoPocket-hosted GPU only for the duration of the swap and is not used for any model training.",
    },
    {
      q: "Can I use this for commercial / client work?",
      a: "Yes. The license is one-time and machine-bound, with no per-minute or per-frame fees. Outputs can be used in commercial work — marketing campaigns, film VFX, social ads — under the standard Terms of Use. Bundled identity references are royalty-free.",
    },
    {
      q: "Will it work on my Mac?",
      a: "Yes, on Apple Silicon (M2, M3, M4, M5). The desktop release ships a native arm64 build that runs on Metal with no Rosetta translation. Intel Macs are not supported.",
    },
    {
      q: "What hardware do I need on Windows?",
      a: "An NVIDIA GPU with 8 GB or more of VRAM, on Windows 10 or 11. RTX 30 / 40 / 50-series cards are tested; cards with more VRAM produce longer video clips at higher resolution.",
    },
    {
      q: "When does the desktop app come out?",
      a: "The Nano FaceSwap Pro 2.0 desktop release ships shortly after the public feature tour goes live. The online demos at /apps/nano-faceswap-pro and /apps/nano-faceswap-pro/video are available today; current signed-in accounts get free access to both.",
    },
  ],
  closing: {
    title: "Try Nano FaceSwap Pro 2.0 in your browser.",
    body: "Free online demos for both Image FaceSwap Pro and Video FaceSwap Pro are open to every signed-in NanoPocket account. The full Nano FaceSwap Pro 2.0 desktop app — virtual identity library, expression editor, and benchmark gallery — launches soon.",
    primaryCta: {
      label: "Try free online",
      href: FACESWAP_PRO_DEMO_URL,
      external: true,
    },
    secondaryCta: {
      label: "Desktop app coming soon",
      href: "#",
      disabled: true,
      variant: "secondary",
    },
  },
};

export default function NanoFaceSwapProPage() {
  return <ProductLandingShell data={data} />;
}
