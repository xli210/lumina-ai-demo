import type { createAdminClient } from "@/lib/supabase/admin";
import { canonicalEmail } from "@/lib/disposable-email";

/** Far above today's accounts; a limit so that a bad reply cannot keep this looping. */
const MAX_PAGES = 50;
const PER_PAGE = 1000;

/**
 * True when this address is another spelling of a mailbox whose account already had free credits:
 * name+anything@ and, on Gmail, dots in the name reach the same inbox, so one person could claim again and again.
 *
 * Only an address written in such a form is looked up, because auth.users can only be read page by page.
 */
export async function aliasOfClaimedMailbox(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  email: string | null | undefined
): Promise<boolean> {
  const canonical = canonicalEmail(email);
  if (!canonical || canonical === email?.trim().toLowerCase()) return false;

  const sameMailbox: string[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    for (const user of data.users) {
      if (user.id !== userId && canonicalEmail(user.email) === canonical) sameMailbox.push(user.id);
    }
    if (data.users.length < PER_PAGE) break;
  }
  if (sameMailbox.length === 0) return false;

  const { data, error } = await supabase
    .from("free_credit_claims")
    .select("user_id")
    .in("user_id", sameMailbox)
    .in("outcome", ["granted", "grandfathered"])
    .limit(1);
  if (error) throw new Error(`free claim lookup failed: ${error.message}`);
  return (data ?? []).length > 0;
}
