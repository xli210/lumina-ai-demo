import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripePaymentKey } from "@/lib/credits";
import { classifyDelivery, type PaymentKind } from "@/lib/stripe-reconcile-classify";

/**
 * Reconciles what Stripe collected against what the licenses table delivered.
 *
 * Why this exists rather than just counting rows: the licenses table is not
 * the record of payment. `stripe_payment_intent_id` is written by the webhook
 * and nothing else, so if the webhook fails — a signature mismatch, a wrong
 * endpoint URL, a deploy that ate the delivery — Stripe collects the money
 * and the table shows nothing at all. Counting only licenses would report
 * "no sales" in exactly the situation that matters most, which is the one
 * where customers paid and received nothing.
 *
 * So the direction of the join is deliberate: start from Stripe, and ask
 * which payments have a license. Never the reverse.
 *
 * Reads the admin client rather than the session client because it queries
 * licenses by payment intent directly rather than through an is_admin() RPC.
 * The caller is responsible for the admin check.
 */

/** How many payment intents to walk back. Roughly a year at low volume. */
const PAYMENT_LIMIT = 200;

export interface ReconciledPayment {
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  email: string | null;
  /** Checkout metadata, which is where product_id and supabase_user_id live. */
  product_id: string | null;
  supabase_user_id: string | null;
  /** The license this payment produced, if the webhook ever ran. */
  license_key: string | null;
  /**
   * What this payment was owed: a license (app purchase) or credits (credit pack).
   * A credit pack never makes a license, so it is judged on the ledger instead.
   */
  kind: PaymentKind;
  /** Credits the ledger granted for this payment, for a credit pack. */
  credits_granted: number | null;
  /** Whether the owed thing arrived: the license row, or the credit grant. */
  delivered: boolean;
}

export interface WebhookEndpointInfo {
  id: string;
  url: string;
  status: string;
  /** Whether it listens for the event the license handler needs. */
  listens_for_checkout: boolean;
}

export interface StripeReconciliation {
  configured: true;
  mode: "live" | "test" | "unknown";
  /** Succeeded payments only. Stripe is the ledger of record. */
  succeeded: ReconciledPayment[];
  /**
   * Payments made after this database existed whose delivery never arrived:
   * no license for an app purchase, no credit grant for a credit pack.
   * Each one is a customer owed something.
   */
  undelivered: ReconciledPayment[];
  /**
   * Payments older than this database. They cannot be matched here no
   * matter what happened, so they are reported apart from real failures.
   */
  predates_database: ReconciledPayment[];
  /** When this database started, or null if it could not be determined. */
  database_since: string | null;
  gross_amount: number;
  currency: string;
  /** True if more payments exist than were walked. */
  truncated: boolean;
  webhooks: WebhookEndpointInfo[];
  /** Rows in stripe_events, i.e. webhook deliveries the app actually processed. */
  events_recorded: number | null;
}

/**
 * When this database started accepting users.
 *
 * This Supabase project was created on 2026-03-15 and replaced an earlier
 * one whose data was never migrated — the first profile here is two hours
 * younger than the project itself, and the app had been issuing licenses
 * since February. So a Stripe payment older than this simply has no license
 * to find, and reporting it as an undelivered order would be wrong.
 *
 * Read from the data rather than hardcoded, so restoring the old rows or
 * moving projects again corrects this automatically instead of silently
 * mis-reporting.
 */
