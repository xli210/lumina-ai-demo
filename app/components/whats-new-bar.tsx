"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Video, ArrowRight, X, Palette, Wand2, ScanFace } from "lucide-react";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";
import { PRODUCTS } from "@/lib/products";
import { BLACK_FRIDAY_ENDS_LABEL, blackFridayOn, blackFridayUpcoming, formatUsdCents } from "@/lib/black-friday";

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
    id: "video-faceswap-neo",
    label: "NEW MODEL",
    labelClassName: "bg-rose-100 text-rose-700 ring-rose-200",
    icon: Sparkles,
    iconClassName: "text-rose-600",
    text: `Neo is live: our first in-house multi-step diffusion video model now makes every Best quality video, and the face looks like your photo. Launch week: 30% fewer credits until Nov 28`,
    href: "/neo",
  },
  {
    id: "video-faceswap-sharper-face",
    label: "NEW",
    labelClassName: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    icon: ScanFace,
    iconClassName: "text-emerald-600",
    text: `${FACESTUDIO_V_NAME} — new: Sharper face for head swaps. Small or distant faces come out with real hair, skin and eye detail. +20% credits`,
    href: "/facestudio-v",
  },
  {
    id: "nano-facestudio-v-trial",
    label: "NEW MODEL",
    labelClassName: "bg-rose-100 text-rose-700 ring-rose-200",
    icon: Video,
    iconClassName: "text-rose-600",
    text: `${FACESTUDIO_V_NAME} — new: Headswap Fast, the whole head about 40% faster and for about 35% fewer credits than Headswap Best`,
    href: "/facestudio-v",
  },
  {
    id: "nano-imageedit-2-online-launch",
    label: "NEW",
    labelClassName: "bg-sky-100 text-sky-700 ring-sky-200",
    icon: Wand2,
    iconClassName: "text-sky-600",
    text: "SpotEdit — retouch at full resolution · only the spot you name changes",
    href: "/image-edit",
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
// v5: the Video FaceSwap Online one-week trial (v4 was the three-day preview).
// v6: Video FaceSwap Online 1.1.0.
// v7: Video FaceSwap Online 1.1.0 is the official release (the trial is over).
// v8: the last days of the Nano FaceStudio Pro launch price.
// v9: Video FaceSwap Online 2.0.0.
// v10: it is now named Video FaceSwap 2.5 Online.
// v11: the equipment-upgrade notice (Face Studio and HeadSwap Pro); v12: it is taken off, so a bar dismissed under it shows again.
// v13: Video FaceSwap 2.5 Online.
// v14: SpotEdit.
// v15: Sharper face for the video head swap.
// v17: Neo is live, with its launch-week offer (v16 was the first Neo item).
// v18: Black Friday (24 Nov to 24 Dec 2026).
const STORAGE_KEY = "nanopocket_whats_new_dismissed_v18";


/**
 * Read from the viewer's clock (the bar only renders after mount): during Black Friday (and the
 * day before it) the sale leads the bar; Nano FaceStudio Pro 1.2 sits in the usual place with
 * whatever price applies now.
 */
function facestudioProItem(): { item: WhatsNewItem; first: boolean } {
  const pro = PRODUCTS.find((p) => p.id === "nano-facestudio-pro");
  const price = pro ? `${formatUsdCents(pro.priceInCents)} one-time` : "";
  const sale = blackFridayOn() || blackFridayUpcoming();
  if (sale) {
    return {
      first: true,
      item: {
        id: "black-friday-2026",
        label: "BLACK FRIDAY",
        labelClassName: "bg-amber-100 text-amber-800 ring-amber-200",
        icon: Sparkles,
        iconClassName: "text-amber-600",
        text: blackFridayOn()
          ? `Black Friday until ${BLACK_FRIDAY_ENDS_LABEL}: Nano FaceStudio Pro 1.2 with batch swap and Mac · the new FaceStudio V Pro · up to 30% off credits · 30% off the other apps`
          : `Black Friday starts Nov 24 and runs a whole month: FaceStudio Pro 1.2, the new FaceStudio V Pro, up to 30% off credits`,
        href: "/black-friday",
      },
    };
  }
  return {
    first: false,
    item: {
      id: "nano-facestudio-pro-1-2",
      label: "PRO",
      labelClassName: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      icon: Palette,
      iconClassName: "text-emerald-600",
      text: `Nano FaceStudio Pro 1.2 — batch face swap, now on Windows and Mac · ${price}`,
      href: "/apps/nano-facestudio-pro-1-2",
    },
  };
}

export function WhatsNewBar() {
  const [visible, setVisible] = useState(false);
  // When the announcements are wider than the bar they scroll by themselves;
  // otherwise they sit still. Reduced-motion users scroll by hand instead.
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
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
      const kids = Array.from(track.children).slice(0, ITEMS.length + 1) as HTMLElement[];
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
  }, [visible]);

  // The bar is fixed under the navbar, so it publishes its height as --whats-new-h for the hero to
  // leave room for; without it the bar covers the top of the hero video on phones.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = barRef.current;
    if (!visible || !bar) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--whats-new-h", `${bar.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(bar);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--whats-new-h");
    };
  }, [visible]);

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

  const pro = facestudioProItem();
  const items = pro.first ? [pro.item, ...ITEMS] : [...ITEMS.slice(0, 2), pro.item, ...ITEMS.slice(2)];
  const scrolling = overflowing && !reduceMotion;
  // A second copy lets the loop run without a jump.
  const shown = scrolling ? [...items, ...items] : items;

  return (
    <div ref={barRef} className="fixed left-0 right-0 top-14 z-40 border-b border-neutral-200 bg-white sm:top-16">
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
