import "server-only";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { FIRST_TOUCH_COOKIE, firstTouchSource, parseFirstTouch, type FirstTouch } from "@/lib/first-touch";

/** This browser's first touch, if it has one. */
export async function readFirstTouch(): Promise<FirstTouch | null> {
  try {
    return parseFirstTouch((await cookies()).get(FIRST_TOUCH_COOKIE)?.value);
  } catch {
    return null;
  }
}

/**
 * Copy this browser's first touch onto the account, once: the first row for an account stays
 * (scripts/025). Called when a new account is first given credits and at every checkout, so an
 * account that only ever buys a licence is covered too.
 *
 * An account opened before the cookie existed picks up a first touch dated after it was opened.
 * That row is kept but says nothing about how the person found us; reads compare `first_seen_at`
 * with the account's `created_at` (see the query in scripts/025).
 *
 * Never throws: a missing table or a failed write must not stop a grant or a checkout.
 */
export async function recordFirstTouch(userId: string): Promise<void> {
  try {
    const touch = await readFirstTouch();
    if (!touch) return;
    const { error } = await createAdminClient()
      .from("first_touches")
      .upsert(
        {
          user_id: userId,
          source: firstTouchSource(touch),
          referrer_host: touch.ref || null,
          landing_path: touch.landing,
          utm_source: touch.utmSource || null,
          utm_medium: touch.utmMedium || null,
          utm_campaign: touch.utmCampaign || null,
          click_id: touch.click || null,
          first_seen_at: new Date(touch.at * 1000).toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    if (error && error.code !== "42P01") console.error("[first-touch] record failed:", error.message);
  } catch (err: unknown) {
    console.error("[first-touch] record failed:", err instanceof Error ? err.message : err);
  }
}

/** The first touch as Stripe checkout metadata, so a purchase carries its source on its own. */
export async function firstTouchMetadata(): Promise<Record<string, string>> {
  const touch = await readFirstTouch();
  if (!touch) return {};
  return {
    ft_source: firstTouchSource(touch),
    ft_landing: touch.landing,
    ft_at: new Date(touch.at * 1000).toISOString(),
  };
}
