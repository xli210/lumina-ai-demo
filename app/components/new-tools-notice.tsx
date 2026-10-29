"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Download, ScanFace, Sparkles, UserRoundCog, Video, Wand2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";

/**
 * A one-time announcement of the two newest online tools, Video FaceSwap Online and Nano HeadSwap Pro,
 * for signed-in visitors. It replaces the HeadSwap Pro notice, which replaced the Video FaceSwap one: the
 * session is read in the browser, so every page's HTML stays the same for everyone, and it is marked as
 * seen the moment it appears.
 *
 * It is also the quickest way into the older tools on a phone, where the menu is a tap further away, so a
 * row of smaller links under the two new ones leads to them. Only the two new tools carry the New badge.
 */

// v2 added the row of older tools: everyone sees the panel once more with it.
const SEEN_KEY = "nanopocket_new_tools_notice_seen_v2";
const QUIET_PREFIXES = ["/facestudio-v", "/headswap-pro", "/auth", "/admin", "/checkout"];

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // storage blocked: do not risk showing it on every page
  }
}

const NEW_TOOLS = [
  {
    href: FACESTUDIO_V_LAUNCH,
    icon: Video,
    name: FACESTUDIO_V_NAME,
    what: "Swap one face in a video, the rest as filmed.",
  },
  {
    href: "/headswap-pro/index.html",
    icon: UserRoundCog,
    name: HEADSWAP_PRO_NAME,
    what: "Put any head in any photo, group photos too.",
  },
];

// Same labels as the menu (mobile-nav.tsx).
const MORE_TOOLS = [
  { href: "/face-swap", icon: ScanFace, label: "Photo Face Swap" },
  { href: "/image-edit", icon: Wand2, label: "AI Image Edit" },
  { href: "/download", icon: Download, label: "Desktop apps" },
];

export function NewToolsNotice() {
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
      <p className="pr-6 text-sm font-semibold">Two new tools, paid in credits</p>
      <ul className="mt-3 space-y-2">
        {NEW_TOOLS.map(({ href, icon: Icon, name, what }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setVisible(false)}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition hover:bg-white/10"
            >
              <Icon className="h-5 w-5 shrink-0 text-sky-200" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="truncate">{name}</span>
                  <span className="shrink-0 rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide">
                    New
                  </span>
                </span>
                <span className="block text-xs text-white/70">{what}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-widest text-white/50">Also on NanoPocket</p>
      <ul className="flex flex-wrap gap-2">
        {MORE_TOOLS.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setVisible(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
