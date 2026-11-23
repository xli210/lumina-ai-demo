import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { BLACK_FRIDAY_ENDS_LABEL, blackFridayOn, blackFridayUpcoming, formatUsdCents } from "@/lib/black-friday";
import type { BlackFridayCopy } from "@/lib/black-friday-copy";

const price = (id: string) => {
  const p = PRODUCTS.find((x) => x.id === id);
  return p ? formatUsdCents(p.priceInCents) : "";
};

/**
 * The homepage's Black Friday band (24 Nov to 24 Dec 2026), linking to the hub. Drawn on the server
 * at each render, so it is gone once the sale ends. The chips carry prices, which stay in English.
 */
export function BlackFridayBanner({ c, href }: { c: BlackFridayCopy["banner"]; href: string }) {
  const on = blackFridayOn();
  if (!on && !blackFridayUpcoming()) return null;
  const chips = on
    ? [
        `FaceStudio Pro 1.2 · ${price("nano-facestudio-pro")}`,
        `New: FaceStudio V Pro · ${price("nano-facestudio-v-pro")} launch price`,
        "Credits up to 30% off",
        "Other apps 30% off",
      ]
    : ["Starts Nov 23", "FaceStudio Pro 1.2 · batch + Mac", "New: FaceStudio V Pro", "Credits up to 30% off"];
  return (
    <section className="relative z-10 px-4 py-6 sm:px-6" aria-label="Black Friday">
      <Link
        href={href}
        className="group relative mx-auto block max-w-6xl overflow-hidden rounded-3xl bg-neutral-950 px-6 py-6 text-white ring-1 ring-amber-400/40 transition hover:ring-amber-400/80 sm:px-10 sm:py-8"
      >
        <span className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/25 blur-3xl" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" aria-hidden="true" />
        <span className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-black uppercase tracking-widest text-neutral-950">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Black Friday{on ? ` · until ${BLACK_FRIDAY_ENDS_LABEL}` : ""}
            </span>
            <span className="block text-2xl font-bold tracking-tight sm:text-3xl">{c.title}</span>
            <span className="mt-1 block max-w-2xl text-sm text-white/75 sm:text-base">{c.body}</span>
            <span className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
                  {chip}
                </span>
              ))}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center self-start rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-neutral-950 transition group-hover:bg-amber-300 md:self-center">
            {c.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </section>
  );
}
