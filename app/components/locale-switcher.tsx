"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, localeSwitchHref, type AppLocale } from "@/lib/i18n/locales";

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

  const currentLocale: AppLocale = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return ((LOCALES as readonly string[]).includes(first) ? first : "en") as AppLocale;
  }, [pathname]);

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
                href={localeSwitchHref(loc, pathWithoutLocale, currentLocale)}
                hrefLang={loc}
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
        const href = localeSwitchHref(loc, pathWithoutLocale, currentLocale);
        const isCurrent = loc === currentLocale;
        return (
          <span key={loc} className="flex items-center gap-1">
            <a
              href={href}
              hrefLang={loc}
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
