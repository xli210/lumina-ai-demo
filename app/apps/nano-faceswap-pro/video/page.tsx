import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

const VIDEO_DEMO_URL = "https://painting-democrats-transport-mime.trycloudflare.com";

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

const data: ProductLandingData = {
  slug: "nano-faceswap-pro-video",
  productMeta: {
    sku: "NPK-FSV-100",
    mpn: "NPK-FSV-100",
    brand: "NanoPocket",
    url: "https://nanopocket.ai/apps/nano-faceswap-pro/video",
    image: "https://nanopocket.ai/og-image.jpg",
    category: "Free Online AI Video Face Swap",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web (browser-hosted demo)",
    softwareVersion: "Demo · 2026.05",
    releaseDate: "2026-05-08",
    description:
      "Nano Video FaceSwap Pro — free, browser-hosted diffusion video face-swap demo with optical-flow temporal propagation. 1080p input, frame-stable output, free for every signed-in NanoPocket account. A privacy-friendly alternative to DeepFaceLab, Rope Live, DeepSwap, Akool, and HeyGen.",
    offer: {
      price: "0.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2027-12-31",
    },
    additionalProperties: [
      { name: "Identity backbone", value: "Diffusion (InstantID + PuLID + IP-Adapter FaceID)" },
      { name: "Temporal stability", value: "Optical-flow-guided identity propagation" },
      { name: "Maximum input resolution", value: "1080p" },
      { name: "Supported containers", value: "MP4, MOV" },
      { name: "Frame-rate handling", value: "Automatic" },
      { name: "Hosting", value: "NanoPocket-hosted GPUs (browser-only)" },
      { name: "Pricing", value: "Free for signed-in NanoPocket accounts" },
      { name: "Test outputs", value: "Watermark-free" },
      { name: "Account requirement", value: "Free NanoPocket sign-in + demo password" },
    ],
  },
  documentation: {
    lastVerified: "2026-05-29",
    methodology:
      "Temporal stability is reported as the average per-frame identity-similarity variance (ArcFace cosine, σ²) across 20 internal Test-Vid-1080p clips, each 10-30s with continuous head motion. Lower σ² is better. Demo capacity is measured against a NanoPocket-hosted A100-80GB pool; queue times during peak hours (UTC 14-22) can exceed the medians stated.",
    scope: {
      bestFor: [
        "Short-form social, ad creative, music video pre-vis",
        "Concept boards before committing to film-grade VFX",
        "Localising a campaign across regional faces",
        "Quick rough cuts with stable facial identity",
        "Buyers comparing diffusion video swap vs Roop/FaceFusion",
      ],
      notRecommendedFor: [
        "Real-time live-streaming (use Rope-Live or Deep-Live-Cam)",
        "Feature-film VFX requiring full per-shot supervision",
        "NDA / restricted footage — wait for the desktop release",
        "Source clips with > 6 simultaneously-swapped faces",
        "Any non-consensual likeness use — explicitly prohibited",
      ],
    },
    limitations: [
      {
        title: "30-second / 1080p ceiling on the online demo",
        detail:
          "The browser demo enforces a 30-second clip and 1080p resolution cap to keep hosted-GPU queue times reasonable. The desktop Pro 2.0 release lifts both limits to whatever the local GPU can sustain.",
      },
      {
        title: "Strong motion-blur frames",
        detail:
          "When a face is severely motion-blurred for 3+ consecutive frames, optical flow has no anchor and identity propagation can drift. Consider de-blurring the source first, or shoot at a higher shutter speed.",
      },
      {
        title: "Rapid lighting cuts (e.g. concert strobes)",
        detail:
          "Identity-encoder confidence drops when scene lighting changes between every frame. Outputs may show short flicker passages that mask-toggle cannot suppress; we recommend trimming around strobe segments.",
      },
      {
        title: "Crowd shots > 6 faces",
        detail:
          "Per-face identity tracking is QA-tested up to 6 simultaneous swapped faces. Beyond that, identity matching may swap the wrong subject between frames.",
      },
      {
        title: "Hosted-GPU queue times during peak hours",
        detail:
          "Free demo queues lengthen at peak hours (UTC 14-22). Most submissions clear in ≤2 min, but a 5-10 min wait is possible on busy weekends until the desktop release lands.",
      },
      {
        title: "Audio is preserved but not edited",
        detail:
          "The pipeline keeps the source audio track 1:1. Lip-sync to the swapped identity is not currently part of the demo — pair with a separate lip-sync model if required.",
      },
    ],
    evidence: [
      {
        label:
          "Wang et al. — InstantID: Zero-shot Identity-Preserving Generation in Seconds (arXiv:2401.07519, 2024)",
        url: "https://arxiv.org/abs/2401.07519",
        note: "Per-frame identity head used by the video pipeline.",
      },
      {
        label:
          "Guo et al. — PuLID: Pure and Lightning ID Customization via Contrastive Alignment (arXiv:2404.16022, 2024)",
        url: "https://arxiv.org/abs/2404.16022",
        note: "Skin-detail and contrast objective shared with the image swap.",
      },
      {
        label:
          "Teed & Deng — RAFT: Recurrent All-Pairs Field Transforms for Optical Flow (arXiv:2003.12039, 2020)",
        url: "https://arxiv.org/abs/2003.12039",
        note: "Optical-flow estimator backbone used for frame-to-frame propagation.",
      },
      {
        label:
          "Perazzi et al. — DAVIS Video Object Segmentation Benchmark",
        url: "https://davischallenge.org/",
        note: "Public temporal-consistency reference dataset used during QA.",
      },
    ],
  },
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
      q: "Is the video face swap really free?",
      a: "Yes. The demo is free for every signed-in NanoPocket account. There is no credit card requirement, no per-minute charge, no per-frame charge, and no watermark on test outputs. Account sign-up is also free.",
    },
    {
      q: "Where do I get the demo password?",
      a: "Sign in to your free NanoPocket account, scroll to the Video FaceSwap Pro card on the landing page, and click the eye icon to reveal the access password. The same card holds the demo URL.",
    },
    {
      q: "What resolution and clip length does the demo accept?",
      a: "The online demo accepts MP4 and MOV containers up to 1080p input. Typical short-to-medium clips work without manual chunking. The desktop Pro release lifts the resolution and clip-length ceilings on the user's local GPU.",
    },
    {
      q: "Will the face stay stable across all frames?",
      a: "Yes. The pipeline runs a diffusion identity head on every frame and then stabilises it with optical-flow-guided identity propagation. Identity holds through long clips, fast head motion, and partial occlusions — failure modes typical of inswapper_128-based tools (Roop, FaceFusion, Rope).",
    },
    {
      q: "How is this different from DeepFaceLab or Rope Live?",
      a: "DeepFaceLab and Rope Live are open-source Gradio scripts that need a Python environment and a per-machine training pass. Nano Video FaceSwap Pro is hosted in the browser, runs diffusion identity instead of inswapper_128, and requires no install or training.",
    },
    {
      q: "Is this safe for private or NDA footage?",
      a: "The source clip is sent to a NanoPocket-hosted GPU only for the duration of the swap and is not used for model training. For strict-NDA work, wait for the desktop Pro release, which keeps every frame on the local disk.",
    },
    {
      q: "Can I download my result?",
      a: "Yes. The demo lets the signed-in user download the swapped video directly from the browser after processing. Outputs are watermark-free.",
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
  return <ProductLandingShell data={data} />;
}
