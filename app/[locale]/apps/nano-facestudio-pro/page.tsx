import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ToolLanding } from "../../tool-landing";
import { hreflangAlternates, isAppLocale, TRANSLATED_PAGES, type AppLocale } from "@/lib/i18n/locales";
import { pageCopy } from "@/lib/i18n/page-copy";
import { facestudioProPrice } from "@/lib/facestudio-pro-price";

// Nano FaceStudio Pro in the other languages, shorter than the English page (app/apps/nano-facestudio-pro/page.tsx).
// The product text is translated; the price line stays in English, like price and billing wording on the rest of the site.

/** Re-rendered every 10 minutes, so the Black Friday price appears and leaves soon after the sale starts and ends. */
export const revalidate = 600;

const BASE = "https://nanopocket.ai";
const PATH = "/apps/nano-facestudio-pro";
const NAME = "Nano FaceStudio Pro";
const IMG = "/images/nano-facestudio";
const LAUNCH_1_2 = "/apps/nano-facestudio-pro-1-2";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const isTranslated = (l: string): l is AppLocale => isAppLocale(l) && TRANSLATED_PAGES[PATH].includes(l);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTranslated(locale)) return {};
  const c = (await pageCopy(locale)).pro;
  const path = `/${locale}${PATH}`;
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: { canonical: path, languages: hreflangAlternates(BASE, PATH, TRANSLATED_PAGES[PATH]) },
    openGraph: { type: "website", url: `${BASE}${path}`, title: c.title, description: c.description, locale: locale.replace("-", "_") },
  };
}

export default async function LocalizedFaceStudioProPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTranslated(locale)) notFound();
  setRequestLocale(locale);
  const c = (await pageCopy(locale)).pro;
  const pr = facestudioProPrice();

  return (
    <ToolLanding
      locale={locale}
      name={NAME}
      copy={c}
      launchHref="/download#nano-facestudio-pro"
      englishHref={PATH}
      wideExamples
      heroExtra={
        <>
          <p lang="en" className="mt-2 text-sm text-foreground">
            {pr.sale ? (
              <>
                <span className="font-semibold">${pr.price}</span>{" "}
                <span className="text-muted-foreground line-through">${pr.regular}</span> one-time · Black Friday price until{" "}
                {pr.endsLabel} ·{" "}
                <Link href="/black-friday" className="text-primary underline-offset-4 hover:underline">
                  See all Black Friday offers
                </Link>
              </>
            ) : (
              <>
                <span className="font-semibold">${pr.regular}</span> one-time · no subscription
              </>
            )}
          </p>
          {c.whatsNew && (
            <p className="mt-2 text-sm">
              <Link href={LAUNCH_1_2} hrefLang="en" className="text-primary underline-offset-4 hover:underline">
                {c.whatsNew}
              </Link>
            </p>
          )}
        </>
      }
      examples={[
        { key: "protect", before: `${IMG}/face-swap-protect-before.png`, after: `${IMG}/face-swap-protect-after.png`, width: 1920, height: 1028 },
        { key: "expression", before: `${IMG}/expression-sliders-1.png`, after: `${IMG}/expression-sliders-2.png`, width: 1920, height: 1028 },
        { key: "mask", before: `${IMG}/mask-edit-1.png`, after: `${IMG}/mask-edit-3.png`, width: 1918, height: 1028 },
      ]}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: NAME,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Windows 10/11 (NVIDIA CUDA); macOS 14+ on Apple Silicon",
          softwareVersion: "1.2.0",
          inLanguage: locale,
          url: `${BASE}/${locale}${PATH}`,
          description: c.description,
          publisher: { "@id": `${BASE}#organization` },
          offers: {
            "@type": "Offer",
            price: pr.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            ...(pr.validUntil ? { priceValidUntil: pr.validUntil } : {}),
            url: `${BASE}${PATH}`,
          },
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
}
