import {
  BLACK_FRIDAY_APP_PRICE_CENTS,
  BLACK_FRIDAY_LAST_DAY,
  FACESTUDIO_V_PRO_LAUNCH_PRICE_CENTS,
  FACESTUDIO_V_PRO_REGULAR_PRICE_CENTS,
  blackFridayOn,
  facestudioVProLaunchPriceOn,
} from "@/lib/black-friday"

export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  /**
   * Optional original (pre-promo) price. When set and greater than priceInCents,
   * UIs should render it struck-through next to the current price to signal a
   * limited-time launch offer.
   */
  originalPriceInCents?: number
  /**
   * Optional YYYY-MM-DD end date for the promotional pricing. Purely
   * informational — display only, not enforced on the server.
   */
  promoValidUntil?: string
  /**
   * What the reduced price is: "launch" (a new product's opening price, which goes up on
   * promoValidUntil) or "sale" (a discount from a price it has been sold at). Read with
   * originalPriceInCents; absent when there is no offer.
   */
  promoKind?: "launch" | "sale"
  /** Number of days for free trial. 0 or undefined = no trial. */
  trialDays?: number
  features: string[]
  /** Maximum number of machines this license can be activated on */
  maxActivations: number
  /** Environment variable name for this product's master encryption key */
  masterKeyEnv: string
}

/**
 * Nano FaceStudio Pro's launch price runs to the end of 31 October 2026, Pacific time (still PDT,
 * UTC-7, that night), and the regular price applies from that instant. A real deadline: it is the
 * date the site has promised since launch, and the price does go up then.
 */
export const FACESTUDIO_PRO_LAUNCH_PRICE_CENTS = 4990
export const FACESTUDIO_PRO_REGULAR_PRICE_CENTS = 6990
export const FACESTUDIO_PRO_LAUNCH_ENDS_AT = Date.parse("2026-11-01T07:00:00Z")
/** The deadline as the copy states it. */
export const FACESTUDIO_PRO_LAUNCH_ENDS_LABEL = "Oct 31, 11:59 pm PT"

export function facestudioProLaunchPriceOn(now: number = Date.now()): boolean {
  return now < FACESTUDIO_PRO_LAUNCH_ENDS_AT
}

/** "2 days left", "5 hours left"; null once the launch price has ended. */
export function facestudioProLaunchTimeLeft(now: number = Date.now()): string | null {
  const ms = FACESTUDIO_PRO_LAUNCH_ENDS_AT - now
  if (ms <= 0) return null
  const hours = Math.ceil(ms / 3_600_000)
  if (hours <= 1) return "under an hour left"
  if (hours <= 24) return `${hours} hours left`
  const days = Math.floor(ms / 86_400_000)
  return `${days} day${days === 1 ? "" : "s"} left`
}

/**
 * Turn a product's fixed price into Black Friday getters (lib/black-friday.ts), read at the moment
 * of use: checkout charges the sale price from the instant the sale starts and the regular price
 * from the instant it ends, on a server that has been running since before either.
 *
 * Getters are defined on the object itself. (A `...spread` of an object with getters would call them
 * once and copy the values, which froze the price at the moment the module loaded: f9c2128.)
 */
