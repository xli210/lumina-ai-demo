import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";

/**
 * Video head swap, on its own page, so a question about it has one page that answers it.
 *
 * It is deliberately about video only: /headswap-pro already ranks for "online head swap" and keeps
 * photos, so this page's title and text stay off that phrase and link there instead. The clips also
 * carry their VideoObject data on /facestudio-v only, so the two pages do not compete for them.
 *
 * Prices, times and limits are the ones published on public/facestudio-v/index.html (section "New in
 * 2.5") and in FACESTUDIO_V_FAQ; change them there and here together. That every head swap model is
 * a diffusion model was confirmed by the owner on 2026-11-08; which model each one is stays unsaid.
 */

const URL_ = "https://nanopocket.ai/video-head-swap";
const MODIFIED = "2026-11-08";
const TITLE = "AI Video Head Swap: Headswap Best vs Headswap Fast";
const DESCRIPTION =
  "Replace a person's whole head in a video: face, hair and head shape, with the body, clothes, background and sound kept. Headswap Best and Headswap Fast compared on credits, time and limits.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["video head swap", "AI video head swap", "replace head in video", "swap whole head in video", "head swap video hair"],
  alternates: { canonical: "/video-head-swap" },
  openGraph: {
    images: [{ url: "/facestudio-v/media/cmp/hd2_best.jpg", alt: "A video head swap made with Headswap Best on stock footage" }],
    type: "article",
    url: URL_,
    title: TITLE,
    description: DESCRIPTION,
  },
};

const COMPARISON: ReadonlyArray<{ label: string; best: string; fast: string }> = [
  { label: "Time for 100 frames", best: "81–95 s", fast: "42–60 s" },
  { label: "5 s clip", best: "149 credits", fast: "102 credits" },
  { label: "10 s clip", best: "218 credits", fast: "143 credits" },
  { label: "12 s clip", best: "245 credits", fast: "159 credits" },
  { label: "2 s clip, account that has never topped up", best: "80 credits", fast: "50 credits" },
];

const CLIPS = [
  { src: "hd2_orig", label: "Original" },
  { src: "hd2_best", label: "Headswap Best" },
  { src: "hd2_fast", label: "Headswap Fast" },
];

