import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import {
  HEADSWAP_PRO_CREDITS_PER_IMAGE,
  HEADSWAP_PRO_MAX_VARIATIONS,
  HEADSWAP_PRO_NAME,
  HEADSWAP_PRO_TAGLINE,
} from "@/lib/headswap-pro";
import { unavailableReason } from "@/lib/headswap-pro-server";
import { Compare, FilmFacade, Reveal, TeaserVideo, type CompareItem } from "./launch-client";

/**
 * The launch page for Nano HeadSwap Pro, laid out like a product keynote: a full-screen opening, a few big
 * statements, the launch film, side-by-side proof, then the plain facts and the price.
 *
 * Weight is the design constraint, because the launch film is long: the film itself is a picture and a button
 * until someone presses play (YouTube is not contacted before that), the opening loop is a 700 KB silent clip that
 * starts only after the page is done loading and never on slow or data-saving connections, the compare images
 * are lazy-loaded WebP, and there is no animation library or web font.
 *
 * The tool itself is the static page at /headswap-pro/index.html. Until the gateway is deployed and HEADSWAP_PRO=1
 * is set, the button says "opening soon" instead of linking to a tool that cannot run.
 */

const URL_ = "https://nanopocket.ai/headswap-pro";
const TITLE = `${HEADSWAP_PRO_NAME}: Put Any Head in Any Photo`;
const DESCRIPTION =
  "Swap the whole head in a portrait or a group photo: face, hair and head shape come from the new head, and the body, the pose and everyone else stay exactly as they were. Up to 4 variations at a time.";
