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
const NOT_A_FAULT = new Set(["cancelled", "studio_cancelled", "input_rejected", "page_released_before_job", "no_job_started"]);

export interface HoldRow {
  id: string;
  user_id: string;
  service: string;
  status: "open" | "captured" | "released" | "expired" | string;
  amount: number;
  estimate: Record<string, unknown> | null;
  /** The job at the GPU side (HeadSwap Pro: the gateway's job id, which says where it ran). */
  job_ref?: string | null;
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
  "facestudio-v": "Video FaceSwap 2.5 Online",
  imageedit: "SpotEdit",
  "headswap-pro": "Nano HeadSwap Pro",
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
    if (t) return t.charAt(0).toUpperCase() + t.slice(1);
    return e.model === "spotedit" ? "SpotEdit" : "Unknown tool";
  }
  if (h.service === "facestudio-v") {
    const m = typeof e.mode === "string" ? e.mode : "";
    return VIDEO_MODE_LABELS[m] ?? "Mode not recorded";
  }
  return "All modes";
}

/** Mirror of FACESTUDIO_V_MODES (kept here so this file stays free of app imports). */
const VIDEO_MODE_LABELS: Record<string, string> = {
  fast: "Fast",
  quality: "Best quality",
  head: "Headswap Best",
  head_fast: "Headswap Fast",
  enhance_fast: "Fast enhance",
  enhance_best: "Best-quality enhance",
};

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

// "own" is the lab's GPU: the RTX 5090 (cs-300036-d) until 2026-11-11, two RTX 4090s (server-black) since 2026-11-13.
const VENDOR_LABELS: Record<string, string> = { own: "Lab GPU", cloud: "RunPod" };
const NO_VENDOR = "Vendor not recorded";
/** A HeadSwap Pro job taken by the lab worker has a gateway id starting with this (headswap-gateway/remote_queue.py ID_MARK); RunPod's never do. */
const LAB_JOB_MARK = "q-";

/** Who rendered: a video, as the studio says when the hold is settled; a HeadSwap Pro swap, from its gateway job id (a lab job that moved
 *  to RunPod keeps its lab id, so it counts for the lab). Older holds, and ones the sweeper freed, have no vendor. */
export function vendorOf(h: Pick<HoldRow, "service" | "estimate" | "job_ref">): string {
  if (h.service === "headswap-pro") {
    const j = h.job_ref;
    return typeof j === "string" && j ? (j.startsWith(LAB_JOB_MARK) ? VENDOR_LABELS.own : VENDOR_LABELS.cloud) : NO_VENDOR;
  }
  if (h.service !== "facestudio-v") return "-";
  const v = h.estimate?.vendor;
  return typeof v === "string" ? VENDOR_LABELS[v] ?? v : NO_VENDOR;
}

export interface VendorSummary {
  groups: Group[];
  /** Video only: started on the lab GPU, which could not do them, and finished by RunPod: delivered, so they count for RunPod, but each is a fault of the lab GPU's. */
  ownToCloud: number;
  /** Video only: stuck in RunPod's queue and moved to the lab GPU. */
  cloudToOwn: number;
}

/** One service (Video FaceSwap by default, or HeadSwap Pro): one row per vendor, and one per mode inside it. A render counts for the vendor that finished it. */
export function summariseVendors(rows: HoldRow[], service = "facestudio-v"): VendorSummary {
  const video = rows.filter((h) => h.service === service);
  const groups: Group[] = [];
  for (const vendor of [VENDOR_LABELS.own, VENDOR_LABELS.cloud, NO_VENDOR]) {
    const mine = video.filter((h) => vendorOf(h) === vendor);
    if (mine.length === 0) continue;
    const total = emptyTally();
    const byMode = new Map<string, Tally>();
    for (const h of mine) {
      add(total, h);
      const m = modeOf(h);
      if (!byMode.has(m)) byMode.set(m, emptyTally());
      add(byMode.get(m)!, h);
    }
    groups.push({ service: vendor, label: vendor, mode: null, tally: total });
    for (const [mode, tally] of Array.from(byMode.entries()).sort((a, b) => b[1].total - a[1].total)) groups.push({ service: vendor, label: vendor, mode, tally });
  }
  const moved = (how: string) => video.filter((h) => h.estimate?.vendor_moved === how).length;
  return { groups, ownToCloud: moved("own_to_cloud"), cloudToOwn: moved("cloud_to_own") };
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
  input_rejected: "Photo could not be used (not our fault)",
  edit_failed: "Edit failed on the GPU",
  gateway_rejected: "GPU gateway refused the job",
  gateway_unreachable: "GPU gateway unreachable",
  attach_failed: "Could not attach the job",
  watermark_missing: "Result came back without its watermark",
  price_mismatch: "Studio price did not match the reservation",
  studio_error: "Studio reported an error",
  studio_refunded: "Studio refunded the job",
  no_job_started: "No job was started",
  studio_job_missing: "Studio no longer knew the job",
  gateway_job_missing: "Gateway no longer knew the job",
  unknown: "No reason recorded",
};
