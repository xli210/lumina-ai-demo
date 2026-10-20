"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * A one-time pointer for signed-in people on a PC that can run the desktop
 * apps: Nano FaceSwap, FacialEdit and ImageTryon are free and run on your own
 * GPU, so photos and videos stay on your computer and nothing is a subscription.
 *
 * Most new accounts arrive for the hosted tools (Video FaceSwap Online, Face
 * Studio Online) and never see the local apps, so this is the one place they
 * are offered. It is shown only where it can help: a desktop browser on
 * Windows, and not on a machine whose graphics card the browser reports as
 * something other than NVIDIA. When the card cannot be read the notice still
 * shows, with the requirement stated. Once per browser, marked as seen the
 * moment it appears. It reads the session in the browser, like the navbar, so
 * every page's HTML stays identical for everyone.
 */

const SEEN_KEY = "nanopocket_local_apps_notice_seen_v1";
const SHOW_AFTER_MS = 8000;
// Pages where it would be noise or is redundant.
const QUIET_PREFIXES = ["/download", "/apps", "/release-notes", "/auth", "/admin", "/checkout", "/facestudio-v", "/face-studio/", "/credits"];

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // storage blocked: do not risk showing it on every page
  }
}

/** Windows desktop browser, and not a card the browser says is not NVIDIA. */
function canRunLocalApps(): boolean {
  const ua = navigator.userAgent;
  if (!/Windows NT/i.test(ua) || /Mobi|Android/i.test(ua)) return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = gl && ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    if (renderer && !/nvidia/i.test(renderer)) return false;
  } catch {
    /* cannot read the card: show it anyway, with the requirement in the text */
  }
  return true;
}

export function LocalAppsNotice() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const quiet = QUIET_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (quiet || visible || readSeen() || !canRunLocalApps()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
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
    }, SHOW_AFTER_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [quiet, visible]);

  if (!visible || quiet) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto w-auto max-w-md rounded-2xl border border-emerald-300/30 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur sm:left-6 sm:right-auto sm:mx-0"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-emerald-200">
        <Download className="h-3.5 w-3.5" />
        Free desktop apps
      </p>
      <p className="pr-6 text-sm font-semibold">Run face swap, face edit and try-on on your own PC</p>
      <p className="mt-1 text-sm text-white/75">
        Your photos and videos stay on your computer, and there is no subscription. Needs Windows and an NVIDIA graphics card.
      </p>
      <div className="mt-3 flex items-center gap-4">
        <Link
          href="/download"
          onClick={() => setVisible(false)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-neutral-100"
        >
          See the free apps
        </Link>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
