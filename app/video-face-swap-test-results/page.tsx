import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";

/**
 * What we measured on Video FaceSwap Online, how, and what it does not show.
 * Every figure here is the one already published on /facestudio-v; this page adds the
 * method and the limits so the numbers can be checked, quoted and argued with.
 */

const URL_ = "https://nanopocket.ai/video-face-swap-test-results";
const TITLE = "Video Face Swap Test Results: Method, Numbers and Limits";
const DESCRIPTION = `What we measured on ${FACESTUDIO_V_NAME} ${FACESTUDIO_V_VERSION}: 74 swapped clips and five hard cases, how similarity was scored, and what the test does not prove. A first look, not a benchmark, with no head-to-head against other tools.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/video-face-swap-test-results" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }],
    type: "article",
    url: URL_,
    title: TITLE,
    description: DESCRIPTION,
  },
};

const RESULTS = [
  {
    metric: "Frames swapped",
    value: "99.6%",
    meaning: "Average share of the chosen person's frames that were swapped, across 74 public clips. The rest are frames where the head turned too far and the swap eased back to the original on purpose.",
  },
  {
    metric: "Match to the reference",
    value: "0.65",
    meaning: "Mean similarity between the result's face and the reference photo, 74 clips. Before the swap the same clips scored 0.08. A score above 0.36 is the usual threshold for \"same person\".",
  },
  {
    metric: "Blank frames",
    value: "0",
    meaning: "Blank frames in the 74 swapped clips. Frame count, frame rate and size matched the input in every clip.",
  },
  {
    metric: "Person left alone",
    value: "0.99",
    meaning: "In a two-person test, the person who was not chosen stayed at 0.99 similarity to their own original.",
  },
  {
    metric: "No usable face",
    value: "~1 in 20",
    meaning: "About 1 in 20 public test clips had no usable face. The studio reported that instead of producing a bad result.",
  },
];

const HARD_CASES = [
  "A head turning from the front to a full profile",
  "A hand covering part of the face, with glasses",
  "Hands in the hair while the head tips back",
  "A low-light shot with the head turning toward the camera",
  "An arm and a phone crossing the face",
];

const NOT_TESTED = [
  "Crowds and sports footage",
  "Masks",
  "Night footage beyond the clips shown",
  "A head-to-head comparison with any other tool. We have not run one, so we do not claim to beat any of them.",
];

const FAQ = [
  {
    q: "How was the match to the reference measured?",
    a: "With the SFace face-recognition model, as the cosine similarity between the face in the result and the reference photo. 0.36 is the usual threshold for \"same person\". Front-facing reference photos give the strongest match.",
  },
  {
    q: "What footage was used?",
    a: "The figures were measured on 80 clips of a public talking-head dataset; 74 swapped clips are behind the averages. The five hard cases on the product page use free stock footage from Mixkit, rendered in Fast mode, and the faces swapped in belong to stock-photo models used only to test the product.",
  },
  {
    q: "Is this a benchmark?",
    a: "No. It is a first look at our own product on footage we chose or could get. It shows the hard cases can work; it does not show how it ranks against other tools, and results depend on your footage and reference photo.",
  },
  {
    q: "Can I check it myself?",
    a: "Yes. A new account gets free credits, and a short Fast-mode clip costs about 20 credits at 1080p, so you can run your own footage. Use a front-facing reference photo, and score the result with any face-recognition model you trust. If you test it against other tools and publish the result, tell us through the contact form.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    url: URL_,
    inLanguage: "en",
    dateModified: "2026-10-24",
    author: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
    publisher: { "@type": "Organization", name: "NanoPocket", url: "https://nanopocket.ai" },
    about: { "@type": "SoftwareApplication", name: FACESTUDIO_V_NAME, url: "https://nanopocket.ai/facestudio-v" },
    disclosure: "Written by the maker of the product being measured. All figures are the maker's own.",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

const link = "font-medium text-primary underline-offset-4 hover:underline";

export default function TestResultsPage() {
  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <article className="px-6 pb-24 pt-28 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Test results</p>
          <h1 className="mb-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            What we measured on video face swap, and what it does not prove
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            These are our own numbers for {FACESTUDIO_V_NAME} {FACESTUDIO_V_VERSION}, written by the people who make it. They are a first
            look, not an independent benchmark, and we have not compared the product with any other tool. The method is below so you can
            check it, and so you know how much weight to give it.
          </p>
          <p className="mb-10 text-sm text-muted-foreground">
            Updated <time dateTime="2026-10-24">2026-10-24</time>. The live examples are on the{" "}
            <Link href="/facestudio-v" className={link}>product page</Link>.
          </p>

          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">The numbers</h2>
          <div className="mb-10 overflow-hidden rounded-2xl border border-border/60">
            {RESULTS.map((r) => (
              <div key={r.metric} className="grid gap-1 border-b border-border/60 bg-card/30 p-5 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">{r.value}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.metric}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.meaning}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">Five hard cases</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Separate from the averages, we rendered five clips we chose because other face swaps tend to fail on them, in Fast mode. You
            can watch each one before and after on the <Link href="/facestudio-v#hard" className={link}>product page</Link>.
          </p>
          <ul className="mb-10 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {HARD_CASES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">What this test does not cover</h2>
          <ul className="mb-10 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {NOT_TESTED.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Questions</h2>
          <div className="mb-10 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 text-base font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
            <h2 className="mb-2 text-lg font-bold text-foreground">Test it on your own footage</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              The honest check is a clip of yours that is hard. A free account is enough to try one. Only swap a face you have permission to use.
            </p>
            <Link href="/facestudio-v" className="inline-block rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90">
              Open {FACESTUDIO_V_NAME}
            </Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
