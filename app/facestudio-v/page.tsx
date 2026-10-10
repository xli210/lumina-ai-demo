import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Video } from "lucide-react";

import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { BeforeAfterSlider } from "../components/before-after-slider";
import {
  FACESTUDIO_V_COMING_SOON,
  FACESTUDIO_V_DEMO,
  FACESTUDIO_V_ENDS_AT,
  FACESTUDIO_V_ENDS_LABEL,
  FACESTUDIO_V_FAQ,
  FACESTUDIO_V_LAUNCH,
  FACESTUDIO_V_NAME,
  FACESTUDIO_V_POINTS,
  FACESTUDIO_V_STARTS_AT,
  FACESTUDIO_V_TAG,
  FACESTUDIO_V_TAGLINE,
  FACESTUDIO_V_URL,
  facestudioVHasEnded,
  facestudioVIsOpen,
} from "@/lib/facestudio-v";

/**
 * /facestudio-v: the public, indexable page for the limited Nano
 * FaceStudio-V Online preview.
 *
 * The studio and the demo page sit behind sign-in (/facestudio-v/launch and
 * /facestudio-v/demo/…, see lib/supabase/middleware.ts); this page does not, so
 * search engines and assistants can read what the preview is, when it closes
 * and what it can and cannot do. It states plainly whether the preview is open,
 * has not opened yet, or has ended, computed on each request.
 *
 * Every picture is a frame from a real render of the demo footage (stock
 * clips, faces of other stock models, used only to test the product) and is
 * labelled as AI-generated. Figures are not repeated here: the demo page
 * carries them with their caveats.
 */

export const dynamic = "force-dynamic";

const TITLE = `${FACESTUDIO_V_NAME}: Video Face Swap Preview`;
const DESCRIPTION = `${FACESTUDIO_V_NAME} swaps one person's face, or their whole head, in a video and leaves everyone else and the sound as filmed. ${FACESTUDIO_V_TAG} for registered users, open until ${FACESTUDIO_V_ENDS_LABEL}. ${FACESTUDIO_V_COMING_SOON}.`;
const OG = {
  src: "/images/facestudio-v/og-facestudio-v.jpg",
  width: 1200,
  height: 630,
  alt: `${FACESTUDIO_V_NAME}: a frame from a three-person clip before and after one person's face is swapped`,
};
const abs = (p: string) => `https://nanopocket.ai${p}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "video face swap online",
    "AI video face swap",
    "swap face in video",
    "video head swap",
    "face swap one person in a group video",
    "video face swap keep original sound",
    "Nano FaceStudio-V",
    "video face swap preview",
  ],
  alternates: { canonical: "/facestudio-v" },
  openGraph: {
    type: "website",
    url: FACESTUDIO_V_URL,
    title: `${FACESTUDIO_V_NAME}: ${FACESTUDIO_V_TAG.toLowerCase()}`,
    description: DESCRIPTION,
    images: [{ url: abs(OG.src), width: OG.width, height: OG.height, alt: OG.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${FACESTUDIO_V_NAME}: ${FACESTUDIO_V_TAG.toLowerCase()}`,
    description: DESCRIPTION,
    images: [abs(OG.src)],
  },
};

const EXAMPLES = [
  {
    id: "group",
    title: "Three people in frame, one changes",
    text: "You pick the person. The other two, the street and the sound stay as filmed.",
    before: "/images/facestudio-v/trio-before.jpg",
    after: "/images/facestudio-v/trio-after.jpg",
    alt: "A selfie clip of three friends before and after the face of the person in the middle is replaced; the other two are unchanged. AI-generated test render.",
  },
  {
    id: "outdoors",
    title: "Moving background, natural light",
    text: "A face swap keeps the original hair, head shape and expression.",
    before: "/images/facestudio-v/park-before.jpg",
    after: "/images/facestudio-v/park-after.jpg",
    alt: "A woman outdoors in a park before and after her face is replaced with another face. AI-generated test render.",
  },
  {
    id: "head",
    title: "Head swap: new hair, new head shape",
    text: "Head swap replaces the face, hair and head shape; the body, clothes and room are untouched.",
    before: "/images/facestudio-v/head-before.jpg",
    after: "/images/facestudio-v/head-after.jpg",
    alt: "A smiling man indoors before and after his whole head, including hair, is replaced. AI-generated test render.",
  },
  {
    id: "wide",
    title: "Wide shot: the face is small",
    text: "The coat and the room are not touched.",
    before: "/images/facestudio-v/presenter-before.jpg",
    after: "/images/facestudio-v/presenter-after.jpg",
    alt: "A presenter in a white coat at a desk before and after her face is replaced. AI-generated test render.",
  },
];

