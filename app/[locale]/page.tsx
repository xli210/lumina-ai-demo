import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Globe,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { OnlineToolCards } from "./online-tools";
import {
  hreflangAlternates,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/locales";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE } from "@/lib/headswap-pro";
import { IMAGEEDIT_CREDITS_PER_EDIT } from "@/lib/imageedit";

const BASE_URL = "https://nanopocket.ai";
const PATH = "/";
const LAST_VERIFIED = "2026-10-28";

/**
 * Locales that currently have a translated Home namespace. Add a locale
 * here only after messages/<locale>.json gains a Home namespace AND the
 * translation has been reviewed.
 */
const HOME_TRANSLATED_LOCALES: AppLocale[] = ["zh-CN"];

/** Values for the {credits}/{swaps}/... placeholders, so the free offer is quoted from billing's constants. */
const FREE = {
  credits: SIGNUP_GRANT_CREDITS,
  swaps: Math.floor(SIGNUP_GRANT_CREDITS / FACE_SWAP_CREDITS),
  faceCredits: FACE_SWAP_CREDITS,
  headswaps: Math.floor(SIGNUP_GRANT_CREDITS / HEADSWAP_PRO_CREDITS_PER_IMAGE),
  edits: Math.floor(SIGNUP_GRANT_CREDITS / IMAGEEDIT_CREDITS_PER_EDIT),
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale) || locale === "en") return {};
  if (!HOME_TRANSLATED_LOCALES.includes(locale)) return {};

  const t = await getTranslations({ locale, namespace: "Home.metadata" });
  const canonical = `${BASE_URL}/${locale}`;

  return {
    title: { absolute: t("title") },
    description: t("description", FREE),
    alternates: {
      canonical,
      languages: hreflangAlternates(BASE_URL, "/", HOME_TRANSLATED_LOCALES),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: t("ogTitle"),
      description: t("ogDescription", FREE),
      images: ["/og-image.jpg"],
      locale: locale.replace("-", "_"),
    },
    other: {
      "article:modified_time": LAST_VERIFIED,
    },
  };
}

interface WhyUsItem {
  title: string;
  body: string;
}

interface AppCatalogItem {
  name: string;
  summary: string;
  href: string;
}

interface FaqItem {
  q: string;
  a: string;
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isAppLocale(locale) || locale === "en") notFound();
  // Until we translate the Home namespace into this locale, send visitors to
  // the locale's translated /face-swap page instead of 404-ing. Returns
  // a 307 (preserves method) so search engines treat it as temporary —
  // we can flip these to permanent (308) once a /[locale] homepage exists.
  if (!HOME_TRANSLATED_LOCALES.includes(locale)) {
    redirect(`/${locale}/face-swap`);
  }
  setRequestLocale(locale satisfies AppLocale);

  const t = await getTranslations({ locale, namespace: "Home" });

  const whyUsItems = t.raw("whyUs.items") as WhyUsItem[];
  const appsItems = t.raw("appsCatalog.items") as AppCatalogItem[];
  const faqs: FaqItem[] = [
    { q: t("faq.free.q"), a: t("faq.free.a", FREE) },
    ...(t.raw("faq.items") as FaqItem[]),
  ];
  const canonical = `${BASE_URL}/${locale}`;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical,
    url: canonical,
    name: t("metadata.ogTitle"),
    description: t("metadata.description", FREE),
    inLanguage: locale,
    isPartOf: { "@id": "https://nanopocket.ai#website" },
    dateModified: LAST_VERIFIED,
    publisher: { "@id": "https://nanopocket.ai#organization" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            {t("hero.kicker")}
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("hero.headline")}
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.subhead")}
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {([1, 2, 3] as const).map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {t(`hero.trustChip${n}`, FREE)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background"
            >
              <Link href={`/${locale}/face-swap`}>
                {t("hero.ctaPrimary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="#apps-catalog">
                {t("hero.ctaSecondary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-y border-border/60 bg-muted/20 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("whyUs.heading")}
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("whyUs.intro")}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {whyUsItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/60 bg-background/60 p-5"
              >
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground sm:text-base">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The online tools */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <OnlineToolCards locale={locale} />
          <p className="mt-6 text-sm text-muted-foreground">
            <Link
              href={`/${locale}/face-swap`}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {t("demosTeaser.ctaSeeAll")}
            </Link>
          </p>
        </div>
      </section>

      {/* Apps catalog */}
      <section
        id="apps-catalog"
        className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("appsCatalog.heading")}
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("appsCatalog.intro")}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {appsItems.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                className="group flex flex-col rounded-2xl border border-border/60 bg-background/60 p-5 transition-colors hover:border-foreground/30 hover:bg-background"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {app.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {app.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            {t("pricing.heading")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("pricing.summary")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("faq.heading")}
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/60 bg-background/60 p-5 open:bg-muted/30"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/60 p-8 text-center sm:p-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("cta.heading")}
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("cta.subhead")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background"
            >
              <Link href={`/${locale}/face-swap`}>
                {t("cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="/auth/sign-up">
                {t("cta.secondary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footnote */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              {t("footnote.lastVerifiedLabel")}{" "}
              <time dateTime={LAST_VERIFIED} className="text-foreground">
                {LAST_VERIFIED}
              </time>
            </span>
          </div>
          <p className="mt-3 normal-case tracking-normal text-xs text-muted-foreground">
            {t("footnote.trustHubLabel")}{" "}
            <Link
              href="/trust"
              className="text-foreground underline-offset-4 hover:underline"
            >
              /trust
            </Link>
            . {t("footnote.verifyHubLabel")}{" "}
            <Link
              href="/verify"
              className="text-foreground underline-offset-4 hover:underline"
            >
              /verify
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
