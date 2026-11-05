import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { callUpstream, isOk } from "@/lib/facestudio-server";
import { gatewayBase } from "@/lib/headswap-pro-server";
import { studioHealth, studioVendors } from "@/lib/facestudio-v-server";

/**
 * The lines in front of the GPUs, for /admin/reliability. Service-role reads: call only from a page that has already checked for an admin.
 *
 * Two views of each product, so one can be read when the other is not available:
 *  - the open reservations (credit holds not yet settled): how many people are waiting or being served, and how long the oldest has waited;
 *  - what the product's own backend says: RunPod's jobs in queue and workers for the two image products (through their gateways); for video, the studio's own queue
 *    and each GPU vendor it sends work to (our RTX 5090 and RunPod) as the studio sees them.
 */

export interface Waiting {
  service: string;
  open: number;
  /** Minutes since the oldest open reservation was made, or null when none is open. */
  oldestMin: number | null;
}

export interface Backend {
  name: string;
  /** null when the backend could not be asked; `note` says why. */
  inQueue: number | null;
  inProgress: number | null;
  workers: Record<string, number> | null;
  /** Anything else it reported, as label: value. */
  extra: Record<string, string>;
  note: string | null;
}

const SERVICES = ["facestudio", "headswap-pro", "facestudio-v"] as const;

/** Reservations still open in the last day (a reservation older than that was swept long ago). */
export async function getWaiting(): Promise<Waiting[]> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("service, created_at")
    .eq("status", "open")
    .in("service", [...SERVICES])
    .gte("created_at", since)
    .limit(2000);
  if (error) throw new Error(`Failed to read open holds: ${error.message}`);
  const now = Date.now();
  return SERVICES.map((service) => {
    const mine = (data ?? []).filter((h) => h.service === service);
    const oldest = mine.reduce<number | null>((a, h) => {
      const t = new Date(h.created_at as string).getTime();
      return a === null || t < a ? t : a;
    }, null);
    return { service, open: mine.length, oldestMin: oldest === null ? null : Math.round((now - oldest) / 60_000) };
  });
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** RunPod's /health: { jobs: { inQueue, inProgress, ... }, workers: { idle, running, throttled, ... } }. */
function fromRunpod(name: string, h: unknown): Backend {
  const o = (h && typeof h === "object" ? h : {}) as { jobs?: Record<string, unknown>; workers?: Record<string, unknown> };
  const workers: Record<string, number> = {};
  for (const [k, v] of Object.entries(o.workers ?? {})) if (num(v) !== null) workers[k] = v as number;
  const extra: Record<string, string> = {};
  for (const k of ["completed", "failed", "retried"]) if (num(o.jobs?.[k]) !== null) extra[k] = String(o.jobs?.[k]);
  return { name, inQueue: num(o.jobs?.inQueue), inProgress: num(o.jobs?.inProgress), workers, extra, note: null };
}

function down(name: string, note: string): Backend {
  return { name, inQueue: null, inProgress: null, workers: null, extra: {}, note };
}

async function headswapBackend(): Promise<Backend> {
  const name = "Nano HeadSwap Pro (RunPod)";
  const base = gatewayBase();
  if (!base) return down(name, "gateway address not configured");
  try {
    const r = await fetch(`${base}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
    if (!r.ok) return down(name, `gateway answered ${r.status}`);
    const j = (await r.json()) as { runpod?: unknown };
    return j.runpod ? fromRunpod(name, j.runpod) : down(name, "gateway could not reach RunPod");
  } catch {
    return down(name, "gateway did not answer (it may be asleep: try again in a minute)");
  }
}

async function facestudioBackend(): Promise<Backend> {
  const name = "Nano FaceStudio Online (RunPod)";
  try {
    const r = await callUpstream("/v5/api/queue", { method: "GET", timeoutMs: 20_000 });
    if (r.status === 404) return down(name, "gateway has no /v5/api/queue yet (redeploy it)");
    if (!isOk(r)) return down(name, `gateway answered ${r.status}`);
    return r.body.runpod ? fromRunpod(name, r.body.runpod) : down(name, "gateway could not reach RunPod");
  } catch {
    return down(name, "gateway did not answer (it may be asleep: try again in a minute)");
  }
}

async function studioBackend(): Promise<Backend> {
  const name = "Video FaceSwap 2.5 Online (studio)";
  const h = (await studioHealth()) as { swap?: { queue?: Record<string, unknown>; available?: boolean } } | null;
  if (!h) return down(name, "studio did not answer");
  const q = h.swap?.queue ?? {};
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") extra[k] = String(v);
  if (typeof h.swap?.available === "boolean") extra.available = String(h.swap.available);
  const n = (k: string) => num(q[k]);
  return { name, inQueue: n("waiting"), inProgress: q.running === true ? 1 : q.running === false ? 0 : null, workers: null, extra, note: null };
}

/** The studio's two GPU vendors, one line each. */
async function videoVendors(): Promise<Backend[]> {
  const ownName = "Video FaceSwap 2.5 Online: RTX 5090";
  const cloudName = "Video FaceSwap 2.5 Online: RunPod";
  const v = await studioVendors();
  if (!v) return [down(ownName, "studio did not answer"), down(cloudName, "studio did not answer")];
  const o = v.own;
  let own: Backend;
  if (!o) {
    own = down(ownName, v.errors?.own ? `could not be read: ${v.errors.own}` : "not in use (the studio sends everything to RunPod)");
  } else {
    const age = num(o.heartbeat_s);
    const state = o.disabled === true ? "switched off (jobq/disabled)" : o.up !== true ? (age === null ? "offline (never seen)" : `offline (last seen ${age} s ago)`) : o.paused === true ? "paused (disk nearly full)" : null;
    own = { name: ownName, inQueue: num(o.waiting), inProgress: o.busy === true ? 1 : 0, workers: null, extra: age === null ? {} : { heartbeat: `${age} s ago` }, note: state };
  }
  const cloud = v.cloud ? fromRunpod(cloudName, v.cloud) : down(cloudName, v.errors?.cloud ? `could not be read: ${v.errors.cloud}` : "could not be read");
  return [own, cloud];
}

export async function getBackends(): Promise<Backend[]> {
  const [face, head, studio, vendors] = await Promise.all([facestudioBackend(), headswapBackend(), studioBackend(), videoVendors()]);
  return [face, head, studio, ...vendors];
}
