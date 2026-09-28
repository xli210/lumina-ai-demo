import "server-only";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import type { LicenseSummary } from "@/lib/license-analytics";

/**
 * Server accessor for the license analytics RPC in migration 013.
 *
 * Uses the *session* client, not the admin client. `license_admin_summary`
 * re-checks `is_admin()`, which resolves the caller through `auth.uid()` —
 * and `auth.uid()` is NULL under the service role. Calling this with
 * `createAdminClient()` fails with "not authorized" no matter who is
 * actually signed in. Same constraint as the credit analytics in
 * lib/credits-server.ts.
 */
export async function getLicenseSummary(): Promise<LicenseSummary> {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("license_admin_summary");

  if (error) throw new Error(`license_admin_summary failed: ${error.message}`);
  if (!data) throw new Error("license_admin_summary returned no data");
  return data as LicenseSummary;
}
