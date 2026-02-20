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

  // 3. Validate product exists and is free
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  if (product.priceInCents > 0) {
    return NextResponse.json(
      { error: "This product requires payment. Use the checkout flow." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // 4. Check if user already has a license for this product
  const { data: existingLicense } = await admin
    .from("licenses")
    .select("id, license_key")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("is_revoked", false)
    .single();

  if (existingLicense) {
    return NextResponse.json({
      status: "already_claimed",
      license_key: existingLicense.license_key,
      message: "You already have a license for this product.",
    });
  }

  // 5. Generate unique license key
  let licenseKey = generateLicenseKey();
  let attempts = 0;
  while (attempts < 10) {
    const { data: dup } = await admin
      .from("licenses")
      .select("id")
      .eq("license_key", licenseKey)
      .single();
    if (!dup) break;
    licenseKey = generateLicenseKey();
    attempts++;
  }

  // 6. Insert the license (max_activations = 1 per machine)
  const { error: insertError } = await admin.from("licenses").insert({
    user_id: user.id,
    license_key: licenseKey,
    product_id: productId,
    max_activations: product.maxActivations,
    stripe_payment_intent_id: null,
  });

  if (insertError) {
    console.error("Failed to create license:", insertError);
    return NextResponse.json(
      { error: "Failed to generate license. Please try again." },
      { status: 500 }
    );
  }

  // 7. Update user profile
  await admin
    .from("profiles")
    .update({ has_purchased: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({
    status: "claimed",
    license_key: licenseKey,
    product_id: productId,
    message: "License generated successfully!",
  });
}
