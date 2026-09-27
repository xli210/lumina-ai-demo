import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import {
  DEFAULT_HOLD_TTL_SECONDS,
  SIGNUP_GRANT_CREDITS,
  isCreditEntryKind,
  isCreditHoldStatus,
  signupGrantKey,
  type CreditAccountState,
  type CreditCaptureResult,
  type CreditEntryKind,
  type CreditHoldResult,
  type CreditHoldStatus,
  type CreditLedgerEntry,
  type CreditMutationResult,
} from "@/lib/credits";
import type {
  CreditDailyRow,
  CreditSummary,
  CreditTopUser,
} from "@/lib/credit-analytics";

/**
 * Typed surface over the credit RPCs in scripts/010_create_credit_functions.sql.
 *
 * The mutation functions go through the service-role client, because those
 * RPCs are granted to `service_role` only — a signed-in user calling
 * `credit_grant` directly would be minting money, so the grant was revoked
 * from `authenticated` in that migration.
 *
 * The analytics functions are the deliberate exception and use the caller's
 * own session, because `is_admin()` resolves the user through `auth.uid()`,
 * which is NULL for the service role. See the note above them.
 *
 * Callers are responsible for having authenticated the user first and
 * passing a trusted user id, exactly like the existing
 * `increment_demo_usage` path in app/api/demos/open/route.ts.
 */

/** How many abandoned holds one sweeper run will free. */
const SWEEP_BATCH_LIMIT = 500;

/** Default reporting window for the admin dashboard. */
const ANALYTICS_WINDOW_DAYS = 30;

/** How many accounts the admin dashboard ranks. */
const ANALYTICS_TOP_USERS = 25;

/** Statement page size when a caller does not ask for one. */
const LEDGER_PAGE_SIZE = 25;

/** Hard ceiling on a caller-supplied statement page size. */
const LEDGER_PAGE_LIMIT = 100;

/**
 * The RPCs return jsonb, which the Supabase client hands back as `any`.
 * Reading it through a Map rather than by index keeps the accessors off the
 * prototype chain, so a key like `__proto__` in a payload cannot resolve to
 * anything.
 */
function asFields(value: unknown): Map<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return new Map(Object.entries(value));
  }
  throw new Error("Credit RPC returned an unexpected payload");
}

function num(fields: ReadonlyMap<string, unknown>, key: string): number {
  const raw = fields.get(key);
  return typeof raw === "number" ? raw : 0;
}

function flag(fields: ReadonlyMap<string, unknown>, key: string): boolean {
  return fields.get(key) === true;
}

function str(
  fields: ReadonlyMap<string, unknown>,
  key: string
): string | undefined {
  const raw = fields.get(key);
  return typeof raw === "string" ? raw : undefined;
}

function toAccountState(
  source: ReadonlyMap<string, unknown>
): CreditAccountState {
  return {
    user_id: str(source, "user_id") ?? "",
    balance: num(source, "balance"),
    held: num(source, "held"),
    available: num(source, "available"),
    lifetime_purchased: num(source, "lifetime_purchased"),
    lifetime_spent: num(source, "lifetime_spent"),
  };
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/**
 * Current balance. Returns a zeroed state for users who have never had a
 * credit account row, which is every user until their first grant.
 */
export async function getCreditAccount(
  userId: string
): Promise<CreditAccountState> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_accounts")
    .select("user_id, balance, held, lifetime_purchased, lifetime_spent")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to read credit account: ${error.message}`);

  if (!data) {
    return {
      user_id: userId,
      balance: 0,
      held: 0,
      available: 0,
      lifetime_purchased: 0,
      lifetime_spent: 0,
    };
  }

  const row = asFields(data);
  return {
    ...toAccountState(row),
    user_id: userId,
    available: num(row, "balance") - num(row, "held"),
  };
}

function toLedgerEntry(
  source: ReadonlyMap<string, unknown>
): CreditLedgerEntry {
  const kind = source.get("kind");
  if (!isCreditEntryKind(kind)) {
    throw new Error(`Ledger row ${num(source, "id")} has an unknown kind`);
  }

  const reference = source.get("reference");
  const isPlainObject =
    typeof reference === "object" &&
    reference !== null &&
    !Array.isArray(reference);

  return {
    id: num(source, "id"),
    amount: num(source, "amount"),
    kind,
    balance_after: num(source, "balance_after"),
    hold_id: str(source, "hold_id") ?? null,
    reference: isPlainObject
      ? Object.fromEntries(asFields(reference))
      : {},
    created_at: str(source, "created_at") ?? "",
  };
}

/**
 * One page of a user's statement, newest first.
 *
 * Reads the ledger rather than summing it: `balance_after` on each row is
 * what makes a statement auditable line by line.
 */
export async function listCreditLedger(params: {
  userId: string;
  limit?: number;
  before?: number;
}): Promise<CreditLedgerEntry[]> {
  const limit = Math.min(
    Math.max(params.limit ?? LEDGER_PAGE_SIZE, 1),
    LEDGER_PAGE_LIMIT
  );

  const supabase = createAdminClient();
  let query = supabase
    .from("credit_ledger")
    .select("id, amount, kind, balance_after, hold_id, reference, created_at")
    .eq("user_id", params.userId)
    .order("id", { ascending: false })
    .limit(limit);

  if (params.before !== undefined) {
    query = query.lt("id", params.before);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to read credit ledger: ${error.message}`);

  return (data ?? []).map((row) => toLedgerEntry(asFields(row)));
}

