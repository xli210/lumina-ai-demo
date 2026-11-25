import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { hreflangAlternates, isAppLocale, translatedOrEnglish, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { pageCopy } from "@/lib/i18n/page-copy";
import { FACESTUDIO_V_PAGE } from "@/lib/facestudio-v";
import { NeoPage } from "../../neo/neo-page";

// The Neo launch page in the other languages (English: app/neo/page.tsx).
const BASE = "https://nanopocket.ai";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES["/neo"].includes(l);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = (await pageCopy(locale)).video?.neo;
  if (!c) return {};
  const path = `/${locale}/neo`;
  return {
    title: { absolute: `${c.pageTitle} | NanoPocket` },
    description: c.pageDescription,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, "/neo", TRANSLATED_PAGES["/neo"]) },
    openGraph: {
      type: "website",
      url: `${BASE}${path}`,
      title: c.pageTitle,
      description: c.pageDescription,
      locale: locale.replace("-", "_"),
      images: [{ url: `${BASE}/facestudio-v/media/cmp/neo_vlog_glasses.jpg` }],
    },
  };
}

export default async function LocalizedNeoPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = (await pageCopy(locale)).video?.neo;
  if (!c) notFound();
  return <NeoPage c={c} videoHref={translatedOrEnglish(FACESTUDIO_V_PAGE, locale)} locale={locale} />;
}
