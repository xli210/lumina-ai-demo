import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/products";
import crypto from "crypto";

function generateLicenseKey(): string {
  // Format: XXXX-XXXX-XXXX-XXXX (unambiguous uppercase alphanumeric)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let c = 0; c < 4; c++) {
      segment += chars[crypto.randomInt(chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paymentIntentId = session.payment_intent as string;
    const customerEmail = session.customer_details?.email;

    const supabase = createAdminClient();

    // Look up the Supabase user
    let userId: string | null = null;

    // Primary: use the supabase_user_id we pass in checkout session metadata
    const metadataUserId = (session.metadata as Record<string, string>)
      ?.supabase_user_id;
    if (metadataUserId) {
      userId = metadataUserId;
    } else if (customerEmail) {
      // Fallback: scan users by email (slower, only if metadata missing)
      const { data } = await supabase.auth.admin.listUsers();
      const match = data?.users?.find((u) => u.email === customerEmail);
      if (match) userId = match.id;
      console.warn(
        "Webhook: supabase_user_id missing from metadata, fell back to email scan"
      );
    }

    // Generate a unique license key (retry up to 10 times)
    let licenseKey = "";
    let keyIsUnique = false;
    for (let attempts = 0; attempts < 10; attempts++) {
      licenseKey = generateLicenseKey();
      const { data: existing } = await supabase
        .from("licenses")
        .select("id")
        .eq("license_key", licenseKey)
        .single();
      if (!existing) {
        keyIsUnique = true;
        break;
      }
    }

    if (!keyIsUnique) {
      console.error("Failed to generate unique license key after 10 attempts");
      return NextResponse.json(
        { error: "License key generation failed" },
        { status: 500 }
      );
    }

    // Determine product_id from session metadata or default
    const productId =
      (session.metadata as Record<string, string>)?.product_id || "lumina-ai";

    // Look up product to get max_activations (default 1)
    const product = PRODUCTS.find((p) => p.id === productId);
    const maxActivations = product?.maxActivations ?? 1;

    // Insert the license
    const { error: insertError } = await supabase.from("licenses").insert({
      user_id: userId,
      license_key: licenseKey,
      product_id: productId,
      max_activations: maxActivations,
      stripe_payment_intent_id: paymentIntentId,
    });

    if (insertError) {
      console.error("Failed to create license:", insertError);
    }

    // Update the user's profile
    if (userId) {
      await supabase
        .from("profiles")
        .update({ has_purchased: true, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }

    console.log(
      `License ${licenseKey} created for ${customerEmail || "unknown"}`
    );
  }

  return NextResponse.json({ received: true });
}
