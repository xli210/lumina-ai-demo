import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import {
  HEADSWAP_PRO_CREDITS_PER_IMAGE,
  HEADSWAP_PRO_MAX_VARIATIONS,
  HEADSWAP_PRO_NAME,
  HEADSWAP_PRO_TAGLINE,
} from "@/lib/headswap-pro";
import { unavailableReason } from "@/lib/headswap-pro-server";

/**
 * The launch page for Nano HeadSwap Pro. The tool itself is the static page at /headswap-pro/index.html
 * (the same arrangement as Face Studio); this page is the poster that sends people to it. Until the gateway is
 * deployed and HEADSWAP_PRO=1 is set, the button says "opening soon" instead of linking to a tool that cannot run.
 */

const URL_ = "https://nanopocket.ai/headswap-pro";
const TITLE = `${HEADSWAP_PRO_NAME}: Put Any Head in Any Photo`;
const DESCRIPTION =
  "Swap the whole head in a portrait or a group photo: face, hair and head shape come from the new head, and the body, the pose and everyone else stay exactly as they were. Up to 4 variations at a time.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/headswap-pro" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: HEADSWAP_PRO_NAME }],
    type: "website",
    url: URL_,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "Bring the scene", body: "Upload the photo you want to change. People are found automatically. In a group shot, click the one to recast." },
  { n: "02", title: "Cast the lead", body: "Upload the new head: a clear, front-facing photo works best. Its face and its hairstyle come along." },
  { n: "03", title: "Roll", body: `Choose 1 to ${HEADSWAP_PRO_MAX_VARIATIONS} variations and press Swap. A portrait takes about half a minute for each variation. Drag the slider to compare before and after.` },
];

const FACTS = [
  { k: "The whole head", v: "Face, hair and head shape all come from the new head, not just the face." },
  { k: "Group photos", v: "Click one person. Everyone else, and the whole scene, stay exactly as they are." },
  { k: "Several takes", v: `Ask for up to ${HEADSWAP_PRO_MAX_VARIATIONS} variations in one go and pick the best. The first is ready while the others render.` },
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

export default function HeadSwapProPage() {
  const open = unavailableReason() === null;
  return (
    <main className="relative min-h-screen bg-black text-white">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />

      {/* The poster */}
      <section className="relative overflow-hidden px-6 pb-24 pt-36 text-center sm:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,160,255,0.28),transparent_60%),radial-gradient(ellipse_at_50%_100%,rgba(255,170,90,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.5em] text-white/60">A NanoPocket original</p>
          <h1 className="text-balance text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            Head<span className="text-white/40">Swap</span> Pro
          </h1>
          <p className="mt-6 text-2xl font-light tracking-[0.35em] text-white/90 sm:text-3xl">
            {HEADSWAP_PRO_TAGLINE.toUpperCase()}
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
            Put any head on any photo, portrait or group shot. The new face, the new hair, the same scene.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {open ? (
              <a href="/headswap-pro/index.html" className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-black transition hover:bg-white/90">
                Step on set
              </a>
            ) : (
              <span className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white/70">
                Opening soon
              </span>
            )}
            <Link href={open ? "/credits" : "/contact"} className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
              {open ? "See credit packs" : "Tell us you want in"}
            </Link>
          </div>
          <p className="mt-6 text-xs tracking-wide text-white/45">
            {HEADSWAP_PRO_CREDITS_PER_IMAGE} credits an image · new accounts get free credits · a failed swap costs nothing
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 px-6 py-20">
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

      {/* What it does */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
          {FACTS.map((f) => (
            <div key={f.k}>
              <h3 className="text-base font-semibold uppercase tracking-widest text-white">{f.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{f.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Questions */}
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
