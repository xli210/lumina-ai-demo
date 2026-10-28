import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeadSwapLaunchPage, headswapMetadata } from "../../headswap-pro/launch-page";
import { HS_TRANSLATED, type HsLocale } from "../../headswap-pro/copy";

// The HeadSwap Pro launch page in the languages it has been translated into (app/headswap-pro/copy.ts).
// Any other locale 404s rather than showing English under a translated address.

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is HsLocale => (HS_TRANSLATED as readonly string[]).includes(l);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return isTranslated(locale) ? headswapMetadata(locale) : {};
}

export default async function LocalizedHeadSwapProPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  return <HeadSwapLaunchPage locale={locale} />;
}
