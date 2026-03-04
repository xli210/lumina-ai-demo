import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/products";
import crypto from "crypto";

function generateLicenseKey(): string {
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
  // 1. Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to claim a license" },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId = body.product_id as string | undefined;
  if (!productId) {
    return NextResponse.json(
      { error: "Missing product_id" },
      { status: 400 }
    );
  }

  // 3. Validate product exists
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  // Block paid products that have no trial period — those must go through Stripe checkout
  if (product.priceInCents > 0 && !product.trialDays) {
    return NextResponse.json(
      { error: "This product requires payment. Use the checkout flow." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // 3b. Check if user is banned
  const { data: profile } = await admin
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json(
      { error: "Your account has been suspended." },
      { status: 403 }
    );
  }

  // 4. Check if user already has a license for this product
  const { data: existingLicense } = await admin
    .from("licenses")
    .select("id, license_key, is_trial, trial_ends_at")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("is_revoked", false)
    .single();

  if (existingLicense) {
    return NextResponse.json({
      status: "already_claimed",
      license_key: existingLicense.license_key,
      is_trial: existingLicense.is_trial ?? false,
      trial_ends_at: existingLicense.trial_ends_at ?? null,
      message: "You already have a license for this product.",
    });
  }

  // 5. Generate unique license key (retry up to 10 times)
  let licenseKey = "";
  let keyIsUnique = false;
  for (let attempts = 0; attempts < 10; attempts++) {
    licenseKey = generateLicenseKey();
    const { data: dup } = await admin
      .from("licenses")
      .select("id")
      .eq("license_key", licenseKey)
      .single();
    if (!dup) {
      keyIsUnique = true;
      break;
    }
  }

  if (!keyIsUnique) {
    console.error("Failed to generate a unique license key after 10 attempts");
    return NextResponse.json(
      { error: "Failed to generate license. Please try again." },
      { status: 500 }
    );
  }

  // 6. Determine if this is a trial license
  const isTrial = product.priceInCents > 0 && (product.trialDays ?? 0) > 0;
  const trialEndsAt = isTrial
    ? new Date(Date.now() + product.trialDays! * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // 7. Insert the license
  const { error: insertError } = await admin.from("licenses").insert({
    user_id: user.id,
    license_key: licenseKey,
    product_id: productId,
    max_activations: product.maxActivations,
    stripe_payment_intent_id: null,
    is_trial: isTrial,
    trial_ends_at: trialEndsAt,
  });

  if (insertError) {
    console.error("Failed to create license:", insertError);
    return NextResponse.json(
      { error: "Failed to generate license. Please try again." },
      { status: 500 }
    );
  }

  // 8. Update user profile
  await admin
    .from("profiles")
    .update({ has_purchased: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({
    status: "claimed",
    license_key: licenseKey,
    product_id: productId,
    is_trial: isTrial,
    trial_ends_at: trialEndsAt,
    message: isTrial
      ? `${product.trialDays}-day free trial started!`
      : "License generated successfully!",
  });
}
