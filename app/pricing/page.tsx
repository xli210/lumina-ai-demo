import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { CREDIT_PACKS, bonusPercent, totalCredits } from "@/lib/credit-packs";
import { PRODUCTS } from "@/lib/products";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import {
  FACESTUDIO_MAX_FACES,
  FACESTUDIO_PRICE_PER_FACE,
  FREE_TOPUP_CREDITS,
  FREE_TOPUP_RULE,
} from "@/lib/facestudio";
import { IMAGE_EDIT_NAME, IMAGE_EDIT_PRICE_CREDITS, IMAGE_EDIT_PRICE_USD_TEXT } from "@/lib/image-edit-facts";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";

/**
 * One page that states what NanoPocket costs. Every figure is read from the code
 * that charges it (credit packs, per-face prices, product licences), so this page
 * cannot disagree with the product. It exists because people and AI assistants
 * ask "how much does it cost" and /pricing used to redirect into the homepage.
 */

const UPDATED = "2026-10-21";

/** Re-rendered hourly, so a launch price stops being described as one when its date passes. */
export const revalidate = 3600;
const PAGE_URL = "https://nanopocket.ai/pricing";

const FACE = FACESTUDIO_PRICE_PER_FACE.face_swap;
const HEAD = FACESTUDIO_PRICE_PER_FACE.head_swap;

