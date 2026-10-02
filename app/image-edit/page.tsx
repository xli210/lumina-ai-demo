import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Brush,
  Eraser,
  ImagePlus,
  Leaf,
  Repeat,
  Sparkles,
  Sun,
  Type,
  Wand2,
} from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import { FREE_DAILY_CREDITS } from "@/lib/facestudio";
import { CREDITS_PER_USD } from "@/lib/credits";
import {
  IMAGEEDIT_CREDITS_PER_EDIT,
  IMAGEEDIT_MAX_SIDE,
  IMAGEEDIT_MAX_VARIATIONS,
  IMAGEEDIT_NAME,
} from "@/lib/imageedit";

/**
 * /image-edit — public landing page for Nano ImageEdit 2.0 Online.
 *
 * Indexable on purpose; the editor itself is at /image-edit/launch, behind
 * sign-in (middleware protects the `/image-edit/` prefix, not this page).
 * Every number here comes from lib/imageedit.ts, so price changes cannot
 * leave the page behind. See docs/image-edit.md.
 */

const PAGE_URL = "https://nanopocket.ai/image-edit";
const LAUNCH = "/image-edit/launch";
const USD = (IMAGEEDIT_CREDITS_PER_EDIT / CREDITS_PER_USD).toFixed(2);
const FREE_EDITS = Math.floor(FREE_DAILY_CREDITS / IMAGEEDIT_CREDITS_PER_EDIT);

export const metadata: Metadata = {
  title: `${IMAGEEDIT_NAME} — Edit Photos by Describing the Change | NanoPocket`,
  description: `Add, remove or replace objects, change text on signs, relight, change the season or restore old photos by describing the edit. Full-resolution output; pixels outside the edit stay identical. ${IMAGEEDIT_CREDITS_PER_EDIT} credits ($${USD}) per edit, with a free daily allowance.`,
  alternates: { canonical: "/image-edit" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: `${IMAGEEDIT_NAME} — describe the edit, keep the rest of the photo`,
    description:
      "Prompt-driven photo editing in the browser. Everything you don't ask to change stays pixel-identical.",
  },
};

const TOOLS = [
  { icon: Wand2, name: "Magic Edit", body: "Paint over an area and say what it should become, or describe a change to the whole photo." },
  { icon: ImagePlus, name: "Add", body: "Add a new object; it is placed and lit to match the scene." },
  { icon: Eraser, name: "Remove", body: "Remove objects or people and fill the background behind them." },
  { icon: Repeat, name: "Replace", body: "Swap one object for another in the same place." },
  { icon: Type, name: "Text", body: "Change the words on signs, packaging or posters, keeping the font style and perspective." },
  { icon: Sun, name: "Light & Style", body: "Relight or colour-grade the whole photo: golden hour, blue hour, film looks." },
  { icon: Leaf, name: "Season", body: "Turn summer into autumn, winter snow or spring blossom." },
  { icon: Sparkles, name: "Restore", body: "Remove scratches and stains from old photos, fix contrast and colourise." },
];

