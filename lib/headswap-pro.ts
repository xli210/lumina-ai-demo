/**
 * Nano HeadSwap Pro: constants, price and the settlement rule. Pure (no database, no network),
 * so the rules can be tested on their own (scripts/check-headswap-pro.mjs).
 *
 * How a swap is paid for (the same reserve-then-settle model as every other hosted tool):
 *   1. the page asks /api/headswap/hold for n images: credits are reserved and a signed ticket comes back;
 *   2. the page sends the swap to the gateway with that ticket (the gateway refuses a swap without one);
 *   3. /api/headswap/settle asks the gateway how the job ended and charges what was delivered, or gives it all back.
 */

/** The one place the public name lives. */
export const HEADSWAP_PRO_NAME = "Nano HeadSwap Pro";
export const HEADSWAP_PRO_TAGLINE = "Starring you.";
export const HEADSWAP_PRO_SERVICE = "headswap-pro";

/** Credits for one delivered image (1 credit = $0.01). The GPU costs us $0.011 to $0.04 an image. */
export const HEADSWAP_PRO_CREDITS_PER_IMAGE = 20;
export const HEADSWAP_PRO_MAX_VARIATIONS = 4;
export const HEADSWAP_PRO_HOLD_TTL_SECONDS = 60 * 60;
/** Reservations an account may have open at once: each one is a GPU job. */
export const HEADSWAP_PRO_MAX_OPEN = 2;
/** How long a ticket is good for: long enough to pick the head photo, not worth keeping. */
export const HEADSWAP_PRO_TICKET_TTL_SECONDS = 20 * 60;

/** Off until HEADSWAP_PRO=1 is set, which happens only after the gateway is deployed. */
export function headswapProEnabled(env: string | undefined = process.env.HEADSWAP_PRO): boolean {
  return env === "1";
}

export function creditsFor(images: number): number {
  return HEADSWAP_PRO_CREDITS_PER_IMAGE * images;
}

/** The variation count from a request, or null when it is not 1 to 4. */
export function parseVariations(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= HEADSWAP_PRO_MAX_VARIATIONS ? v : null;
}

/** A RunPod job id as the gateway returns it, checked before it is stored or put in a URL. */
export function isGatewayJobId(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9-]{8,80}$/.test(v);
}

export type GatewayJob =
  | { found: true; status: string; billable_images?: number; watermarked?: boolean }
  | { found: false }
  | { error: string };

export type SettlementDecision =
  | { action: "capture"; amount: number }
  | { action: "release"; reason: string }
  | { action: "wait" }
  | { action: "unreachable"; message: string };

/**
 * What to do with an open reservation, given what the gateway says about the job.
 * Charged: what was delivered (billable images x the price), never more than was reserved.
 * A failed job costs nothing. A render that was owed a watermark and came back without one is
 * not delivered, so it costs nothing either. Not final yet: wait.
 */
export function decideSettlement(reserved: number, job: GatewayJob, owedWatermark: boolean): SettlementDecision {
  if ("error" in job) return { action: "unreachable", message: job.error };
  if (!job.found) return { action: "release", reason: "gateway_job_missing" };
  if (job.status === "error") return { action: "release", reason: "render_failed" };
  if (job.status !== "done") return { action: "wait" };
  if (owedWatermark && job.watermarked !== true) return { action: "release", reason: "watermark_missing" };
  const n = Number.isInteger(job.billable_images) ? (job.billable_images as number) : 0;
  if (n < 1) return { action: "release", reason: "render_failed" };
  return { action: "capture", amount: Math.min(reserved, creditsFor(n)) };
}
