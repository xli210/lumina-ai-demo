export const PAGE_URL = "https://nanopocket.ai/apps/nanoface-vivid";
export const LAST_VERIFIED = "2026-06-02";

export interface VividCase {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  caption: string;
  aspect?: string;
}

export const VIVID_CASES: VividCase[] = [
  {
    id: "gemini",
    beforeSrc: "/images/vivid/gemini-before.jpg",
    afterSrc: "/images/vivid/gemini-after.jpg",
    beforeLabel: "Gemini 2.5 Flash Image (Nano Banana) — output",
    afterLabel: "Same image after NanoFace Vivid",
    caption:
      "Source: Google Gemini 2.5 Flash Image (Nano Banana) generation. Notice the porcelain skin, flat highlights, and missing pores. NanoFace Vivid restores skin micro-texture, sharpens lash and eyebrow detail, and breaks the uniform lighting that gives away an AI portrait.",
  },
  {
    id: "gemini2",
    beforeSrc: "/images/vivid/gemini2-before.jpg",
    afterSrc: "/images/vivid/gemini2-after.jpg",
    beforeLabel: "Gemini-generated portrait — over-smoothed",
    afterLabel: "Vivid pass — pores, lashes, micro-shadow restored",
    caption:
      "Second Gemini 2.5 Flash Image example. The before frame has the classic 'AI taste' — shiny forehead, plastic skin, missing nasolabial detail. After the Vivid pass the same face reads as a real photograph at any zoom level.",
  },
  {
    id: "firefly",
    beforeSrc: "/images/vivid/firefly-before.jpg",
    afterSrc: "/images/vivid/firefly-after.jpg",
    beforeLabel: "Adobe Firefly — over-smoothed face",
    afterLabel: "Vivid pass — texture and color recovered",
    caption:
      "Adobe Firefly portrait output. Vivid recovers visible pore structure, restores lip texture, and corrects the slightly waxy highlight rendering that Firefly leaves on cheekbones.",
  },
  {
    id: "firefly2",
    beforeSrc: "/images/vivid/firefly2-before.jpg",
    afterSrc: "/images/vivid/firefly2-after.jpg",
    beforeLabel: "Firefly portrait — washed colour",
    afterLabel: "Vivid pass — colour and micro-detail restored",
    caption:
      "Same Firefly model regenerated, now with NanoFace Vivid as a post step. Skin colour gains depth, eye iris detail returns, and the smile no longer looks airbrushed.",
  },
  {
    id: "faceswap1",
    beforeSrc: "/images/vivid/faceswap-ex1-before.jpg",
    afterSrc: "/images/vivid/faceswap-ex1-after.jpg",
    beforeLabel: "FaceSwap output (any vendor) — soft, plastic skin",
    afterLabel: "After NanoFace Vivid post-processor",
    caption:
      "Common face-swap failure mode: identity copies cleanly but the skin loses pores and the lighting flattens. Vivid is engineered to be a drop-in post-processor for any face-swap stack — Roop, FaceFusion, NanoPocket FaceSwap Pro, or the cloud services that wrap Gemini.",
  },
  {
    id: "faceswap2",
    beforeSrc: "/images/vivid/faceswap-ex2-before.jpg",
    afterSrc: "/images/vivid/faceswap-ex2-after.jpg",
    beforeLabel: "Cloud face-swap — flat AI skin",
    afterLabel: "Vivid pass — texture restored without changing identity",
    caption:
      "Second face-swap example. The crucial detail: Vivid does not re-identify the face — the swapped identity is preserved. It only re-introduces the high-frequency skin / hair / lighting detail that the swap step removed.",
  },
  {
    id: "headshot",
    beforeSrc: "/images/vivid/headshot-before.jpg",
    afterSrc: "/images/vivid/headshot-after.jpg",
    beforeLabel: "Casual selfie — soft, low-frequency",
    afterLabel: "Vivid pass — natural studio-grade detail",
    caption:
      "Vivid is not only for AI-generated faces. Real photos that have been over-compressed (Instagram, WhatsApp, Zoom screen-grabs) gain back skin texture and edge detail without any plastic-surgery sharpening.",
  },
  {
    id: "headshot2",
    beforeSrc: "/images/vivid/headshot2-before.jpg",
    afterSrc: "/images/vivid/headshot2-after.jpg",
    beforeLabel: "Compressed selfie",
    afterLabel: "Vivid pass — texture and lighting recovered",
    caption:
      "Second selfie example. Vivid is most useful on portraits that have already been through one or more lossy steps (compression, denoise, AI swap, AI generation).",
  },
  {
    id: "product",
    beforeSrc: "/images/vivid/product-before.jpg",
    afterSrc: "/images/vivid/product-after.jpg",
    beforeLabel: "AI fashion model — flat skin, plastic feel",
    afterLabel: "Vivid pass — fabric and skin texture restored",
    caption:
      "Fashion / e-commerce use case: AI-generated model imagery often has the right pose and outfit but reads as obviously AI. Vivid restores fabric weave, skin pore detail, and natural specular highlights.",
  },
  {
    id: "product2",
    beforeSrc: "/images/vivid/product2-before.jpg",
    afterSrc: "/images/vivid/product2-after.jpg",
    beforeLabel: "Editorial AI portrait — magazine vs Instagram filter",
    afterLabel: "Vivid pass — editorial-grade detail",
    caption:
      "Higher-end editorial use case. The before reads as a polished AI render; the after reads as a magazine cover.",
  },
];

