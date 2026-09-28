import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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
  /** Succeeded payments with no license. Each one is a customer owed software. */
  undelivered: ReconciledPayment[];
  gross_amount: number;
  currency: string;
  /** True if more payments exist than were walked. */
  truncated: boolean;
  webhooks: WebhookEndpointInfo[];
  /** Rows in stripe_events, i.e. webhook deliveries the app actually processed. */
  events_recorded: number | null;
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

  const succeeded: ReconciledPayment[] = succeededIntents.map((pi) => {
    const session = sessions.get(pi.id);
    const licenseKey = licenseByIntent.get(pi.id) ?? null;

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
      license_key: licenseKey,
      delivered: licenseKey !== null,
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

  return {
    configured: true,
    mode: modeOf(key),
    succeeded,
    undelivered: succeeded.filter((p) => !p.delivered),
    gross_amount: succeeded.reduce((sum, p) => sum + p.amount, 0),
    currency: succeeded[0]?.currency ?? "usd",
    truncated,
    webhooks,
    events_recorded: eventsRecorded,
  };
}
