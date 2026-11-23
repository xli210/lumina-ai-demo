import Link from "next/link";
import { ArrowRight, Check, Coins, Film, Laptop, Palette, Sparkles, Tag } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/products";
import {
  BLACK_FRIDAY_APP_PRICE_CENTS,
  BLACK_FRIDAY_ENDS_LABEL,
  BLACK_FRIDAY_STARTS_AT,
  BLACK_FRIDAY_STARTS_LABEL,
  NEO_SALE_ENDS_AT,
  NEO_SALE_ENDS_LABEL,
  blackFridayOn,
  blackFridayTimeLeft,
  blackFridayUpcoming,
  formatUsdCents,
} from "@/lib/black-friday";
import { CREDIT_PACKS, formatPackListPrice, packChargeCents, packPercentOff, totalCredits } from "@/lib/credit-packs";
import type { BlackFridayCopy } from "@/lib/black-friday-copy";


const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => v[k] ?? m);

function priceOf(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
      <Tag className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Regular price struck through, then the sale price; for a launch price, only the price. */
function ProductPrice({ id }: { id: string }) {
  const p = priceOf(id);
  if (!p) return null;
  const coming = blackFridayUpcoming() ? BLACK_FRIDAY_APP_PRICE_CENTS[id] : undefined;
  if (coming) {
    // Before the sale: the regular price applies now, and the page says what it will be from Nov 24.
    return (
      <div className="my-4">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-4xl font-bold tracking-tight text-foreground">{formatUsdCents(coming)}</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </p>
        <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-300">
          Black Friday price from {BLACK_FRIDAY_STARTS_LABEL} to {BLACK_FRIDAY_ENDS_LABEL}; regular price {formatUsdCents(p.priceInCents)} before and after
        </p>
      </div>
    );
  }
  const sale = p.promoKind === "sale" && p.originalPriceInCents && p.originalPriceInCents > p.priceInCents;
  const launch = p.promoKind === "launch" && p.originalPriceInCents && p.originalPriceInCents > p.priceInCents;
  return (
    <div className="my-4">
      <p className="flex flex-wrap items-baseline gap-x-3">
        {sale && <span className="text-lg text-muted-foreground line-through">{formatUsdCents(p.originalPriceInCents!)}</span>}
        <span className="text-4xl font-bold tracking-tight text-foreground">{formatUsdCents(p.priceInCents)}</span>
        <span className="text-sm text-muted-foreground">one-time</span>
      </p>
      {sale && (
        <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-300">
          Black Friday price until {BLACK_FRIDAY_ENDS_LABEL}; regular {formatUsdCents(p.originalPriceInCents!)}
        </p>
      )}
      {launch && (
        <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-300">
          Launch price until {BLACK_FRIDAY_ENDS_LABEL}; {formatUsdCents(p.originalPriceInCents!)} after
        </p>
      )}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mb-6 space-y-2">
      {items.map((b) => (
        <li key={b} className="flex items-start gap-2 text-sm text-foreground/85">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {b}
        </li>
      ))}
    </ul>
  );
}

const card = "rounded-3xl border border-border/60 bg-card/50 p-6 sm:p-8";

/**
 * The Black Friday hub: /black-friday in English (./page.tsx) and /<locale>/black-friday
 * (app/[locale]/black-friday/page.tsx). Words from lib/black-friday-copy.ts; every price, percentage and
 * date from lib/black-friday.ts, lib/products.ts and lib/credit-packs.ts, read at render time, so the
 * page drops each offer by itself when it ends. `href` maps an English path to this locale's page.
 */
export function BlackFridayPage({ c, href }: { c: BlackFridayCopy; href: (path: string) => string }) {
  const now = Date.now();
  const on = blackFridayOn(now);
  const upcoming = blackFridayUpcoming(now);
  const left = blackFridayTimeLeft(now);
  const neoOn = now < NEO_SALE_ENDS_AT;
  const saleApps = ["nano-imageedit", "nano-videoenhance", "nnanoimageenh", "nano-videogen"]
    .map(priceOf)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden px-6 pt-28 pb-12 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.16),transparent_60%)]" />
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-background">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            {c.kicker}
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl" style={{ textWrap: "balance" }}>
            {c.heading}
          </h1>
          <p className="mb-5 max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg">{c.intro}</p>
          <p className="inline-flex rounded-full border border-amber-400/50 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300">
            {upcoming
              ? fill(c.upcoming, { date: `${BLACK_FRIDAY_STARTS_LABEL}, 12:00 am PT` })
              : on
                ? fill(c.running, { date: BLACK_FRIDAY_ENDS_LABEL, left: left ?? "" })
                : c.ended}
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6">
          <h2 className="sr-only">{c.offersHeading}</h2>

          {/* 1. Nano FaceStudio Pro 1.2 */}
          <article className={card} id="facestudio-pro">
            <Badge>{c.studioPro.badge}</Badge>
            <h3 className="flex items-start gap-3 text-2xl font-bold text-foreground">
              <Palette className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              {c.studioPro.title}
            </h3>
            <ProductPrice id="nano-facestudio-pro" />
            <p className="mb-4 text-foreground/85">{c.studioPro.body}</p>
            <Bullets items={c.studioPro.bullets} />
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/checkout?product=nano-facestudio-pro">
                  {c.studioPro.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/apps/nano-facestudio-pro-1-2">{c.studioPro.more}</Link>
              </Button>
            </div>
          </article>

          {/* 2. Nano FaceStudio V Pro launch */}
          <article className={card} id="facestudio-v-pro">
            <Badge>{c.vPro.badge}</Badge>
            <h3 className="flex items-start gap-3 text-2xl font-bold text-foreground">
              <Film className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              {c.vPro.title}
            </h3>
            <ProductPrice id="nano-facestudio-v-pro" />
            <p className="mb-4 text-foreground/85">{c.vPro.body}</p>
            <Bullets items={c.vPro.bullets} />
            <p className="mb-5 text-sm text-muted-foreground">
              {c.vPro.noTrial}{" "}
              <Link href={href("/facestudio-v")} className="font-medium text-primary underline-offset-4 hover:underline">
                Nano FaceStudio-V Online
              </Link>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/checkout?product=nano-facestudio-v-pro">
                  {c.vPro.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/apps/nano-facestudio-v-pro">{c.vPro.more}</Link>
              </Button>
            </div>
          </article>

          {/* 3. Credit packs */}
          <article className={card} id="credits">
            <Badge>{c.credits.badge}</Badge>
            <h3 className="flex items-start gap-3 text-2xl font-bold text-foreground">
              <Coins className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              {c.credits.title}
            </h3>
            <p className="my-4 text-foreground/85">{c.credits.body}</p>
{upcoming && (
              <p className="mb-3 text-sm font-medium text-amber-600 dark:text-amber-300">
                These prices apply from {BLACK_FRIDAY_STARTS_LABEL}, 12:00 am PT to {BLACK_FRIDAY_ENDS_LABEL}. Until then, the regular prices apply.
              </p>
            )}
            <div className="mb-4 overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{c.credits.thPack}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{c.credits.thPrice}</th>
                    <th className="px-4 py-3 font-semibold text-foreground">{c.credits.thCredits}</th>
                  </tr>
                </thead>
                <tbody>
                  {CREDIT_PACKS.filter((p) => p.id !== "starter").map((p) => {
                    // Before the sale starts, show the sale terms as they will apply.
                    const at = upcoming ? BLACK_FRIDAY_STARTS_AT : now;
                    const off = packPercentOff(p, at);
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3">
                          {off > 0 ? (
                            <>
                              <span className="mr-2 text-muted-foreground line-through">{formatPackListPrice(p)}</span>
                              <span className="font-bold text-foreground">{formatUsdCents(packChargeCents(p, at))}</span>
                              <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                {off}% off
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-foreground">{formatPackListPrice(p)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground/85">{totalCredits(p).toLocaleString("en-US")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">{c.credits.starterNote}</p>
            <p className="mb-5 text-sm text-muted-foreground">{c.credits.autoNote}</p>
            <Button asChild className="rounded-full">
              <Link href="/credits">
                {c.credits.cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </article>

          {/* 4. Neo launch week */}
          {neoOn && (
            <article className={card} id="neo">
              <Badge>{c.neo.badge}</Badge>
              <h3 className="flex items-start gap-3 text-2xl font-bold text-foreground">
                <Sparkles className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                {c.neo.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-300">Until {NEO_SALE_ENDS_LABEL}</p>
              <p className="my-4 text-foreground/85">{c.neo.body}</p>
              <Button asChild className="rounded-full">
                <Link href={href("/neo")}>
                  {c.neo.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </article>
          )}

          {/* 5. The other desktop apps */}
          <article className={card} id="apps">
            <Badge>{c.apps.badge}</Badge>
            <h3 className="flex items-start gap-3 text-2xl font-bold text-foreground">
              <Laptop className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              {c.apps.title}
            </h3>
            <p className="my-4 text-foreground/85">{c.apps.body}</p>
{upcoming && (
              <p className="mb-3 text-sm font-medium text-amber-600 dark:text-amber-300">
                These prices apply from {BLACK_FRIDAY_STARTS_LABEL}, 12:00 am PT to {BLACK_FRIDAY_ENDS_LABEL}. Until then, the regular prices apply.
              </p>
            )}
            <ul className="mb-4 grid gap-3 sm:grid-cols-2">
              {saleApps.map((p) => {
                // Before the sale starts, list the prices that will apply from Nov 24.
                const regular = p.originalPriceInCents ?? p.priceInCents;
                const sale = upcoming ? BLACK_FRIDAY_APP_PRICE_CENTS[p.id] ?? regular : p.priceInCents;
                return (
                  <li key={p.id} className="flex items-baseline justify-between rounded-2xl border border-border/60 px-4 py-3">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span>
                      {sale < regular && <span className="mr-2 text-sm text-muted-foreground line-through">{formatUsdCents(regular)}</span>}
                      <span className="font-bold text-foreground">{formatUsdCents(sale)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mb-5 text-sm text-muted-foreground">{c.apps.trialNote}</p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/download">
                {c.apps.cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </article>

          <div className="rounded-3xl border border-border/60 p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">{c.finePrintHeading}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                {BLACK_FRIDAY_STARTS_LABEL}, 12:00 am PT – {BLACK_FRIDAY_ENDS_LABEL}.
              </li>
              {c.finePrint.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
