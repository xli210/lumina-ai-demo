export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  /** Maximum number of machines this license can be activated on */
  maxActivations: number
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
  },
]
