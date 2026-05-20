import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano VideoGen — Local AI Video Generator (LTX-2.3) for Windows NVIDIA GPUs",
  description:
    "Nano VideoGen is a local desktop AI video generator built on the LTX-2.3 model. It produces text-to-video and image-to-video outputs on a single NVIDIA GPU with as little as 12 GB VRAM, includes camera-control LoRAs, keyframe interpolation, and a 2× spatial upscaler.",
  keywords: [
    "Nano VideoGen",
    "local AI video generator",
    "text to video AI",
    "image to video AI",
    "LTX-2.3",
    "LTX video model",
    "AI video generator NVIDIA",
    "Sora alternative",
    "Veo alternative",
    "Kling alternative",
    "Runway Gen-3 alternative",
    "Pika Labs alternative",
    "camera control LoRA",
    "keyframe video AI",
    "12 GB VRAM video generator",
  ],
  alternates: { canonical: "/apps/nano-videogen" },
  openGraph: {
    title: "Nano VideoGen — Local AI Video Generator (LTX-2.3)",
    description:
      "Local text-to-video and image-to-video on a single NVIDIA GPU. LTX-2.3 model, camera-control LoRAs, keyframe interpolation, 2× spatial upscaler.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-videogen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano VideoGen — Local AI Video Generator (LTX-2.3)",
    description:
      "Local text-to-video and image-to-video on a single NVIDIA GPU. Camera-control LoRAs included.",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nano VideoGen",
  softwareVersion: "1.1.2",
  operatingSystem: "Windows 10/11",
  applicationCategory: "MultimediaApplication",
  description:
    "Local AI video generator built on the LTX-2.3 model. Text-to-video and image-to-video on a single NVIDIA GPU with as little as 12 GB VRAM. Includes camera-control LoRAs, keyframe interpolation, and a 2× spatial upscaler.",
  offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
};