/**
 * A reservation, looked up by the upstream job id it was attached to.
 *
 * This is how a metered service answers "whose job is this?". The row
 * survives settlement, so it keeps authorising downloads of a finished
 * result, and the partial unique index on (service, job_ref) in migration
 * 009 guarantees at most one match.
 */
export interface CreditHoldRecord {
  id: string;
  user_id: string;
  amount: number;
  status: CreditHoldStatus;
  service: string;
  job_ref: string | null;
  created_at: string;
}

/**
 * How many of this user's reservations for a service are still open.
 *
 * Metered GPU work needs a concurrency cap: every open hold is a job burning
 * real compute, and without a ceiling one account can occupy the whole pool.
 * Counting open holds is the cap, since a hold exists for exactly the window
 * a job is running.
 */
export async function countOpenHolds(
  service: string,
  userId: string
): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("credit_holds")
    .select("id", { head: true, count: "exact" })
    .eq("service", service)
    .eq("user_id", userId)
    .eq("status", "open");

  if (error) throw new Error(`Failed to count open holds: ${error.message}`);
  return count ?? 0;
}

export async function findHoldByJobRef(
  service: string,
  jobRef: string
): Promise<CreditHoldRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at")
    .eq("service", service)
    .eq("job_ref", jobRef)
    .maybeSingle();

  if (error) throw new Error(`Failed to look up hold: ${error.message}`);
  if (!data) return null;

  const row = asFields(data);
  const status = row.get("status");
  if (!isCreditHoldStatus(status)) {
    throw new Error(`Hold ${str(row, "id") ?? "?"} has an unknown status`);
  }

  return {
    id: str(row, "id") ?? "",
    user_id: str(row, "user_id") ?? "",
    amount: num(row, "amount"),
    status,
    service: str(row, "service") ?? "",
    job_ref: str(row, "job_ref") ?? null,
    created_at: str(row, "created_at") ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

/**
 * Add credits.
 *
 * `idempotencyKey` must be derived from the thing that caused the grant
 * (see the key builders in lib/credits.ts), never generated per call —
 * that is what makes a Stripe redelivery or a retried request a no-op
 * instead of a second grant.
 */
export async function grantCredits(params: {
  userId: string;
  amount: number;
  kind: CreditEntryKind;
  idempotencyKey: string;
  reference?: Record<string, unknown>;
}): Promise<CreditMutationResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_grant", {
    p_user_id: params.userId,
    p_amount: params.amount,
    p_kind: params.kind,
    p_idempotency_key: params.idempotencyKey,
    p_reference: params.reference ?? {},
  });

  if (error) throw new Error(`credit_grant failed: ${error.message}`);

  const row = asFields(data);
  return {
    ...toAccountState(row),
    applied: flag(row, "applied"),
    ledger_id: num(row, "ledger_id"),
  };
}

/**
 * Give an account its one-off welcome credits if it has not had them.
 *
 * Done lazily on first read instead of in the signup trigger so the users
 * who registered before credits existed are covered by the same code path.
 * The pre-check is only there to keep an ordinary balance read off the
 * write path — `credit_grant` takes a row lock before it checks its own
 * idempotency key, and correctness still rests on that key, not on this.
 */