const FILM_ID = "qy2w3wVwZq0";
const FILM_URL = `https://youtu.be/${FILM_ID}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/headswap-pro" },
  openGraph: {
    images: [{ url: "/headswap-pro/og.jpg", width: 1200, height: 630, alt: `${HEADSWAP_PRO_NAME}: ${HEADSWAP_PRO_TAGLINE}` }],
    type: "website",
    url: URL_,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/headswap-pro/og.jpg"] },
};

// Two of the four examples in the worker team's comparison. The other two use real film posters and are not shown (see docs/headswap-pro.md).
const EXAMPLES: CompareItem[] = [
  {
    id: "occlusion",
    title: "A mirror, two fingers on the cheek, a blurred shoulder in front",
    note: "The head is swapped and nothing else: the reflection, the hand on the face and the foreground all stay as shot.",
    ratio: "3 / 2",
    original: "/headswap-pro/compare/ex2_body.webp",
    earlier: "/headswap-pro/compare/ex2_v1.webp",
    pro: "/headswap-pro/compare/ex2_v2.webp",
    face: "/headswap-pro/compare/ex2_face.webp",
  },
  {
    id: "studio",
    title: "An editorial shot with a film camera, a braided strap and art-directed makeup",
    note: "For studio and product work the styling has to survive the swap. Hands and strap stay in front of the face, and the makeup and gaze stay with the original photo.",
    ratio: "3 / 4",
    original: "/headswap-pro/compare/ex3_body.webp",
    earlier: "/headswap-pro/compare/ex3_v1.webp",
    pro: "/headswap-pro/compare/ex3_v2.webp",
    face: "/headswap-pro/compare/ex3_face.webp",
  },
];

const STEPS = [
  { n: "01", title: "Bring the scene", body: "Upload the photo you want to change. People are found automatically. In a group shot, click the one to recast." },
  { n: "02", title: "Cast the lead", body: "Upload the new head: a clear, front-facing photo works best. Its face and its hairstyle come along." },
  { n: "03", title: "Roll", body: `Choose 1 to ${HEADSWAP_PRO_MAX_VARIATIONS} variations and press Swap. A portrait takes about 40 seconds. Drag the slider to compare before and after.` },
];

const FACTS = [
  { k: "The whole head", v: "Face, hair and head shape all come from the new head, not just the face." },
  { k: "Group photos", v: "Click one person. Everyone else, and the whole scene, stay exactly as they are. Our earlier head swap took one face per photo." },
  { k: "Several takes", v: `Ask for up to ${HEADSWAP_PRO_MAX_VARIATIONS} variations in one go and pick the best.` },
  { k: "Full size", v: "The result keeps your photo's resolution. Drop in a big image, get a big image back." },
];

const FAQ = [
  {
    q: "What does it cost?",
    a: `${HEADSWAP_PRO_CREDITS_PER_IMAGE} credits per image ($${(HEADSWAP_PRO_CREDITS_PER_IMAGE / 100).toFixed(2)}). Four variations cost four times as much. The price is shown on the button before you press it, and a swap that fails costs nothing. New accounts get free credits.`,
  },
  {
    q: "Is there a watermark?",
    a: "Results from an account that has never bought credits carry a small NanoPocket.ai watermark. Buy credits once and your results are clean from then on, whatever your balance.",
  },
  {
    q: "What photos work best?",
    a: "For the new head, a clear, front-facing photo with the face fully visible. For the scene photo, any portrait or group photo in which the person you want to change shows their face. Photos up to 25 MB in JPG, PNG or WebP.",
  },
  {
    q: "How long are my pictures kept?",
    a: "Your uploaded photo is kept for up to 3 hours so you can try several heads on it. A finished image can be downloaded for 24 hours.",
  },
  {
    q: "Can I use anyone's photo?",
    a: "Only use photos of people who have agreed to it. You are responsible for making sure your use of the results complies with the law and with other people's rights.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: HEADSWAP_PRO_NAME,
    url: URL_,
    description: DESCRIPTION,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (web browser)",
    publisher: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
    offers: {
      "@type": "Offer",
      price: (HEADSWAP_PRO_CREDITS_PER_IMAGE / 100).toFixed(2),
      priceCurrency: "USD",
      description: "Per image, paid in credits. New accounts get free credits.",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

function YouTubeMark() {
  return (
    <svg width="20" height="14" viewBox="0 0 28 20" aria-hidden="true" className="shrink-0">
      <rect width="28" height="20" rx="5" fill="#ff0033" />
      <path d="M11 6l7 4-7 4z" fill="#fff" />
    </svg>
  );
}

function Cta({ open, className = "" }: { open: boolean; className?: string }) {
  return open ? (
    <a href="/headswap-pro/index.html" className={`inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-black transition hover:bg-white/90 ${className}`}>
      Step on set <ArrowRight className="h-4 w-4" />
    </a>
  ) : (
    <span className={`inline-flex rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white/70 ${className}`}>Opening soon</span>
  );
}

export default function HeadSwapProPage() {
  const open = unavailableReason() === null;
  return (
    <main className="relative min-h-screen bg-black text-white">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />

      {/* 1. The opening */}
      <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden px-6 pb-16 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,160,255,0.22),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl pt-24">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.5em] text-white/65">A NanoPocket original</p>
          <h1 className="text-balance text-6xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl">
            Head<span className="text-white/45">Swap</span> Pro
          </h1>
          <p className="mt-8 text-2xl font-light tracking-[0.4em] text-white/90 sm:text-3xl">{HEADSWAP_PRO_TAGLINE.toUpperCase()}</p>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            Put any head in any photo, portrait or group shot. The new face, the new hair, the same scene.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Cta open={open} />
            <a href={FILM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline">
              <YouTubeMark /> Watch the film on YouTube
            </a>
          </div>
          <p className="mt-6 text-xs tracking-wide text-white/50">
            {HEADSWAP_PRO_CREDITS_PER_IMAGE} credits an image · new accounts get free credits · a failed swap costs nothing
          </p>
        </div>
      </section>

      {/* 1b. The film's own pictures, clear, in a frame under the headline */}
      <section className="px-6 pb-24 sm:pb-32">
        <div className="relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-[0_30px_120px_-30px_rgba(120,160,255,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/headswap-pro/teaser-poster.webp" alt="A still from the HeadSwap Pro launch film: a studio portrait before and after the swap" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <TeaserVideo src="/headswap-pro/teaser.mp4" poster="/headswap-pro/teaser-poster.webp" />
        </div>
      </section>

      {/* 2. The statements */}
      <section className="px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-4xl space-y-10 text-center sm:space-y-14">
          <Reveal>
            <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">One new head.<br /><span className="text-white/45">Any photo.</span></h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-white/65 sm:text-2xl">
              Not just the face: the hair and the shape of the head come with it. And everything you did not ask to change stays exactly as it was.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">Portraits · group shots · mirror selfies · studio work</p>
          </Reveal>
        </div>
      </section>

      {/* 3. The film */}
      <section id="film" className="px-6 pb-28 sm:pb-40">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.5em] text-white/55">The film</p>
            <FilmFacade id={FILM_ID} poster="/headswap-pro/film-poster.webp" title={`${HEADSWAP_PRO_NAME}: the launch film`} />
            <div className="mt-6 flex flex-col items-center gap-2">
              <a
                href={FILM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <YouTubeMark /> Watch on YouTube
              </a>
              <p className="text-xs text-white/50">{FILM_URL.replace("https://", "")} · 53 seconds</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. The proof */}
      <section className="border-t border-white/10 px-6 py-28 sm:py-40">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-balance text-center text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Same photos. <span className="text-white/45">Better heads.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg">
              Each result is a single run with default settings and no retouching. Drag the slider, and switch between our earlier head swap and the original photo.
            </p>
          </Reveal>
          <div className="mt-16 space-y-24">
            {EXAMPLES.map((ex) => (
              <Reveal key={ex.id}>
                <Compare item={ex} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. The facts */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2">
          {FACTS.map((f, i) => (
            <Reveal key={f.k} delay={i * 80}>
              <h3 className="text-base font-semibold uppercase tracking-widest text-white">{f.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{f.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. How it works */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-sm font-medium uppercase tracking-[0.4em] text-white/60">Three steps to the premiere</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="border-l border-white/20 pl-6">
                <p className="text-4xl font-extrabold text-white/25">{s.n}</p>
                <h3 className="mt-3 text-lg font-semibold uppercase tracking-wide">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. The close */}
      <section className="border-t border-white/10 px-6 py-28 text-center sm:py-36">
        <Reveal>
          <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{HEADSWAP_PRO_TAGLINE}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-white/60">
            {HEADSWAP_PRO_CREDITS_PER_IMAGE} credits (${(HEADSWAP_PRO_CREDITS_PER_IMAGE / 100).toFixed(2)}) an image. New accounts get free credits, and a swap that fails costs nothing.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Cta open={open} />
            <Link href={open ? "/credits" : "/contact"} className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
              {open ? "See credit packs" : "Tell us you want in"}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 8. Questions */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-sm font-medium uppercase tracking-[0.4em] text-white/60">Before you roll</h2>
          <div className="space-y-7">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-semibold text-white">{f.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 text-center text-xs text-white/40">
            Nano HeadSwap Pro is made by NanoPocket.ai. For the other tools, see <Link href="/face-studio" className="underline underline-offset-4">Nano FaceStudio Online</Link> and the{" "}
            <Link href="/apps" className="underline underline-offset-4">desktop apps</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
