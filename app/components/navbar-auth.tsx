"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NavbarUserMenu } from "./navbar-user-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";

/**
 * The signed-in half of the navbar, resolved in the browser.
 *
 * It used to be resolved on the server (a Supabase round trip plus a profiles
 * query on every page view), which made every page's HTML different per
 * visitor and therefore impossible to cache. Reading the session here keeps
 * the page itself identical for everyone, so public pages can be served from
 * the CDN. Route protection is unaffected: middleware still guards the
 * protected paths, and every API route authenticates itself.
 */

type AuthState = { user: User | null; isAdmin: boolean };

// Remembered across client-side navigations so the bar does not flicker.
let lastKnown: AuthState | null = null;

export function NavbarAuth() {
  const [state, setState] = useState<AuthState | null>(lastKnown);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function apply(user: User | null) {
      let isAdmin = false;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        isAdmin = profile?.role === "admin";
      }
      if (cancelled) return;
      lastKnown = { user, isAdmin };
      setState(lastKnown);
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void apply(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = state?.user ?? null;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <LocaleSwitcher className="hidden sm:flex" />
      {state === null ? (
        // Same footprint as the buttons, so nothing shifts when the session resolves.
        <div className="h-8 w-24" aria-hidden />
      ) : user ? (
        <NavbarUserMenu user={user} isAdmin={state.isAdmin} />
      ) : (
        <>
          {/* Below sm "Sign In" lives in the mobile menu, so the bar fits. */}
          <Link href="/auth/login" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-500 hover:text-black sm:text-sm"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="text-xs bg-black text-white hover:bg-neutral-800 sm:text-sm">
              Get Started
            </Button>
          </Link>
        </>
      )}
      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
