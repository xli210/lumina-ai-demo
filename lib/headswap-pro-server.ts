import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { captureHold, releaseHold, type CreditHoldRecord } from "@/lib/credits-server";
import {
  HEADSWAP_PRO_SERVICE,
  HEADSWAP_PRO_TICKET_TTL_SECONDS,
  decideSettlement,
  headswapProEnabled,
  isGatewayJobId,
  type GatewayJob,
} from "@/lib/headswap-pro";

/**
 * The website's side of the HeadSwap Pro gateway (headswap-gateway/app.py): the signed tokens it
 * understands, who is asking, and what the gateway says about a job.
 *
 *   entitlement  v1.<b64url {"uid","paid","exp"}>.<hex HMAC>     "has this person ever bought credits"
 *   ticket       t1.<b64url {"uid","hold","n","paid","exp"}>.<hex HMAC>   "credits are reserved for this swap"
 *
 * Both are signed with HS_ENTITLEMENT_SECRET, the same value as on the gateway.
 */

export function privateJson(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: { "cache-control": "private, no-store" } });
}

function secret(): string | null {
  return process.env.HS_ENTITLEMENT_SECRET?.trim() || null;
}

export function gatewayBase(): string | null {
  const raw = process.env.HEADSWAP_GATEWAY_URL?.trim().replace(/\/$/, "");
  return raw && /^https:\/\//.test(raw) ? raw : null;
}

/** Why the feature cannot be used right now, or null when it can. */
export function unavailableReason(): string | null {
  if (!headswapProEnabled()) return "not_open";
  if (!secret() || !gatewayBase()) return "not_configured";
  return null;
}

export function sign(prefix: "v1" | "t1", data: Record<string, unknown>): string | null {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", key).update(`${prefix}.${payload}`).digest("hex");
  return `${prefix}.${payload}.${sig}`;
}

export function entitlementToken(userId: string, paid: boolean, ttlSeconds = 6 * 3600, now = Date.now()): string | null {
  return sign("v1", { uid: userId, paid, exp: Math.floor(now / 1000) + ttlSeconds });
}

export function swapTicket(userId: string, holdId: string, images: number, paid: boolean, now = Date.now()): string | null {
  return sign("t1", { uid: userId, hold: holdId, n: images, paid, exp: Math.floor(now / 1000) + HEADSWAP_PRO_TICKET_TTL_SECONDS });
}

/** What the gateway does with a token: here so the format can be tested end to end. */
export function verify(prefix: "v1" | "t1", token: string, key: string, now = Date.now()): Record<string, unknown> | null {
  const [ver, payload, sig, extra] = token.split(".");
  if (ver !== prefix || !payload || !sig || extra !== undefined) return null;
  const want = createHmac("sha256", key).update(`${ver}.${payload}`).digest("hex");
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig.toLowerCase()), Buffer.from(want))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    return typeof d.exp === "number" && d.exp * 1000 > now ? d : null;
  } catch {
    return null;
  }
}

/** The signed-in user, or null. */
export async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** One of this user's HeadSwap Pro reservations, by id. */
export async function holdOf(userId: string, holdId: string): Promise<CreditHoldRecord | null> {
  if (!/^[0-9a-f-]{36}$/i.test(holdId)) return null;
  const { data, error } = await createAdminClient()
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at, estimate")
    .eq("id", holdId)
    .eq("user_id", userId)
    .eq("service", HEADSWAP_PRO_SERVICE)
    .maybeSingle();
  if (error) throw new Error(`Failed to read hold: ${error.message}`);
  return (data as CreditHoldRecord | null) ?? null;
}

/** What the gateway says about a job. Job ids are unguessable and the gateway needs no key to read one. */
export async function fetchGatewayJob(jobId: string): Promise<GatewayJob> {
  const base = gatewayBase();
  if (!base) return { error: "The gateway address is not configured." };
  if (!isGatewayJobId(jobId)) return { found: false };
  try {
    const r = await fetch(`${base}/api/job/${jobId}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (r.status === 404) return { found: false };
    if (!r.ok) return { error: `The gateway answered ${r.status}.` };
    const j = (await r.json()) as { status?: string; billable_images?: number; watermarked?: boolean };
    return { found: true, status: String(j.status ?? ""), billable_images: j.billable_images, watermarked: j.watermarked };
  } catch {
    return { error: "The gateway did not answer." };
  }
}

export type SettleOutcome =
  | { status: "settled"; charged: number }
  | { status: "refunded"; reason: string }
  | { status: "held"; note?: string };

/** A swap that never got as far as a job is given back after this long. */
const NO_JOB_GRACE_MS = 10 * 60 * 1000;

/**
 * Charge or release one open reservation according to what the gateway says about its job.
 * `abandon` is the page saying the swap never started. Safe to call again: only an open
 * reservation is ever changed, and the credit functions are idempotent.
 */
export async function settleHold(hold: CreditHoldRecord, abandon = false): Promise<SettleOutcome> {
  if (!hold.job_ref) {
    if (abandon || Date.now() - Date.parse(hold.created_at) > NO_JOB_GRACE_MS) {
      await releaseHold(hold.id, "no_job_started");
      return { status: "refunded", reason: "no_job_started" };
    }
    return { status: "held" };
  }
  const d = decideSettlement(hold.amount, await fetchGatewayJob(hold.job_ref), hold.estimate?.watermark === true);
  switch (d.action) {
    case "unreachable":
      return { status: "held", note: d.message };
    case "wait":
      return { status: "held" };
    case "release":
      await releaseHold(hold.id, d.reason);
      return { status: "refunded", reason: d.reason };
    case "capture": {
      const r = await captureHold({
        holdId: hold.id,
        actualAmount: d.amount,
        reference: { service: HEADSWAP_PRO_SERVICE, job: hold.job_ref },
      });
      return { status: "settled", charged: r.charged ?? d.amount };
    }
  }
}

/**
 * Settle whatever this account left open (a closed tab, a lost connection) before a new reservation,
 * so a finished swap is always charged and a stale one never counts against the open-swaps cap.
 */
export async function reconcileOpenHolds(userId: string): Promise<void> {
  const { data, error } = await createAdminClient()
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at, estimate")
    .eq("service", HEADSWAP_PRO_SERVICE)
    .eq("user_id", userId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(`Failed to list open holds: ${error.message}`);
  for (const h of (data ?? []) as CreditHoldRecord[]) await settleHold(h);
}