export interface CompetitorRow {
  tool: string;
  category: string;
  problem: string;
  vividHelps: string;
}

export const COMPETITOR_ROWS: CompetitorRow[] = [
  {
    tool: "Google Gemini 2.5 Flash Image (Nano Banana)",
    category: "Cloud image-edit model",
    problem:
      "Excellent composition and prompt adherence, but portraits tend to come out with flat porcelain skin, missing pores, and uniform 'studio' lighting that reads as AI.",
    vividHelps:
      "Drop the Gemini output through Vivid as a final step. Skin micro-texture, lash structure, and lighting variance all return — without re-rolling the prompt or losing identity.",
  },
  {
    tool: "Adobe Firefly",
    category: "Cloud image generation",
    problem:
      "Strong subject control and brand-safe output, but human faces tend to render slightly waxy with low-frequency detail, especially at small face sizes inside a wider scene.",
    vividHelps:
      "Vivid restores fine detail at the face crop while leaving the rest of the Firefly composition untouched.",
  },
  {
    tool: "Roop / FaceFusion / Rope (InsightFace inswapper_128)",
    category: "Open-source GAN face swap",
    problem:
      "Identity transfers cleanly but skin loses high-frequency information at the swap boundary. The classic 'AI face' giveaway is exactly this loss.",
    vividHelps:
      "Vivid is a post-processor designed to live after the swap step. It re-introduces pore-level detail at the boundary while preserving the swapped identity exactly.",
  },
  {
    tool: "DeepSwap / Magic Hour / Reface (cloud face swap)",
    category: "Cloud face-swap services",
    problem:
      "Convenient web/mobile UX, but cloud GAN swappers consistently produce the smoothest faces in the category. Output rarely passes a zoom test.",
    vividHelps:
      "Save the cloud-swap output, run it through NanoFace Vivid (online demo today, FaceSwap Pro 2.0 desktop integration coming), and the same face crosses the zoom-test threshold.",
  },
  {
    tool: "Topaz Photo AI / Sharpen AI",
    category: "Local photo enhancement",
    problem:
      "Excellent at general sharpening and noise reduction, but not specialised on AI-generated face artefacts. Can amplify the plastic look rather than fix it.",
    vividHelps:
      "Vivid is purpose-built for the over-smoothed AI-face failure mode. It targets the exact frequency band that AI generators flatten.",
  },
  {
    tool: "Magnific AI",
    category: "Cloud upscaler with creativity slider",
    problem:
      "Good for upscaling, but the creativity slider can hallucinate features or change identity on portraits. Cloud-only.",
    vividHelps:
      "Vivid is identity-locked by design — it does not change features. It only restores the texture and lighting frequencies that AI flattens.",
  },
];
