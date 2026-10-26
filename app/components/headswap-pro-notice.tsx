"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * A one-time announcement of Nano HeadSwap Pro for signed-in visitors. Same pattern as the earlier
 * Video FaceSwap notice it replaces: the session is read in the browser, so every page's HTML stays the
 * same for everyone, and it is marked as seen the moment it appears.
 */

const SEEN_KEY = "nanopocket_headswap_pro_notice_seen_v1";
const QUIET_PREFIXES = ["/headswap-pro", "/auth", "/admin", "/checkout"];

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // storage blocked: do not risk showing it on every page
  }
}

export function HeadswapProNotice() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const quiet = QUIET_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (quiet || visible || readSeen()) return;
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
        <Sparkles className="h-3.5 w-3.5" />
        New
      </p>
      <p className="pr-6 text-sm font-semibold">Nano HeadSwap Pro is here</p>
      <p className="mt-1 text-sm text-white/75">
        Put any head in any photo: the new face and hair, the same scene. Works on group photos, up to four variations at a time,
        paid per image in credits.
      </p>
      <div className="mt-3 flex items-center gap-4">
        <Link
          href="/headswap-pro/index.html"
          onClick={() => setVisible(false)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-neutral-100"
        >
          Try HeadSwap Pro
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/headswap-pro"
          onClick={() => setVisible(false)}
          className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}
