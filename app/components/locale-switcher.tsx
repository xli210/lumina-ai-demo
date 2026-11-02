"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, localeSwitchHref, usesLocaleCookie, type AppLocale } from "@/lib/i18n/locales";

function rememberLocale(locale: string) {
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Inline locale switcher. Reads the current pathname, strips any leading
 * locale prefix, and links each language to this page's translation, or to
 * that language's landing page when this page has none (localeSwitchHref).
 *
 * Conventions:
 *  - English (default locale) lives at unprefixed paths (e.g. `/face-swap`).
 *  - Other locales live under a prefix (e.g. `/zh-CN/face-swap`).
 *  - We use plain anchor tags with `hrefLang` so crawlers see clear
 *    cross-language signals on every page that includes the switcher.
 *
 * `layout="rows"` stacks the languages in two short rows of four, so eight
 * languages fit in the desktop navbar without widening it. `layout="wrap"`
 * (the default) flows them on one line and wraps, for the phone menu.
 */
export function LocaleSwitcher({
  className = "",
  layout = "wrap",
}: {
  className?: string;
  layout?: "rows" | "wrap";
}) {
  const pathname = usePathname() ?? "/";

  const pathWithoutLocale = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0])) {
      const rest = segments.slice(1).join("/");
      return rest ? `/${rest}` : "/";
    }
    return pathname;
  }, [pathname]);

  // Sign-in and credits keep one address in every language: choosing a language there reloads the same page in it.
  const sameAddress = usesLocaleCookie(pathWithoutLocale);
  const activeLocale = useLocale() as AppLocale;

  const prefix = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return (LOCALES as readonly string[]).includes(first) ? (first as AppLocale) : null;
  }, [pathname]);
  const currentLocale: AppLocale = sameAddress ? activeLocale : prefix ?? "en";

  // Browsing a translated page carries its language on to sign-in, credits and the tools. Set here, not in middleware,
  // because a cached page must not send a cookie.
  useEffect(() => {
    if (prefix) rememberLocale(prefix);
  }, [prefix]);

  const hrefFor = (loc: AppLocale) => (sameAddress ? pathWithoutLocale : localeSwitchHref(loc, pathWithoutLocale, currentLocale));
  const choose = (loc: AppLocale) => (e: React.MouseEvent) => {
    rememberLocale(loc);
    if (sameAddress) {
      e.preventDefault();
      window.location.reload();
    }
  };

  const linkClass = (isCurrent: boolean) =>
    isCurrent ? "font-semibold text-black" : "text-neutral-500 transition-colors hover:text-black";

  if (layout === "rows") {
    return (
      <div className={`items-center gap-1.5 ${className}`}>
        <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div className="grid grid-cols-4 gap-x-2 text-[11px] leading-4">
          {LOCALES.map((loc) => {
            const isCurrent = loc === currentLocale;
            return (
              <a
                key={loc}
                href={hrefFor(loc)}
                hrefLang={loc}
                onClick={choose(loc)}
                aria-current={isCurrent ? "true" : undefined}
                className={linkClass(isCurrent)}
              >
                {LOCALE_LABELS[loc]}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 text-xs ${className}`}>
      <Globe className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
      {LOCALES.map((loc, i) => {
        const href = hrefFor(loc);
        const isCurrent = loc === currentLocale;
        return (
          <span key={loc} className="flex items-center gap-1">
            <a
              href={href}
              hrefLang={loc}
              onClick={choose(loc)}
              aria-current={isCurrent ? "true" : undefined}
              className={linkClass(isCurrent)}
            >
              {LOCALE_LABELS[loc]}
            </a>
            {i < LOCALES.length - 1 ? (
              <span className="text-neutral-300" aria-hidden="true">
                ·
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
