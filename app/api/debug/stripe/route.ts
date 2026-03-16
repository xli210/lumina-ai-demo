import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
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
