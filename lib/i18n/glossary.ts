/**
 * Do-Not-Translate (DNT) glossary.
 *
 * Any string in this list MUST appear verbatim in every translated message
 * catalogue. The CI checker (scripts/check-i18n-dnt.mjs) verifies this.
 *
 * Add a term here when:
 * - It is a brand name (ours or a competitor's).
 * - It is the exact name of an open-source / commercial model the docs cite.
 * - It is a URL, password, file path, code identifier, or RFC number.
 *
 * Do NOT add generic English nouns ("face swap", "browser") — those are
 * meant to be translated.
 */

export const I18N_DNT_TERMS = [
  // First-party brand names
  "NanoPocket",
  "NanoFace Vivid",
  "FaceSwap Pro 2.0",
  "Image FaceSwap Pro 2.0",
  "Video FaceSwap Pro",
  "Nano FaceSwap Pro",
  "Nano Video FaceSwap Pro",

  // Competitor brand names (referenced in comparisons)
  "DeepSwap",
  "Reface",
  "FaceFusion",
  "Akool",
  "Magic Hour",
  "WaveSpeed AI",
  "Roop",
  "Roop Unleashed",
  "Rope",
  "Rope Live",
  "DeepFaceLab",
  "Deep-Live-Cam",
  "deepfacelive",
  "Reactor",
  "SimSwap",
  "HeyGen",
  "DeepBrain",
  "Nano Banana",

  // Models / technical artefacts (always cited verbatim)
  "InstantID",
  "PuLID",
  "IP-Adapter FaceID",
  "PhotoMaker",
  "InsightFace",
  "inswapper_128",
  "Flux.1",
  "LTX-2.3",
  "Stable Diffusion",
  "Real-ESRGAN",
  "BasicVSR++",
  "Gemini 2.5 Flash Image",
  "Adobe Firefly",
  "ComfyUI",

  // Vendor / partner names
  "Cloudflare",
  "Hugging Face",
  "GitHub",
  "Discord",
  "Apple Silicon Metal",
  "NVIDIA CUDA",
  "Windows",
  "macOS",
  "iOS",
  "Android",

  // URLs and route slugs that must round-trip exactly
  "nanopocket.ai",
  "/face-swap",
  "/best-face-swap-app-2026",
  "/compare",
  "/compare/nanopocket-vs-deepswap",
  "/compare/nanopocket-vs-wavespeed",
  "/compare/nanopocket-vs-nano-banana",
  "/apps/nano-faceswap-pro",
  "/apps/nanoface-vivid",
  "/auth/sign-up",
  "/privacy",
  "/verify",
  "/status",
  "/.well-known/security.txt",

  // Email / contact
  "tech@nanopocket.ai",
  "sales@nanopocket.ai",
] as const;

export type I18nDntTerm = (typeof I18N_DNT_TERMS)[number];
