import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SkinTestPage, skinTestMetadata } from "../../../data/face-swap-skin-test/skin-test-page";
import { SKIN_TEST_LOCALES, type SkinTestLocale } from "../../../data/face-swap-skin-test/copy";

// The skin-texture test in the languages it has been translated into (only Portuguese so far); any other locale 404s.

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is SkinTestLocale => l !== "en" && (SKIN_TEST_LOCALES as readonly string[]).includes(l);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return isTranslated(locale) ? skinTestMetadata(locale) : {};
}

export default async function LocalizedSkinTestPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  return <SkinTestPage locale={locale} />;
}
