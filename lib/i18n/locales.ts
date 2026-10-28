/**
 * Locale registry.
 *
 * Adding a new locale is a 4-step process:
 *  1) Append the BCP-47 tag here (e.g. "ja", "ko", "zh-TW").
 *  2) Create messages/<tag>.json by copying messages/en.json and translating
 *     meaningful content while preserving every term in lib/i18n/glossary.ts.
 *  3) Add a corresponding app/[locale]/<page>/page.tsx if the page should be
 *     localised (otherwise the locale will fall through to English).
 *  4) Run `node scripts/check-i18n-dnt.mjs` to verify DNT integrity.
 */

export const DEFAULT_LOCALE = "en" as const;

export const LOCALES = ["en", "zh-CN", "ja", "ko"] as const;

export type AppLocale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  "zh-CN": "中文",
  ja: "日本語",
  ko: "한국어",
};

/**
 * Native subtitle shown in the language switcher menu, in the locale's own
 * script. We keep this redundant-by-design so the switcher is intelligible
 * to users whose UI is currently in a different language.
 */
export const LOCALE_SUBTITLES: Record<AppLocale, string> = {
  en: "English",
  "zh-CN": "Chinese (Simplified) — 简体中文",
  ja: "Japanese — 日本語",
  ko: "Korean — 한국어",
};

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Build the URL path for a given page in a given locale, using the
 * "default-locale unprefixed" convention.
 *   localizedPath("en",    "/face-swap") => "/face-swap"
 *   localizedPath("zh-CN", "/face-swap") => "/zh-CN/face-swap"
 */
export function localizedPath(locale: AppLocale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  return `/${locale}${normalized}`;
}

/**
 * The pages that exist in each language, keyed by their English path. Most pages are English only, so the
 * language switcher must not invent `/<locale><path>` for them: those addresses 404, and every page linking to
 * them taught crawlers hundreds of dead URLs. Add a page here when its translation ships.
 */
const TRANSLATED_PAGES: Record<string, readonly AppLocale[]> = {
  "/": ["zh-CN"],
  "/face-swap": ["zh-CN", "ja", "ko"],
  "/headswap-pro": ["zh-CN", "ja"],
};

/** This page's address in `locale` if it has been translated, else its English address. */
export function translatedOrEnglish(path: string, locale: AppLocale): string {
  return locale !== DEFAULT_LOCALE && TRANSLATED_PAGES[path]?.includes(locale) ? `/${locale}${path === "/" ? "" : path}` : path;
}

/** Where a language's visitors land when the current page has no translation in it. */
const LOCALE_LANDING: Record<AppLocale, string> = {
  en: "/",
  "zh-CN": "/zh-CN",
  ja: "/ja/face-swap",
  ko: "/ko/face-swap",
};

/** Translated pages whose English counterpart is not at the same path. */
const ENGLISH_COUNTERPART: Array<[RegExp, string]> = [
  [/^\/guides(\/.*)?$/, "/blog"],
  [/^\/faq$/, "/face-swap"],
];

/**
 * The address of the current page in `target`, or that language's landing page when the page has no
 * translation in it. `path` is the current path without its locale prefix; `from` is the current locale.
 */
export function localeSwitchHref(target: AppLocale, path: string, from: AppLocale): string {
  if (target === from) return from === DEFAULT_LOCALE ? path : `/${from}${path === "/" ? "" : path}`;
  if (target === DEFAULT_LOCALE) {
    if (TRANSLATED_PAGES[path]?.includes(from)) return path;
    const match = ENGLISH_COUNTERPART.find(([re]) => re.test(path));
    return match ? match[1] : LOCALE_LANDING.en;
  }
  if (TRANSLATED_PAGES[path]?.includes(target)) return `/${target}${path === "/" ? "" : path}`;
  return LOCALE_LANDING[target];
}

/**
 * For a page that has been translated into one or more non-default locales,
 * produce the metadata.alternates.languages map (used to emit hreflang tags).
 *
 * Always include x-default pointing at the unprefixed English URL.
 */
export function hreflangAlternates(
  baseUrl: string,
  pathWithoutLocale: string,
  translatedLocales: readonly AppLocale[],
): Record<string, string> {
  const normalized = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : `/${pathWithoutLocale}`;
  const map: Record<string, string> = {
    en: `${baseUrl}${normalized}`,
    "x-default": `${baseUrl}${normalized}`,
  };
  for (const loc of translatedLocales) {
    if (loc === DEFAULT_LOCALE) continue;
    map[loc] = `${baseUrl}/${loc}${normalized}`;
  }
  return map;
}
