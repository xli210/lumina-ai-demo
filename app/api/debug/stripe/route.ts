import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/debug/stripe — admin only.
 *
 * This route shipped unauthenticated and was live in production returning
 * real customer email addresses, checkout metadata including
 * supabase_user_id, the webhook endpoint URLs, and the first ten characters
 * of STRIPE_WEBHOOK_SECRET, to anyone who requested it.
 *
 * It is genuinely useful for diagnosing "the payment went through but no
 * license arrived", so it is gated rather than deleted. Nothing here is safe
 * to expose: treat every field as customer data.
 *
 * Not in ADMIN_PATH_PREFIXES — /api/debug is not a protected prefix — so the
 * check has to live here.
 */
async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const stripe = getStripe();
  const results: Record<string, unknown> = {};

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  results.keys = {
    secretKeyPresent: !!secretKey,
    secretKeyMode: secretKey.startsWith("sk_live_")
      ? "LIVE"
      : secretKey.startsWith("sk_test_")
        ? "TEST"
        : "UNKNOWN/MISSING",
    publishableKeyPresent: !!publishableKey,
    publishableKeyMode: publishableKey.startsWith("pk_live_")
      ? "LIVE"
      : publishableKey.startsWith("pk_test_")
        ? "TEST"
        : "UNKNOWN/MISSING",
    webhookSecretPresent: !!webhookSecret,
    webhookSecretPrefix: webhookSecret ? webhookSecret.substring(0, 10) + "..." : "MISSING",
  };

  const secretMode = results.keys.secretKeyMode;
  const pubMode = results.keys.publishableKeyMode;
  results.modeMatch = secretMode === pubMode;
  if (!results.modeMatch) {
    results.warning =
      `KEY MODE MISMATCH: Secret key is ${secretMode} but Publishable key is ${pubMode}. They must match!`;
  }

  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 10 });
    results.recentSessions = sessions.data.map((s) => ({
      id: s.id,
      status: s.status,
      payment_status: s.payment_status,
      amount_total: s.amount_total,
      currency: s.currency,
      created: new Date(s.created * 1000).toISOString(),
      customer_email: s.customer_details?.email || null,
      metadata: s.metadata,
    }));
    results.totalSessionsFound = sessions.data.length;
  } catch (err) {
    results.stripeError =
      err instanceof Error ? err.message : "Failed to contact Stripe API";
  }

  try {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 5 });
    results.recentPaymentIntents = paymentIntents.data.map((pi) => ({
      id: pi.id,
      status: pi.status,
      amount: pi.amount,
      currency: pi.currency,
      created: new Date(pi.created * 1000).toISOString(),
    }));
  } catch (err) {
    results.paymentIntentsError =
      err instanceof Error ? err.message : "Failed to list payment intents";
  }

  try {
    const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    results.webhookEndpoints = webhookEndpoints.data.map((w) => ({
      id: w.id,
      url: w.url,
      status: w.status,
      enabled_events: w.enabled_events,
    }));
  } catch (err) {
    results.webhookEndpointsError =
      err instanceof Error ? err.message : "Failed to list webhook endpoints";
  }

  results.env = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "NOT SET",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "SET"
      : "NOT SET",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "SET"
      : "NOT SET",
  };

  return NextResponse.json(results, {
    headers: { "Content-Type": "application/json" },
  });
}
