import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface LicenseInfo {
  license_key: string;
  is_trial: boolean;
  trial_ends_at: string | null;
}

export async function GET() {
  // 1. Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();

  // 2. Fetch all non-revoked licenses for this user (including trial info)
  const { data: licenses, error } = await admin
    .from("licenses")
    .select("product_id, license_key, is_trial, trial_ends_at")
    .eq("user_id", user.id)
    .eq("is_revoked", false);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }

  // Return as a map: { product_id: { license_key, is_trial, trial_ends_at } }
  const licenseMap: Record<string, LicenseInfo> = {};
  for (const lic of licenses ?? []) {
    licenseMap[lic.product_id] = {
      license_key: lic.license_key,
      is_trial: lic.is_trial ?? false,
      trial_ends_at: lic.trial_ends_at ?? null,
    };
  }

  return NextResponse.json({ licenses: licenseMap });
}
