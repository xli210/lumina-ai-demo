import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Globe,
  ImageIcon,
  Info,
  ShieldCheck,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { Button } from "@/components/ui/button";
import { DemoStatusBadge } from "../../components/demo-status-badge";
import { DEMOS, demoUrl, type DemoId } from "@/lib/demos";
import {
  hreflangAlternates,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/locales";
import { notFound } from "next/navigation";

const BASE_URL = "https://nanopocket.ai";
const PATH = "/face-swap";
const LAST_VERIFIED = "2026-06-03";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale) || locale === "en") return {};

  const t = await getTranslations({ locale, namespace: "FaceSwap.metadata" });
  const canonical = `${BASE_URL}/${locale}${PATH}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      languages: hreflangAlternates(BASE_URL, PATH, ["zh-CN"]),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/images/vivid/gemini-after.jpg"],
      locale: locale.replace("-", "_"),
    },
    other: {
      "article:modified_time": LAST_VERIFIED,
    },
  };
}

interface DemoCardConfig {
  id: DemoId;
  Icon: React.ComponentType<{ className?: string }>;
  accent: "violet" | "sky" | "rose";
  copyKey: "image" | "video" | "vivid";
}

const DEMO_CARDS: DemoCardConfig[] = [
  { id: "image", Icon: ImageIcon, accent: "violet", copyKey: "image" },
  { id: "video", Icon: Video, accent: "sky", copyKey: "video" },
  { id: "vivid", Icon: Wand2, accent: "rose", copyKey: "vivid" },
];

const accentClasses: Record<
  DemoCardConfig["accent"],
  { ring: string; chip: string; cta: string }
> = {
  violet: {
    ring: "ring-violet-500/30",
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-500",
    cta: "bg-violet-500 hover:bg-violet-400",
  },
  sky: {
    ring: "ring-sky-500/30",
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-500",
    cta: "bg-sky-500 hover:bg-sky-400",
  },
  rose: {
    ring: "ring-rose-500/30",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-500",
    cta: "bg-rose-500 hover:bg-rose-400",
  },
};

interface CompareRow {
  tool: string;
  setup: string;
  signup: string;
  pricing: string;
  identity: string;
  privacy: string;
}

interface FaqItem {
  q: string;
  a: string;
}

export default async function LocalizedFaceSwapPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isAppLocale(locale) || locale === "en") notFound();
  setRequestLocale(locale satisfies AppLocale);

  const t = await getTranslations({ locale, namespace: "FaceSwap" });

  const onlineDemos = DEMO_CARDS.map((card) => {
    const demo = DEMOS.find((d) => d.id === card.id)!;
    return {
      ...card,
      name: demo.name,
      href: demoUrl(demo),
      password: demo.password ?? undefined,
      blurb: t(`demos.${card.copyKey}.blurb`),
      bullets: [
        t(`demos.${card.copyKey}.bullet1`),
        t(`demos.${card.copyKey}.bullet2`),
        t(`demos.${card.copyKey}.bullet3`),
      ],
    };
  });

  const compareRows = t.raw("compare.rows") as CompareRow[];
  const faqs = t.raw("faq.items") as FaqItem[];
  const canonical = `${BASE_URL}/${locale}${PATH}`;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical,
    url: canonical,
    name: t("metadata.ogTitle"),
    description: t("metadata.description"),
    inLanguage: locale,
    isAccessibleForFree: true,
    dateModified: LAST_VERIFIED,
    isPartOf: { "@id": "https://nanopocket.ai#website" },
    about: {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}${PATH}#app`,
      name: "NanoPocket Face Swap (online demos)",
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Face swap",
      operatingSystem: "Browser (any modern OS)",
      browserRequirements: "Modern browser; WebGL not required",
      softwareVersion: "Pro 2.0",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Photo face swap",
        "Video face swap",
        "Over-smoothed AI-face restoration (NanoFace Vivid)",
        "Diffusion identity stack — InstantID + PuLID + IP-Adapter FaceID",
        "Browser-only — no install, no GPU required on user's device",
      ],
      publisher: { "@id": "https://nanopocket.ai#organization" },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            {t("hero.kicker")}
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("hero.headline")}
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.subhead")}
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
              <FileCheck2 className="h-3.5 w-3.5" />
              {t("hero.lastVerifiedLabel")}{" "}
              <time dateTime={LAST_VERIFIED} className="text-foreground">
                {LAST_VERIFIED}
              </time>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-500">
              <Clock className="h-3.5 w-3.5" />
              {t("hero.openSpeed")}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background"
            >
              <a
                href={onlineDemos[0].href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("hero.ctaPrimary")} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="/auth/sign-up">
                {t("hero.ctaSecondary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Three online demos */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("demos.heading")}
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("demos.intro")}
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {onlineDemos.map((d) => {
              const a = accentClasses[d.accent];
              const Icon = d.Icon;
              return (
                <div
                  key={d.id}
                  className={`flex flex-col rounded-2xl border border-border/60 bg-background/60 p-6 ring-1 ${a.ring}`}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${a.chip}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {/* @ts-expect-error Async Server Component */}
                    <DemoStatusBadge demoId={d.id} size="sm" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">
                    {d.name}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {d.blurb}
                  </p>
                  <ul className="mb-5 space-y-2 text-sm text-muted-foreground">
                    {d.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {d.password ? (
                    <p className="mb-4 text-xs text-muted-foreground">
                      {t("demos.passwordLabel")}{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                        {d.password}
                      </code>
                    </p>
                  ) : null}
                  <div className="mt-auto">
                    <Button
                      asChild
                      className={`w-full rounded-full text-white ${a.cta}`}
                    >
                      <a
                        href={d.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("demos.openCta")}{" "}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="border-y border-border/60 bg-muted/20 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {t("steps.heading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-border/60 bg-background/60 p-5"
              >
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  {n}
                </span>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {t(`steps.step${n}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`steps.step${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browser-first comparison */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("compare.heading")}
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("compare.intro")}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">{t("compare.colTool")}</th>
                  <th className="px-4 py-3">{t("compare.colSetup")}</th>
                  <th className="px-4 py-3">{t("compare.colSignup")}</th>
                  <th className="px-4 py-3">{t("compare.colPricing")}</th>
                  <th className="px-4 py-3">{t("compare.colIdentity")}</th>
                  <th className="px-4 py-3">{t("compare.colPrivacy")}</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r, i) => (
                  <tr
                    key={r.tool}
                    className={`border-t border-border/40 align-top ${
                      i === 0
                        ? "bg-emerald-500/5"
                        : i % 2 === 0
                          ? "bg-background/40"
                          : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">
                      {r.tool}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {r.setup}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {r.signup}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {r.pricing}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {r.identity}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {r.privacy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {t("compare.footnote")}{" "}
            <Link
              href="/best-face-swap-app-2026"
              className="text-foreground underline-offset-2 hover:underline"
            >
              /best-face-swap-app-2026
            </Link>{" "}
            {t("compare.footnoteAnd")}{" "}
            <Link
              href="/compare"
              className="text-foreground underline-offset-2 hover:underline"
            >
              /compare
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Why diffusion */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-muted/20 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <Sparkles className="h-5 w-5 text-violet-500" />
            {t("diffusion.heading")}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("diffusion.p1")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("diffusion.p2")}
          </p>
        </div>
      </section>

      {/* Going further */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            {t("offline.heading")}
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("offline.body")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/apps/nano-faceswap-pro">
                {t("offline.ctaDesktop")}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/verify">
                {t("offline.ctaVerify")}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("faq.heading")}
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/60 bg-background/60 p-5 open:bg-muted/30"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Honest disclosure */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/60 p-6 sm:p-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            {t("disclosure.heading")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">
                {t("disclosure.cloudGpuTitle")}
              </strong>{" "}
              {t("disclosure.cloudGpuBody")}
            </li>
            <li>
              <strong className="text-foreground">
                {t("disclosure.youngerBrandTitle")}
              </strong>{" "}
              {t("disclosure.youngerBrandBody", {
                lastVerified: LAST_VERIFIED,
              })}
            </li>
            <li>
              <strong className="text-foreground">
                {t("disclosure.tunnelledTitle")}
              </strong>{" "}
              {t("disclosure.tunnelledBody")}
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
