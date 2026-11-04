"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Globe, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { DEFAULT_LOCALE, LOCALE_COOKIE, negotiateLocale, TRANSLATED_PAGES, translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";

/**
 * A small offer to read this page in the visitor's language, for someone on an English page that has a translation and
 * whose browser or earlier choice asks for that language. Most views land on English addresses, whatever the visitor reads.
 *
 * It is only an offer: never a redirect, because crawlers and people who chose English must get the page they asked for,
 * and never a panel over the page (the Quick Start panel opening by itself cost sign-ups on 10/29). It appears after the
 * page is up, so the HTML stays the same for everyone. Anyone whose cookie says English never sees it, and closing it is
 * remembered in this browser. The words are in the language being offered, not the page's.
 */

const CLOSED_KEY = "nanopocket_language_prompt_closed_v1";
const SHOW_AFTER_MS = 1500;

const COPY: Record<Exclude<AppLocale, "en">, { text: string; action: string; close: string }> = {
  "zh-CN": { text: "这个页面有中文版。", action: "查看中文版", close: "关闭" },
  ja: { text: "このページには日本語版があります。", action: "日本語で見る", close: "閉じる" },
  ko: { text: "이 페이지는 한국어로도 볼 수 있습니다.", action: "한국어로 보기", close: "닫기" },
  es: { text: "Esta página está disponible en español.", action: "Ver en español", close: "Cerrar" },
  "pt-BR": { text: "Esta página está disponível em português.", action: "Ver em português", close: "Fechar" },
  de: { text: "Diese Seite gibt es auch auf Deutsch.", action: "Auf Deutsch ansehen", close: "Schließen" },
  fr: { text: "Cette page est disponible en français.", action: "Voir en français", close: "Fermer" },
};

function readClosed(): boolean {
  try {
    return localStorage.getItem(CLOSED_KEY) === "1";
  } catch {
    return true; // storage blocked: closing could not be remembered, so do not offer
  }
}

function wantedLocale(): AppLocale {
  const cookie = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return negotiateLocale(cookie ? decodeURIComponent(cookie[1]) : undefined, languages.join(","));
}

export function LanguagePrompt() {
  const pathname = usePathname() ?? "/";
  const [offer, setOffer] = useState<{ locale: Exclude<AppLocale, "en">; path: string } | null>(null);

  useEffect(() => {
    setOffer(null);
    if (!TRANSLATED_PAGES[pathname] || readClosed()) return;
    const locale = wantedLocale();
    if (locale === DEFAULT_LOCALE || !TRANSLATED_PAGES[pathname].includes(locale)) return;
    const timer = setTimeout(() => {
      setOffer({ locale, path: pathname });
      trackEvent("language_prompt_shown", { language: locale });
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!offer || offer.path !== pathname) return null;
  const copy = COPY[offer.locale];

  const close = () => {
    try {
      localStorage.setItem(CLOSED_KEY, "1");
    } catch {}
    setOffer(null);
  };

  return (
    <div
      lang={offer.locale}
      role="region"
      aria-label={copy.text}
      className="fixed bottom-[7.5rem] left-4 right-4 z-30 flex items-start gap-2 rounded-xl border border-border bg-card/95 p-3 text-sm text-foreground shadow-lg backdrop-blur sm:bottom-4 sm:right-auto sm:max-w-xs"
    >
      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p>{copy.text}</p>
        <a
          href={translatedOrEnglish(pathname, offer.locale)}
          hrefLang={offer.locale}
          onClick={() => trackEvent("language_prompt_accepted", { language: offer.locale })}
          className="mt-1 inline-block font-medium text-primary underline-offset-4 hover:underline"
        >
          {copy.action}
        </a>
      </div>
      <button type="button" onClick={close} aria-label={copy.close} className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