const data: ProductLandingData = {
  slug: "nano-videogen",
  hero: {
    eyebrow: "AI Video Generation",
    versionChip: "v1.1.2",
    title: "Nano",
    titleAccent: "VideoGen",
    lead: "Nano VideoGen is a local AI video generator built on the LTX-2.3 model that produces text-to-video and image-to-video clips on a single NVIDIA GPU with as little as 12 GB VRAM, supports keyframe interpolation between two reference images, and exposes camera-control LoRAs (dolly, jib, pan, static).",
    parameters: [
      { value: "LTX-2.3", label: "Open-source video diffusion model" },
      { value: "12 GB VRAM", label: "Streaming DiT for limited-memory GPUs" },
      { value: "Camera LoRAs", label: "Dolly · jib · pan · static" },
    ],
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-videogen",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Single-GPU local inference" },
    { label: "12 GB VRAM minimum" },
    { label: "LTX-2.3 model · open weights" },
    { label: "No cloud generation, no per-second fees" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "LTX-2.3 backbone",
      title: "Open-weight diffusion video, locally.",
      lead: "Nano VideoGen runs the LTX-2.3 video diffusion model on the user's GPU instead of routing prompts to a cloud endpoint, so generation cost is the cost of compute the user already owns and prompts and reference images stay on the local disk.",
      bullets: [
        "Open-weight LTX-2.3 video diffusion model",
        "On-device inference — no remote endpoint",
        "Prompts and reference images never uploaded",
        "No per-second or per-clip charges",
      ],
      hint: "LTX-2.3 · open weights",
    },
    {
      index: "02",
      eyebrow: "Text-to-video",
      title: "Prompt to motion, single GPU.",
      lead: "Text-to-video accepts a prompt and produces a short video clip on a single GPU; the included streaming DiT path runs the same model on cards with 12 GB of VRAM by streaming attention layers, enabling generation on RTX 3060 / 4060 / 5060 class hardware.",
      bullets: [
        "Prompt-driven short-clip generation",
        "Streaming DiT path for 12 GB VRAM cards",
        "Runs on RTX 3060 / 4060 / 5060 class GPUs",
        "Same model weights as higher-tier GPUs",
      ],
      hint: "Streaming DiT · 12 GB VRAM",
    },
    {
      index: "03",
      eyebrow: "Image-to-video",
      title: "Animate a still with structural control.",
      lead: "Image-to-video accepts a reference image plus a prompt and produces a clip that respects the image's composition, lighting, and structural layout — useful for product shots, illustration animation, and photo-anchored storyboards.",
      bullets: [
        "Reference-image conditioning",
        "Composition and lighting respected across frames",
        "Useful for product shots and storyboards",
        "Same prompt grammar as text-to-video",
      ],
      hint: "Image + prompt → clip",
    },
    {
      index: "04",
      eyebrow: "Keyframe interpolation",
      title: "Morph between two stills.",
      lead: "Keyframe mode accepts two reference images and produces a smooth morph between them — controlled with a duration slider — which simplifies transition clips and concept animation that would otherwise require a frame-by-frame edit.",
      bullets: [
        "Two-reference morph with duration slider",
        "Smooth transitions for editorial and motion design",
        "Controllable curve and easing",
        "Single-pass generation, no manual interpolation",
      ],
      hint: "Two stills · one clip",
    },
    {
      index: "05",
      eyebrow: "Camera control LoRAs",
      title: "Dolly, jib, pan, or static.",
      lead: "A bundled set of camera-control LoRAs maps prompt-level intent to a specific camera move — dolly in, dolly out, jib up, jib down, pan left, pan right, or static — so the same scene can be re-rendered from a different camera intent without rewriting the prompt.",
      bullets: [
        "Dolly in / dolly out",
        "Jib up / jib down",
        "Pan left / pan right",
        "Static (no camera motion)",
      ],
      hint: "7 named camera moves",
    },
    {
      index: "06",
      eyebrow: "Spatial upscaler",
      title: "2× upscale in the same app.",
      lead: "An in-app 2× spatial upscaler lifts a 720p output to 1440p without a round-trip through Topaz Video AI or an external upscaler, and pairs naturally with Nano VideoEnhance for further chroma-stable enhancement.",
      bullets: [
        "2× in-app spatial upscale",
        "720p → 1440p in one pass",
        "Pairs with Nano VideoEnhance for chroma fix",
        "No external upscaler required",
      ],
      hint: "2× upscale · same app",
    },
  ],
  faqs: [
    {
      q: "What model does Nano VideoGen run?",
      a: "Nano VideoGen runs the LTX-2.3 video diffusion model with open weights on the user's local GPU. The same model weights are used across consumer NVIDIA cards; the streaming DiT path is what enables 12 GB VRAM cards to run a model that otherwise targets larger memory footprints.",
    },
    {
      q: "What's the minimum hardware?",
      a: "Windows 10 or 11 with an NVIDIA GPU and 12 GB of VRAM (e.g. RTX 3060, 4060, or 5060 class). Cards with more VRAM benefit from faster inference and longer clip lengths. Apple Silicon support is not in v1.1.2.",
    },
    {
      q: "How is this different from Sora, Veo, Kling, or Runway?",
      a: "Sora (OpenAI), Veo (Google), Kling, and Runway Gen-3 are cloud services that bill per second of generated video and upload prompts to remote endpoints. Nano VideoGen runs the LTX-2.3 model on the user's local GPU with a one-time license, no per-second charge, and no remote prompt logging.",
    },
    {
      q: "Can I generate from a still image?",
      a: "Yes. Image-to-video accepts a reference image plus a prompt and respects the image's composition, lighting, and structure across the generated frames. Two-image keyframe interpolation is also supported with a duration slider.",
    },
    {
      q: "Are the camera moves preset or prompt-based?",
      a: "Both. The bundled camera-control LoRAs map seven named moves — dolly in, dolly out, jib up, jib down, pan left, pan right, and static — to specific camera intent without rewriting the prompt. Prompt-level camera language remains supported on top.",
    },
  ],
  closing: {
    title: "Install Nano VideoGen.",
    body: "LTX-2.3 video diffusion on your local GPU, with camera-control LoRAs, two-image keyframe morph, and a 2× spatial upscaler. No per-second cloud fee.",
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-videogen",
      variant: "secondary",
    },
  },
};

export default function NanoVideoGenPage() {
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
