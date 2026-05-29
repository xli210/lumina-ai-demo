import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano ImageEdit — Local Flux.1 Image Generator, Local Midjourney Alternative",
  description:
    "Nano ImageEdit is a local desktop image generator and editor running Flux.1 on a single NVIDIA GPU. Text-to-image, image-to-image, and reference conditioning ship in one app, with a streaming DiT path for GPUs with under 12 GB of VRAM.",
  keywords: [
    "Nano ImageEdit",
    "local Midjourney alternative",
    "Flux.1 desktop",
    "Flux.1 local",
    "local AI image generator",
    "text to image local",
    "image to image local",
    "Stable Diffusion alternative",
    "DALL-E alternative",
    "Adobe Firefly alternative",
    "Leonardo AI alternative",
    "Krea AI alternative",
    "Playground AI alternative",
    "AI image generator NVIDIA",
    "12 GB VRAM image generator",
  ],
  alternates: { canonical: "/apps/nano-imageedit" },
  openGraph: {
    title: "Nano ImageEdit — Local Flux.1 Image Generator",
    description:
      "Local text-to-image and image-to-image with Flux.1 on a single NVIDIA GPU. Streaming DiT for under-12 GB VRAM cards.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-imageedit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano ImageEdit — Local Flux.1 Image Generator",
    description:
      "Local Flux.1 image generation on a single NVIDIA GPU. No subscription, no cloud upload.",
  },
};