const SAMPLE_CREDITS: { file: string; title: string; url: string; license: string }[] = [
  { file: "lake2", title: "Glencoe Lochan reflections 3 20211022.jpg", url: "https://commons.wikimedia.org/wiki/File:Glencoe_Lochan_reflections_3_20211022.jpg", license: "CC BY-SA 3.0" },
  { file: "park2", title: "Dülmen, Merfeld, Von-Galen-Park -- 2013 -- 2367.jpg", url: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Merfeld,_Von-Galen-Park_--_2013_--_2367.jpg", license: "CC BY-SA 4.0" },
  { file: "room", title: "A table in The Round Table Cafe at Winchester Great Hall 2026-07-12.jpg", url: "https://commons.wikimedia.org/wiki/File:A_table_in_The_Round_Table_Cafe_at_Winchester_Great_Hall_2026-07-12.jpg", license: "CC0" },
  { file: "fruit", title: "Fruit Bowl (4880797613).jpg", url: "https://commons.wikimedia.org/wiki/File:Fruit_Bowl_(4880797613).jpg", license: "CC BY 2.0" },
  { file: "cars", title: "Parked Panek car, Batuty street, Warsaw.jpg", url: "https://commons.wikimedia.org/wiki/File:Parked_Panek_car,_Batuty_street,_Warsaw.jpg", license: "CC BY-SA 4.0" },
  { file: "barber", title: "Barber Storefront with Flag - panoramio.jpg", url: "https://commons.wikimedia.org/wiki/File:Barber_Storefront_with_Flag_-_panoramio.jpg", license: "CC BY-SA 3.0" },
  { file: "trends", title: "Citi Trends Storefront Logo.jpg", url: "https://commons.wikimedia.org/wiki/File:Citi_Trends_Storefront_Logo.jpg", license: "CC BY-SA 4.0" },
  { file: "houses", title: "Cape Town (ZA), Wale Street -- 2024 -- 3544.jpg", url: "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Wale_Street_--_2024_--_3544.jpg", license: "CC BY-SA 4.0" },
  { file: "park", title: "A garden path and lawn Gibberd Garden Essex England.JPG", url: "https://commons.wikimedia.org/wiki/File:A_garden_path_and_lawn_Gibberd_Garden_Essex_England.JPG", license: "CC BY-SA 4.0" },
  { file: "glassplate", title: "Five photographs of Center Street looking east, Monroe, Ohio, 1910 (DPLA)", url: "https://commons.wikimedia.org/wiki/File:Five_photographs_of_Center_Street_looking_east,_Monroe,_Ohio,_1910_February_18_-_DPLA_-_2d4294c2bedb8ac377730ee383ef4b1b_(page_1).jpg", license: "Public domain" },
  { file: "sepia", title: "Jerald Schaitberger … Columbus Circle, October 8, 1910 (LOC cph.3a01149)", url: "https://commons.wikimedia.org/wiki/File:Jerald_Schaitberger_of_416_W._57th_St._N.Y._who_helps_an_older_boy_sell_papers_until_10_P.M._on_Columbus_Circle._7_yrs._old._9-30_P.M.,_October_8,_1910._LOC_cph.3a01149.jpg", license: "Public domain" },
  { file: "hangar", title: "Bazalgette Lancaster FM-159 (51067883253).jpg", url: "https://commons.wikimedia.org/wiki/File:Bazalgette_Lancaster_FM-159_(51067883253).jpg", license: "CC BY 2.0" },
];

const FAQS = [
  {
    q: `How much does ${IMAGEEDIT_NAME} cost?`,
    a: `${IMAGEEDIT_CREDITS_PER_EDIT} credits ($${USD}) per finished edit, prepaid in credits that never expire. Every signed-in account is topped up to ${FREE_DAILY_CREDITS} free credits each day, which covers ${FREE_EDITS === 1 ? "one edit" : `${FREE_EDITS} edits`}. Each variation is a separate edit. An edit that fails or that you cancel is refunded in full. There is no subscription.`,
  },
  {
    q: "Does it change parts of the photo I did not ask to edit?",
    a: "No. For the object tools (add, remove, replace, text and the brush edit), every pixel outside the edited area is kept bit-identical to your photo, and the editor shows how much of the image changed. The whole-photo tools (light & style, season, restore) change the whole image by design, and let you choose how much of your original detail to keep.",
  },
  {
    q: "How long does an edit take?",
    a: "Usually 30 to 50 seconds. The first edit after a quiet period takes one to two minutes longer while a GPU starts up. Several variations of one edit run one after another.",
  },
  {
    q: "What resolution do I get back?",
    a: `The edited photo at the resolution you uploaded, as a lossless PNG, up to ${IMAGEEDIT_MAX_SIDE} px on the long side (larger photos are scaled down to that before editing). No watermark.`,
  },
  {
    q: `Is this the same as the Nano ImageEdit desktop app?`,
    a: `No. ${IMAGEEDIT_NAME} runs in the browser on NanoPocket's GPUs and is paid per edit in credits. Nano ImageEdit is a separate desktop app that runs on your own GPU with a one-time license.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: IMAGEEDIT_NAME,
      url: PAGE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web browser",
      offers: { "@type": "Offer", price: USD, priceCurrency: "USD", description: "Per edit, prepaid in credits; free daily allowance" },
      publisher: { "@type": "Organization", "@id": "https://nanopocket.ai#organization", name: "NanoPocket" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function ImageEditLanding() {
  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="px-6 pb-12 pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Brush className="h-3.5 w-3.5" /> New · runs in your browser
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {IMAGEEDIT_NAME}
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Describe the change and get your photo back at full resolution. Add or remove objects, swap one thing
            for another, rewrite the text on a sign, relight the scene or restore an old print. Everything you
            don&apos;t ask to change stays pixel-identical.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background">
              <Link href={LAUNCH}>
                Open the editor <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              {IMAGEEDIT_CREDITS_PER_EDIT} credits (${USD}) per edit · {FREE_DAILY_CREDITS} free credits every day · failed edits refunded
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Eight tools</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map(({ icon: Icon, name, body }) => (
              <div key={name} className="rounded-2xl border border-border/60 bg-card/50 p-5">
                <Icon className="mb-3 h-5 w-5 text-foreground" />
                <h3 className="mb-1 font-semibold text-foreground">{name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">How it works</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>Sign in, then upload a photo (up to 40 MB) or pick a sample.</li>
            <li>Choose a tool and describe the edit. Paint over an area to limit where it can land.</li>
            <li>
              Press Generate. Compare before and after, chain further edits from any version, and download the
              full-resolution PNG. Ask for up to {IMAGEEDIT_MAX_VARIATIONS} variations at once.
            </li>
          </ol>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Questions</h2>
          <div className="space-y-5">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sample-credits" className="scroll-mt-24 px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-lg font-bold tracking-tight text-foreground">Sample photo credits</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            The sample photos in the editor come from Wikimedia Commons and are shown resized. Edited versions of
            CC BY-SA images are shared under the same licence.
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {SAMPLE_CREDITS.map((c) => (
              <li key={c.file}>
                <a href={c.url} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  {c.title}
                </a>{" "}
                — {c.license}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
