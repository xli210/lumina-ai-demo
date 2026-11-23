import type { Metadata } from "next";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";
import { blackFridayCopy } from "@/lib/black-friday-copy";
import { BlackFridayPage } from "./black-friday-page";

const BASE = "https://nanopocket.ai";
const c = blackFridayCopy("en");

/** Re-rendered every 10 minutes, so each offer leaves the page soon after it ends. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: `${c.pageTitle} | NanoPocket` },
  description: c.pageDescription,
  alternates: { canonical: "/black-friday", languages: hreflangAlternates(BASE, "/black-friday", TRANSLATED_PAGES["/black-friday"]) },
  openGraph: { type: "website", url: `${BASE}/black-friday`, title: c.pageTitle, description: c.pageDescription },
};

export default function BlackFriday() {
  return <BlackFridayPage c={c} href={(path) => path} />;
}
