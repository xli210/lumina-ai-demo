/**
 * Face Studio contract — safe to import from both client and server.
 *
 * Face Studio is the paid, credit-metered version of the multi-face swap and
 * head swap tool. The GPU work runs on a RunPod Serverless endpoint behind a
 * gateway; this file holds the vocabulary and the prices that the browser,
 * the /api/facestudio/* routes and the gateway all have to agree on.
 *
 * Nothing secret lives here. The gateway token is server-only and handled in
 * lib/facestudio-server.ts.
 *
 * Reference: facestudio_handoff/README_INTEGRATION.md
 */

import { CREDITS_PER_USD } from "@/lib/credits";

export const FACESTUDIO_DEFAULT_BASE_URL =
  "https://facestudio-gateway.onrender.com";

/* -------------------------------------------------------------------------- */
/* Modes and pricing                                                           */
/* -------------------------------------------------------------------------- */

/** `head_swap` replaces the whole head and requires exactly one face. */
export type FaceStudioMode = "face_swap" | "head_swap";

export const FACESTUDIO_MODES: readonly FaceStudioMode[] = [
  "face_swap",
  "head_swap",
];

export function isFaceStudioMode(v: unknown): v is FaceStudioMode {
  return typeof v === "string" && FACESTUDIO_MODES.some((m) => m === v);
}

/**
 * What one swapped face costs, in credits (1 credit = $0.01).
 *
 * Named per *face*, not per render, because the worker runs one diffusion
 * pass per face: a six-face group photo is six times the GPU work of a
 * portrait. Charging per render would have meant a flat fee for anything
 * between one and six times the cost, which is both unprofitable at the top
 * end and overpriced at the bottom.
 *
 * Derived from the measured GPU cost in README_INTEGRATION.md §7 at $0.00034
 * per GPU second: a single-face swap runs 17-25 s (~$0.006-0.008) and a head
 * swap 30-47 s (~$0.010-0.016). Head swap is twice face swap because it costs
 * roughly twice as much to produce, which keeps the margin flat across both
 * instead of subsidising head swaps out of face swap revenue.
 *
 * Detection is free; see the reasoning on DETECT_MIN_BALANCE below.
 */
export const FACESTUDIO_PRICE_PER_FACE: Readonly<
  Record<FaceStudioMode, number>
> = {
  face_swap: 10,
  head_swap: 20,
};

/** The per-face rate. Use `creditsForJob` to price an actual render. */
export function creditsForMode(mode: FaceStudioMode): number {
  return FACESTUDIO_PRICE_PER_FACE[mode];
}

/**
 * What a whole render costs: the per-face rate times the number of faces
 * being replaced.
 *
 * `faceCount` is the number of reference photos supplied, not the number of
 * faces detected — a group photo where only one person is being swapped is
 * one face of work and is billed as one.
 *
 * Head swap accepts exactly one face, so this is always the base rate there;
 * the multiplication is written generally anyway so the two modes cannot
 * drift apart if that constraint is ever lifted.
 *
 * Linear is a slight overcharge: a render has fixed overhead (decoding the
 * source, encoding a ~20 MB PNG) that does not repeat per face. The ledger
 * records both the face count and the measured render time, so the curve can
 * be fitted from real data later rather than guessed at now.
 */
export function creditsForJob(
  mode: FaceStudioMode,
  faceCount: number
): number {
  const faces = Math.min(Math.max(Math.trunc(faceCount), 1), FACESTUDIO_MAX_FACES);
  return FACESTUDIO_PRICE_PER_FACE[mode] * faces;
}

/** The cheapest possible render — one face — for affordability checks. */
export const FACESTUDIO_MIN_PRICE = Math.min(
  ...FACESTUDIO_MODES.map((m) => FACESTUDIO_PRICE_PER_FACE[m])
);

/**
 * Detection is free, but it is not costless: it occupies a GPU for 2-6 s
 * (~$0.001). Rather than add a separate rate-limit table, detect requires
 * enough balance to pay for the cheapest render — detecting faces is only
 * useful as a prelude to generating, so a user who cannot afford a render has
 * no legitimate reason to be detecting, and a user who can is self-limiting
 * because every render they run spends down this same balance.
 */
export const DETECT_MIN_BALANCE = FACESTUDIO_MIN_PRICE;