export async function ensureSignupGrant(
  userId: string
): Promise<CreditAccountState> {
  const idempotencyKey = signupGrantKey(userId);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("credit_ledger")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check signup grant: ${error.message}`);
  }

  if (data) return getCreditAccount(userId);

  return grantCredits({
    userId,
    amount: SIGNUP_GRANT_CREDITS,
    kind: "signup_grant",
    idempotencyKey,
    reference: { reason: "welcome_grant" },
  });
}

/**
 * Top an account up to a free daily allowance, once per UTC day.
 *
 * Deliberately a `promo` grant rather than a parallel quota counter, so a
 * free render is indistinguishable from a paid one everywhere downstream:
 * the same reservation protects the GPU, a failure refunds by the same path,
 * ownership resolves through the same hold, and the user sees the allowance
 * as a line on their statement instead of an invisible counter.
 *
 * Tops *up to* `amount`, never adds to it. Adding would let an allowance
 * accumulate across idle days into a balance nobody paid for; topping up
 * bounds the free tier at `amount` per day no matter how long an account
 * sits unused. An account already above the line gets nothing, and
 * `credit_grant` rejects a zero amount, so that case must not call it.
 *
 * The date in the idempotency key is what makes it once-daily.
 */
export async function ensureDailyAllowance(params: {
  userId: string;
  amount: number;
  /** Distinguishes one service's allowance from another's. */
  service: string;
  /** UTC date as YYYY-MM-DD. */
  day: string;
}): Promise<CreditAccountState> {
  const account = await getCreditAccount(params.userId);
  if (account.available >= params.amount) return account;

  return grantCredits({
    userId: params.userId,
    amount: params.amount - account.available,
    kind: "promo",
    idempotencyKey: `allowance:${params.service}:${params.userId}:${params.day}`,
    reference: {
      reason: "daily_free_allowance",
      service: params.service,
      day: params.day,
      topped_up_to: params.amount,
    },
  });
}

/**
 * Reserve credits before starting async work.
 *
 * Check `ok` before doing anything upstream: a false value means the user
 * cannot afford the job, and `shortfall` is how many credits short they are
 * — the number the 402 response should quote.
 */
export async function holdCredits(params: {
  userId: string;
  amount: number;
  service: string;
  jobRef?: string;
  ttlSeconds?: number;
  estimate?: Record<string, unknown>;
}): Promise<CreditHoldResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_hold", {
    p_user_id: params.userId,
    p_amount: params.amount,
    p_service: params.service,
    p_job_ref: params.jobRef ?? null,
    p_ttl_seconds: params.ttlSeconds ?? DEFAULT_HOLD_TTL_SECONDS,
    p_estimate: params.estimate ?? {},
  });

  if (error) throw new Error(`credit_hold failed: ${error.message}`);

  const row = asFields(data);
  const reason = str(row, "reason");
  return {
    ...toAccountState(row),
    ok: flag(row, "ok"),
    applied: flag(row, "applied"),
    hold_id: str(row, "hold_id"),
    reason: reason === "insufficient_credits" ? reason : undefined,
    required: num(row, "required"),
    shortfall: num(row, "shortfall"),
  };
}

/**
 * Record the upstream job id against a hold, once the gateway has issued
 * one. Reserving happens first so an unaffordable job never reaches the
 * gateway at all.
 */
export async function attachJobToHold(
  holdId: string,
  jobRef: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_hold_attach_job", {
    p_hold_id: holdId,
    p_job_ref: jobRef,
  });

  if (error) throw new Error(`credit_hold_attach_job failed: ${error.message}`);
  return flag(asFields(data), "ok");
}

/**
 * Settle a hold at the metered cost.
 *
 * `actualAmount` above what was reserved is clamped by the SQL function —
 * the user was quoted an estimate, so the difference is absorbed rather
 * than billed — and the uncapped figure is written to the ledger reference
 * so pricing can be recalibrated against it.
 */
export async function captureHold(params: {
  holdId: string;
  actualAmount: number;
  reference?: Record<string, unknown>;
}): Promise<CreditCaptureResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_capture", {
    p_hold_id: params.holdId,
    p_actual_amount: params.actualAmount,
    p_reference: params.reference ?? {},
  });

  if (error) throw new Error(`credit_capture failed: ${error.message}`);

  const row = asFields(data);
  return {
    ...toAccountState(row),
    ok: flag(row, "ok"),
    applied: flag(row, "applied"),
    charged: num(row, "charged"),
    ledger_id: num(row, "ledger_id"),
  };
}

/**
 * Return a reservation in full and charge nothing. This is the correct
 * response to any failed, cancelled or timed-out job — a render that did
 * not produce a file is not billable.
 */
export async function releaseHold(
  holdId: string,
  reason: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_release", {
    p_hold_id: holdId,
    p_reason: reason,
    p_status: "released",
  });

  if (error) throw new Error(`credit_release failed: ${error.message}`);
  return flag(asFields(data), "ok");
}

/**
 * Claw credits back after a Stripe refund or chargeback. The balance is
 * allowed to go negative if the credits were already spent; further holds
 * then fail on their own, because available is negative too.
 */
export async function reverseCredits(params: {
  userId: string;
  amount: number;
  idempotencyKey: string;
  reference?: Record<string, unknown>;
}): Promise<CreditMutationResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_reverse", {
    p_user_id: params.userId,
    p_amount: params.amount,
    p_idempotency_key: params.idempotencyKey,
    p_reference: params.reference ?? {},
  });

  if (error) throw new Error(`credit_reverse failed: ${error.message}`);

  const row = asFields(data);
  return {
    ...toAccountState(row),
    applied: flag(row, "applied"),
    ledger_id: num(row, "ledger_id"),
  };
}

/** Sweep reservations nothing ever settled. Returns how many were freed. */
export async function releaseExpiredHolds(
  limit = SWEEP_BATCH_LIMIT
): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("credit_release_expired_holds", {
    p_limit: limit,
  });

  if (error) {
    throw new Error(`credit_release_expired_holds failed: ${error.message}`);
  }
  return typeof data === "number" ? data : 0;
}

/* ------------------------------------------------------------------ */
/* Admin analytics                                                     */
/* ------------------------------------------------------------------ */

/**
 * The analytics RPCs are the exception to this file's service-role rule:
 * they must be called with the *caller's own session*.
 *
 * `public.is_admin()` resolves the current user with `auth.uid()`, and
 * `auth.uid()` is NULL for the service role — it is not a user. So these
 * functions, which re-check `is_admin()` by design, raise
 * "not authorized" (42501) when reached through `createAdminClient()`,
 * however genuinely admin the human at the keyboard is.
 *
 * Migration 012 grants EXECUTE to `authenticated` precisely so this path
 * works. Do not "fix" a 42501 here by switching to the admin client; that
 * would remove the check rather than satisfy it.
 */
/** Headline credit metrics for the admin dashboard. */
export async function getCreditSummary(
  windowDays = ANALYTICS_WINDOW_DAYS
): Promise<CreditSummary> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("credit_admin_summary", {
    p_days: windowDays,
  });

  if (error) throw new Error(`credit_admin_summary failed: ${error.message}`);
  return data as CreditSummary;
}

/** Per-UTC-day series with zero-filled gaps. */
export async function getCreditDaily(
  windowDays = ANALYTICS_WINDOW_DAYS
): Promise<CreditDailyRow[]> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("credit_admin_daily", {
    p_days: windowDays,
  });

  if (error) throw new Error(`credit_admin_daily failed: ${error.message}`);
  return (data ?? []) as CreditDailyRow[];
}

/** Accounts ranked by lifetime spend. */
export async function getCreditTopUsers(
  limit = ANALYTICS_TOP_USERS
): Promise<CreditTopUser[]> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("credit_admin_top_users", {
    p_limit: limit,
  });

  if (error) throw new Error(`credit_admin_top_users failed: ${error.message}`);
  return (data ?? []) as CreditTopUser[];
}

/* ------------------------------------------------------------------ */
/* Stripe webhook de-duplication                                       */
/* ------------------------------------------------------------------ */

/**
 * Claim a Stripe event for processing.
 *
 * Returns false when this delivery should be acknowledged and dropped
 * because another delivery already handled it, or is handling it right now.
 * This only removes redundant work — the guarantee that a payment grants
 * credits once is the ledger's unique idempotency key, not this.
 */
export async function beginStripeEvent(params: {
  eventId: string;
  type: string;
  payload?: unknown;
}): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("stripe_event_begin", {
    p_event_id: params.eventId,
    p_type: params.type,
    p_payload: params.payload ?? null,
  });

  if (error) throw new Error(`stripe_event_begin failed: ${error.message}`);
  return data === true;
}

/**
 * Mark a claimed event finished. Passing an error message leaves the event
 * unprocessed so Stripe's next retry is allowed to try again.
 */
export async function completeStripeEvent(
  eventId: string,
  errorMessage?: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("stripe_event_complete", {
    p_event_id: eventId,
    p_error: errorMessage ?? null,
  });

  if (error) {
    // Never fail the webhook over bookkeeping: the work itself already
    // succeeded, and a stuck row is recoverable on the next delivery.
    console.error("[credits] stripe_event_complete failed:", error.message);
  }
}
