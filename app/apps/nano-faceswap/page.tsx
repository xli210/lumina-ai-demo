import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano FaceSwap — Local Desktop Face Swap for Windows NVIDIA GPUs",
  description:
    "Nano FaceSwap is a local desktop face-swap app for Windows. It swaps single or multiple faces in photos and videos on a single NVIDIA GPU, with a one-time license, no per-minute fees, and no cloud upload of source media.",
  keywords: [
    "Nano FaceSwap",
    "desktop face swap",
    "local face swap",
    "offline face swap",
    "Windows face swap app",
    "face swap NVIDIA",
    "Roop alternative",
    "Roop Unleashed alternative",
    "FaceFusion alternative",
    "Rope alternative",
    "Reactor alternative",
    "Deep-Live-Cam alternative",
    "Akool alternative",
    "DeepSwap alternative",
    "private face swap",
    "no cloud face swap",
  ],
  alternates: { canonical: "/apps/nano-faceswap" },
  openGraph: {
    title: "Nano FaceSwap — Local Desktop Face Swap",
    description:
      "Local desktop face-swap for Windows NVIDIA GPUs. One-time license, no per-minute fees, no cloud upload.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano FaceSwap — Local Desktop Face Swap",
    description:
      "Local desktop face swap on a single NVIDIA GPU. One-time license, no cloud upload.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano FaceSwap",
  softwareVersion: "1.0.4",
  operatingSystem: "Windows 10/11",
  applicationCategory: "MultimediaApplication",
  description:
    "Local desktop face swap for photos and videos on a single NVIDIA GPU. One-time license, no cloud upload of source media.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
};

