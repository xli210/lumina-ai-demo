import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BestFreeFaceSwapPage, bestFreeMetadata } from "../../components/best-free-face-swap-page";

/** Only Portuguese has this page (TRANSLATED_PAGES["/best-free-face-swap"]); other locales 404 rather than show English. */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return locale === "pt-BR" ? bestFreeMetadata("pt-BR") : {};
}

export default async function LocalizedBestFreeFaceSwapPage({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== "pt-BR") notFound();
  setRequestLocale(locale);
  return <BestFreeFaceSwapPage lang="pt-BR" />;
}
