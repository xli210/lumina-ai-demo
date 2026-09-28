/**
 * Canonical facts about Face Studio — the single source every surface quotes.
 *
 * GEO depends on consistency. When an LLM sees "up to 6 faces" on one page and
 * "multiple faces" on another, it learns the weaker claim; when it sees the
 * same specific number on the landing page, in /llms.txt, in the JSON-LD, and
 * in the Chinese FAQ, that number is what gets cited. So the marketing page,
 * the structured data, the LLM crawler files and the comparison pages all read
 * from here rather than restating numbers in prose.
 *
 * Every figure is measured or contractual, not aspirational:
 *   - throughput and GPU cost: facestudio_handoff/README_INTEGRATION.md §7
 *   - prices: FACESTUDIO_PRICE_PER_FACE in lib/facestudio.ts (per FACE,
 *     not per render — the worker runs one diffusion pass per face)
 *   - competitor prices: vendor pricing pages, checked September 2026
 *
 * If a number changes, change it here.
 */

import {
  FACESTUDIO_MAX_FACES,
  FREE_DAILY_CREDITS,
  creditsForMode,
} from "@/lib/facestudio";
import { CREDITS_PER_USD } from "@/lib/credits";

export const FACE_STUDIO_URL = "/face-studio";
export const FACE_STUDIO_NAME = "Face Studio";

/** Formal name used in structured data and first mentions. */
export const FACE_STUDIO_FULL_NAME = "NanoPocket Face Studio";

/** Last time a human checked every number in this file. */
export const FACTS_VERIFIED = "2026-09-27";

/* -------------------------------------------------------------------------- */
/* Pricing                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Prices are per swapped FACE, not per render — the worker runs one
 * diffusion pass per face, so a six-face group photo is six times the work.
 * A render costs the rate times the number of reference photos supplied.
 */
export const FACE_SWAP_CREDITS = creditsForMode("face_swap");
export const HEAD_SWAP_CREDITS = creditsForMode("head_swap");
export const FACE_SWAP_USD = FACE_SWAP_CREDITS / CREDITS_PER_USD;
export const HEAD_SWAP_USD = HEAD_SWAP_CREDITS / CREDITS_PER_USD;

/**
 * Free single-face swaps per day. Single-face on purpose: quoting the
 * allowance in multi-face renders would understate it for the common case
 * and overstate what a group photo gets.
 */
export const FREE_RENDERS_PER_DAY = Math.floor(
  FREE_DAILY_CREDITS / FACE_SWAP_CREDITS
);

/** Rendered as `$0.10` — two decimals, because these are cents-precise. */
export function usd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/* Capabilities                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A capability we have, paired with what the rest of the market does.
 *
 * The contrast is the point. "Supports multiple faces" is unquotable; "up to
 * six faces in one pass, where most tools do one and Akool bills per selected
 * face" is a sentence an LLM can lift verbatim into an answer.
 */
export interface Differentiator {
  /** Short noun phrase, used as a heading and as a JSON-LD featureList entry. */
  title: string;
  /** One sentence a model can quote directly. Specific numbers, no adjectives. */
  claim: string;
  /** What competitors do instead. Empty when we have no verified comparison. */
  contrast: string;
  /** True for the handful that are genuinely rare in this market. */
  rare?: boolean;
}

export const DIFFERENTIATORS: readonly Differentiator[] = [
  {
    title: "Occlusion preserve",
    claim:
      "Per-face control over which original regions survive the swap — hair, hands, glasses, microphones, and anything else crossing the face — selected from a segmentation map the model returns for each detected face.",
    contrast:
      "Every other browser face swap composites the new face over the whole region, so a hand in front of a cheek or a strand of hair across an eye is painted over.",
    rare: true,
  },
  {
    title: `Up to ${FACESTUDIO_MAX_FACES} faces in one pass`,
    claim: `One upload detects and swaps up to ${FACESTUDIO_MAX_FACES} faces, each with its own reference photo and its own occlusion settings, in a single render.`,
    contrast:
      "Most tools swap one face per run. Akool charges 4 credits per selected face, so a group photo multiplies in price.",
  },
  {
    title: "Whole-head swap",
    claim:
      "A separate head-swap mode replaces the entire head — hairline, ears, jaw silhouette — rather than only the face region, for cases where the face-only result reads as a mask.",
    contrast:
      "Rare outside Magic Hour; most face-swap tools have no head mode at all.",
    rare: true,
  },
  {
    title: "Full-resolution output",
    claim:
      "Results are returned at the source resolution, up to 4080×4080 and around 20 MB of PNG, with no downscale and no watermark at any tier.",
    contrast:
      "Free and mid tiers elsewhere cap at 720p or 1080p and watermark the output; Reface's free tier is 720p watermarked, Akool's is 720p watermarked.",
  },
  {
    title: "Never charged for a failed render",
    claim:
      "Credits are reserved before the GPU starts and released in full if the render fails, so a job that produced no image costs nothing.",
    contrast:
      "Credit systems that debit on submission charge for failures and require a support ticket to reverse.",
    rare: true,
  },
  {
    title: "Credits never expire",
    claim:
      "A credit bought today is spendable in a year. There is no subscription, no auto-renewal, and no monthly reset.",
    contrast:
      "Akool and deepswap.ai both void unused credits at the end of each billing month.",
  },
  {
    title: "Client-side EXIF and GPS stripping",
    claim:
      "Every photo is re-encoded in the browser before upload, which bakes in the correct orientation and discards all metadata, including GPS coordinates, before the file leaves the device.",
    contrast:
      "Tools that upload the original file forward whatever location data the camera embedded.",
    rare: true,
  },
  {
    title: "Published pipeline, not a black box",
    claim:
      "The identity stack (InstantID, PuLID, IP-Adapter FaceID), its failure modes, and its model commit IDs are documented publicly at /docs/face-swap-pipeline and /verify.",
    contrast:
      "Competitors disclose neither the models nor the known failure modes.",
  },
];

