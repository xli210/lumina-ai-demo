"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin bar along the top of the window from the moment a link to another page is
 * clicked until that page is on screen. Pages are rendered on the server, so a click
 * used to leave the old page standing still for a few hundred milliseconds with no sign
 * that anything happened.
 *
 * It lives only in the browser and adds nothing to the HTML a crawler reads. It ignores
 * links that open elsewhere (new tab, modifier keys, downloads, other sites, a #section
 * on the same page) and stays hidden for the first 120 ms, so a page that is already
 * prefetched never flashes it.
 */

const SHOW_AFTER_MS = 120;
const GIVE_UP_MS = 10_000;

export function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const hide = (finished: boolean) => {
    clearTimers();
    const bar = barRef.current;
    if (!bar || bar.style.opacity !== "1") return;
    if (finished) {
      bar.style.transition = "transform 150ms ease-out, opacity 250ms ease 150ms";
      bar.style.transform = "scaleX(1)";
    } else {
      bar.style.transition = "opacity 150ms ease";
    }
    bar.style.opacity = "0";
  };

  useEffect(() => {
    const start = () => {
      clearTimers();
      timers.current.push(
        window.setTimeout(() => {
          const bar = barRef.current;
          if (!bar) return;
          bar.style.transition = "none";
          bar.style.transform = "scaleX(0)";
          bar.style.opacity = "1";
          // Read layout once so the reset above is painted before the bar starts to grow.
          void bar.offsetWidth;
          bar.style.transition = "transform 8s cubic-bezier(0.1, 0.7, 0.2, 1)";
          bar.style.transform = "scaleX(0.9)";
        }, SHOW_AFTER_MS),
        window.setTimeout(() => hide(false), GIVE_UP_MS),
      );
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      start();
    };

    const onPageShow = () => hide(false);

    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onPageShow);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    hide(true);
  }, [pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 origin-left bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
      style={{ opacity: 0, transform: "scaleX(0)" }}
    />
  );
}
