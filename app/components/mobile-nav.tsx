"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LocaleSwitcher } from "./locale-switcher";

/**
 * The navigation below the md breakpoint, where the link row is hidden.
 *
 * Before this the bar simply had no menu on a phone: the links vanished and
 * "Sign In" plus "Get Started" pushed the page 40px wider than the screen.
 * Now "Sign In" lives here, the bar keeps only the logo, "Get Started" and
 * this button, and every link the desktop bar has is reachable.
 *
 * Styled to match the bar it opens from (white, black text), not the dark
 * page behind it.
 */

// Same tools and order as the desktop bar, plus AI Image Edit, which the desktop bar has no room for.
const PRIMARY = [
  { href: "/face-swap", key: "photoFaceSwap" },
  { href: "/headswap-pro", key: "photoHeadSwap", isNew: true },
  { href: "/facestudio-v", key: "videoFaceSwap", isNew: true },
  { href: "/image-edit", key: "aiImageEdit" },
];

const SECONDARY = [
  { href: "/#showcase-features", key: "showcase", englishOnly: true },
  { href: "/#how-it-works", key: "howItWorks", englishOnly: true },
  { href: "/apps", key: "apps" },
  { href: "/#faq", key: "faq", englishOnly: true },
  { href: "/download", key: "download" },
];

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const t = useTranslations("Ui.nav");
  const locale = useLocale() as AppLocale;
  const isEnglish = locale === "en";

  const row =
    "block whitespace-nowrap rounded-lg px-3 py-3 text-base transition-colors hover:bg-neutral-100";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-black transition-colors hover:bg-neutral-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[85%] max-w-xs border-neutral-200 bg-white p-0 text-black"
      >
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        <SheetDescription className="sr-only">
          {t("siteNavigation")}
        </SheetDescription>

        <nav className="flex h-full flex-col overflow-y-auto px-4 pb-6 pt-16">
          <div className="space-y-0.5">
            {PRIMARY.map((l) => (
              <Link
                key={l.href}
                href={translatedOrEnglish(l.href, locale)}
                onClick={close}
                className={`${row} flex items-center gap-2 font-semibold text-black`}
              >
                {t(l.key)}
                {l.isNew && (
                  <span className="rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white">
                    {t("new")}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="my-3 border-t border-neutral-200" />

          <div className="space-y-0.5">
            {SECONDARY.filter((l) => isEnglish || !l.englishOnly).map((l) => (
              <Link
                key={l.href}
                href={!isEnglish && l.href === "/apps" ? `${translatedOrEnglish("/", locale)}#apps-catalog` : l.href}
                onClick={close}
                className={`${row} text-neutral-600 hover:text-black`}
              >
                {t(l.key)}
              </Link>
            ))}
            <a
              href="https://discord.gg/bNfPjfUDAn"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className={`${row} text-neutral-600 hover:text-black`}
            >
              Discord
            </a>
          </div>

          <div className="mt-auto space-y-4 pt-6">
            {!isLoggedIn && (
              <Link
                href="/auth/login"
                onClick={close}
                className="block rounded-full border border-neutral-300 py-3 text-center text-base font-medium text-black transition-colors hover:bg-neutral-100"
              >
                {t("signIn")}
              </Link>
            )}
            <LocaleSwitcher className="justify-center text-sm" />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
