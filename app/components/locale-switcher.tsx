"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type AppLocale } from "@/lib/i18n/locales";

/**
 * Inline locale switcher. Reads the current pathname, strips any leading
 * locale prefix, and rebuilds links pointing at every supported locale.
 *
 * Conventions:
 *  - English (default locale) lives at unprefixed paths (e.g. `/face-swap`).
 *  - Other locales live under a prefix (e.g. `/zh-CN/face-swap`).
 *  - We use plain anchor tags with `hrefLang` so crawlers see clear
 *    cross-language signals on every page that includes the switcher.
 */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";

  const pathWithoutLocale = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0])) {
      const rest = segments.slice(1).join("/");
      return rest ? `/${rest}` : "/";
    }
    return pathname;
  }, [pathname]);

  const currentLocale: AppLocale = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return ((LOCALES as readonly string[]).includes(first) ? first : "en") as AppLocale;
  }, [pathname]);

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <Globe className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
      {LOCALES.map((loc, i) => {
        const href = loc === "en" ? pathWithoutLocale : `/${loc}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
        const isCurrent = loc === currentLocale;
        return (
          <span key={loc} className="flex items-center gap-1">
            <a
              href={href}
              hrefLang={loc}
              aria-current={isCurrent ? "true" : undefined}
              className={
                isCurrent
                  ? "font-semibold text-black"
                  : "text-neutral-500 transition-colors hover:text-black"
              }
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