/**
 * What every signed-in account is topped up to, free, once per UTC day.
 *
 * 30 credits is three face swaps, costing us at most ~$0.024 of GPU per
 * active user per day. This is what keeps "free for every signed-in account"
 * true — the claim is published across the site and in the homepage FAQ's
 * JSON-LD, so credits had to be an upgrade rather than a toll gate.
 *
 * It tops the balance *up to* this figure rather than adding to it, which is
 * the whole reason it is safe: an account that sat idle for a hundred days
 * still arrives with 30, not 3,000. The consequence is that someone holding a
 * purchased balance above 30 receives nothing, which is intended — the free
 * tier exists so people can try the thing, not as a discount on volume.
 */
export const FREE_DAILY_CREDITS = 30;

/**
 * How long a reservation survives unsettled.
 *
 * A head swap is 30-47 s of GPU plus up to ~20 s of cold start, so 15 minutes
 * is far longer than any healthy job needs. Shorter than the system-wide
 * default of an hour on purpose: these are small, fast jobs, and a user whose
 * browser was closed mid-render should get their credits back promptly.
 */
export const FACESTUDIO_HOLD_TTL_SECONDS = 900;

/** Identifies our reservations in credit_holds.service. */
export const FACESTUDIO_SERVICE = "facestudio";

/* -------------------------------------------------------------------------- */
/* Limits                                                                      */
/* -------------------------------------------------------------------------- */

/** The GPU worker refuses inputs over 40 MB. */
export const FACESTUDIO_MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

/** Most faces the worker will return from one photo. */
export const FACESTUDIO_MAX_FACES = 6;

export const FACESTUDIO_ALLOWED_UPLOAD_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function isAllowedUploadType(v: unknown): boolean {
  return (
    typeof v === "string" && FACESTUDIO_ALLOWED_UPLOAD_TYPES.some((t) => t === v)
  );
}

/**
 * Storage keys are minted by the gateway as `<32 hex>.<ext>`. Validating the
 * shape here means a caller cannot smuggle a path such as `../secrets` into a
 * storage lookup by way of `detection_id`.
 */
const STORAGE_KEY = /^[0-9a-f]{32}\.(jpg|png)$/;

export function isStorageKey(v: unknown): v is string {
  return typeof v === "string" && STORAGE_KEY.test(v);
}

/** RunPod job ids, as accepted by the gateway. */
const JOB_ID = /^[A-Za-z0-9-]{8,80}$/;

export function isFaceStudioJobId(v: unknown): v is string {
  return typeof v === "string" && JOB_ID.test(v);
}

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

export type FaceStudioJobStatus = "queued" | "running" | "done" | "error";

export interface FaceStudioSegClass {
  id: number;
  name: string;
  color: [number, number, number];
  area_pct: number;
  default_preserve: boolean;
}

export interface FaceStudioFace {
  index: number;
  bbox_max_dim: number;
  thumb_b64: string;
  seg_panel_b64: string;
  seg_map_b64: string;
  seg_w: number;
  seg_h: number;
  present_classes: FaceStudioSegClass[];
}

export interface FaceStudioDetectResult {
  detection_id: string;
  count: number;
  max_faces: number;
  faces: FaceStudioFace[];
}

export interface FaceStudioUploadTicket {
  upload_url: string;
  input_key: string;
  max_bytes: number;
  expires_in: number;
}

/**
 * The status document the console polls. `credits_charged` is ours, not the
 * gateway's: it reports what settling the job actually cost so the UI can
 * update the balance without a second request.
 */
export interface FaceStudioStatusResult {
  status: FaceStudioJobStatus;
  progress_pct?: number;
  elapsed_seconds?: number;
  error?: string;
  credits_charged?: number;
  balance?: number;
  available?: number;
}

/** 402 body. `shortfall` is how many credits the user needs to buy. */
export interface FaceStudioInsufficientCredits {
  detail: string;
  reason: "insufficient_credits";
  required: number;
  available: number;
  shortfall: number;
  topup_url: string;
}

/* -------------------------------------------------------------------------- */
/* Display helpers                                                             */
/* -------------------------------------------------------------------------- */

/** `30 credits ($0.30)` — the price of an actual render, for the button. */
export function describePrice(
  mode: FaceStudioMode,
  faceCount: number
): string {
  const credits = creditsForJob(mode, faceCount);
  return `${credits} credits ($${(credits / CREDITS_PER_USD).toFixed(2)})`;
}