const data: ProductLandingData = {
  slug: "nano-imageedit",
  productMeta: {
    sku: "NPK-IED-105",
    mpn: "NPK-IED-105",
    brand: "NanoPocket",
    url: "https://nanopocket.ai/apps/nano-imageedit",
    image: "https://nanopocket.ai/og-image.jpg",
    category: "Local AI Image Generator & Editor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Windows 10/11 (NVIDIA CUDA)",
    softwareVersion: "1.0.5",
    releaseDate: "2026-03-04",
    description:
      "Nano ImageEdit — local AI image generator and editor running the Flux.1 12-billion-parameter diffusion transformer on a single NVIDIA GPU. Text-to-image, image-to-image, reference conditioning. Streaming DiT path runs on GPUs with under 12 GB VRAM. A local alternative to Midjourney, DALL-E 3, Adobe Firefly, Leonardo.Ai, and ideogram.",
    offer: {
      price: "0.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2027-12-31",
    },
    additionalProperties: [
      { name: "Backbone model", value: "Flux.1 diffusion transformer (12B parameters, open weights)" },
      { name: "Generation modes", value: "Text-to-image, image-to-image, reference-image conditioning" },
      { name: "Streaming DiT", value: "Memory-streaming Diffusion Transformer for sub-12 GB GPUs" },
      { name: "GPU runtime", value: "Single NVIDIA GPU (CUDA), Windows 10/11" },
      { name: "Seed control", value: "Yes — deterministic re-roll" },
      { name: "Generation knobs", value: "Guidance, sampler steps, seed, aspect ratio" },
      { name: "Data handling", value: "100% local; prompts, references, outputs stay on disk" },
      { name: "Network requirement", value: "Only for license activation" },
      { name: "License model", value: "One-time, machine-bound; no per-image fees" },
    ],
  },
  documentation: {
    lastVerified: "2026-05-29",
    methodology:
      "Generation throughput is reported in seconds per image at 1024 × 1024, 30 sampling steps, fp16, batch=1. Tested on RTX 4070 Ti (12 GB VRAM), RTX 4080 (16 GB VRAM), and RTX 4090 (24 GB VRAM) on Windows 11 23H2 driver 553.62. Prompt-following uses GenEval and DrawBench public protocols on internal 200-prompt subsets.",
    scope: {
      bestFor: [
        "Concept art and illustration on a 12 GB-VRAM card",
        "Image-to-image edits where structure must be preserved",
        "Studios that cannot ship prompts to Midjourney or DALL-E",
        "Iterating offline with seed control and reproducible re-rolls",
        "Replacing per-image cloud subscriptions with one-time license",
      ],
      notRecommendedFor: [
        "Real-time interactive painting on the same canvas",
        "Apple Silicon Macs (Windows + NVIDIA only in v1.0.5)",
        "Bulk e-commerce upscaling — use Nano ImageEnh Pro 3.0",
        "Multi-character compositions with strict identity locks (use FacialEdit)",
        "Photoreal text rendering (Flux.1 still struggles with paragraphs)",
      ],
    },
    limitations: [
      {
        title: "Text inside images",
        detail:
          "Flux.1 renders short captions reasonably well but degrades on paragraphs or stylised typography. Add text in post (Photoshop / Figma) for production-quality typography.",
      },
      {
        title: "Sub-12 GB VRAM throughput",
        detail:
          "The streaming DiT path runs the same weights on 8 GB / 10 GB cards but at roughly 0.4-0.6× throughput. Output quality is identical; only wall-clock differs.",
      },
      {
        title: "Hands and fine anatomy",
        detail:
          "Like other open-weight diffusion models, Flux.1 still produces occasional finger-count and joint errors. Use img2img inpaint for hand fixes, or generate hands separately and composite.",
      },
      {
        title: "Identity preservation across edits",
        detail:
          "Image-to-image with high strength may drift the subject's identity. For face-stable workflows, route the result through Nano FacialEdit's identity-preserving stack.",
      },
      {
        title: "Apple Silicon is not supported in v1.0.5",
        detail:
          "Current build is Windows + NVIDIA CUDA only. Metal support is on the roadmap.",
      },
      {
        title: "Output licensing follows Flux.1 model license",
        detail:
          "Generated images are usable commercially under the open Flux.1 license plus the NanoPocket Terms of Use. Subjects and trademarks must still be cleared by the user.",
      },
    ],
    evidence: [
      {
        label: "Black Forest Labs — Flux.1 model card",
        url: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
        note: "Open-weight backbone the v1.0.5 release ships against.",
      },
      {
        label:
          "Esser et al. — Scaling Rectified Flow Transformers for High-Resolution Image Synthesis (Stable Diffusion 3 paper, arXiv:2403.03206, 2024)",
        url: "https://arxiv.org/abs/2403.03206",
        note: "Architecture lineage for Flux.1's MM-DiT design.",
      },
      {
        label:
          "Ghosh et al. — GenEval: An Object-Focused Framework for Evaluating Text-to-Image Alignment (arXiv:2310.11513, 2023)",
        url: "https://arxiv.org/abs/2310.11513",
        note: "Public benchmark used for prompt-following numbers.",
      },
      {
        label: "OpenAI — DALL-E 3 system card",
        url: "https://openai.com/research/dall-e-3-system-card",
        note: "Cloud benchmark — referenced for direct comparison.",
      },
    ],
  },
  hero: {
    eyebrow: "AI Image Generation",
    versionChip: "v1.0.5",
    title: "Nano",
    titleAccent: "ImageEdit",
    lead: "Nano ImageEdit is a local desktop image generator and editor that runs the Flux.1 diffusion transformer on a single NVIDIA GPU on Windows, supports text-to-image, image-to-image, and reference-image conditioning, and uses a streaming DiT path so cards with under 12 GB of VRAM can run the same 12-billion-parameter model.",
    parameters: [
      { value: "Flux.1", label: "12B-parameter diffusion transformer" },
      {
        value: "<12 GB VRAM",
        label: "Streaming DiT for limited-memory cards",
      },
      {
        value: "Local-only",
        label: "No subscription · no cloud generation",
      },
    ],
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-imageedit",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Single-GPU local inference" },
    { label: "Flux.1 — 12 B parameters" },
    { label: "No subscription · one-time license" },
    { label: "Prompts and outputs stay local" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Flux.1 backbone",
      title: "12 billion parameters, on the user's GPU.",
      lead: "Nano ImageEdit runs the Flux.1 diffusion transformer (12 billion parameters) on a single local NVIDIA GPU rather than routing prompts to OpenAI, Midjourney, Adobe Firefly, or Leonardo's cloud endpoints, so prompts, references, and outputs stay on the local disk.",
      bullets: [
        "Flux.1 — 12 B-parameter diffusion transformer",
        "On-device inference, no remote endpoint",
        "Prompts and references never uploaded",
        "Output rights retained 100% by the user",
      ],
      hint: "Flux.1 · open weights",
    },
    {
      index: "02",
      eyebrow: "Text-to-image",
      title: "Prompt to image, in one app.",
      lead: "Text-to-image accepts a prompt plus a small set of generation knobs — guidance, sampler steps, seed, aspect ratio — and produces an output image at a chosen size, with no subscription, no per-image charge, and no waitlist.",
      bullets: [
        "Prompt-driven generation with seed control",
        "Common sampler knobs exposed (steps, guidance)",
        "Aspect-ratio presets for print, social, and 3:4 portrait",
        "No subscription, no per-image charge",
      ],
      hint: "Prompt · seed · aspect",
    },
    {
      index: "03",
      eyebrow: "Image-to-image",
      title: "Edit with a reference photo.",
      lead: "Image-to-image accepts a reference image plus a prompt and applies the prompt's edit while preserving the reference's structural layout — useful for product re-photographs, color-graded variants, and edited stock that would otherwise require Photoshop and a remask.",
      bullets: [
        "Reference-image conditioning",
        "Structural layout preserved",
        "Per-image strength slider",
        "Useful for product re-photography and stock variants",
      ],
      hint: "Reference + prompt → output",
    },
    {
      index: "04",
      eyebrow: "Streaming DiT",
      title: "Run Flux.1 on a 12 GB GPU.",
      lead: "The streaming DiT path streams attention layers between disk, system RAM, and VRAM during inference, enabling cards with under 12 GB of VRAM (RTX 3060 / 4060 / 5060 class) to run a model that otherwise targets larger memory footprints.",
      bullets: [
        "Streams attention layers across the memory hierarchy",
        "Runs on RTX 3060 / 4060 / 5060 class cards",
        "Same Flux.1 weights as larger GPUs",
        "Single in-app toggle, no manual quantisation",
      ],
      hint: "<12 GB VRAM · single toggle",
    },
    {
      index: "05",
      eyebrow: "License protection",
      title: "Product-bound license.",
      lead: "Each install activates against a product-bound license, which prevents redistribution of the bundled Flux.1 weights and downstream training-set leakage; license activation is the only network call the application makes during a generation session.",
      bullets: [
        "Product-bound license activation",
        "Bundled weights protected from redistribution",
        "License is the only network handshake",
        "Inference itself is fully offline",
      ],
      hint: "Activation only · offline inference",
    },
    {
      index: "06",
      eyebrow: "How it compares",
      title: "Midjourney quality, locally, no subscription.",
      lead: "Midjourney, DALL-E, Adobe Firefly, Leonardo, and Krea run server-side and bill per generation or per seat. Nano ImageEdit runs Flux.1 locally on a single NVIDIA GPU with a one-time license, no per-image charge, and no requirement to send prompts to a remote endpoint.",
      bullets: [
        "Local inference on a single license",
        "No per-image or per-seat charges",
        "Same Flux.1 model on every supported GPU",
        "No remote prompt logging",
      ],
      hint: "vs Midjourney · vs Firefly · vs Leonardo",
    },
  ],
  faqs: [
    {
      q: "Will Flux.1 actually run on my GPU?",
      a: "If the GPU has at least 12 GB of VRAM (RTX 3060 / 4060 / 5060 class or better), yes. Below that, the streaming DiT path still loads the model in chunks; smaller cards generate at lower resolution and lower throughput. Cards with more VRAM run the same model faster.",
    },
    {
      q: "How is this different from Midjourney, DALL-E, or Adobe Firefly?",
      a: "Midjourney, DALL-E (OpenAI), Adobe Firefly, Leonardo.Ai, Krea, and ideogram run server-side and charge per generation or per seat. Nano ImageEdit runs the open-weight Flux.1 model on the user's local GPU with a one-time license, no per-image charge, and no remote prompt logging.",
    },
    {
      q: "Can I edit an existing photo, not just generate from text?",
      a: "Yes. Image-to-image accepts a reference image plus a prompt and applies the edit while preserving the reference's structural layout. A per-image strength slider controls how aggressively the prompt overrides the reference. Reference-image conditioning is also available for style transfer.",
    },
    {
      q: "Do I need an internet connection to generate?",
      a: "No. After the one-time license-activation handshake, generation runs fully offline on the local GPU. Prompts, references, and outputs are not transmitted off the machine.",
    },
    {
      q: "Will my prompts stay private?",
      a: "Yes. There is no remote endpoint contact during generation; the only network call is product-bound license activation. Prompts, references, and outputs stay on the user's disk and are not used for any model training.",
    },
    {
      q: "Does it work on a Mac?",
      a: "Not in v1.0.5. The current build is Windows 10/11 + NVIDIA CUDA. Apple Silicon support is on the roadmap.",
    },
    {
      q: "Can I use the generated images commercially?",
      a: "Yes. The license is one-time and machine-bound, with no per-image fees. Generated images can be used in commercial deliverables under the standard NanoPocket Terms of Use and the open Flux.1 model license. The user retains full output rights.",
    },
  ],
  closing: {
    title: "Install Nano ImageEdit.",
    body: "Flux.1 image generation on your local GPU, with text-to-image, image-to-image, and a streaming DiT path for under-12 GB VRAM cards. No subscription, no cloud generation.",
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-imageedit",
      variant: "secondary",
    },
  },
};

export default function NanoImageEditPage() {
  return <ProductLandingShell data={data} />;
}
