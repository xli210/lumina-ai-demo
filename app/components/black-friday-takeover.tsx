import Link from "next/link";
import { ArrowRight, Coins, Film, Laptop, Palette, Sparkles } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import {
  BLACK_FRIDAY_APP_PRICE_CENTS,
  BLACK_FRIDAY_ENDS_AT,
  BLACK_FRIDAY_PACK_PERCENT_OFF,
  BLACK_FRIDAY_STARTS_AT,
  blackFridayOn,
  blackFridayUpcoming,
  formatUsdCents,
} from "@/lib/black-friday";
import { blackFridayCopy, type BlackFridayTakeoverCopy } from "@/lib/black-friday-copy";
import { CREDIT_PACKS, formatPackListPrice, packChargeCents } from "@/lib/credit-packs";
import { BlackFridayCountdown } from "./black-friday-countdown";

const MAX_PACK_OFF = Math.max(...Object.values(BLACK_FRIDAY_PACK_PERCENT_OFF));

/** The price a product has during the sale (also shown before it starts, labelled as such). */
function salePrice(id: string): { now: string; regular?: string } {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return { now: "" };
  // V Pro: the launch price with the price from Dec 25 struck through (owner's choice, 2026-11-23).
  if (p.promoKind === "launch")
    return { now: formatUsdCents(p.priceInCents), regular: p.originalPriceInCents ? formatUsdCents(p.originalPriceInCents) : undefined };
  const sale = BLACK_FRIDAY_APP_PRICE_CENTS[id];
  const regular = p.originalPriceInCents ?? p.priceInCents;
  return sale && sale < regular ? { now: formatUsdCents(sale), regular: formatUsdCents(regular) } : { now: formatUsdCents(p.priceInCents) };
}

/**
 * The homepage's Black Friday section (24 Nov to 24 Dec 2026): full width, dark, a giant two-line
 * headline, the biggest real discount, a live countdown to the date the prices change, a collage of
 * the new FaceStudio Pro 1.2 and four offer tiles that open the hub at the right card.
 *
 * Drawn on the server at each render and gone once the sale ends. Words from lib/black-friday-copy.ts
 * (translated); prices from the catalogue, in English. The portraits are the AI-generated test photos
 * from the 1.2 launch page.
 */
