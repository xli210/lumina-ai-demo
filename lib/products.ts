export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  /** Number of days for free trial. 0 or undefined = no trial. */
  trialDays?: number
  features: string[]
  /** Maximum number of machines this license can be activated on */
  maxActivations: number
  /** Environment variable name for this product's master encryption key */
  masterKeyEnv: string
}

export const PRODUCTS: Product[] = [
  {
    id: "nano-facialedit",
    name: "Nano FacialEdit",
    description:
      "AI Facial Editing — Retouch, enhance, and transform facial features with Nano FacialEdit, running 100% locally on your GPU.",
    priceInCents: 0,
    features: [
      "AI-powered facial retouching & enhancement",
      "Face swap and expression editing",
      "Runs 100% locally on your GPU",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_FACIALEDIT",
  },
  {
    id: "nano-faceswap",
    name: "Nano FaceSwap",
    description:
      "AI Face Swap — Swap faces in photos and videos with realistic results using Nano FaceSwap, running 100% locally on your GPU.",
    priceInCents: 0,
    features: [
      "AI-powered face swapping",
      "Photo and video support",
      "Runs 100% locally on your GPU",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_FACESWAP",
  },
  {
    id: "nano-image-tryon",
    name: "Nano ImageTryon",
    description:
      "AI Virtual Try-On — See how clothes look on you before you buy, powered by AI running 100% locally on your GPU.",
    priceInCents: 0,
    features: [
      "AI-powered virtual try-on",
      "Photo-realistic clothing swap",
      "Runs 100% locally on your GPU",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_IMAGE_TRYON",
  },
  {
    id: "nano-imageedit",
    name: "Nano ImageEdit",
    description:
      "AI Image Generation — Generate and edit stunning images from text prompts with Nano ImageEdit, running locally on your GPU.",
    priceInCents: 1990,
    trialDays: 7,
    features: [
      "Text-to-image generation",
      "Image-to-image with reference photos",
      "Runs 100% locally on your GPU",
      "7-day free trial included",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_IMAGEEDIT",
  },
  {
    id: "nano-videoenhance",
    name: "Nano VideoEnhance",
    description:
      "AI Video Enhancement — Upscale, stabilize, and enhance video quality with Nano VideoEnhance, running 100% locally on your GPU.",
    priceInCents: 1990,
    trialDays: 7,
    features: [
      "AI-powered video upscaling & enhancement",
      "Video stabilization and denoising",
      "Runs 100% locally on your GPU",
      "7-day free trial included",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_VIDEOENHANCE",
  },
  {
    id: "nnanoimageenh",
    name: "Nano ImageEnh",
    description:
      "AI Image Enhancement — Upscale, denoise, and restore images with Nano ImageEnh, running 100% locally on your GPU.",
    priceInCents: 2990,
    trialDays: 7,
    features: [
      "AI-powered image upscaling & denoising",
      "Photo restoration and enhancement",
      "Runs 100% locally on your GPU",
      "7-day free trial included",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_IMAGEENH",
  },
  {
    id: "nano-videogen",
    name: "Nano VideoGen",
    description:
      "AI Video Generation — Create stunning videos from text prompts or images with Nano VideoGen, running 100% locally on your GPU.",
    priceInCents: 2990,
    trialDays: 7,
    features: [
      "Text-to-video generation",
      "Image-to-video & keyframe interpolation",
      "Camera control LoRAs (dolly, jib, static)",
      "7-day free trial included",
      "All future updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_VIDEOGEN",
  },
]
