"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";
import { IMAGEEDIT_NAME } from "@/lib/imageedit";
import { NavbarAuth } from "./navbar-auth";
import { Wordmark } from "./wordmark";

const SECTIONS = [
  { href: "#proof", label: "Pixel check" },
  { href: "#examples", label: "Examples" },
  { href: "#faq", label: "FAQ" },
];

/**
 * The bar on SpotEdit's own pages. People who retouch for a living arrive here from outside; the site's
 * usual bar would greet them with face swap links.
 */
export function SpotEditNav({ sections = false }: { sections?: boolean }) {
  const locale = useLocale() as AppLocale;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Link href={translatedOrEnglish("/", locale)} className="flex items-center">
            <Wordmark className="h-5 w-auto text-black sm:h-6" />
          </Link>
          <span aria-hidden className="h-4 w-px bg-neutral-300" />
          <span className="text-sm font-semibold text-black">{IMAGEEDIT_NAME}</span>
        </div>
        {sections && (
          <div className="hidden items-center gap-6 lg:flex">
            {SECTIONS.map((s) => (
              <a key={s.href} href={s.href} className="text-sm text-neutral-500 transition-colors hover:text-black">
                {s.label}
              </a>
            ))}
          </div>
        )}
        <NavbarAuth menu={false} />
      </div>
    </nav>
  );
}