export function BlackFridayTakeover({ locale, hubHref }: { locale: string; hubHref: string }) {
  const on = blackFridayOn();
  if (!on && !blackFridayUpcoming()) return null;
  const all = blackFridayCopy(locale);
  const c: BlackFridayTakeoverCopy = all.takeover ?? blackFridayCopy("en").takeover!;
  const cjk = locale === "zh-CN" || locale === "ja" || locale === "ko";
  const studio = salePrice("nano-facestudio-pro");
  const vpro = salePrice("nano-facestudio-v-pro");
  // The biggest pack's figures as they are during the sale (also before it starts, labelled as such).
  const bigPack = CREDIT_PACKS[CREDIT_PACKS.length - 1];
  const bigPackSale = `${formatPackListPrice(bigPack)} → ${formatUsdCents(packChargeCents(bigPack, BLACK_FRIDAY_STARTS_AT))}`;
  const appsFrom = formatUsdCents(Math.min(...["nano-imageedit", "nano-videoenhance", "nnanoimageenh", "nano-videogen"].map((id) => BLACK_FRIDAY_APP_PRICE_CENTS[id])));

  const tiles = [
    { href: `${hubHref}#facestudio-pro`, icon: Palette, title: c.tiles.studioPro.title, line: c.tiles.studioPro.line, price: studio.now, was: studio.regular, tag: "1.2" },
    { href: `${hubHref}#facestudio-v-pro`, icon: Film, title: c.tiles.vPro.title, line: c.tiles.vPro.line, price: vpro.now, was: vpro.regular, tag: c.tiles.vPro.tag },
    { href: `${hubHref}#credits`, icon: Coins, title: c.tiles.credits.title, line: c.tiles.credits.line, price: bigPackSale, was: undefined, tag: `−${MAX_PACK_OFF}%` },
    { href: `${hubHref}#apps`, icon: Laptop, title: c.tiles.apps.title, line: c.tiles.apps.line, price: `from ${appsFrom}`, was: undefined, tag: "−30%" },
  ];
  const ticker = [
    `FaceStudio Pro 1.2 · ${studio.now}`,
    `New: FaceStudio V Pro · ${vpro.now} launch price`,
    `Credits up to ${MAX_PACK_OFF}% off`,
    "Desktop apps 30% off",
    on ? "Until Dec 24" : "From Nov 23",
  ];

  return (
    <section aria-label="Black Friday" className="bf-takeover relative isolate overflow-hidden bg-[#07060a] text-white">
      <style>{`
        @keyframes bf-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(4%,-6%,0) scale(1.12); } }
        @keyframes bf-drift2 { 0%,100% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(-6%,5%,0) scale(0.95); } }
        @keyframes bf-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes bf-shine { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
        @keyframes bf-float { 0%,100% { transform: translateY(0) rotate(var(--r)); } 50% { transform: translateY(-10px) rotate(var(--r)); } }
        .bf-takeover .bf-blob1 { animation: bf-drift 16s ease-in-out infinite; }
        .bf-takeover .bf-blob2 { animation: bf-drift2 20s ease-in-out infinite; }
        .bf-takeover .bf-marquee { animation: bf-marquee 38s linear infinite; }
        .bf-takeover .bf-shine { background-size: 200% 100%; animation: bf-shine 6s linear infinite; }
        .bf-takeover .bf-float { animation: bf-float 7s ease-in-out infinite; }
        .bf-takeover .bf-outline { -webkit-text-stroke: 2px rgba(255,255,255,0.85); color: transparent; }
        @media (prefers-reduced-motion: reduce) {
          .bf-takeover .bf-blob1, .bf-takeover .bf-blob2, .bf-takeover .bf-marquee, .bf-takeover .bf-shine, .bf-takeover .bf-float { animation: none; }
        }
      `}</style>

      {/* Light: two slow aurora blobs, a fine grid and film grain. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bf-blob1 absolute -left-[10%] -top-[30%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.32),transparent_60%)] blur-2xl" />
        <div className="bf-blob2 absolute -bottom-[35%] right-[-15%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.28),rgba(139,92,246,0.12)_40%,transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
      </div>

      {/* Ticker */}
      <div className="border-y border-white/10 bg-white/[0.03] py-2.5">
        <div className="flex overflow-hidden whitespace-nowrap">
          <div className="bf-marquee flex shrink-0 gap-10 pr-10 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/90">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                {t} <Sparkles className="h-3 w-3 text-rose-300" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-12 lg:py-24">
        {/* Words */}
        <div className="lg:col-span-7">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {c.kicker}
          </p>
          <h2 className="font-black uppercase leading-[0.82] tracking-tighter">
            {/* Outlined Latin letters; CJK glyphs are too dense for a stroke, so they are solid. */}
            <span className={`${cjk ? "text-white text-[14vw]" : "bf-outline text-[18vw]"} block sm:text-[8.5rem] lg:text-[9.5rem]`}>{c.line1}</span>
            <span className={`bf-shine block bg-[linear-gradient(90deg,#fbbf24,#fb7185,#c084fc,#fbbf24)] bg-clip-text text-transparent ${cjk ? "text-[14vw]" : "text-[18vw]"} sm:text-[8.5rem] lg:text-[9.5rem]`}>
              {c.line2}
            </span>
          </h2>
          <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-6">
            <p className="leading-none">
              <span className="block text-sm font-semibold uppercase tracking-[0.3em] text-white/60">{c.upTo}</span>
              <span className="text-7xl font-black tracking-tight sm:text-8xl">{MAX_PACK_OFF}%</span>
              <span className="ml-2 text-lg font-semibold text-white/70">{c.off}</span>
            </p>
            <BlackFridayCountdown
              startsAt={BLACK_FRIDAY_STARTS_AT}
              endsAt={BLACK_FRIDAY_ENDS_AT}
              labels={{ startsIn: c.startsIn, endsIn: c.endsIn, days: c.days, hours: c.hours, minutes: c.minutes, seconds: c.seconds }}
            />
          </div>
          {/* Phones: a small strip of the 1.2 batch results instead of the collage. */}
          <div className="mt-8 flex gap-3 lg:hidden" aria-hidden>
            {["out_shoot_0142", "out_shoot_0145", "out_team_photo"].map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={f}
                src={`/facestudio-pro-1-2/assets/${f}.jpg`}
                alt=""
                loading="lazy"
                className={`aspect-[3/4] min-w-0 flex-1 rounded-2xl border border-white/15 object-cover shadow-xl ${i === 1 ? "-translate-y-3" : ""}`}
              />
            ))}
          </div>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{c.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={hubHref}
              className="group inline-flex items-center rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 px-7 py-3.5 text-base font-bold text-neutral-950 shadow-[0_0_40px_rgba(251,191,36,0.35)] transition hover:shadow-[0_0_60px_rgba(251,113,133,0.5)]"
            >
              {c.cta} <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/credits"
              className="inline-flex items-center rounded-full border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
            >
              {c.ctaCredits}
            </Link>
          </div>
        </div>

        {/* Collage: FaceStudio Pro 1.2 batch results (AI-generated test portraits). */}
        <div className="relative hidden h-[520px] lg:col-span-5 lg:block" aria-hidden>
          <div className="bf-float absolute left-0 top-6 w-[58%] overflow-hidden rounded-3xl border border-white/15 shadow-2xl [--r:-6deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/facestudio-pro-1-2/assets/out_shoot_0142.jpg" alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
          </div>
          <div className="bf-float absolute right-0 top-0 w-[50%] overflow-hidden rounded-3xl border border-white/15 shadow-2xl [--r:5deg] [animation-delay:-2s]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/facestudio-pro-1-2/assets/out_shoot_0145.jpg" alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
          </div>
          <div className="bf-float absolute bottom-0 left-[14%] w-[78%] overflow-hidden rounded-2xl border border-white/20 shadow-2xl [--r:-2deg] [animation-delay:-4s]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/facestudio-pro-1-2/assets/ui_04_running.jpg" alt="" className="w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute right-2 top-[44%] rotate-6 rounded-2xl bg-amber-300 px-4 py-3 text-neutral-950 shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest">FaceStudio Pro 1.2</p>
            <p className="text-2xl font-black leading-none">
              {studio.now}
              {studio.regular && <span className="ml-1.5 text-sm font-semibold line-through opacity-60">{studio.regular}</span>}
            </p>
            {!on && <p className="text-[10px] font-semibold">from Nov 23</p>}
          </div>
        </div>
      </div>

      {/* Offer tiles */}
      <div className="mx-auto grid max-w-7xl gap-4 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4 lg:pb-20">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.07]"
          >
            <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/0 blur-2xl transition duration-500 group-hover:bg-amber-400/25" />
            <span className="mb-5 flex items-center justify-between">
              <t.icon className="h-7 w-7 text-amber-300" aria-hidden />
              <span className="rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{t.tag}</span>
            </span>
            <span className="block text-lg font-bold">{t.title}</span>
            <span className="mt-1 block text-sm text-white/60">{t.line}</span>
            <span className="mt-5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-200">{t.price}</span>
              {t.was && <span className="text-sm text-white/45 line-through">{t.was}</span>}
            </span>
            <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-white/40 transition group-hover:translate-x-1 group-hover:text-amber-200" aria-hidden />
          </Link>
        ))}
      </div>
      {!on && (
        <p className="pb-10 text-center text-xs text-white/50">
          Prices shown apply from Nov 23 to Dec 24, 11:59 pm PT. Regular prices apply until then.
        </p>
      )}
    </section>
  );
}
