import "server-only";
import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";

import { DEVICE_COOKIE, isDeviceId } from "@/lib/device-cookie";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Who may receive free credits.
 *
 * New accounts get a welcome grant and every account gets a small daily
 * top-up. Both are free, so both can be farmed by opening many accounts.
 * `free_credit_claim` (scripts/015) lets one account per device and one per
 * network (IP, for IP_WINDOW_DAYS) claim; this module works out those two
 * keys from the request and asks it.
 *
 * What this does and does not stop, honestly:
 *
 *   - It stops the common case: several accounts made from one browser, or
 *     from one connection, to collect the free credits again.
 *   - It does not stop someone who changes network *and* clears cookies (a VPN
 *     plus a fresh browser profile). Nothing based on IP and cookies can. The
 *     next steps up are a CAPTCHA at signup (Supabase supports Turnstile) and
 *     asking for a card or phone number before the free credits are released.
 *   - It can refuse a real person who shares a network with someone who
 *     already claimed (a dorm, an office, a mobile carrier, a household). That
 *     is why a blocked account can still buy credits, and why any account that
 *     has bought credits is treated as eligible again (see `isFreeEligible`).
 *
 * Neither key is stored raw. Both are HMAC'd with a server secret, so the
 * table cannot be turned back into IP addresses or cookie values.
 */

/** Accounts per device that may receive free credits. */
export const MAX_FREE_CLAIMS_PER_DEVICE = 1;
/** Accounts per network that may receive free credits within the window. */
export const MAX_FREE_CLAIMS_PER_IP = 1;
/** Dynamic addresses get reassigned, so an IP is only held against someone for this long. */
export const IP_WINDOW_DAYS = 30;

export type FreeClaimOutcome =
  | "granted"
  | "grandfathered"
  | "blocked_ip"
  | "blocked_device";

export function isAllowedOutcome(o: FreeClaimOutcome): boolean {
  return o === "granted" || o === "grandfathered";
}

function secret(): string {
  // A dedicated secret is better, but the service role key already exists, is
  // server-only, and never changes meaning, so the feature works on deploy.
  const s =
    process.env.FREE_CLAIM_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("no secret available to hash claim keys");
  return s;
}

function hash(kind: "ip" | "device", value: string): string {
  return createHmac("sha256", secret())
    .update(`${kind}:${value}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Collapse an address to what identifies a subscriber: an IPv4 address as is,
 * an IPv6 address to its /64, because one household is handed a whole /64 and
 * can use any address in it.
 */
export function normalizeIp(raw: string): string | null {
  const ip = raw.trim().toLowerCase();
  if (!ip) return null;

  // IPv4-mapped IPv6 (::ffff:1.2.3.4)
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(ip);
  if (mapped) return mapped[1];

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return ip;

  if (ip.includes(":")) {
    // Expand "::" so the first four groups can be taken reliably.
    const [head, tail = ""] = ip.split("::");
    const h = head ? head.split(":") : [];
    const t = tail ? tail.split(":") : [];
    if (h.length + t.length > 8) return null;
    const groups = ip.includes("::")
      ? [...h, ...Array(8 - h.length - t.length).fill("0"), ...t]
      : h;
    if (groups.length !== 8) return null;
    return (
      groups
        .slice(0, 4)
        .map((g) => g.replace(/^0+(?=.)/, ""))
        .join(":") + "::/64"
    );
  }
  return null;
}

/** The visitor's address as Vercel reports it (it overwrites the header). */
function clientIp(h: Headers): string | null {
  const real = h.get("x-real-ip");
  if (real) return normalizeIp(real);
  const fwd = h.get("x-forwarded-for");
  if (fwd) return normalizeIp(fwd.split(",")[0]);
  return null;
}

export interface ClaimKeys {
  ipHash: string | null;
  deviceHash: string | null;
}

/** Keys for the request being handled. Either may be null. */
export async function claimKeysFromRequest(): Promise<ClaimKeys> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  const ip = clientIp(h);
  const device = c.get(DEVICE_COOKIE)?.value;
  return {
    ipHash: ip ? hash("ip", ip) : null,
    deviceHash: isDeviceId(device) ? hash("device", device) : null,
  };
}

function isMissingFunction(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "42883" || // undefined_function
    error.code === "PGRST202" || // PostgREST: function not found in schema cache
    /free_credit_claim/.test(error.message ?? "") && /not (find|exist)|could not/i.test(error.message ?? "")
  );
}

/**
 * Record this account's claim and learn whether it may have free credits.
 *
 * Returns null when the claim could not be evaluated because migration 015
 * has not been applied. Callers treat that as "allowed" so a deploy that
 * lands before the migration does not strip free credits from every new
 * account, and it is logged loudly because it means the limit is not active.
 */
export async function claimFreeCredits(
  userId: string,
  options: { grandfather?: boolean } = {}
): Promise<FreeClaimOutcome | null> {
  const keys = await claimKeysFromRequest();
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("free_credit_claim", {
    p_user_id: userId,
    p_ip_hash: keys.ipHash,
    p_device_hash: keys.deviceHash,
    p_max_per_ip: MAX_FREE_CLAIMS_PER_IP,
    p_max_per_device: MAX_FREE_CLAIMS_PER_DEVICE,
    p_ip_window_days: IP_WINDOW_DAYS,
    p_grandfather: options.grandfather === true,
  });

  if (error) {
    if (isMissingFunction(error)) {
      console.error(
        "[free-claim] free_credit_claim() is missing: apply scripts/015_create_free_credit_claims.sql. The free-credit limit is NOT active."
      );
      return null;
    }
    throw new Error(`free_credit_claim failed: ${error.message}`);
  }

  const outcome = (data as { outcome?: string } | null)?.outcome;
  if (
    outcome === "granted" ||
    outcome === "grandfathered" ||
    outcome === "blocked_ip" ||
    outcome === "blocked_device"
  ) {
    return outcome;
  }
  throw new Error("free_credit_claim returned an unexpected result");
}

/** The verdict already recorded for an account, or null if there is none. */
export async function getFreeClaimOutcome(
  userId: string
): Promise<FreeClaimOutcome | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("free_credit_claims")
    .select("outcome")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // 42P01: the table is not there yet (migration 015 not applied).
    if (error.code === "42P01" || error.code === "PGRST205") return null;
    throw new Error(`Failed to read free claim: ${error.message}`);
  }
  const outcome = (data as { outcome?: string } | null)?.outcome;
  return outcome === "granted" ||
    outcome === "grandfathered" ||
    outcome === "blocked_ip" ||
    outcome === "blocked_device"
    ? outcome
    : null;
}
