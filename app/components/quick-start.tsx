"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Download, LayoutGrid, ScanFace, Sparkles, UserRoundCog, Video, Wand2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";

/**
 * The quick way into every tool, bottom right, for everyone. For signed-in visitors it opens by itself
 * once per visit (per browser tab session), a few seconds in; signed-out visitors see only the small
 * "Tools" button until they tap it. Closed, it stays as that button, so on a phone the tools are
 * always one tap away without the panel covering the page each time.
 *
 * Signed-out visitors are asked to sign up first: the two new tools need an account, so their links go
 * through sign-up and come back to the tool. The older tools' links go to their pages, which are open
 * to everyone. Only the two new tools carry the New badge.
 *
 * The session is read in the browser, so every page's HTML stays the same for everyone.
 */

// Pages where the button would sit on top of a tool in use or of a form being filled in.
const QUIET_PREFIXES = [
  "/facestudio-v",
  "/headswap-pro",
  "/face-studio/",
  "/image-edit/launch",
  "/auth",
  "/admin",
  "/checkout",
  "/credits",
];
const AUTO_OPENED_KEY = "nanopocket_quick_start_opened";
const AUTO_OPEN_AFTER_MS = 4000;

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

function signUpFor(path: string): string {
  return `/auth/sign-up?next=${encodeURIComponent(path)}`;
}

/** True the first time in this tab session; storage that is blocked counts as already opened. */
function claimAutoOpen(): boolean {
  try {
    if (sessionStorage.getItem(AUTO_OPENED_KEY) === "1") return false;
    sessionStorage.setItem(AUTO_OPENED_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function QuickStart() {
  const pathname = usePathname() ?? "/";
  // null until the session has been read: the links depend on it.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const quiet = QUIET_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    let cancelled = false;
    try {
      createClient()
        .auth.getSession()
        .then(({ data }) => {
          if (!cancelled) setSignedIn(Boolean(data.session?.user));
        })
        .catch(() => {
          if (!cancelled) setSignedIn(false);
        });
    } catch {
      setSignedIn(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Signed-out visitors only get the button: on 10/29 the panel opening by itself over the first
    // screen coincided with sign-ups halving, so a new visitor sees the page first.
    if (quiet || !signedIn) return;
    const timer = setTimeout(() => {
      if (!claimAutoOpen()) return;
      setOpen(true);
      trackEvent("quick_start_auto_open", { signed_in: signedIn });
    }, AUTO_OPEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [quiet, signedIn]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (quiet || signedIn === null) return null;

  const follow = (item: string) => () => {
    setOpen(false);
    trackEvent("quick_start_click", { item, signed_in: signedIn });
  };

  if (!open) {
    // Above the Feedback button, which has the bottom-right corner.
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent("quick_start_open", { signed_in: signedIn });
        }}
        aria-expanded={false}
        aria-controls="quick-start"
        className="fixed bottom-[4.25rem] right-4 z-40 inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-neutral-950/95 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur transition-colors hover:bg-neutral-900 sm:bottom-[4.75rem] sm:right-6"
      >
        <LayoutGrid className="h-4 w-4 text-sky-200" />
        Tools
        <span className="rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide">
          2 new
        </span>
      </button>
    );
  }

  return (
    <div
      id="quick-start"
      role="dialog"
      aria-label="Tools"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto w-auto max-w-md rounded-2xl border border-sky-300/30 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur sm:left-auto sm:right-6 sm:mx-0"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-3 top-3 text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-sky-200">
        <Sparkles className="h-3.5 w-3.5" />
        New
      </p>
      <p className="pr-6 text-sm font-semibold">Two new tools, paid in credits</p>
      {!signedIn && (
        <Link
          href={signUpFor(pathname)}
          onClick={follow("sign_up")}
          className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-100"
        >
          <span>
            Sign up free <span className="font-normal text-neutral-600">· {SIGNUP_GRANT_CREDITS} credits to start</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}
      <ul className="mt-3 space-y-2">
        {NEW_TOOLS.map(({ href, icon: Icon, name, what }) => (
          <li key={href}>
            <Link
              href={signedIn ? href : signUpFor(href)}
              onClick={follow(href)}
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
              onClick={follow(href)}
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
