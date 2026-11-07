"use client";

import { useEffect } from "react";
import { FIRST_TOUCH_COOKIE, FIRST_TOUCH_MAX_AGE_S, encodeFirstTouch } from "@/lib/first-touch";

const CLICK_IDS = ["gclid", "fbclid", "msclkid"];

/**
 * Writes the first-touch cookie (lib/first-touch.ts) on a browser's first page view and never
 * again. Runs in the browser so every page's HTML stays the same for everyone and can be cached.
 */
export function FirstTouch() {
  useEffect(() => {
    try {
      if (document.cookie.split("; ").some((c) => c.startsWith(`${FIRST_TOUCH_COOKIE}=`))) return;

      let ref = "";
      try {
        const host = document.referrer ? new URL(document.referrer).hostname : "";
        if (host && host !== location.hostname) ref = host;
      } catch {
        /* a referrer that is not a URL counts as none */
      }

      const params = new URLSearchParams(location.search);
      const value = encodeFirstTouch({
        ref,
        landing: location.pathname,
        utmSource: params.get("utm_source") ?? "",
        utmMedium: params.get("utm_medium") ?? "",
        utmCampaign: params.get("utm_campaign") ?? "",
        click: CLICK_IDS.find((k) => params.has(k)) ?? "",
        at: Math.floor(Date.now() / 1000),
      });
      const secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${FIRST_TOUCH_COOKIE}=${value}; Path=/; Max-Age=${FIRST_TOUCH_MAX_AGE_S}; SameSite=Lax${secure}`;
    } catch {
      /* cookies blocked: nothing is recorded */
    }
  }, []);

  return null;
}
