"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";
import { Wordmark } from "./wordmark";

/**
 * Guides that AI search indexers only find through links on pages they already crawl: ChatGPT's indexer re-reads the
 * ~60 pages this footer reaches and had not found /best-free-face-swap, /head-swap or the skin test in 6-9 days
 * (ai_fetches, 2026-11-25). Product and brand names stay in English; the rest is short enough to keep here.
 */
const GUIDE_LABELS: Record<AppLocale, { free: string; head: string; skin: string }> = {
  en: { free: "Free face swap", head: "Head swap", skin: "Skin texture test" },
  "zh-CN": { free: "免费换脸", head: "换头", skin: "皮肤质感测试" },
  ja: { free: "無料フェイススワップ", head: "ヘッドスワップ", skin: "肌の質感テスト" },
  ko: { free: "무료 페이스 스왑", head: "헤드 스왑", skin: "피부 질감 테스트" },
  es: { free: "Face swap gratis", head: "Cambio de cabeza", skin: "Prueba de textura de piel" },
  "pt-BR": { free: "Troca de rosto grátis", head: "Troca de cabeça", skin: "Teste de textura de pele" },
  de: { free: "Kostenloser Face Swap", head: "Kopftausch", skin: "Hauttextur-Test" },
  fr: { free: "Face swap gratuit", head: "Échange de tête", skin: "Test de texture de peau" },
};

export function Footer() {
  const t = useTranslations("Ui.footer");
  const locale = useLocale() as AppLocale;
  const isEnglish = locale === "en";

  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <Link href={translatedOrEnglish("/", locale)} className="flex items-center">
          <Wordmark className="h-4 w-auto text-foreground sm:h-5" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {isEnglish && (
            <Link href="/#demo" className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
              {t("demo")}
            </Link>
          )}
          {isEnglish && (
            <Link href="/#showcase" className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
              {t("gallery")}
            </Link>
          )}
          {isEnglish && (
            <Link href="/#how-it-works" className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
              {t("howItWorks")}
            </Link>
          )}
          {isEnglish && (
            <Link href="/#features" className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
              {t("features")}
            </Link>
          )}
          <Link
            href="/apps"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("apps")}
          </Link>
          <Link
            href="/pricing"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("pricing")}
          </Link>
          {isEnglish && (
            <Link href="/#faq" className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
              {t("faq")}
            </Link>
          )}
          <Link
            href="/download"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("download")}
          </Link>
          <Link
            href="/blog"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("blog")}
          </Link>
          <Link
            href="/about"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("about")}
          </Link>
          <Link
            href="/apps/nanoface-vivid"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Vivid
          </Link>
          <Link
            href={translatedOrEnglish("/face-swap", locale)}
            className="text-xs font-semibold text-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("photoFaceSwap")}
          </Link>
          <Link
            href={translatedOrEnglish("/image-edit", locale)}
            className="text-xs font-semibold text-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("aiImageEdit")}
          </Link>
          <Link
            href={translatedOrEnglish("/headswap-pro", locale)}
            className="text-xs font-semibold text-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("photoHeadSwap")}
          </Link>
          <Link
            href={translatedOrEnglish("/facestudio-v", locale)}
            className="text-xs font-semibold text-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("videoFaceSwap")}
          </Link>
          <Link
            href="/status"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("status")}
          </Link>
          <Link
            href="/best-face-swap-app-2026"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Best of 2026
          </Link>
          <Link
            href={translatedOrEnglish("/best-free-face-swap", locale)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {(GUIDE_LABELS[locale] ?? GUIDE_LABELS.en).free}
          </Link>
          <Link
            href={translatedOrEnglish("/head-swap", locale)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {(GUIDE_LABELS[locale] ?? GUIDE_LABELS.en).head}
          </Link>
          <Link
            href={translatedOrEnglish("/data/face-swap-skin-test", locale)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {(GUIDE_LABELS[locale] ?? GUIDE_LABELS.en).skin}
          </Link>
          <Link
            href="/compare"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("compare")}
          </Link>
          <Link
            href="/trust"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Trust
          </Link>
          <Link
            href="/verify"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Verify
          </Link>
          <Link
            href="/community"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("community")}
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/terms"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("terms")}
          </Link>
          <Link
            href="/security"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("security")}
          </Link>
          <Link
            href="/contact"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("contact")}
          </Link>
          <a
            href="https://discord.gg/bNfPjfUDAn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Discord
          </a>
          <Link
            href="/auth/login"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            {t("signIn")}
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} NanoPocket. All rights reserved.
        </p>
      </div>

      <div className="mx-auto max-w-7xl border-t border-border mt-8 pt-8 px-6">
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors select-none">
            Disclaimer
          </summary>
          <div className="mt-4 space-y-3 text-[11px] leading-relaxed text-muted-foreground/70">
            <p>
              The applications provided by us are offered &ldquo;as is&rdquo; without warranties of any kind, express or implied. While we strive to deliver a high-quality experience, we do not guarantee that our applications will be error-free, uninterrupted, or meet every individual requirement.
            </p>
            <p>
              AI-generated outputs — including images, videos, and other content — are produced by automated systems and may not always be accurate, complete, or suitable for every use case. Users are responsible for reviewing and validating any AI-generated results before use.
            </p>
            <p>
              We are not liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our applications, including but not limited to data loss, hardware compatibility issues, or reliance on AI-generated content.
            </p>
            <p>
              Our applications may integrate with or depend on third-party services and technologies. We are not responsible for the availability, performance, or policies of any third-party providers.
            </p>
            <p>
              By downloading and using our applications, you agree to use them in compliance with all applicable laws and regulations. We reserve the right to update, modify, or discontinue any application or feature at any time without prior notice.
            </p>
          </div>
        </details>
      </div>
    </footer>
  );
}
