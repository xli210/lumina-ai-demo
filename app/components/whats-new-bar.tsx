"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Video, ArrowRight, X } from "lucide-react";

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
    id: "video-faceswap-demo",
    label: "ONLINE",
    labelClassName: "bg-purple-500/15 text-purple-400 ring-purple-500/30",
    icon: Video,
    iconClassName: "text-purple-400",
    text: "Try Video FaceSwap Pro online — free demo",
    href: "#announcement",
    isHash: true,
  },
  {
    id: "nano-imageenh-pro-3",
    label: "NEW",
    labelClassName: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
    icon: Sparkles,
    iconClassName: "text-amber-400",
    text: "Nano ImageEnh Pro 3.0 — now on Mac (M2–M5)",
    href: "/apps/nano-imageenh-pro",
  },
];

const STORAGE_KEY = "nanopocket_whats_new_dismissed_v1";

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
    <div className="relative z-30 border-b border-border/60 bg-gradient-to-r from-purple-500/[0.04] via-primary/[0.04] to-amber-500/[0.04] backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:flex">
          <Sparkles className="h-3 w-3 text-amber-400" />
          What&apos;s new
        </div>

        <div
          className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const linkContent = (
              <span className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs transition-all hover:border-primary/40 hover:bg-card hover:shadow-sm">
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider ring-1 ${item.labelClassName}`}
                >
                  {item.label}
                </span>
                <Icon className={`h-3.5 w-3.5 ${item.iconClassName}`} />
                <span className="text-foreground/90 group-hover:text-foreground">
                  {item.text}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
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
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss what's new bar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
