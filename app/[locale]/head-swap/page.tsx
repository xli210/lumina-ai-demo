import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { HeadSwapPage, headSwapMetadata } from "../../components/head-swap-page";

/** Only Portuguese has this page so far (TRANSLATED_PAGES["/head-swap"]); other locales 404 rather than show English. */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return locale === "pt-BR" ? headSwapMetadata("pt-BR") : {};
}

export default async function LocalizedHeadSwapPage({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== "pt-BR") notFound();
  setRequestLocale(locale);
  return <HeadSwapPage lang="pt-BR" />;
}
