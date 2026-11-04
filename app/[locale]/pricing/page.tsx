import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { CREDIT_PACKS, bonusPercent, totalCredits } from "@/lib/credit-packs";
import { PRODUCTS } from "@/lib/products";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACESTUDIO_MAX_FACES, FACESTUDIO_PRICE_PER_FACE, FREE_TOPUP_CREDITS } from "@/lib/facestudio";
import { IMAGE_EDIT_NAME, IMAGE_EDIT_PRICE_CREDITS } from "@/lib/image-edit-facts";
import { FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_MAX_VARIATIONS, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { hreflangAlternates, isAppLocale, TRANSLATED_PAGES, translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";
import { fillCopy, pageCopy } from "@/lib/i18n/page-copy";

// What NanoPocket costs, in the other languages. Every figure is read from the code that charges it, as on the English page
// (app/pricing/page.tsx). The Terms of Service stay in English, and this page says so.

const BASE = "https://nanopocket.ai";
const PATH = "/pricing";
const FACE = FACESTUDIO_PRICE_PER_FACE.face_swap;
const HEAD = FACESTUDIO_PRICE_PER_FACE.head_swap;

/** Re-rendered every 10 minutes, so a price change shows soon after it happens. */
export const revalidate = 600;

const VALUES = {
  face: FACE,
  head: HEAD,
  edit: IMAGE_EDIT_PRICE_CREDITS,
  faces: FACESTUDIO_MAX_FACES,
  credits: HEADSWAP_PRO_CREDITS_PER_IMAGE,
  variations: HEADSWAP_PRO_MAX_VARIATIONS,
  grant: SIGNUP_GRANT_CREDITS,
  topup: FREE_TOPUP_CREDITS,
  video: FACESTUDIO_V_NAME,
};

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

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[PATH].includes(l);
const money = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);

async function copyFor(locale: AppLocale) {
  return fillCopy((await pageCopy(locale)).pricing, VALUES);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = await copyFor(locale);
  const path = `/${locale}${PATH}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, PATH, TRANSLATED_PAGES[PATH]) },
    openGraph: { type: "website", url: `${BASE}${path}`, title: c.title, description: c.description, locale: locale.replace("-", "_") },
  };
}

const h2 = "mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl";
const note = "mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground";
const th = "px-4 py-3 text-left font-semibold text-foreground";
const td = "px-4 py-3 text-muted-foreground";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default async function LocalizedPricingPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = await copyFor(locale);
  const n = (v: number) => v.toLocaleString(locale);
  const fill = (text: string, values: Record<string, string | number>) => fillCopy(text, values);
  const page = (path: string) => translatedOrEnglish(path, locale);

  const tools = [
    { href: page("/face-studio"), name: "Nano FaceStudio Online", pay: c.faceStudioPay, tip: c.faceStudioNote },
    { href: page("/headswap-pro"), name: HEADSWAP_PRO_NAME, pay: c.headswapPay, tip: c.headswapNote },
    { href: page("/facestudio-v"), name: FACESTUDIO_V_NAME, pay: c.videoPay, tip: c.videoNote },
    { href: page("/image-edit"), name: IMAGE_EDIT_NAME, pay: c.imageEditPay, tip: c.imageEditNote },
  ];

  return (
    <main lang={locale} className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: locale,
            mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <header className="mb-14">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">{c.kicker}</p>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{c.h1}</h1>
          <p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{c.lead}</p>
        </header>

        <section className="mb-16" id="online">
          <h2 className={h2}>{c.onlineHeading}</h2>
          <p className={note}>{c.onlineNote}</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className={th}>{c.thTool}</th>
                  <th className={th}>{c.thPay}</th>
                  <th className={th}>{c.thNote}</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.name} className="border-b border-border last:border-0">
                    <td className={td}>
                      <Link href={tool.href} className={textLink}>
                        {tool.name}
                      </Link>
                    </td>
                    <td className={td}>{tool.pay}</td>
                    <td className={td}>{tool.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16" id="credits">
          <h2 className={h2}>{c.packsHeading}</h2>
          <p className={note}>
            {c.packsNote}{" "}
            <Link href="/credits" className={textLink}>
              {c.packsLink}
            </Link>
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className={th}>{c.thPack}</th>
                  <th className={th}>{c.thPrice}</th>
                  <th className={th}>{c.thCredits}</th>
                  <th className={th}>{c.thRoughly}</th>
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
                        {n(total)}
                        {p.bonusCredits > 0 && ` (${fill(c.bonus, { bonus: n(p.bonusCredits), percent: bonusPercent(p) })})`}
                      </td>
                      <td className={td}>{fill(c.roughly, { swaps: n(Math.floor(total / FACE)), edits: n(Math.floor(total / IMAGE_EDIT_PRICE_CREDITS)) })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16" id="free">
          <h2 className={h2}>{c.freeHeading}</h2>
          <p className={note}>{c.freeNote}</p>
          <p className={note}>{c.watermarkNote}</p>
        </section>

        <section className="mb-16" id="desktop">
          <h2 className={h2}>{c.desktopHeading}</h2>
          <p className={note}>{c.desktopNote}</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className={th}>{c.thApp}</th>
                  <th className={th}>{c.thPrice}</th>
                  <th className={th}>{c.thTrial}</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className={td}>
                      <Link href={page(APP_PAGE[p.id] ?? "/download")} className={textLink}>
                        {p.name}
                      </Link>
                    </td>
                    <td className={td}>{p.priceInCents === 0 ? c.freeLicense : fill(c.oneTime, { price: money(p.priceInCents) })}</td>
                    <td className={td}>{(p.trialDays ?? 0) > 0 ? fill(c.trialDays, { days: p.trialDays ?? 0 }) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={note}>
            <Link href="/download" className={textLink}>
              {c.desktopLink}
            </Link>
          </p>
        </section>

        <section id="faq">
          <h2 className={h2}>{c.faqHeading}</h2>
          <div className="mt-6 space-y-6">
            {c.faq.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 text-base font-semibold text-foreground">{f.q}</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
          <p className={note}>
            {c.terms}{" "}
            <Link href="/terms" hrefLang="en" className={textLink}>
              {c.termsLink}
            </Link>
          </p>
          <p className="mt-3 text-sm">
            <Link href={PATH} hrefLang="en" className="text-muted-foreground underline-offset-4 hover:underline">
              {c.english}
            </Link>
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
