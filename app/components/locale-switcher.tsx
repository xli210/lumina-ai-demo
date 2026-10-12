"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { ChevronDown, Globe } from "lucide-react";
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
export function LocaleSwitcher({
  className = "",
  variant = "inline",
}: {
  className?: string;
  /** "menu": one globe button that opens the list (the navbar). The links are still in the HTML. */
  variant?: "inline" | "menu";
}) {
  const pathname = usePathname() ?? "/";
  const menuRef = useRef<HTMLDetailsElement>(null);

  // Close the menu on an outside click or Escape. A plain <details> keeps every
  // language link in the markup, so crawlers still see the hreflang anchors.
  useEffect(() => {
    if (variant !== "menu") return;
    const close = (e: Event) => {
      const el = menuRef.current;
      if (el?.open && !(e.target instanceof Node && el.contains(e.target))) el.open = false;
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuRef.current) menuRef.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [variant]);

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

  if (variant === "menu") {
    return (
      <details ref={menuRef} className={`group relative text-sm ${className}`}>
        <summary
          aria-label="Language"
          className="flex cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black [&::-webkit-details-marker]:hidden"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium">{LOCALE_LABELS[currentLocale]}</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg">
          {LOCALES.map((loc) => {
            const href = loc === "en" ? pathWithoutLocale : `/${loc}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
            const isCurrent = loc === currentLocale;
            return (
              <a
                key={loc}
                href={href}
                hrefLang={loc}
                aria-current={isCurrent ? "true" : undefined}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-neutral-100 ${
                  isCurrent ? "font-semibold text-black" : "text-neutral-600 hover:text-black"
                }`}
              >
                {LOCALE_LABELS[loc]}
              </a>
            );
          })}
        </div>
      </details>
    );
  }

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
