import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { license_key, machine_id } = body as {
    license_key?: string;
    machine_id?: string;
  };

  if (!license_key || !machine_id) {
    return NextResponse.json(
      { valid: false, error: "Missing license_key or machine_id" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: license } = await supabase
    .from("licenses")
    .select("id, is_revoked, product_id, user_id")
    .eq("license_key", license_key.toUpperCase().trim())
    .single();

  if (!license) {
    return NextResponse.json(
      { valid: false, error: "Invalid license" },
      { status: 404 }
    );
  }

  if (license.is_revoked) {
    return NextResponse.json(
      { valid: false, error: "License revoked" },
      { status: 403 }
    );
  }

  // Check if user is banned
  if (license.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", license.user_id)
      .single();

    if (profile?.is_banned) {
      return NextResponse.json(
        { valid: false, error: "Account suspended" },
        { status: 403 }
      );
    }
  }

  const { data: activation } = await supabase
    .from("activations")
    .select("id")
    .eq("license_id", license.id)
    .eq("machine_id", machine_id)
    .single();

  if (!activation) {
    return NextResponse.json(
      { valid: false, error: "Machine not activated" },
      { status: 403 }
    );
  }

  // Update heartbeat
  await supabase
    .from("activations")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", activation.id);

  return NextResponse.json({ valid: true, product_id: license.product_id });
}
