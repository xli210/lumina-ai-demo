import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_NAME, FACE_STUDIO_URL, FACE_SWAP_CREDITS, HEAD_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE } from "@/lib/facestudio-v";
import { IMAGEEDIT_CREDITS_PER_EDIT, IMAGEEDIT_NAME } from "@/lib/imageedit";

/**
 * A short, plain-text summary of what NanoPocket is and what each online tool costs, near the top of
 * the homepage. AI assistants send most of their visitors to "/", and quote whatever states the facts
 * most plainly, so every number here comes from the same constants the product pages and billing use.
 */

// Prices are given in credits only, by the owner's choice.

const TOOLS = [
  {
    name: FACE_STUDIO_NAME,
    href: FACE_STUDIO_URL,
    what: "Photo face swap. Swaps up to six faces in one photo; you choose who gets which face.",
    price: `${FACE_SWAP_CREDITS} credits per face; head swap ${HEAD_SWAP_CREDITS} credits`,
  },
  {
    name: HEADSWAP_PRO_NAME,
    href: "/headswap-pro",
    what: "Photo head swap. Puts a whole new head, face and hair, into a photo. Pick one person in a group photo; works at steep angles.",
    price: `${HEADSWAP_PRO_CREDITS_PER_IMAGE} credits per image`,
  },
  {
    name: FACESTUDIO_V_NAME,
    href: FACESTUDIO_V_PAGE,
    what: "Video face swap. Replaces one person's face or whole head in a video; everyone else and the original sound stay as filmed.",
    price: "Priced per video; the price is shown before you start",
  },
  {
    name: IMAGEEDIT_NAME,
    href: "/image-edit",
    what: "Photo editing by text. Describe the change, such as removing an object or changing the background.",
    price: `${IMAGEEDIT_CREDITS_PER_EDIT} credits per edit`,
  },
] as const;

const FACTS = [
  `New accounts get ${SIGNUP_GRANT_CREDITS} free credits, one grant per person.`,
  "No subscription. Credits are prepaid and never expire. A job that fails is refunded in full.",
  "Face, head and video swaps from an account that has never bought credits carry a NanoPocket watermark; one purchase removes it. Image edits have no watermark.",
  "The online tools run in any modern browser. Nothing to install and no GPU needed.",
  "The desktop apps run offline on your own NVIDIA GPU (Windows) and are sold as one-time licences.",
];

export const AT_A_GLANCE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "NanoPocket online tools",
  itemListElement: TOOLS.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "WebApplication",
      name: t.name,
      url: `https://nanopocket.ai${t.href}`,
      description: `${t.what} ${t.price}.`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any modern web browser",
      publisher: { "@id": "https://nanopocket.ai#organization" },
    },
  })),
};

export function AtAGlanceSection() {
  return (
    <section id="at-a-glance" aria-labelledby="at-a-glance-title" className="relative px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">At a glance</p>
        <h2 id="at-a-glance-title" className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          NanoPocket in one minute
        </h2>
        <p className="mb-8 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          NanoPocket (nanopocket.ai) makes AI face swap and photo tools. Four of them run in your browser with a free
          account; the rest are desktop apps that run on your own GPU.
        </p>

        <div className="overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">NanoPocket online tools, what each does and what it costs</caption>
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Tool</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">What it does</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((t) => (
                <tr key={t.name} className="border-t border-border/40 align-top">
                  <th scope="row" className="px-4 py-4 font-semibold text-foreground">
                    <Link href={t.href} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                      {t.name}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                    <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground sm:hidden">{t.what}</span>
                  </th>
                  <td className="hidden px-4 py-4 leading-relaxed text-muted-foreground sm:table-cell">{t.what}</td>
                  <td className="px-4 py-4 leading-relaxed text-muted-foreground">{t.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 grid gap-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
          {FACTS.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