async function databaseSince(
  admin: ReturnType<typeof createAdminClient>
): Promise<string | null> {
  const { data } = await admin
    .from("profiles")
    .select("created_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.created_at ?? null;
}

export interface StripeUnavailable {
  configured: false;
  reason: string;
}

export type StripeReconcileResult = StripeReconciliation | StripeUnavailable;

/** The event the license handler is driven by. */
const CHECKOUT_EVENT = "checkout.session.completed";

function modeOf(key: string | undefined): "live" | "test" | "unknown" {
  if (key?.startsWith("sk_live_")) return "live";
  if (key?.startsWith("sk_test_")) return "test";
  return "unknown";
}

/**
 * Metadata lives on the checkout session, not the payment intent, so the
 * session has to be fetched to learn which product was bought. Done in one
 * bulk list rather than per-payment to keep this to a handful of API calls.
 */
async function sessionsByPaymentIntent(
  stripe: Stripe
): Promise<Map<string, Stripe.Checkout.Session>> {
  const byIntent = new Map<string, Stripe.Checkout.Session>();

  for await (const session of stripe.checkout.sessions.list({
    limit: 100,
  })) {
    const intent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (intent) byIntent.set(intent, session);
    if (byIntent.size >= PAYMENT_LIMIT) break;
  }

  return byIntent;
}

export async function reconcileStripe(): Promise<StripeReconcileResult> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return {
      configured: false,
      reason:
        "STRIPE_SECRET_KEY is not set on this deployment, so payments cannot be read.",
    };
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return {
      configured: false,
      reason: err instanceof Error ? err.message : "Stripe client unavailable",
    };
  }

  const intents: Stripe.PaymentIntent[] = [];
  let truncated = false;
  try {
    for await (const pi of stripe.paymentIntents.list({ limit: 100 })) {
      if (intents.length >= PAYMENT_LIMIT) {
        truncated = true;
        break;
      }
      intents.push(pi);
    }
  } catch (err) {
    return {
      configured: false,
      reason:
        err instanceof Error
          ? `Stripe API error: ${err.message}`
          : "Could not list payments",
    };
  }

  const succeededIntents = intents.filter((pi) => pi.status === "succeeded");

  let sessions: Map<string, Stripe.Checkout.Session>;
  try {
    sessions = await sessionsByPaymentIntent(stripe);
  } catch {
    // Metadata is a nicety; the reconciliation still works without it.
    sessions = new Map();
  }

  // One query for every payment at once. An empty `in` list would match
  // nothing, but Supabase also rejects it, so guard the call entirely.
  const admin = createAdminClient();
  const ids = succeededIntents.map((pi) => pi.id);
  const licenseByIntent = new Map<string, string>();

  if (ids.length > 0) {
    const { data } = await admin
      .from("licenses")
      .select("license_key, stripe_payment_intent_id")
      .in("stripe_payment_intent_id", ids);

    for (const row of data ?? []) {
      if (row.stripe_payment_intent_id) {
        licenseByIntent.set(row.stripe_payment_intent_id, row.license_key);
      }
    }
  }

  // Credit packs are delivered as a `purchase` entry in the credit ledger,
  // keyed on the payment intent, not as a license.
  const creditsByIntent = new Map<string, number>();
  if (ids.length > 0) {
    const keyToIntent = new Map(ids.map((id) => [stripePaymentKey(id), id]));
    const { data } = await admin
      .from("credit_ledger")
      .select("idempotency_key, amount")
      .eq("kind", "purchase")
      .in("idempotency_key", [...keyToIntent.keys()]);
    for (const row of data ?? []) {
      const intent = keyToIntent.get(String(row.idempotency_key));
      if (intent) creditsByIntent.set(intent, Number(row.amount));
    }
  }

  const succeeded: ReconciledPayment[] = succeededIntents.map((pi) => {
    const session = sessions.get(pi.id);
    const delivery = classifyDelivery({
      metadataKind: session?.metadata?.kind,
      licenseKey: licenseByIntent.get(pi.id) ?? null,
      creditsGranted: creditsByIntent.get(pi.id) ?? null,
    });

    return {
      payment_intent_id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: new Date(pi.created * 1000).toISOString(),
      email:
        session?.customer_details?.email ??
        pi.receipt_email ??
        null,
      product_id: session?.metadata?.product_id ?? null,
      supabase_user_id: session?.metadata?.supabase_user_id ?? null,
      license_key: delivery.licenseKey,
      kind: delivery.kind,
      credits_granted: delivery.creditsGranted,
      delivered: delivery.delivered,
    };
  });

  let webhooks: WebhookEndpointInfo[] = [];
  try {
    const list = await stripe.webhookEndpoints.list({ limit: 20 });
    webhooks = list.data.map((w) => ({
      id: w.id,
      url: w.url,
      status: w.status,
      listens_for_checkout:
        w.enabled_events.includes(CHECKOUT_EVENT) ||
        w.enabled_events.includes("*"),
    }));
  } catch {
    // Restricted keys cannot list endpoints. Not fatal.
    webhooks = [];
  }

  // Deliveries the app recorded. Zero alongside succeeded payments is the
  // clearest possible signal that the webhook never reached this app.
  let eventsRecorded: number | null = null;
  const { count, error: eventsError } = await admin
    .from("stripe_events")
    .select("*", { count: "exact", head: true });
  if (!eventsError) eventsRecorded = count ?? 0;

  const since = await databaseSince(admin);
  const sinceMs = since ? new Date(since).getTime() : null;

  const unmatched = succeeded.filter((p) => !p.delivered);
  const tooOld = (p: ReconciledPayment) =>
    sinceMs !== null && new Date(p.created).getTime() < sinceMs;

  return {
    configured: true,
    mode: modeOf(key),
    succeeded,
    undelivered: unmatched.filter((p) => !tooOld(p)),
    predates_database: unmatched.filter(tooOld),
    database_since: since,
    gross_amount: succeeded.reduce((sum, p) => sum + p.amount, 0),
    currency: succeeded[0]?.currency ?? "usd",
    truncated,
    webhooks,
    events_recorded: eventsRecorded,
  };
}