const FAQ = [
  {
    q: "What is a video head swap?",
    a: "A video head swap replaces a person's whole head in a clip: the face, the hair and the head shape all come from one reference photo. The body, clothes, background, everyone else in the shot and the original sound stay as filmed. A video face swap changes only the face and keeps the original hair and head shape.",
  },
  {
    q: "What model does it use?",
    a: "Both Headswap Best and Headswap Fast are diffusion models. A diffusion model redraws the whole head, which is why the hair and head shape can change; a typical GAN face swapper replaces only the inner face.",
  },
  {
    q: "Which should I choose, Headswap Best or Headswap Fast?",
    a: "Headswap Best is for the highest quality. Headswap Fast is about 40% faster and uses about 35% fewer credits, and its quality may be slightly lower. Fast is a sensible first try on a new clip.",
  },
  {
    q: "How long can the clip be?",
    a: "Up to 12 seconds on an account that has topped up credits, and 2 seconds on an account that never has. A clip is counted by its frames, at 30 frames per second at most, so a 60 fps clip counts as twice as long as it plays. For longer clips, a face swap runs up to 60 seconds.",
  },
  {
    q: "How long does it take?",
    a: "Generation takes about 42 to 60 seconds per 100 frames in Headswap Fast and 81 to 95 seconds in Headswap Best, measured on our GPUs with the models already loaded. Requests are queued, so a clip may wait for its turn, and an account that has never topped up waits behind those that have.",
  },
  {
    q: "What does it cost, and what happens if it fails?",
    a: "It is paid for in credits and the exact price is shown before you start. If a video fails, the credits are returned. A head swap cannot be cancelled once you press Create.",
  },
  {
    q: "Can I try it for free?",
    a: `New accounts start with ${SIGNUP_GRANT_CREDITS} free credits, enough for a 2-second head swap. Videos from an account that has never topped up carry a moving NanoPocket watermark; one top-up removes it from later videos and unlocks the full 12 seconds.`,
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
    dateModified: MODIFIED,
    author: { "@id": "https://nanopocket.ai#organization" },
    publisher: { "@id": "https://nanopocket.ai#organization" },
    about: { "@type": "SoftwareApplication", name: FACESTUDIO_V_NAME, url: "https://nanopocket.ai/facestudio-v" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

const h2 = "mb-4 mt-12 text-2xl font-bold tracking-tight text-foreground";
const listItem = "ml-5 list-disc text-sm leading-relaxed text-muted-foreground";

export default function VideoHeadSwapPage() {
  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <article className="px-6 pb-20 pt-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{TITLE}</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            A video head swap replaces a person&apos;s face, hair and head shape from one reference photo. The body, clothes,
            background, everyone else in the shot and the original sound stay as filmed. {FACESTUDIO_V_NAME} does it with two
            diffusion models: Headswap Best and Headswap Fast.
          </p>
          <Link
            href={FACESTUDIO_V_PAGE}
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open {FACESTUDIO_V_NAME}
          </Link>

          <h2 className={h2}>The same clip, both models</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CLIPS.map((c) => (
              <figure key={c.src}>
                <video
                  src={`/facestudio-v/media/cmp/${c.src}.mp4`}
                  poster={`/facestudio-v/media/cmp/${c.src}.jpg`}
                  controls
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="w-full rounded-xl border border-border/60"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">{c.label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            AI-generated test renders on stock footage, with a reference photo of a stock model.
          </p>

          <h2 className={h2}>Headswap Best and Headswap Fast</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium" />
                  <th className="px-4 py-3 font-medium">Headswap Best</th>
                  <th className="px-4 py-3 font-medium">Headswap Fast</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-muted-foreground">{row.label}</th>
                    <td className="px-4 py-3 tabular-nums text-foreground">{row.best}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground">{row.fast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Credits are for 1080p, one person, 30 fps. Times were measured on our GPUs with the models already loaded and do not
            include any wait in the queue. Headswap Fast&apos;s quality may be slightly lower than Headswap Best&apos;s. The exact
            price of your clip is shown before you start.
          </p>

          <h2 className={h2}>Head swap or face swap?</h2>
          <ul className="space-y-2">
            <li className={listItem}><strong className="text-foreground">Head swap</strong>: the hair and head shape matter, or you want a completely new look. Short clips, up to 12 seconds.</li>
            <li className={listItem}><strong className="text-foreground">Face swap</strong>: you want a different face with the same hair and expression, or the clip is long. Up to 60 seconds, and it takes far less time.</li>
          </ul>

          <h2 className={h2}>Where it works best, and where it does not</h2>
          <ul className="space-y-2">
            <li className={listItem}>Use a sharp, front-facing reference photo with the whole face visible.</li>
            <li className={listItem}>The face in the video should be large enough to see clearly, and not covered by hands, microphones or props.</li>
            <li className={listItem}>In heavy lens flare or strong backlight the head can be lost for a moment.</li>
            <li className={listItem}>If two people are equally prominent, the studio asks you to choose instead of guessing.</li>
          </ul>

          <h2 className={h2}>Questions</h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-semibold text-foreground">{f.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Working with a photo instead? <Link href="/headswap-pro" className="font-medium text-primary hover:underline">{HEADSWAP_PRO_NAME}</Link> is
              our tool for images. How diffusion differs from a GAN is in{" "}
              <Link href="/blog/diffusion-head-swap-vs-gan-face-swap" className="font-medium text-primary hover:underline">Diffusion Head Swap vs GAN Face Swap</Link>,
              and live job figures are on the <Link href="/data/face-swap-stats" className="font-medium text-primary hover:underline">statistics page</Link>.
            </p>
            <p className="mt-3">Use a face only if you have the right to. NanoPocket asks you to confirm it before a video starts.</p>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
