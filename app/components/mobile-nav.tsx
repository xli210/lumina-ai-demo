"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

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

const PRIMARY = [
  { href: "/face-swap", label: "Free Face Swap" },
  { href: "/image-edit", label: "AI Image Edit" },
];

const SECONDARY = [
  { href: "/#showcase-features", label: "Showcase" },
  { href: "/#demo", label: "Demo" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Apps" },
  { href: "/#faq", label: "FAQ" },
  { href: "/download", label: "Download" },
];

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const row =
    "block whitespace-nowrap rounded-lg px-3 py-3 text-base transition-colors hover:bg-neutral-100";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-black transition-colors hover:bg-neutral-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[85%] max-w-xs border-neutral-200 bg-white p-0 text-black"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Site navigation
        </SheetDescription>

        <nav className="flex h-full flex-col overflow-y-auto px-4 pb-6 pt-16">
          <div className="space-y-0.5">
            {PRIMARY.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className={`${row} font-semibold text-black`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="my-3 border-t border-neutral-200" />

          <div className="space-y-0.5">
            {SECONDARY.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className={`${row} text-neutral-600 hover:text-black`}
              >
                {l.label}
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
                Sign In
              </Link>
            )}
            <LocaleSwitcher className="justify-center text-sm" />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
