"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Video, ArrowRight, X, Palette } from "lucide-react";

interface WhatsNewItem {
  id: string;
  /** Short label shown as a colored badge ("NEW", "PRO", etc.) */
  label: string;
  labelClassName: string;
  icon: typeof Video;
  iconClassName: string;
  text: string;
  href: string;
  /** Whether the link is in-app (Next.js Link) or hash navigation on the same page */
  isHash?: boolean;
}

const ITEMS: WhatsNewItem[] = [
  {
    id: "nano-facestudio-pro-1-launch",
    label: "LAUNCH",
    labelClassName: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    icon: Palette,
    iconClassName: "text-emerald-600",
    text: "Nano FaceStudio Pro 1.0 — available now for Windows · macOS in ~1 week · $49.90 launch (was $69.90)",
    href: "/apps/nano-facestudio-pro",
  },
  {
    id: "faceswap-pro-2-features",
    label: "NEW",
    labelClassName: "bg-purple-100 text-purple-700 ring-purple-200",
    icon: Video,
    iconClassName: "text-purple-600",
    text: "Introducing Nano FaceSwap Pro 2.0 — full feature tour",
    href: "/apps/nano-faceswap-pro/features",
  },
  {
    id: "nano-imageenh-pro-3",
    label: "NEW",
    labelClassName: "bg-amber-100 text-amber-700 ring-amber-200",
    icon: Sparkles,
    iconClassName: "text-amber-600",
    text: "Nano ImageEnh Pro 3.0 — now on Mac (M2–M5)",
    href: "/apps/nano-imageenh-pro",
  },
];

// Bumped from v1 → v2 so users who dismissed the previous bar see the new
// Nano FaceStudio Pro launch announcement.
const STORAGE_KEY = "nanopocket_whats_new_dismissed_v2";

export function WhatsNewBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function handleDismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }

  function handleHashClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-14 z-40 border-b border-neutral-200 bg-white sm:top-16">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 sm:px-6 sm:py-2">
        <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 sm:flex">
          <Sparkles className="h-3 w-3 text-amber-500" />
          What&apos;s new
        </div>

        <div
          className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const linkContent = (
              <span className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs transition-all hover:border-neutral-300 hover:bg-white hover:shadow-sm">
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider ring-1 ${item.labelClassName}`}
                >
                  {item.label}
                </span>
                <Icon className={`h-3.5 w-3.5 ${item.iconClassName}`} />
                <span className="text-neutral-700 group-hover:text-black">
                  {item.text}
                </span>
                <ArrowRight className="h-3 w-3 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
              </span>
            );

            return item.isHash ? (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleHashClick(e, item.href)}
                className="shrink-0"
              >
                {linkContent}
              </a>
            ) : (
              <Link key={item.id} href={item.href} className="shrink-0">
                {linkContent}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
          aria-label="Dismiss what's new bar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
