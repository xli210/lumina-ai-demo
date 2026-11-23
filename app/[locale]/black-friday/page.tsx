import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { hreflangAlternates, isAppLocale, translatedOrEnglish, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { blackFridayCopy } from "@/lib/black-friday-copy";
import { BlackFridayPage } from "../../black-friday/black-friday-page";

// The Black Friday hub in the other languages (English: app/black-friday/page.tsx).
const BASE = "https://nanopocket.ai";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES["/black-friday"].includes(l);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = blackFridayCopy(locale);
  const path = `/${locale}/black-friday`;
  return {
    title: { absolute: `${c.pageTitle} | NanoPocket` },
    description: c.pageDescription,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, "/black-friday", TRANSLATED_PAGES["/black-friday"]) },
    openGraph: { type: "website", url: `${BASE}${path}`, title: c.pageTitle, description: c.pageDescription, locale: locale.replace("-", "_") },
  };
}

export default async function LocalizedBlackFriday({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  return <BlackFridayPage c={blackFridayCopy(locale)} href={(path) => translatedOrEnglish(path, locale)} />;
}
