import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/products";
import crypto from "crypto";

/**
 * Derive a one-time transport key from the machine fingerprint so the
 * master key is never sent in plaintext (even over HTTPS, defense-in-depth).
 * Client uses the same derivation to decrypt.
 */
function encryptMasterKey(masterKey: string, machineId: string): string {
  const secret = crypto
    .createHash("sha256")
    .update(`machine-transport:${machineId}`)
    .digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secret, iv);
  const enc = Buffer.concat([cipher.update(masterKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Return iv + tag + ciphertext as hex
  return Buffer.concat([iv, tag, enc]).toString("hex");
}

/**
 * Resolve the master encryption key for a given product.
 * Checks the per-product env var first, then falls back to the global key.
 */
function getMasterKeyForProduct(productId: string): string | undefined {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product) {
    const perProductKey = process.env[product.masterKeyEnv];
    if (perProductKey) return perProductKey;
  }
  // Fallback to global key (legacy / single-product setups)
  return process.env.LICENSE_MASTER_KEY;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    license_key,
    machine_id,
    machine_label,
    product_id,
    force_takeover,
  } = body as {
    license_key?: string;
    machine_id?: string;
    machine_label?: string;
    product_id?: string;
    force_takeover?: boolean;
  };

  if (!license_key || !machine_id || !product_id) {
    return NextResponse.json(
      { error: "Missing license_key, machine_id, or product_id" },
      { status: 400 }
    );
  }

  // Validate that the product_id is a known product
  const knownProduct = PRODUCTS.find((p) => p.id === product_id);
  if (!knownProduct) {
    return NextResponse.json(
      { error: "Unknown product" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 1. Find the license
  const { data: license, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", license_key.toUpperCase().trim())
    .single();

  if (!license || error) {
    return NextResponse.json({ error: "Invalid license key" }, { status: 404 });
  }

  // 2. Verify the license belongs to the requested product
  if (license.product_id !== product_id) {
    return NextResponse.json(
      { error: "This license key is not valid for this application." },
      { status: 403 }
    );
  }

  if (license.is_revoked) {
    return NextResponse.json(
      { error: "This license has been revoked" },
      { status: 403 }
    );
  }

  // Check if the user is banned
  if (license.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", license.user_id)
      .single();

    if (profile?.is_banned) {
      return NextResponse.json(
        { error: "Account has been suspended" },
        { status: 403 }
      );
    }
  }

  // 3. Check if this machine is already activated
  const { data: existingActivation } = await supabase
    .from("activations")
    .select("*")
    .eq("license_id", license.id)
    .eq("machine_id", machine_id)
    .single();

  if (existingActivation) {
    // Already activated — refresh heartbeat
    await supabase
      .from("activations")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existingActivation.id);

    const masterKey = getMasterKeyForProduct(license.product_id);
    return NextResponse.json({
      status: "activated",
      message: "Machine already activated",
      license_id: license.id,
      product_id: license.product_id,
      ...(masterKey && machine_id
        ? { encrypted_master_key: encryptMasterKey(masterKey, machine_id) }
        : {}),
    });
  }

  // 4. Count current activations
  const { count } = await supabase
    .from("activations")
    .select("*", { count: "exact", head: true })
    .eq("license_id", license.id);

  if ((count ?? 0) >= license.max_activations) {
    if (!force_takeover) {
      return NextResponse.json(
        {
          error: "activation_limit_reached",
          message: `Limit of ${license.max_activations} machines reached. Send force_takeover: true to deactivate all and bind this machine.`,
          current_activations: count,
          max_activations: license.max_activations,
        },
        { status: 409 }
      );
    }

    // Rate-limit force takeovers to once per 30 days
    if (license.last_force_takeover_at) {
      const daysSince =
        (Date.now() - new Date(license.last_force_takeover_at).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        return NextResponse.json(
          {
            error: "force_takeover_cooldown",
            message: `Force takeover available again in ${Math.ceil(30 - daysSince)} days.`,
          },
          { status: 429 }
        );
      }
    }

    // Deactivate all existing machines
    await supabase
      .from("activations")
      .delete()
      .eq("license_id", license.id);

    await supabase
      .from("licenses")
      .update({ last_force_takeover_at: new Date().toISOString() })
      .eq("id", license.id);
  }

  // 5. Create the activation
  await supabase.from("activations").insert({
    license_id: license.id,
    machine_id,
    machine_label: machine_label || null,
  });

  const masterKey = getMasterKeyForProduct(license.product_id);

  return NextResponse.json({
    status: "activated",
    message: "Machine activated successfully",
    license_id: license.id,
    product_id: license.product_id,
    ...(masterKey && machine_id
      ? { encrypted_master_key: encryptMasterKey(masterKey, machine_id) }
      : {}),
  });
}
