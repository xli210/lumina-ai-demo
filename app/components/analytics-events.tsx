"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { once, trackEvent } from "@/lib/analytics";

/**
 * Fires GA4's `sign_up` once for a brand-new account. It reads the session in the
 * browser (like the navbar), so every page's HTML stays identical for everyone.
 *
 * "Brand new" means the account was created in the last 24 hours and has signed in
 * in the last 10 minutes. That covers Google and GitHub sign-up (created and signed
 * in at the same moment) and email sign-up (the confirmation link signs the person
 * in later). One event per account per browser: a second browser on the same new
 * account would count it again, which is a small overcount we accept.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_SIGN_IN_MS = 10 * 60 * 1000;

export function AnalyticsEvents() {
  useEffect(() => {
    let cancelled = false;
    try {
      createClient()
        .auth.getSession()
        .then(({ data }) => {
          const user = data.session?.user;
          if (cancelled || !user) return;
          const now = Date.now();
          const created = Date.parse(user.created_at);
          const signedIn = Date.parse(user.last_sign_in_at ?? "");
          if (!Number.isFinite(created) || now - created > DAY_MS) return;
          if (!Number.isFinite(signedIn) || now - signedIn > RECENT_SIGN_IN_MS) return;
          once(`ga_sign_up_${user.id}`, () =>
            trackEvent("sign_up", { method: user.app_metadata?.provider ?? "email" })
          );
        })
        .catch(() => {});
    } catch {
      /* no Supabase client in this environment */
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
