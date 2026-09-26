"use server";

import { headers } from "next/headers";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findCreditPack,
  formatPackPrice,
  totalCredits,
  type CreditPack,
} from "@/lib/credit-packs";

/**
 * Get the Stripe Customer for a user, creating it on first top-up.
 *
 * Attaching a Customer is what lets someone see their whole top-up history
 * in one place and lets us reach the email a receipt should go to. The id
 * is cached on `profiles.stripe_customer_id` (added in migration 007) so a
 * user never accumulates duplicate Customers.
 */
async function resolveStripeCustomer(
  userId: string,
  email: string | undefined
): Promise<string> {
  const admin = createAdminClient();

  const { data: profile, error: readError } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Could not read profile: ${readError.message}`);
  }

  const existing = profile?.stripe_customer_id;
  if (typeof existing === "string" && existing.length > 0) {
    return existing;
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  const { error: writeError } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (writeError) {
    // The Customer exists in Stripe either way. Failing here would strand
    // it and create a second one on the next attempt, so surface it.
    throw new Error(`Could not save Stripe customer: ${writeError.message}`);
  }

  return customer.id;
}

function buildLineItem(
  pack: CreditPack
): Stripe.Checkout.SessionCreateParams.LineItem {
  const bonusNote =
    pack.bonusCredits > 0
      ? ` (includes ${pack.bonusCredits.toLocaleString("en-US")} bonus credits)`
      : "";

  return {
    price_data: {
      currency: "usd",
      product_data: {
        name: `${totalCredits(pack).toLocaleString("en-US")} credits`,
        description: `${pack.name} top-up — ${formatPackPrice(pack)}${bonusNote}`,
      },
      unit_amount: pack.priceInCents,
    },
    quantity: 1,
  };
}

/**
 * Open an embedded Checkout session for a credit top-up.
 *
 * Only a pack id crosses the wire; the price and the credit amount are
 * both resolved here from `lib/credit-packs.ts`. The amount granted is
 * written into session metadata at creation time, because that is what the
 * customer was sold — the webhook honours that figure even if the pack is
 * later repriced.
 *
 * Unlike the one-time app purchase, this refuses anonymous checkout: there
 * is no way to deliver credits to someone with no account to hold them.
 */
export async function startCreditCheckoutSession(
  packId: string
): Promise<string> {
  const pack = findCreditPack(packId);
  if (!pack) {
    throw new Error(`Unknown credit pack "${packId}"`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please sign in before topping up credits");
  }

  const customerId = await resolveStripeCustomer(user.id, user.email);

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    customer: customerId,
    return_url: `${origin}/credits?session_id={CHECKOUT_SESSION_ID}`,
    line_items: [buildLineItem(pack)],
    metadata: {
      // The webhook dispatches on this. Absent it, a session is treated as
      // the legacy one-time app purchase.
      kind: "credit_topup",
      pack_id: pack.id,
      supabase_user_id: user.id,
      base_credits: String(pack.priceInCents),
      bonus_credits: String(pack.bonusCredits),
    },
  });

  if (!session.client_secret) {
    throw new Error("Stripe did not return a client secret");
  }

  return session.client_secret;
}
