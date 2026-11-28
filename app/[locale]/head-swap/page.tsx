import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { HeadSwapPage, headSwapMetadata } from "../../components/head-swap-page";
import { HEAD_SWAP_LANGS, type HeadSwapLang } from "@/lib/head-swap-copy";

/** Only the languages in TRANSLATED_PAGES["/head-swap"] have this page; other locales 404 rather than show English. */

interface PageProps {
  params: Promise<{ locale: string }>;
}

function headSwapLang(locale: string): Exclude<HeadSwapLang, "en"> | null {
  return locale !== "en" && (HEAD_SWAP_LANGS as readonly string[]).includes(locale) ? (locale as Exclude<HeadSwapLang, "en">) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = headSwapLang(locale);
  return lang ? headSwapMetadata(lang) : {};
}

export default async function LocalizedHeadSwapPage({ params }: PageProps) {
  const { locale } = await params;
  const lang = headSwapLang(locale);
  if (!lang) notFound();
  setRequestLocale(locale);
  return <HeadSwapPage lang={lang} />;
}
