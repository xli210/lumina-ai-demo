import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
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

    // Look up the Supabase user by email
    let userId: string | null = null;
    if (customerEmail) {
      const { data } = await supabase.auth.admin.listUsers();
      const match = data?.users?.find((u) => u.email === customerEmail);
      if (match) userId = match.id;
    }

    // Generate a unique license key
    let licenseKey = generateLicenseKey();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("licenses")
        .select("id")
        .eq("license_key", licenseKey)
        .single();
      if (!existing) break;
      licenseKey = generateLicenseKey();
      attempts++;
    }

    // Determine product_id from session metadata or default
    const productId =
      (session.metadata as Record<string, string>)?.product_id || "creator-pro";

    // Insert the license
    const { error: insertError } = await supabase.from("licenses").insert({
      user_id: userId,
      license_key: licenseKey,
      product_id: productId,
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
