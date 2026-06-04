import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LOCALES, isAppLocale, type AppLocale } from "@/lib/i18n/locales";

/**
 * Pre-render every translated locale at build time. Adding a new locale to
 * lib/i18n/locales.ts therefore automatically wires it into static generation.
 */
export function generateStaticParams() {
  return LOCALES
    .filter((l) => l !== "en")
    .map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  // Reject the default locale here too — English never lives under /en/...,
  // it lives at the root, so /en/face-swap should 404 to keep one canonical
  // URL per language.
  if (locale === "en") notFound();

  // Enables static rendering and lets next-intl resolve translations on
  // server components inside this segment.
  setRequestLocale(locale satisfies AppLocale);

  return <>{children}</>;
}
