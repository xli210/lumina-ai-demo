/**
 * The decisions behind the Video FaceSwap Online trial's billing, as pure
 * functions of what the studio reports, so each case can be tested without a
 * database or a network.
 */

export interface StudioBilling {
  credits?: number;
  status?: "held" | "settled" | "refunded";
  charge?: number;
  refund?: number;
}

export type StudioJob =
  | { found: true; state: string; billing: StudioBilling | null }
  | { found: false }
  | { error: string };

export type SettlementDecision =
  | { action: "capture"; amount: number }
  | { action: "release"; reason: string }
  | { action: "wait" }
  | { action: "unreachable"; message: string };

/**
 * What to do with an open reservation, given what the studio says about its job.
 * A video the studio made (`settled`) is charged what the STUDIO charged, never
 * more than was reserved. A failed, cancelled or abandoned one (`refunded`) costs
 * nothing. Anything not final waits. A job the studio no longer knows about
 * produced nothing, so it costs nothing.
 */
export function decideSettlement(reserved: number, job: StudioJob): SettlementDecision {
  if ("error" in job) return { action: "unreachable", message: job.error };
  if (!job.found) return { action: "release", reason: "studio_job_missing" };

  const b = job.billing;
  if (b?.status === "settled") {
    const asked = Number.isFinite(b.charge) ? (b.charge as number) : Number.isFinite(b.credits) ? (b.credits as number) : reserved;
    return { action: "capture", amount: Math.max(0, Math.min(Math.floor(asked), reserved)) };
  }
  if (b?.status === "refunded") return { action: "release", reason: "studio_refunded" };
  if (!b && (job.state === "error" || job.state === "cancelled")) {
    return { action: "release", reason: `studio_${job.state}` };
  }
  return { action: "wait" };
}

/**
 * Is a studio insisting on a quote? Its /api/health reports it as swap.billing.enabled
 * (a public studio nests everything under `swap`); an older shape had it at the top.
 */
export function billingEnabledIn(health: unknown): boolean {
  const h = (health ?? {}) as { billing?: { enabled?: unknown }; swap?: { billing?: { enabled?: unknown } } };
  return h.swap?.billing?.enabled === true || h.billing?.enabled === true;
}

/** Does the price the studio put on a job fit what was reserved? */
export function priceFits(reserved: number, job: StudioJob): boolean {
  return "found" in job && job.found && typeof job.billing?.credits === "number" && job.billing.credits <= reserved;
}
