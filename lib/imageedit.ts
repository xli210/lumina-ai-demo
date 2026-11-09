/**
 * SpotEdit (online, formerly Nano ImageEdit 2.0 Online) contract — safe to import from both client and server.
 *
 * A prompt-driven photo editor that changes only the part of the photo the
 * prompt names and returns the photo at its full resolution. The model is
 * SpotEdit; the GPU work runs on the RunPod Serverless endpoint
 * 8zekyhvth8nfp6, reached through the same gateway as Nano FaceStudio Online;
 * images travel through R2 under `spotedit/`.
 *
 *   browser ──► /api/imageedit/* (auth + credits) ──► gateway ──► RunPod
 *      └──────────── presigned PUT / GET ────────────► R2 ◄────────┘
 *
 * Nothing secret lives here. See docs/image-edit.md.
 */

export const IMAGEEDIT_NAME = "SpotEdit";

/** `service` on credit holds and ledger rows. */
export const IMAGEEDIT_SERVICE = "imageedit";

/**
 * Credits per finished edit, by the photo's size: [up to this many MP, credits].
 * A failed edit costs nothing, and "Try another version" is a new edit.
 */
export const IMAGEEDIT_CREDIT_TIERS: ReadonlyArray<readonly [maxMp: number, credits: number]> = [
  [12, 40],
  [24, 50],
  [49, 60],
];

/** The cheapest edit: what an account must hold to start, and the price quoted as "from". */
export const IMAGEEDIT_CREDITS_PER_EDIT = IMAGEEDIT_CREDIT_TIERS[0][1];

export const IMAGEEDIT_MAX_MP = IMAGEEDIT_CREDIT_TIERS[IMAGEEDIT_CREDIT_TIERS.length - 1][0];

/** The price of one edit. MP is rounded first, so a 12.2 MP phone photo counts as 12 MP. */
export function creditsForPhoto(width: number, height: number): number {
  const mp = Math.round((width * height) / 1e6);
  const tier = IMAGEEDIT_CREDIT_TIERS.find(([maxMp]) => mp <= maxMp);
  return (tier ?? IMAGEEDIT_CREDIT_TIERS[IMAGEEDIT_CREDIT_TIERS.length - 1])[1];
}

/**
 * Open reservations per account. The endpoint runs at most two workers, one job
 * each, so more than this only builds a queue the user is paying to hold.
 */
export const IMAGEEDIT_MAX_OPEN_EDITS = 2;

/**
 * How long a reservation may stay open before the sweeper frees it. Long
 * enough for a GPU start and a large edit (over four minutes when more than
 * half of a big photo changes); a hold released before its job finishes is an
 * edit delivered free.
 */
export const IMAGEEDIT_HOLD_TTL_SECONDS = 30 * 60;

/** The prices as one line, for the places that quote them all. */
export const IMAGEEDIT_PRICE_TEXT = IMAGEEDIT_CREDIT_TIERS.map(([maxMp, credits]) => `${credits} credits up to ${maxMp} MP`).join(", ");

/** The prices as a range, for sentences that have room for one figure. */
export const IMAGEEDIT_PRICE_RANGE = `${IMAGEEDIT_CREDITS_PER_EDIT}-${IMAGEEDIT_CREDIT_TIERS[IMAGEEDIT_CREDIT_TIERS.length - 1][1]}`;

/** Largest upload; the gateway refuses anything bigger. */
export const IMAGEEDIT_MAX_UPLOAD_MB = 120;

/** Presigned upload lifetime. */
export const IMAGEEDIT_UPLOAD_TTL_SECONDS = 15 * 60;

/** Presigned result lifetime. The privacy policy promises links that expire within an hour. */
export const IMAGEEDIT_FILE_TTL_SECONDS = 60 * 60;

/** RunPod job ids, e.g. `53e40671-8baa-479d-a46b-c413bb7083a8-u1`. */
export function isImageEditJobId(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9-]{8,80}$/.test(v);
}
