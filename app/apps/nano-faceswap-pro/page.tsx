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

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano FaceSwap Pro 2.0",
  softwareVersion: "2.0",
  operatingSystem: "Web (online demo) · Windows 10/11 · macOS Apple Silicon",
  applicationCategory: "MultimediaApplication",
  description:
    "Diffusion-based face swap for images and video, built on InstantID, PuLID, and IP-Adapter FaceID research. Free online demo plus a 100% local desktop pipeline.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
};

const data: ProductLandingData = {
  slug: "nano-faceswap-pro",
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
      q: "Is Nano FaceSwap Pro 2.0 really free?",
      a: "Yes. The Image FaceSwap Pro and Video FaceSwap Pro online demos are free for every signed-in NanoPocket account, with no credit card and no watermark on test outputs. The Nano FaceSwap Pro 2.0 desktop app launches with a free trial at release.",
    },
    {
      q: "How does Nano FaceSwap Pro 2.0 differ from Roop, FaceFusion, and Rope?",
      a: "Roop, Roop-Unleashed, FaceFusion, Rope, Rope-Live, Reactor, and Deep-Live-Cam share the InsightFace inswapper_128 GAN, which produces 128×128 identity output and then upscales. Nano FaceSwap Pro 2.0 uses a native high-resolution diffusion pipeline derived from InstantID, PuLID, and IP-Adapter FaceID research, so identity output stays at the input resolution and skin detail is preserved without an upscaling step.",
    },
    {
      q: "Does Nano FaceSwap Pro 2.0 run locally?",
      a: "Yes. The desktop release runs the full diffusion pipeline on a single local GPU — NVIDIA CUDA on Windows 10/11 or Apple Silicon Metal on macOS (M2, M3, M4, M5). Source photos and videos remain on the user's machine. The free online demo is hosted by NanoPocket for in-browser testing.",
    },
    {
      q: "Is this a DeepSwap, Akool, or HeyGen alternative?",
      a: "DeepSwap, Akool, HeyGen, DeepBrain, and Reface are cloud services that upload media to their servers and charge per minute. Nano FaceSwap Pro 2.0 runs in the user's browser for free testing or on the user's local GPU for production, with a one-time license and no per-minute fees.",
    },
    {
      q: "Does video face swap maintain temporal consistency?",
      a: "Yes. The Video FaceSwap Pro pipeline uses optical-flow-guided identity propagation on a diffusion backbone, so faces stay stable across frames even on long clips with strong head motion. Frame-rate handling is automatic and supports up to 1080p input in the online demo.",
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
