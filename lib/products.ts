export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  /** Maximum number of machines this license can be activated on */
  maxActivations: number
  /** Environment variable name for this product's master encryption key */
  masterKeyEnv: string
}

export const PRODUCTS: Product[] = [
  {
    id: "lumina-ai",
    name: "Lumina AI",
    description:
      "AI Creative Studio — Transform your ideas into stunning visuals with AI-powered creative tools.",
    priceInCents: 0,
    features: [
      "AI image generation",
      "HD video creation & export",
      "100+ creative style presets",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_LUMINA_AI",
  },
  {
    id: "ocr-demo",
    name: "OCR Demo",
    description:
      "Intelligent Text Recognition — Extract text from images, PDFs, and scanned documents with local AI.",
    priceInCents: 0,
    features: [
      "State-of-the-art OCR",
      "PDF & image support",
      "100% offline & private",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_OCR_DEMO",
  },
  {
    id: "flux-klein",
    name: "FLUX.2 Klein",
    description:
      "AI Image Generation — Generate stunning images from text prompts with the FLUX.2 Klein 4B model, running locally on your GPU.",
    priceInCents: 0,
    features: [
      "Text-to-image generation",
      "Image-to-image with reference photos",
      "Runs 100% locally on your GPU",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_FLUX_KLEIN",
  },
  {
    id: "ltx-video",
    name: "LTX-2 Video Studio",
    description:
      "AI Video Generation — Create stunning videos from text prompts or images with the LTX-2 19B model, running 100% locally on your GPU.",
    priceInCents: 0,
    features: [
      "Text-to-video generation",
      "Image-to-video & keyframe interpolation",
      "Camera control LoRAs (dolly, jib, static)",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_LTX_VIDEO",
  },
]
