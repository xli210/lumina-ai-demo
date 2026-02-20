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
      { error: "Missing license_key or machine_id" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 1. Validate the license exists and is not revoked
  const { data: license } = await supabase
    .from("licenses")
    .select("id, is_revoked, user_id")
    .eq("license_key", license_key.toUpperCase().trim())
    .single();

  if (!license) {
    return NextResponse.json({ error: "Invalid license" }, { status: 404 });
  }

  if (license.is_revoked) {
    return NextResponse.json(
      { error: "This license has been revoked" },
      { status: 403 }
    );
  }

  // 2. Check if the user is banned
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

  // 3. Verify the activation actually exists before deleting
  const { data: activation } = await supabase
    .from("activations")
    .select("id")
    .eq("license_id", license.id)
    .eq("machine_id", machine_id)
    .single();

  if (!activation) {
    return NextResponse.json(
      { error: "No activation found for this machine" },
      { status: 404 }
    );
  }

  // 4. Delete the activation
  const { error } = await supabase
    .from("activations")
    .delete()
    .eq("id", activation.id);

  if (error) {
    return NextResponse.json(
      { error: "Deactivation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "deactivated",
    message: "Machine deactivated successfully",
  });
}
