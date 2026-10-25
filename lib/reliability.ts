/**
 * How reliable each hosted service is, worked out from the credit holds.
 *
 * Every render reserves credits first (a hold) and then either captures them (the render
 * was delivered) or releases them (it was not). So the holds table already says, for every
 * attempt, which service and mode it was and how it ended, without asking the GPUs.
 *
 * Pure functions only, so the rules can be read in one place and tested without a database.
 */

export type Outcome =
  | "success" // delivered, credits captured
  | "system_failure" // our side failed and the credits went back
  | "cancelled" // the user left or cancelled before anything was made: not our fault
  | "expired" // nobody settled it and the sweeper freed it: unknown, shown separately
  | "in_flight"; // still running

/** Release reasons that mean the person stopped, not the service. */
const NOT_A_FAULT = new Set(["cancelled", "studio_cancelled", "page_released_before_job", "no_job_started"]);

export interface HoldRow {
  id: string;
  user_id: string;
  service: string;
  status: "open" | "captured" | "released" | "expired" | string;
  amount: number;
  estimate: Record<string, unknown> | null;
  created_at: string;
}

export function releaseReason(h: Pick<HoldRow, "estimate">): string {
  const r = h.estimate?.release_reason;
  return typeof r === "string" && r ? r : "unknown";
}

export function classify(h: Pick<HoldRow, "status" | "estimate">): Outcome {
  if (h.status === "captured") return "success";
  if (h.status === "open") return "in_flight";
  if (h.status === "expired") return "expired";
  if (h.status === "released") return NOT_A_FAULT.has(releaseReason(h)) ? "cancelled" : "system_failure";
  return "system_failure";
}

export const SERVICE_LABELS: Record<string, string> = {
  facestudio: "Nano FaceStudio Online",
  "facestudio-v": "Video FaceSwap Online",
  imageedit: "Image Edit Online",
};

const MODE_LABELS: Record<string, string> = {
  face_swap: "Face swap",
  head_swap: "Head swap",
};

/** The mode or tool inside a service. Video FaceSwap does not record one on the hold. */
export function modeOf(h: Pick<HoldRow, "service" | "estimate">): string {
  const e = h.estimate ?? {};
  if (h.service === "facestudio") {
    const m = typeof e.mode === "string" ? e.mode : "";
    return MODE_LABELS[m] ?? (m || "Unknown mode");
  }
  if (h.service === "imageedit") {
    const t = typeof e.tool === "string" ? e.tool : "";
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Unknown tool";
  }
  return "All modes (not recorded per render)";
}

export interface Tally {
  total: number;
  success: number;
  system_failure: number;
  cancelled: number;
  expired: number;
  in_flight: number;
  /** Credits handed back after a failure: what the failures cost users to wait out. */
  failed_credits: number;
  reasons: Record<string, number>;
}

export function emptyTally(): Tally {
  return { total: 0, success: 0, system_failure: 0, cancelled: 0, expired: 0, in_flight: 0, failed_credits: 0, reasons: {} };
}

export function add(t: Tally, h: HoldRow): void {
  const o = classify(h);
  t.total += 1;
  t[o] += 1;
  if (o === "system_failure") {
    t.failed_credits += h.amount;
    const r = releaseReason(h);
    t.reasons[r] = (t.reasons[r] ?? 0) + 1;
  }
}

/** Renders that finished one way or the other: the denominator for the rates. */
export function decided(t: Tally): number {
  return t.success + t.system_failure;
}

/** Share of decided renders that were delivered, or null when none were decided. */
export function successRate(t: Tally): number | null {
  const d = decided(t);
  return d === 0 ? null : t.success / d;
}

export function errorRate(t: Tally): number | null {
  const d = decided(t);
  return d === 0 ? null : t.system_failure / d;
}

export interface Group {
  service: string;
  label: string;
  mode: string | null; // null for the service total
  tally: Tally;
}

/** One row per service, and one per mode inside it, services in a fixed order. */
export function summarise(rows: HoldRow[]): Group[] {
  const bySvc = new Map<string, Tally>();
  const byMode = new Map<string, Tally>();
  for (const h of rows) {
    if (!bySvc.has(h.service)) bySvc.set(h.service, emptyTally());
    add(bySvc.get(h.service)!, h);
    const k = `${h.service}\u0000${modeOf(h)}`;
    if (!byMode.has(k)) byMode.set(k, emptyTally());
    add(byMode.get(k)!, h);
  }
  const order = Object.keys(SERVICE_LABELS);
  const services = Array.from(bySvc.keys()).sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const out: Group[] = [];
  for (const s of services) {
    out.push({ service: s, label: SERVICE_LABELS[s] ?? s, mode: null, tally: bySvc.get(s)! });
    const modes = Array.from(byMode.entries())
      .filter(([k]) => k.startsWith(s + "\u0000"))
      .map(([k, t]) => ({ mode: k.slice(s.length + 1), t }))
      .sort((a, b) => b.t.total - a.t.total);
    for (const m of modes) out.push({ service: s, label: SERVICE_LABELS[s] ?? s, mode: m.mode, tally: m.t });
  }
  return out;
}

export const WINDOWS = {
  today: { label: "Today (UTC)", since: () => new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z") },
  "24h": { label: "Last 24 hours", since: () => new Date(Date.now() - 24 * 3600_000) },
  "7d": { label: "Last 7 days", since: () => new Date(Date.now() - 7 * 86400_000) },
  "30d": { label: "Last 30 days", since: () => new Date(Date.now() - 30 * 86400_000) },
} as const;

export type WindowKey = keyof typeof WINDOWS;

export function parseWindow(v: string | undefined): WindowKey {
  return v && v in WINDOWS ? (v as WindowKey) : "today";
}

export function fmtRate(r: number | null): string {
  if (r === null) return "—";
  const p = r * 100;
  return `${p >= 99.95 || p === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
}

/** Human wording for the codes the routes store. Unknown codes are shown as they are. */
export const REASON_LABELS: Record<string, string> = {
  render_failed: "Render failed on the GPU",
  edit_failed: "Edit failed on the GPU",
  gateway_rejected: "GPU gateway refused the job",
  gateway_unreachable: "GPU gateway unreachable",
  attach_failed: "Could not attach the job",
  watermark_missing: "Result came back without its watermark",
  price_mismatch: "Studio price did not match the reservation",
  studio_error: "Studio reported an error",
  studio_refunded: "Studio refunded the job",
  studio_job_missing: "Studio no longer knew the job",
  unknown: "No reason recorded",
};
