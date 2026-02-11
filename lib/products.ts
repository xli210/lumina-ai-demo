export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: "creator-pro",
    name: "Creator Pro",
    description:
      "Unlock the full power of AI-driven creative tools. One-time purchase, lifetime access.",
    priceInCents: 4999,
    features: [
      "Unlimited AI image generation",
      "HD video creation & export",
      "100+ creative style presets",
      "Priority rendering queue",
      "Commercial usage rights",
      "All future updates included",
    ],
  },
]