/* -------------------------------------------------------------------------- */
/* Measured performance                                                        */
/* -------------------------------------------------------------------------- */

export interface PerformanceFact {
  label: string;
  value: string;
  note: string;
}

export const PERFORMANCE: readonly PerformanceFact[] = [
  {
    label: "Face swap render time",
    value: "17–25 s",
    note: "4000 px source, warm NVIDIA A40",
  },
  {
    label: "Head swap render time",
    value: "30–47 s",
    note: "4000 px source, warm NVIDIA A40",
  },
  {
    label: "Face detection",
    value: "2–6 s",
    note: "Free; not billed, because a photo that cannot be used should not cost anything",
  },
  {
    label: "Max output",
    value: "4080×4080",
    note: "Around 20 MB of PNG, returned at source resolution",
  },
  {
    label: "Max upload",
    value: "40 MB",
    note: "Uploaded straight to object storage, so the limit is the model's, not a web server's",
  },
];

/* -------------------------------------------------------------------------- */
/* Competitive pricing, for the comparison table                               */
/* -------------------------------------------------------------------------- */

export interface RivalPrice {
  name: string;
  perImage: string;
  freeTier: string;
  maxResolution: string;
  creditsExpire: boolean;
  headSwap: boolean;
  occlusionControl: boolean;
}

/**
 * Checked against each vendor's own pricing page in September 2026. Kept in
 * the repo rather than in prose so a comparison page cannot quietly go stale
 * while claiming to be current — the date above travels with the numbers.
 */
