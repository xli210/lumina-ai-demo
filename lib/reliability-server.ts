import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { WINDOWS, type HoldRow, type WindowKey } from "@/lib/reliability";

const MAX_ROWS = 20000;
const PAGE = 1000;

/**
 * Every credit hold made since the start of the window, newest first.
 * Service-role read: call it only from a page that has already checked for an admin.
 * `truncated` is true when the window held more than MAX_ROWS and the oldest were left out.
 */
export async function getHolds(window: WindowKey): Promise<{ rows: HoldRow[]; truncated: boolean }> {
  const supabase = createAdminClient();
  const since = WINDOWS[window].since().toISOString();
  const rows: HoldRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabase
      .from("credit_holds")
      .select("id, user_id, service, status, amount, estimate, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Failed to read credit holds: ${error.message}`);
    const batch = (data ?? []) as HoldRow[];
    rows.push(...batch);
    if (batch.length < PAGE) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}
