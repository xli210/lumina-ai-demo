"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Video, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  FACESTUDIO_V_ENDS_LABEL,
  FACESTUDIO_V_LAUNCH,
  FACESTUDIO_V_NAME,
  FACESTUDIO_V_PAGE,
  facestudioVIsOpen,
} from "@/lib/facestudio-v";

/**
 * A one-time reminder for signed-in users while the Nano FaceStudio-V Online
 * preview is open. It reads the session in the browser (like the navbar), so
 * every page's HTML stays identical for everyone and CDN caching is unaffected.
 * Shown once per browser: marked as seen the moment it appears.
 */

const SEEN_KEY = "nanopocket_fsv_notice_seen_v1";
// Pages where it would be noise: the preview's own page, sign-in flows, admin.
const QUIET_PREFIXES = ["/facestudio-v", "/auth", "/admin", "/checkout"];

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // storage blocked: do not risk showing it on every page
  }
}

export function FacestudioVNotice() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const quiet = QUIET_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (quiet || visible || !facestudioVIsOpen() || readSeen()) return;
    let cancelled = false;
    try {
      createClient()
        .auth.getSession()
        .then(({ data }) => {
          if (cancelled || !data.session?.user || readSeen()) return;
          try {
            localStorage.setItem(SEEN_KEY, "1");
          } catch {}
          setVisible(true);
        })
        .catch(() => {});
    } catch {}
    return () => {
      cancelled = true;
    };
  }, [quiet, visible]);

  if (!visible || quiet) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto w-auto max-w-md rounded-2xl border border-sky-300/30 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur sm:left-auto sm:right-6 sm:mx-0"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-sky-200">
        <Video className="h-3.5 w-3.5" />
        Free 3-day preview
      </p>
      <p className="pr-6 text-sm font-semibold">{FACESTUDIO_V_NAME} is open</p>
      <p className="mt-1 text-sm text-white/75">
        Swap one face in a video and keep the rest as filmed. Free for your account until{" "}
        {FACESTUDIO_V_ENDS_LABEL}.
      </p>
      <div className="mt-3 flex items-center gap-4">
        <Link
          href={FACESTUDIO_V_LAUNCH}
          onClick={() => setVisible(false)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-neutral-100"
        >
          Open the studio
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={FACESTUDIO_V_PAGE}
          onClick={() => setVisible(false)}
          className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          See examples
        </Link>
      </div>
    </div>
  );
}
