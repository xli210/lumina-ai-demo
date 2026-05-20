import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

const VIDEO_DEMO_URL = "https://yacht-surrounding-draft-charity.trycloudflare.com";

export const metadata: Metadata = {
  title:
    "Nano Video FaceSwap Pro — Free Online AI Video Face Swap with Temporal Consistency",
  description:
    "Nano Video FaceSwap Pro is a free, browser-hosted AI video face-swap demo. It runs a diffusion identity backbone (InstantID, PuLID, IP-Adapter FaceID) with optical-flow-guided propagation, supports up to 1080p input, and is free for every signed-in NanoPocket account.",
  keywords: [
    "Nano Video FaceSwap Pro",
    "AI video face swap",
    "free video face swap",
    "diffusion video face swap",
    "video face swap online",
    "deepfake video online",
    "DeepFaceLab alternative",
    "Rope Live alternative",
    "FaceFusion video alternative",
    "video deepfake free",
    "temporal consistent face swap",
    "1080p video face swap",
    "video face swap no cloud upload",
  ],
  alternates: { canonical: "/apps/nano-faceswap-pro/video" },
  openGraph: {
    title: "Nano Video FaceSwap Pro — Free Online AI Video Face Swap",
    description:
      "Free, browser-hosted diffusion video face swap with optical-flow temporal propagation. 1080p input, frame-stable output, no per-minute fees.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro/video",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano Video FaceSwap Pro — Free Online Diffusion Video Face Swap",
    description:
      "Free online video face swap with optical-flow temporal consistency. 1080p input, no per-minute fees.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano Video FaceSwap Pro",
  operatingSystem: "Web (browser-hosted demo)",
  applicationCategory: "MultimediaApplication",
  description:
    "Free online diffusion-based video face swap with optical-flow-guided identity propagation. 1080p input, frame-stable output, free for every signed-in NanoPocket account.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
};

const data: ProductLandingData = {
  slug: "nano-faceswap-pro-video",
  parent: { label: "Back to Nano FaceSwap Pro 2.0", href: "/apps/nano-faceswap-pro" },
  hero: {
    eyebrow: "Free online · Video face swap",
    versionChip: "Demo",
    title: "Nano Video FaceSwap",
    titleAccent: "Pro",
    lead: "Nano Video FaceSwap Pro is a free, browser-hosted diffusion video face-swap demo that uses optical-flow-guided identity propagation on a single hosted GPU, accepts up to 1080p input, and produces frame-stable output across long clips with strong head motion.",
    parameters: [
      { value: "1080p", label: "Maximum input resolution" },
      {
        value: "Optical-flow",
        label: "Frame-to-frame identity propagation",
      },
      {
        value: "Free · signed-in",
        label: "No per-minute fees · no credit card",
      },
    ],
    primaryCta: {
      label: "Try free online",
      href: VIDEO_DEMO_URL,
      external: true,
    },
    secondaryCta: {
      label: "See full feature tour",
      href: "/apps/nano-faceswap-pro/features",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Free for signed-in NanoPocket accounts" },
    { label: "No credit card · no per-minute fees" },
    { label: "Diffusion identity backbone (InstantID + PuLID)" },
    { label: "Optical-flow temporal propagation" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Diffusion video pipeline",
      title: "Diffusion identity, frame by frame.",
      lead: "The video pipeline applies a diffusion identity head — derived from InstantID, PuLID, and IP-Adapter FaceID research — to every frame, then stabilizes the per-frame swap with optical-flow-guided identity propagation, similar in spirit to DeepFaceLab and Rope-Live but with a diffusion backbone.",
      bullets: [
        "Diffusion identity head on every frame, not a 128-pixel GAN upsample",
        "Optical-flow-guided propagation for temporal stability",
        "Skin texture and lighting cues retained across motion",
        "Built on published research (InstantID, PuLID, IP-Adapter FaceID)",
      ],
      hint: "Diffusion + optical-flow",
    },
    {
      index: "02",
      eyebrow: "Frame stability",
      title: "Stable identity across motion.",
      lead: "Identity stays locked across long clips, fast head motion, and partial occlusions — common failure modes in inswapper_128-based tools — through optical-flow-guided propagation between consecutive frames.",
      bullets: [
        "Stable identity across long clips",
        "Handles fast head motion and quick rotations",
        "Recovers identity through partial occlusions",
        "No per-frame flicker artifacts",
      ],
      hint: "Long-clip stability",
    },
    {
      index: "03",
      eyebrow: "Free hosted demo",
      title: "Open to every signed-in account.",
      lead: "The demo is hosted by NanoPocket on dedicated GPUs and is free for every signed-in NanoPocket account; no credit card, no per-minute fees, and no per-frame charges. Test outputs are watermark-free.",
      bullets: [
        "Free for every signed-in NanoPocket account",
        "Hosted on NanoPocket GPUs — no setup required",
        "Watermark-free test outputs",
        "Password is shown on the landing-page demo card",
      ],
      hint: "Free · watermark-free",
    },
    {
      index: "04",
      eyebrow: "Inputs supported",
      title: "Up to 1080p input, common containers.",
      lead: "The demo accepts MP4 and MOV containers up to 1080p input resolution and a typical clip length, with automatic frame-rate handling. The desktop Pro release lifts this ceiling further on the user's local hardware.",
      bullets: [
        "MP4 and MOV containers",
        "Up to 1080p input in the online demo",
        "Automatic frame-rate handling",
        "Higher ceilings on the desktop Pro release",
      ],
      hint: "MP4 · MOV · 1080p",
    },
    {
      index: "05",
      eyebrow: "How it compares",
      title: "Cloud face swap, without the per-minute charge.",
      lead: "DeepSwap, Akool, HeyGen, DeepBrain, and Reface charge per minute of processed video and upload media to their servers. The Nano Video FaceSwap Pro demo is free, runs on dedicated NanoPocket-hosted GPUs, and the desktop release runs the same pipeline 100% on the user's local GPU.",
      bullets: [
        "No per-minute or per-frame charges",
        "No cloud retention requirement on the desktop release",
        "Same diffusion identity head across online and desktop",
        "One-time license on the desktop release, no usage fees",
      ],
      hint: "Free online · local on desktop",
    },
  ],
  faqs: [
    {
      q: "How much does the Nano Video FaceSwap Pro online demo cost?",
      a: "Zero. The demo is free for every signed-in NanoPocket account and accepts no credit card. There are no per-minute fees, no per-frame charges, and no watermarks on test outputs. Higher tier limits and 100% local processing arrive with the desktop Pro release.",
    },
    {
      q: "What input resolution and clip length does the demo accept?",
      a: "The online demo accepts MP4 and MOV containers up to 1080p input resolution. The desktop Pro release runs the same pipeline locally on the user's GPU and lifts the resolution and clip-length ceilings.",
    },
    {
      q: "How does Nano Video FaceSwap Pro stay temporally consistent?",
      a: "The pipeline applies a diffusion identity head per frame and then stabilizes the per-frame swap with optical-flow-guided identity propagation. Identity stays stable across long clips and through fast head motion, similar in spirit to DeepFaceLab and Rope-Live but on a diffusion backbone.",
    },
    {
      q: "Is this an alternative to DeepSwap, Akool, or HeyGen?",
      a: "Yes. DeepSwap, Akool, HeyGen, DeepBrain, and Reface upload video to their servers and charge per minute. Nano Video FaceSwap Pro is free in the browser and 100% local on the desktop release, with a one-time license and no usage fees.",
    },
    {
      q: "How do I get the access password?",
      a: "Sign in to NanoPocket and open the demo card on the landing page. The access password is displayed in the demo card after sign-in, and the same card holds the link to the online demo URL.",
    },
  ],
  closing: {
    title: "Try the video face swap demo, free.",
    body: "Sign in to NanoPocket, open the Video FaceSwap Pro card on the landing page for the access password, and run the demo in your browser at no cost.",
    primaryCta: {
      label: "Try free online",
      href: VIDEO_DEMO_URL,
      external: true,
    },
    secondaryCta: {
      label: "See the eight-section feature tour",
      href: "/apps/nano-faceswap-pro/features",
      variant: "secondary",
    },
  },
};

export default function NanoVideoFaceSwapProPage() {
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
