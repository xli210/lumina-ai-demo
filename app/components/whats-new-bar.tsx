"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Video, ArrowRight, X, Palette, Wand2, ScanFace } from "lucide-react";
import { FACESTUDIO_V_NAME, facestudioVHasEnded } from "@/lib/facestudio-v";

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
    id: "nano-facestudio-v-preview",
    label: "3 DAYS",
    labelClassName: "bg-rose-100 text-rose-700 ring-rose-200",
    icon: Video,
    iconClassName: "text-rose-600",
    text: `${FACESTUDIO_V_NAME} — video face swap · limited 3-day queued preview · official release coming soon`,
    href: "/facestudio-v",
  },
  {
    id: "nano-imageedit-2-online-launch",
    label: "NEW",
    labelClassName: "bg-sky-100 text-sky-700 ring-sky-200",
    icon: Wand2,
    iconClassName: "text-sky-600",
    text: "Nano ImageEdit 2.0 Online — edit photos by describing the change · remove, replace, restyle, restore",
    href: "/image-edit",
  },
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
    id: "nano-facestudio-online-live",
    label: "LIVE",
    labelClassName: "bg-purple-100 text-purple-700 ring-purple-200",
    icon: ScanFace,
    iconClassName: "text-purple-600",
    text: "Nano FaceStudio Online — swap up to 6 faces in one photo, in your browser",
    href: "/face-studio",
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

// Bumped each time the announcements change, so people who dismissed the
// previous bar see the new ones. v3: Nano ImageEdit 2.0 Online launch.
// v4: the Nano FaceStudio-V Online three-day preview.
const STORAGE_KEY = "nanopocket_whats_new_dismissed_v4";

export function WhatsNewBar() {
  const [visible, setVisible] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  // When the announcements are wider than the bar they scroll by themselves;
  // otherwise they sit still. Reduced-motion users scroll by hand instead.
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setPreviewEnded(facestudioVHasEnded());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track) return;
    const measure = () => {
      // Width of the first copy of the items (the track may hold a second copy
      // for the loop), so the answer does not depend on whether it is scrolling.
      const kids = Array.from(track.children).slice(0, ITEMS.length) as HTMLElement[];
      if (kids.length === 0) return;
      const first = kids[0];
      const last = kids[kids.length - 1];
      const one = last.offsetLeft + last.offsetWidth - first.offsetLeft;
      setOverflowing(one > frame.clientWidth + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [visible, previewEnded]);

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

  const items = ITEMS.map((item) =>
    item.id === "nano-facestudio-v-preview" && previewEnded
      ? { ...item, label: "ENDED", text: `${FACESTUDIO_V_NAME} preview has ended — official release coming soon` }
      : item
  );
  const scrolling = overflowing && !reduceMotion;
  // A second copy lets the loop run without a jump.
  const shown = scrolling ? [...items, ...items] : items;

  return (
    <div className="fixed left-0 right-0 top-14 z-40 border-b border-neutral-200 bg-white sm:top-16">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5 sm:px-6 sm:py-2">
        <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 sm:flex">
          <Sparkles className="h-3 w-3 text-amber-500" />
          What&apos;s new
        </div>

        <div
          ref={frameRef}
          className={`flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            scrolling ? "overflow-hidden" : "overflow-x-auto"
          }`}
        >
         <div
          ref={trackRef}
          className={`flex w-max items-center gap-2 ${
            scrolling
              ? "[animation:whatsnew-scroll_55s_linear_infinite] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
              : ""
          }`}
         >
          {shown.map((item, i) => {
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
                key={`${item.id}-${i}`}
                href={item.href}
                onClick={(e) => handleHashClick(e, item.href)}
                className="shrink-0"
              >
                {linkContent}
              </a>
            ) : (
              <Link
                key={`${item.id}-${i}`}
                href={item.href}
                className="shrink-0"
                aria-hidden={scrolling && i >= items.length ? true : undefined}
                tabIndex={scrolling && i >= items.length ? -1 : undefined}
              >
                {linkContent}
              </Link>
            );
          })}
         </div>
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
