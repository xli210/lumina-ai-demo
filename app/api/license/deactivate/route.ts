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

  const { data: license } = await supabase
    .from("licenses")
    .select("id")
    .eq("license_key", license_key.toUpperCase().trim())
    .single();

  if (!license) {
    return NextResponse.json({ error: "Invalid license" }, { status: 404 });
  }

  const { error } = await supabase
    .from("activations")
    .delete()
    .eq("license_id", license.id)
    .eq("machine_id", machine_id);

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
