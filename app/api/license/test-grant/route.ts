import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/products";
import crypto from "crypto";

/**
 * Admin-only "instant license" endpoint used by hidden internal-preview
 * pages to test the license → download → activation loop end-to-end
 * without paying through Stripe.
 *
 * Hard-gates:
 *   1. Caller must be authenticated.
 *   2. Caller's profile.role must be exactly "admin".
 *   3. product_id must be in TEST_GRANT_ALLOWED_PRODUCTS (below).
 *
 * When those pass, we insert a real, permanent, non-trial license row —
 * identical shape to what the Stripe webhook produces on
 * checkout.session.completed. The row is idempotent per (user, product):
 * calling twice returns the existing license instead of duplicating.
 *
 * Do NOT add public-launch products to TEST_GRANT_ALLOWED_PRODUCTS.
 */

// Product allowlist. Only these products can be minted via test-grant.
const TEST_GRANT_ALLOWED_PRODUCTS = new Set<string>(["nano-facestudio-pro"]);

type Admin = ReturnType<typeof createAdminClient>;

function generateLicenseKey(): string {
  // Crockford-ish alphabet — no ambiguous chars (I, O, 0, 1)
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

async function generateUniqueLicenseKey(admin: Admin): Promise<string | null> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateLicenseKey();
    const { data: dup } = await admin
      .from("licenses")
      .select("id")
      .eq("license_key", candidate)
      .single();
    if (!dup) return candidate;
  }
  return null;
}

async function validateAdminCaller(
  admin: Admin,
  userId: string
): Promise<NextResponse | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_banned")
    .eq("id", userId)
    .single();

  if (profile?.is_banned) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }
  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Test grant is admin-only." },
      { status: 403 }
    );
  }
  return null;
}

async function parseBody(req: NextRequest): Promise<
  | { productId: string; error: null }
  | { productId: null; error: NextResponse }
> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return {
      productId: null,
      error: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }
  const productId = body.product_id as string | undefined;
  if (!productId) {
    return {
      productId: null,
      error: NextResponse.json(
        { error: "Missing product_id" },
        { status: 400 }
      ),
    };
  }
  if (!TEST_GRANT_ALLOWED_PRODUCTS.has(productId)) {
    return {
      productId: null,
      error: NextResponse.json(
        { error: "Test grant not enabled for this product." },
        { status: 403 }
      ),
    };
  }
  return { productId, error: null };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = await parseBody(req);
  if (parsed.error) return parsed.error;
  const productId = parsed.productId;

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  const adminError = await validateAdminCaller(admin, user.id);
  if (adminError) return adminError;

  // Idempotent: if the user already has a live license, return it.
  const { data: existing } = await admin
    .from("licenses")
    .select("license_key, is_trial, trial_ends_at")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("is_revoked", false)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({
      status: "already_claimed",
      license_key: existing.license_key,
      is_trial: existing.is_trial ?? false,
      trial_ends_at: existing.trial_ends_at ?? null,
      message: "You already have a license for this product.",
    });
  }

  const licenseKey = await generateUniqueLicenseKey(admin);
  if (!licenseKey) {
    return NextResponse.json(
      { error: "Failed to generate license. Please try again." },
      { status: 500 }
    );
  }

  const { error: insertError } = await admin.from("licenses").insert({
    user_id: user.id,
    license_key: licenseKey,
    product_id: productId,
    max_activations: product.maxActivations,
    stripe_payment_intent_id: null,
    is_trial: false,
    trial_ends_at: null,
  });
  if (insertError) {
    console.error("[test-grant] insert failed:", insertError);
    return NextResponse.json(
      { error: "Failed to create license." },
      { status: 500 }
    );
  }

  await admin
    .from("profiles")
    .update({ has_purchased: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({
    status: "granted",
    license_key: licenseKey,
    product_id: productId,
    is_trial: false,
    trial_ends_at: null,
    message: "Test license granted. This is a real permanent license.",
  });
}