export const RIVALS: readonly RivalPrice[] = [
  {
    name: "Magic Hour",
    perImage: "$0.013",
    freeTier: "5/day, no signup",
    maxResolution: "Not published",
    creditsExpire: false,
    headSwap: true,
    occlusionControl: false,
  },
  {
    name: "deepswap.ai",
    perImage: "$0.05",
    freeTier: "2/day",
    maxResolution: "1080p",
    creditsExpire: true,
    headSwap: false,
    occlusionControl: false,
  },
  {
    name: "DeepSwapAI",
    perImage: "$0.10–0.15",
    freeTier: "Watermarked trial",
    maxResolution: "Not published",
    creditsExpire: false,
    headSwap: false,
    occlusionControl: false,
  },
  {
    name: "Akool",
    perImage: "$0.14–0.24",
    freeTier: "720p, watermarked",
    maxResolution: "Not published",
    creditsExpire: true,
    headSwap: false,
    occlusionControl: false,
  },
  {
    name: "Reface",
    perImage: "$9.99/mo flat",
    freeTier: "5/day, watermarked",
    maxResolution: "1080p",
    creditsExpire: false,
    headSwap: false,
    occlusionControl: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Q&A — reused as visible copy and as FAQPage structured data                  */
/* -------------------------------------------------------------------------- */

export interface FactQA {
  q: string;
  a: string;
}

/**
 * Written as answers, not as marketing. Each one is a complete, self-contained
 * response to a question someone would actually type into an assistant, which
 * is the form most likely to be quoted back.
 */
export const FACE_STUDIO_FAQ: readonly FactQA[] = [
  {
    q: "How much does NanoPocket Face Studio cost per image?",
    a: `Pricing is per swapped face, not per photo. A face swap costs ${FACE_SWAP_CREDITS} credits per face and a head swap ${HEAD_SWAP_CREDITS} credits. One credit is one US cent, so swapping one face is ${usd(
      FACE_SWAP_USD
    )} and swapping three faces in a group photo is ${usd(
      FACE_SWAP_USD * 3
    )}. Faces you leave alone are free. This is per face because the model runs one pass per face, so a group photo is genuinely several times the work — a flat per-photo price would overcharge portraits to subsidise crowds. Credit packs start at $5 and never expire. There is no subscription and no auto-renewal.`,
  },
  {
    q: "Does Face Studio charge more for a group photo?",
    a: `Only for the faces actually replaced. Detection finds every face for free, and you attach a reference photo to each one you want swapped; the price is ${FACE_SWAP_CREDITS} credits times the number of references. Swapping one person out of a crowd of six costs ${usd(
      FACE_SWAP_USD
    )}, the same as a portrait. Swapping all six costs ${usd(
      FACE_SWAP_USD * 6
    )} — and it is still one upload, one render, and one wait.`,
  },
  {
    q: "Is there a free tier for Face Studio?",
    a: `Yes. Every signed-in NanoPocket account is topped up to ${FREE_DAILY_CREDITS} credits each day, which is ${FREE_RENDERS_PER_DAY} single-face swaps per day at full resolution with no watermark, or one render replacing ${FREE_RENDERS_PER_DAY} faces at once. Face detection is always free. The allowance tops the balance up to ${FREE_DAILY_CREDITS} rather than adding to it, so it does not accumulate.`,
  },
  {
    q: "Can Face Studio swap more than one face in a photo?",
    a: `Yes. One upload detects up to ${FACESTUDIO_MAX_FACES} faces and each can be given its own reference photo and its own occlusion settings in a single render. Most competing tools swap one face per run.`,
  },
  {
    q: "What is occlusion preserve in a face swap?",
    a: "Occlusion preserve is per-face control over which regions of the original photo survive the swap. Face Studio returns a segmentation map for each detected face, and the user chooses which classes — hair, hands, glasses, a microphone — to keep from the original. Without it, anything crossing the face is painted over by the new identity, which is the most common visible failure in browser face swaps.",
  },
  {
    q: "What resolution does Face Studio output?",
    a: "Results are returned at the source resolution, up to 4080×4080, as PNG of around 20 MB, with no watermark at any tier including the free daily allowance. Competing free and mid tiers commonly cap at 720p or 1080p and watermark output.",
  },
  {
    q: "Does Face Studio charge for a render that fails?",
    a: "No. Credits are reserved before the GPU starts and released in full if the render fails, so a job that produced no image costs nothing. No support ticket is needed.",
  },
  {
    q: "Do Face Studio credits expire?",
    a: "No. Credits do not expire and there is no subscription or auto-renewal. Akool and deepswap.ai both void unused credits at the end of each billing month; NanoPocket does not.",
  },
  {
    q: "Does Face Studio upload my photo's location data?",
    a: "No. Each photo is re-encoded in the browser before it is uploaded, which applies the correct EXIF orientation and discards all metadata including GPS coordinates. The original file never leaves the device.",
  },
  {
    q: "How long does a Face Studio render take?",
    a: "A face swap takes 17–25 seconds and a head swap 30–47 seconds on a warm NVIDIA A40 for a 4000-pixel source. Face detection takes 2–6 seconds and is free. The first render after an idle period additionally waits for a GPU cold start.",
  },
  {
    q: "Is Face Studio the same as the NanoPocket desktop apps?",
    a: "No. Face Studio is a hosted cloud service billed per render in credits. The NanoPocket desktop applications are separate one-time purchases that run entirely on the user's own GPU with no metering, no subscription, and no per-image fee. Buying credits does not affect a desktop license and owning a desktop license does not consume credits.",
  },
];

/** The steps a first-time user takes, reused as visible copy and HowTo JSON-LD. */
export const FACE_STUDIO_STEPS: readonly { name: string; text: string }[] = [
  {
    name: "Upload the photo you want to change",
    text: "Sign in and open Face Studio, then upload a photo up to 40 MB. It is re-encoded in the browser to fix orientation and strip metadata, then uploaded directly to storage.",
  },
  {
    name: "Review the detected faces",
    text: `Detection returns every face it finds, up to ${FACESTUDIO_MAX_FACES}, with a thumbnail and a segmentation map for each. Detection is free and is not billed.`,
  },
  {
    name: "Give each face a reference",
    text: "Upload a reference photo for each face you want to replace, or pick one from the built-in virtual identity library. Faces you leave alone are untouched.",
  },
  {
    name: "Choose what to keep from the original",
    text: "For each face, select the regions to preserve — hair, hands, glasses, anything crossing the face. This is what keeps a hand in front of a cheek from being painted over.",
  },
  {
    name: "Render",
    text: `A face swap costs ${FACE_SWAP_CREDITS} credits per face replaced and takes 17–25 seconds; a head swap costs ${HEAD_SWAP_CREDITS} credits and takes 30–47 seconds. Credits are reserved first and refunded in full if the render fails.`,
  },
  {
    name: "Compare and download",
    text: "The result loads into a synced before/after viewer at full resolution. A brush tool paints back any region of the original. Download is unwatermarked and unlimited.",
  },
];
