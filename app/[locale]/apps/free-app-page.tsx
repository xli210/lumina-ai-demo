import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ToolLanding } from "../tool-landing";
import { hreflangAlternates, isAppLocale, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { pageCopy, type PageCopy } from "@/lib/i18n/page-copy";

// The free desktop apps in the other languages, shorter than their English pages (app/apps/<slug>/page.tsx). One layout, three sets of words.

const BASE = "https://nanopocket.ai";

export interface FreeApp {
  path: string;
  name: string;
  /** The card on /download. */
  downloadId: string;
  copyKey: "faceswap" | "facialedit" | "imagetryon";
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function copyFor(locale: AppLocale, app: FreeApp) {
  return (await pageCopy(locale) as PageCopy)[app.copyKey];
}

const isTranslated = (l: string, app: FreeApp): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[app.path].includes(l);

export function freeAppMetadata(app: FreeApp) {
  return async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    if (!isTranslated(locale, app)) return {};
    const c = await copyFor(locale, app);
    const path = `/${locale}${app.path}`;
    return {
      title: { absolute: c.title },
      description: c.description,
      alternates: { canonical: path, languages: hreflangAlternates(BASE, app.path, TRANSLATED_PAGES[app.path]) },
      openGraph: { type: "website", url: `${BASE}${path}`, title: c.title, description: c.description, locale: locale.replace("-", "_") },
    };
  };
}

export function freeAppPage(app: FreeApp) {
  return async function LocalizedFreeAppPage({ params }: PageProps) {
    const { locale } = await params;
    if (!isTranslated(locale, app)) notFound();
    setRequestLocale(locale);
    const c = await copyFor(locale, app);
    return (
      <ToolLanding
        locale={locale}
        name={app.name}
        copy={c}
        launchHref={`/download#${app.downloadId}`}
        englishHref={app.path}
        examples={[]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: app.name,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Windows 10/11",
            inLanguage: locale,
            url: `${BASE}/${locale}${app.path}`,
            description: c.description,
            publisher: { "@id": `${BASE}#organization` },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: locale,
            mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
    );
  };
}
