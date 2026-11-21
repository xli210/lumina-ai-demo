import type { Metadata } from "next";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";
import enCopy from "@/messages/pages/en.source.json";
import { FACESTUDIO_V_PAGE } from "@/lib/facestudio-v";
import { NeoPage } from "./neo-page";

const BASE = "https://nanopocket.ai";
const c = enCopy.video.neo;

export const metadata: Metadata = {
  title: { absolute: `${c.pageTitle} | NanoPocket` },
  description: c.pageDescription,
  alternates: { canonical: "/neo", languages: hreflangAlternates(BASE, "/neo", TRANSLATED_PAGES["/neo"]) },
  openGraph: {
    type: "website",
    url: `${BASE}/neo`,
    title: c.pageTitle,
    description: c.pageDescription,
    images: [{ url: `${BASE}/facestudio-v/media/cmp/neo_vlog_glasses.jpg` }],
  },
};

export default function NeoLaunchPage() {
  return <NeoPage c={c} videoHref={FACESTUDIO_V_PAGE} />;
}