const STEPS = [
  { name: "Upload the video", text: "Any clip with a person in it. The video is analysed and every face is found and followed." },
  { name: "Add the reference face", text: "A clear, front-facing photo of the face you want in the video. You confirm you have the right to use that face." },
  { name: "Choose who, get the result", text: "Click the person to replace. Only that person changes, and detail is restored after the swap. With several people you choose; it never guesses." },
];

const eyebrow = "mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary";
const h2 = "text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl";
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default function FaceStudioVPage() {
  const now = Date.now();
  const open = facestudioVIsOpen(now);
  const ended = facestudioVHasEnded(now);

  const status = open
    ? `Open now · closes ${FACESTUDIO_V_ENDS_LABEL}`
    : ended
      ? "The preview has ended"
      : `Opens ${new Date(FACESTUDIO_V_STARTS_AT).toUTCString().replace("GMT", "UTC")}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${FACESTUDIO_V_NAME}: ${FACESTUDIO_V_TAG.toLowerCase()}`,
      description: DESCRIPTION,
      startDate: FACESTUDIO_V_STARTS_AT,
      endDate: FACESTUDIO_V_ENDS_AT,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: { "@type": "VirtualLocation", url: FACESTUDIO_V_URL },
      image: abs(OG.src),
      isAccessibleForFree: true,
      organizer: { "@type": "Organization", "@id": "https://nanopocket.ai#organization", name: "NanoPocket", url: "https://nanopocket.ai" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: FACESTUDIO_V_URL,
        validFrom: FACESTUDIO_V_STARTS_AT,
        validThrough: FACESTUDIO_V_ENDS_AT,
        availability: ended ? "https://schema.org/Discontinued" : "https://schema.org/InStock",
        description: "Free for registered NanoPocket users during the three-day preview.",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${FACESTUDIO_V_URL}#webpage`,
      url: FACESTUDIO_V_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
      primaryImageOfPage: abs(OG.src),
      dateModified: "2026-10-10",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FACESTUDIO_V_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to swap a face in a video with ${FACESTUDIO_V_NAME}`,
      step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
        { "@type": "ListItem", position: 2, name: "Online face swap", item: "https://nanopocket.ai/face-swap" },
        { "@type": "ListItem", position: 3, name: FACESTUDIO_V_NAME, item: FACESTUDIO_V_URL },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 px-6 pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-sky-600/25 blur-[140px]" />
          <div className="absolute -bottom-48 right-0 h-[480px] w-[480px] rounded-full bg-violet-500/15 blur-[140px]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60 ${open ? "animate-ping" : ""}`} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
              </span>
              {FACESTUDIO_V_TAG}
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Swap a face in a video.
              <span className="block bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">
                Leave the rest as filmed.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base text-white/70 sm:text-lg">
              {FACESTUDIO_V_NAME}: {FACESTUDIO_V_TAGLINE}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {open ? (
                <Link
                  href={FACESTUDIO_V_LAUNCH}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg transition-all hover:bg-neutral-100"
                >
                  Sign in and open the preview <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80">
                  {ended ? "Preview ended" : "Not open yet"}
                </span>
              )}
              {open && (
                <Link href={FACESTUDIO_V_DEMO} className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                  See the demo page →
                </Link>
              )}
            </div>
            <p className="mt-5 text-xs text-white/50">{status} · free for registered users · requests are queued</p>
          </div>

          <figure className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-sky-950/50">
              <BeforeAfterSlider before={EXAMPLES[0].before} after={EXAMPLES[0].after} alt={EXAMPLES[0].alt} width={1200} height={675} />
            </div>
            <figcaption className="mt-3 text-center text-xs text-white/50">
              Drag to compare · AI-generated test render: one of three people replaced
            </figcaption>
          </figure>
        </div>

        {/* The bright line: the real thing is coming */}
        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_18px_3px] shadow-sky-400/60" />
          <p className="mt-4 text-center text-sm font-semibold tracking-wide text-white">
            {FACESTUDIO_V_COMING_SOON}
            <span className="ml-2 font-normal text-white/60">
              This is a three-day look at it. The full version is on its way.
            </span>
          </p>
        </div>
      </section>

      {/* What it does */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className={eyebrow}>What you get</p>
          <h2 className={h2}>One person changes. Everything else stays.</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FACESTUDIO_V_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-2xl border border-border/70 p-5 text-sm text-foreground sm:text-base">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Real frames */}
      <section id="examples" className="scroll-mt-24 bg-muted/30 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className={eyebrow}>Real results</p>
            <h2 className={h2}>Drag to compare. Every one is a frame from a real render.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              The clips are stock footage and the faces belong to other stock models, used only to test the
              product. All of it is AI-generated. The demo page has fourteen cases as video.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {EXAMPLES.map((e) => (
              <figure key={e.id} className="overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm">
                <BeforeAfterSlider before={e.before} after={e.after} alt={e.alt} width={1200} height={675} />
                <figcaption className="p-5">
                  <p className="font-semibold text-foreground">{e.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{e.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className={eyebrow}>How it works</p>
          <h2 className={h2}>Three inputs. One result.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.name} className="rounded-2xl border border-border/70 p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest limits */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Good to know</p>
          <h2 className={h2}>What it will not do.</h2>
          <ul className="mt-6 space-y-3">
            {[
              "It will not start until you confirm you have the right to use the reference face. Do not publish swaps of real people without their permission.",
              "When two people are equally prominent it asks you to choose; it does not guess.",
              "Frames where a head turns beyond the usable angle stay as filmed.",
              "It works best with a sharp, front-facing reference photo and a face large enough to see. Heavy lens flare or strong backlight can lose the face for a moment.",
              "It is a limited preview: requests are queued, and the preview closes on " + FACESTUDIO_V_ENDS_LABEL + ".",
            ].map((l) => (
              <li key={l} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 px-6 pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <p className={eyebrow}>Questions</p>
          <h2 className={h2}>Frequently asked.</h2>
          <div className="mt-8 divide-y divide-border rounded-3xl border border-border/70">
            {FACESTUDIO_V_FAQ.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  <h3 className="text-base">{f.q}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border/70 p-7">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Video className="h-5 w-5 text-primary" />
            More from NanoPocket
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/face-studio" className={textLink}>Nano FaceStudio Online</Link>
              <span className="text-muted-foreground"> swaps up to six faces in a photo</span>
            </li>
            <li>
              <Link href="/image-edit" className={textLink}>Nano ImageEdit 2.0 Online</Link>
              <span className="text-muted-foreground"> edits a photo by describing the change</span>
            </li>
            <li>
              <Link href="/face-swap" className={textLink}>All online face swap tools</Link>
            </li>
            <li>
              <Link href="/apps/nano-facestudio-pro" className={textLink}>Nano FaceStudio Pro 1.0</Link>
              <span className="text-muted-foreground"> runs on your own GPU</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-neutral-950 px-8 py-14 text-center text-white">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_14px_2px] shadow-sky-400/60" />
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {open ? "Try it before it closes." : ended ? "The preview has ended." : "The preview opens soon."}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            {open
              ? `Free for registered users until ${FACESTUDIO_V_ENDS_LABEL}. Requests are queued.`
              : `${FACESTUDIO_V_COMING_SOON}. Follow NanoPocket for the announcement.`}
          </p>
          {open && (
            <Link
              href={FACESTUDIO_V_LAUNCH}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 hover:bg-neutral-100"
            >
              Sign in and open the preview <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