const data: ProductLandingData = {
  slug: "nano-faceswap",
  hero: {
    eyebrow: "Desktop Face Swap",
    versionChip: "v1.0.4",
    title: "Nano",
    titleAccent: "FaceSwap",
    lead: "Nano FaceSwap is a local Windows desktop face-swap application that swaps single or multiple faces in photos and videos on a single NVIDIA GPU, ships with a one-time license, charges no per-minute or per-frame fees, and never uploads source media to a server.",
    parameters: [
      { value: "Single & group", label: "One-face and multi-face swap" },
      {
        value: "Photos + video",
        label: "Same app, both media types",
      },
      {
        value: "One-time license",
        label: "No per-minute or per-frame fees",
      },
    ],
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Compare with Pro 2.0",
      href: "/apps/nano-faceswap-pro",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Single-GPU NVIDIA CUDA" },
    { label: "100% local · no cloud upload" },
    { label: "One-time license" },
    { label: "Photos + video in one app" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Local NVIDIA GPU",
      title: "One GPU, photos and video.",
      lead: "Nano FaceSwap runs the full identity swap pipeline on a single NVIDIA GPU on Windows 10 or 11, supports both still photos and video clips inside the same desktop app, and does not require a multi-GPU rig or external render farm.",
      bullets: [
        "Single-GPU local inference (CUDA)",
        "Photos and video in the same desktop app",
        "No multi-GPU or render-farm setup required",
        "Offline operation during inference",
      ],
      hint: "Single GPU · Windows 10/11",
    },
    {
      index: "02",
      eyebrow: "Single & group swap",
      title: "Swap one face or every face.",
      lead: "The face picker detects every face in the source frame and exposes per-face targeting, so a single subject can be swapped while bystanders remain untouched, or a group portrait can be swapped wholesale with a single click.",
      bullets: [
        "Per-face targeting with a numbered picker",
        "Bystanders left untouched when needed",
        "One-click swap-all for group portraits",
        "Same fidelity on a single face or several",
      ],
      hint: "Per-face control · batch swap",
    },
    {
      index: "03",
      eyebrow: "License protection",
      title: "Product-bound license activation.",
      lead: "Each install activates against a product-bound license that protects the bundled face-swap model weights from redistribution; license activation is the only network handshake the application makes during a session.",
      bullets: [
        "Product-bound license activation",
        "Bundled weights protected from redistribution",
        "License is the only network call",
        "Inference itself is fully offline",
      ],
      hint: "Activation only · offline inference",
    },
    {
      index: "04",
      eyebrow: "Privacy",
      title: "Source media never leaves the disk.",
      lead: "Source photos and videos remain on the user's local drive. There is no cloud upload of source media, no remote proxy generation, and no content-level telemetry; the application is suitable for private, NDA, and editorial work where source media must not leave the machine.",
      bullets: [
        "No cloud upload of source media",
        "No remote proxy generation",
        "No content-level telemetry",
        "Suitable for NDA and editorial work",
      ],
      hint: "Local-only · GDPR-friendly",
    },
    {
      index: "05",
      eyebrow: "How it compares",
      title: "Roop & FaceFusion stack, productised.",
      lead: "Roop, Roop-Unleashed, FaceFusion, Rope, Rope-Live, and Reactor all ship as Gradio scripts on top of the InsightFace inswapper_128 GAN. Nano FaceSwap is a single Windows installer with a real desktop UI, single-license activation, and no Python environment to maintain.",
      bullets: [
        "Single Windows installer, no pip / conda environment",
        "Desktop UI instead of a Gradio script",
        "Single-license activation, no per-machine recompilation",
        "Same one-GPU footprint as the open-source scripts",
      ],
      hint: "vs Roop · vs FaceFusion · vs Rope",
    },
    {
      index: "06",
      eyebrow: "Path to Pro 2.0",
      title: "Diffusion upgrade lands in Pro 2.0.",
      lead: "Nano FaceSwap (this app) ships the inswapper-class identity swap. Nano FaceSwap Pro 2.0 ships a diffusion identity stack (InstantID, PuLID, IP-Adapter FaceID), a virtual identity library, mask control, magic pen, and identity-preserving expression editing.",
      bullets: [
        "Pro 2.0 adds a diffusion identity stack",
        "Pro 2.0 adds a license-free virtual identity library",
        "Pro 2.0 adds region-level mask control and a magic pen",
        "Pro 2.0 adds identity-preserving expression editing",
      ],
      hint: "Free online demo for Pro 2.0 available",
    },
  ],
  faqs: [
    {
      q: "What hardware does Nano FaceSwap need?",
      a: "Windows 10 or 11 with an NVIDIA GPU. The pipeline runs on a single GPU and does not require a multi-GPU rig or remote render farm. Apple Silicon support is not in v1.0.4.",
    },
    {
      q: "Can I swap multiple faces in a group portrait?",
      a: "Yes. The face picker detects every face in the source frame and exposes per-face targeting, so a single subject can be swapped while bystanders remain untouched, or every face can be swapped in one click. The same fidelity is applied to a single face or several.",
    },
    {
      q: "How is this different from Roop and FaceFusion?",
      a: "Roop, Roop-Unleashed, FaceFusion, Rope, Rope-Live, and Reactor ship as Gradio scripts that wrap the InsightFace inswapper_128 GAN — they require a Python environment, a pip / conda setup, and per-machine recompilation. Nano FaceSwap ships as a single Windows installer with a desktop UI and a one-time license. The Pro 2.0 release additionally upgrades the identity head from inswapper to a diffusion stack.",
    },
    {
      q: "Does source media get uploaded?",
      a: "No. Source photos and videos remain on the local disk. There is no cloud upload, no remote proxy generation, and no content-level telemetry. Network is contacted only for product-bound license activation.",
    },
    {
      q: "Should I use Nano FaceSwap or Nano FaceSwap Pro 2.0?",
      a: "Nano FaceSwap (this app) is the inswapper-class desktop swap, available today. Nano FaceSwap Pro 2.0 is the diffusion upgrade with a virtual identity library, mask control, magic pen, expression editing, and an in-app benchmark gallery. The Pro 2.0 online demo is free for every signed-in NanoPocket account; the Pro 2.0 desktop release launches soon.",
    },
  ],
  closing: {
    title: "Install Nano FaceSwap.",
    body: "Local desktop face swap for photos and videos on a single NVIDIA GPU. One-time license, no per-minute fees, source media stays on your disk.",
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Compare with Pro 2.0",
      href: "/apps/nano-faceswap-pro",
      variant: "secondary",
    },
  },
};

export default function NanoFaceSwapPage() {
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