function applyBlackFridayPricing(product: Product): void {
  const sale = BLACK_FRIDAY_APP_PRICE_CENTS[product.id]
  if (!sale) return
  const regularCents = product.priceInCents
  const on = () => blackFridayOn()
  Object.defineProperties(product, {
    priceInCents: { get: () => (on() ? sale : regularCents), enumerable: true, configurable: true },
    originalPriceInCents: { get: () => (on() ? regularCents : undefined), enumerable: true, configurable: true },
    promoValidUntil: { get: () => (on() ? BLACK_FRIDAY_LAST_DAY : undefined), enumerable: true, configurable: true },
    promoKind: { get: () => (on() ? ("sale" as const) : undefined), enumerable: true, configurable: true },
  })
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
    priceInCents: 1990, // Black Friday getters: applyBlackFridayPricing
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
    priceInCents: 1990, // Black Friday getters: applyBlackFridayPricing
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
    priceInCents: 2990, // Black Friday getters: applyBlackFridayPricing
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
    id: "nano-facestudio-pro",
    name: "Nano FaceStudio Pro",
    description:
      "AI Face Studio — Face swap, mask edit, expression editing, face vivid, upscale, light adjust, and crop in one local desktop app running 100% on your GPU. Free browser demos at /face-swap preview the swap + vivid capabilities.",
    // The launch price ($49.90) ended on 31 October; $69.90 since. Black Friday brings $49.90 back
    // as a sale price from 24 November to 24 December (lib/black-friday.ts).
    priceInCents: FACESTUDIO_PRO_REGULAR_PRICE_CENTS, // Black Friday getters: applyBlackFridayPricing
    // No trial — the free online demos at /face-swap (Nano FaceStudio Online +
    // NanoFace Vivid) act as the preview. This product is paid-only.
    features: [
      "7-tool bundle: swap, mask, expression, vivid, upscale, light, crop",
      "Multi-face swap up to 16 faces per image",
      "GAN and diffusion models",
      "2×, 3×, 4× full-image upscale",
      "Face Vivid: de-plasticize AI-smoothed skin",
      "Batch face swap: one reference across a whole shoot (1.2)",
      "Runs 100% locally on NVIDIA CUDA or Apple Silicon Metal (macOS 14+, M1 or newer)",
      "One-time license covers Windows + macOS",
      "Free browser demos available at /face-swap",
      "All 1.x updates included",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_FACESTUDIO_PRO",
  },
  {
    id: "nano-facestudio-v-pro",
    name: "Nano FaceStudio V Pro",
    description:
      "AI Video Face Studio — Swap a face in a video, enhance it to 1080p or 4K, and lip-sync it, in a local Windows desktop app running on your own NVIDIA GPU.",
    // Listed from the Black Friday launch (2026-11-23): $84.90 until 24 December, then $119.90.
    // It was never sold at $119.90 before, so pages call $84.90 a launch price, not a discount.
    get priceInCents() {
      return facestudioVProLaunchPriceOn() ? FACESTUDIO_V_PRO_LAUNCH_PRICE_CENTS : FACESTUDIO_V_PRO_REGULAR_PRICE_CENTS
    },
    get originalPriceInCents() {
      return facestudioVProLaunchPriceOn() ? FACESTUDIO_V_PRO_REGULAR_PRICE_CENTS : undefined
    },
    get promoValidUntil() {
      return facestudioVProLaunchPriceOn() ? BLACK_FRIDAY_LAST_DAY : undefined
    },
    get promoKind() {
      return facestudioVProLaunchPriceOn() ? ("launch" as const) : undefined
    },
    // No trial (owner, 2026-11-23).
    features: [
      "Video face swap: pick the person, add a photo of the new face",
      "Fast and Best quality modes, output in 1080p or 4K",
      "Enhance only: sharpen and clean up a video without swapping",
      "Optional lip sync to an audio file",
      "Up to 5 photos of the face for a closer match",
      "Batch queue of up to 50 videos",
      "Original sound kept; MP4 export",
      "Runs 100% locally on Windows with an NVIDIA RTX GPU",
    ],
    maxActivations: 1,
    masterKeyEnv: "LICENSE_MASTER_KEY_NANO_FACESTUDIO_V_PRO",
  },
  {
    id: "nano-videogen",
    name: "Nano VideoGen",
    description:
      "AI Video Generation — Create stunning videos from text prompts or images with Nano VideoGen, running 100% locally on your GPU.",
    priceInCents: 2990, // Black Friday getters: applyBlackFridayPricing
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

for (const product of PRODUCTS) applyBlackFridayPricing(product)

/**
 * Products that desktop apps can activate but that are not on sale yet. They stay out of PRODUCTS
 * because the pricing pages, checkout and facts.json list that array in full. priceInCents is
 * never shown or charged while a product is here; moving it into PRODUCTS is what lists it.
 */
const UNLISTED_PRODUCTS: Product[] = []

/** Every product a license can be activated for: the ones on sale and the unlisted ones. */
export const ACTIVATABLE_PRODUCTS: Product[] = [...PRODUCTS, ...UNLISTED_PRODUCTS]