const TITLE = "Pricing: Free Apps, Pay-per-Use Credits";
const DESCRIPTION = `Free desktop apps, online tools paid per use in credits (100 credits = $1), one-time Pro licences. Face swap from $${(FACE / 100).toFixed(2)} a face, photo edit $${(IMAGE_EDIT_PRICE_CREDITS / 100).toFixed(2)}. No subscription.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }], type: "website", url: PAGE_URL, title: TITLE, description: DESCRIPTION },
};

const money = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);

/** The product page for a licence id (a few differ from the product id). */
const APP_PAGE: Record<string, string> = {
  "nano-facialedit": "/apps/nano-facialedit",
  "nano-faceswap": "/apps/nano-faceswap",
  "nano-image-tryon": "/apps/nano-imagetryon",
  "nano-imageedit": "/apps/nano-imageedit",
  "nano-videoenhance": "/apps/nano-videoenhance",
  nnanoimageenh: "/apps/nano-imageenh-pro",
  "nano-facestudio-pro": "/apps/nano-facestudio-pro",
  "nano-videogen": "/apps/nano-videogen",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is there a subscription?",
    a: "No. The online tools are paid per use from a credit balance you top up when you want to, and the desktop apps are free or a one-time licence. Nothing renews automatically.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits never expire, and the price of each render is shown before you start. If a render fails or is cancelled, the credits are returned.",
  },
  {
    q: "What do the free credits cover?",
    a: `A new account starts with ${SIGNUP_GRANT_CREDITS} credits. An account that has never bought credits is topped up to ${FREE_TOPUP_CREDITS} credits when it runs low, ${FREE_TOPUP_RULE}. An account that has bought credits is topped up whenever it runs low. Free credits are limited to one account per person.`,
  },
  {
    q: "How do I remove the watermark?",
    a: `Renders from ${FACESTUDIO_V_NAME} and Nano FaceStudio Online made on an account that has never bought credits carry a NanoPocket.ai watermark. Buying credits once, with any pack, removes it for good from the renders you make afterwards. Free credits do not count as buying, and a render already made keeps the mark it was made with. ${IMAGE_EDIT_NAME} and the desktop apps have no watermark.`,
  },
  {
    q: "Do credits work in the desktop apps?",
    a: "No. Credits pay for the hosted online tools only. Desktop licences are separate: buying credits does not affect a licence, and holding a licence does not use credits.",
  },
  {
    q: "Which desktop apps are free?",
    a: `${PRODUCTS.filter((p) => p.priceInCents === 0)
      .map((p) => p.name)
      .join(", ")} come with a free licence. They run on your own NVIDIA GPU on Windows, so your photos and videos stay on your computer. The Pro apps are a one-time licence, and most include a 7-day free trial.`,
  },
];

const eyebrow = "mb-3 text-sm font-medium uppercase tracking-widest text-primary";
const h2 = "mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl";
const note = "mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground";
const th = "px-4 py-3 text-left font-semibold text-foreground";
const td = "px-4 py-3 text-muted-foreground";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default function PricingPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      dateModified: UPDATED,
      isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
        { "@type": "ListItem", position: 2, name: "Pricing", item: PAGE_URL },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <header className="mb-14">
          <p className={eyebrow}>Pricing</p>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            What NanoPocket costs.
          </h1>
          <p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Three ways to pay, and none of them is a subscription. The desktop apps for face swap, portrait editing and
            virtual try-on are free. The online tools are paid per use from a credit balance, where 100 credits is one
            US dollar and the price is shown before you start. The Pro desktop apps are a one-time licence. Prices below
            were last checked on {UPDATED}.
          </p>
        </header>

        <section className="mb-16" id="online">
          <h2 className={h2}>Online tools: pay per use, in credits</h2>
          <p className={note}>
            These run on NanoPocket&apos;s GPUs in your browser, so nothing is installed. A render that fails or is
            cancelled is refunded, and credits never expire.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className={th}>Tool</th>
                  <th className={th}>What you pay</th>
                  <th className={th}>Good to know</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className={td}><Link href="/face-studio" className={textLink}>Nano FaceStudio Online</Link></td>
                  <td className={td}>
                    Face swap {FACE} credits (${(FACE / 100).toFixed(2)}) per face; head swap {HEAD} credits (${(HEAD / 100).toFixed(2)}).
                  </td>
                  <td className={td}>Up to {FACESTUDIO_MAX_FACES} faces in one photo. Face detection is free. Priced per face replaced, so faces you leave alone cost nothing.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className={td}><Link href="/facestudio-v" className={textLink}>{FACESTUDIO_V_NAME} {FACESTUDIO_V_VERSION}</Link></td>
                  <td className={td}>Priced per video from the mode, output size, clip length and number of people, and shown before you start.</td>
                  <td className={td}>A 10-second 1080p clip in Fast mode is about 20 credits (about $0.20). Requests are queued.</td>
                </tr>
                <tr>
                  <td className={td}><Link href="/image-edit" className={textLink}>{IMAGE_EDIT_NAME}</Link></td>
                  <td className={td}>{IMAGE_EDIT_PRICE_CREDITS} credits ({IMAGE_EDIT_PRICE_USD_TEXT}) per edit.</td>
                  <td className={td}>Lossless PNG, no watermark. For the object tools every pixel outside the edit stays identical.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16" id="credits">
          <h2 className={h2}>Credit packs</h2>
          <p className={note}>
            Buy credits when you need them. 1 credit = $0.01, and bigger packs add bonus credits. Credits are bought on
            the <Link href="/credits" className={textLink}>credits page</Link> by card through Stripe.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className={th}>Pack</th>
                  <th className={th}>Price</th>
                  <th className={th}>Credits you get</th>
                  <th className={th}>Roughly</th>
                </tr>
              </thead>
              <tbody>
                {CREDIT_PACKS.map((p) => {
                  const total = totalCredits(p);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className={`${td} font-medium text-foreground`}>{p.name}</td>
                      <td className={td}>{money(p.priceInCents)}</td>
                      <td className={td}>
                        {total.toLocaleString("en-US")}
                        {p.bonusCredits > 0 && ` (includes ${p.bonusCredits.toLocaleString("en-US")} bonus, +${bonusPercent(p)}%)`}
                      </td>
                      <td className={td}>
                        {Math.floor(total / FACE).toLocaleString("en-US")} face swaps, or{" "}
                        {Math.floor(total / IMAGE_EDIT_PRICE_CREDITS).toLocaleString("en-US")} photo edits
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16" id="free">
          <h2 className={h2}>Free credits, and the watermark</h2>
          <p className={note}>
            A new account starts with {SIGNUP_GRANT_CREDITS} credits. An account that has never bought credits is topped up to{" "}
            {FREE_TOPUP_CREDITS} credits when it runs low, {FREE_TOPUP_RULE}; one that has bought credits is topped up whenever it
            runs low. Free credits are limited to one account per person.
          </p>
          <p className={note}>
            <strong className="text-foreground">The watermark:</strong> renders from {FACESTUDIO_V_NAME} and Nano FaceStudio Online
            made on an account that has never bought credits carry a NanoPocket.ai watermark. Buy credits once, with any pack, and it
            is removed for good from the renders you make afterwards. Free credits do not count as buying.
          </p>
        </section>

        <section className="mb-16" id="desktop">
          <h2 className={h2}>Desktop apps: free or a one-time licence</h2>
          <p className={note}>
            The desktop apps run on your own NVIDIA GPU on Windows, so your photos and videos stay on your computer. A licence is
            separate from credits.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className={th}>App</th>
                  <th className={th}>Price</th>
                  <th className={th}>Trial</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className={td}>
                      <Link href={APP_PAGE[p.id] ?? "/download"} className={textLink}>{p.name}</Link>
                    </td>
                    <td className={td}>
                      {p.priceInCents === 0 ? "Free licence" : `${money(p.priceInCents)}, one-time`}
                      {p.originalPriceInCents &&
                      p.originalPriceInCents > p.priceInCents &&
                      p.promoValidUntil &&
                      Date.now() <= Date.parse(`${p.promoValidUntil}T23:59:59Z`)
                        ? ` (list ${money(p.originalPriceInCents)}; launch price until ${p.promoValidUntil})`
                        : ""}
                    </td>
                    <td className={td}>{(p.trialDays ?? 0) > 0 ? `${p.trialDays}-day free trial` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={note}>
            Download and licence keys are on the <Link href="/download" className={textLink}>download page</Link>; every installer&apos;s
            checksum and signature are on <Link href="/verify" className={textLink}>/verify</Link>.
          </p>
        </section>

        <section id="faq">
          <h2 className={h2}>Questions</h2>
          <div className="mt-6 space-y-6">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 text-base font-semibold text-foreground">{f.q}</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
