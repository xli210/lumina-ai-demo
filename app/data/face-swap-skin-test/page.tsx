import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

/**
 * A skin-texture test of NanoPocket's diffusion models against tools anyone can run without an account,
 * made on 2026-11-25. Every number here was measured on the downloaded outputs (scripts and full files in
 * exports-private/quality-test-2026-11-25/, not public). Only HeadSwap Pro and the video models other than
 * Fast are diffusion models (owner, 2026-11-25), so only those are tested. Do not add a tool or a figure
 * that was not run and measured the same way; re-run the whole test before changing a number.
 */

const PAGE_PATH = "/data/face-swap-skin-test";
const PAGE_URL = `https://nanopocket.ai${PAGE_PATH}`;
const TESTED = "2026-11-25";
const TITLE = "Face Swap Skin Test: Which AI Keeps Real Skin Texture?";
const DESCRIPTION =
  "We ran the same AI-generated faces and stock clips through Nano HeadSwap Pro, Neo, FaceFusion, roop and Magic Hour's free tools, then measured how much fine skin detail each result kept. Full-size outputs, method and limits included.";
const MEDIA = "/quality-test/2026-11";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "realistic face swap",
    "face swap plastic skin",
    "face swap skin texture",
    "most realistic AI head swap",
    "FaceFusion vs",
    "inswapper GFPGAN smooth skin",
    "diffusion face swap",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${MEDIA}/p2_headswap_pro.webp`, width: 600, height: 533, alt: "Nano HeadSwap Pro result with forehead wrinkles and pores" }],
  },
};

type Tool = { key: string; name: string; detail: string };

const PHOTO_TOOLS: Tool[] = [
  { key: "headswap_pro", name: "Nano HeadSwap Pro", detail: "Ours. Diffusion head swap, 1 variation, default settings." },
  {
    key: "facefusion_hyperswap1b",
    name: "FaceFusion 3.3.2, HyperSwap 1b 256",
    detail: "Open source. Community Hugging Face Space V0pr0S/FaceFusion-Face-Swap-Hyperswap, its recommended model, no face enhancer.",
  },
  {
    key: "roop_inswapper128_gfpgan",
    name: "roop (inswapper_128 + GFPGAN)",
    detail: "Open source, the classic pipeline. Community Space aiguruji97/facefusion, “Enhance face quality with GFPGAN” on.",
  },
  {
    key: "magichour_free",
    name: "Magic Hour, free head swap",
    detail: "No sign-up tier. Returned a 640×344 image; Magic Hour says signing up gives higher-resolution outputs.",
  },
];

/** Skin detail: std of the Laplacian on left cheek, right cheek, forehead, every image resampled to 2080 px wide. */
const PHOTO_PAIRS: {
  n: number;
  label: string;
  target: [number, number, number];
  scores: Record<string, [number, number, number]>;
}[] = [
  {
    n: 1,
    label: "Pair 1: smooth young face, new head with stubble",
    target: [32.0, 29.9, 29.8],
    scores: {
      headswap_pro: [21.8, 20.9, 20.3],
      facefusion_hyperswap1b: [10.0, 9.3, 9.8],
      roop_inswapper128_gfpgan: [3.0, 3.1, 5.6],
      magichour_free: [1.4, 1.3, 1.2],
    },
  },
  {
    n: 2,
    label: "Pair 2: new head with deep wrinkles and age spots",
    target: [15.6, 11.7, 16.1],
    scores: {
      headswap_pro: [17.7, 16.3, 28.9],
      facefusion_hyperswap1b: [5.1, 4.0, 5.9],
      roop_inswapper128_gfpgan: [2.5, 2.3, 4.6],
    },
  },
  {
    n: 3,
    label: "Pair 3: new head with freckles",
    target: [24.2, 22.5, 28.5],
    scores: {
      headswap_pro: [25.3, 24.1, 21.5],
      facefusion_hyperswap1b: [7.9, 7.5, 9.9],
      roop_inswapper128_gfpgan: [5.1, 4.7, 7.8],
    },
  },
];

/** Averages over every 8th frame of a 4-second clip, face region resampled to 600 px wide. */
const VIDEO_CLIPS: {
  n: number;
  label: string;
  frames: number;
  original: [number, number, number];
  neo: [number, number, number];
  magichour: [number, number, number];
}[] = [
  { n: 1, label: "Clip 1: smiling man, indoors", frames: 7, original: [5.8, 2.7, 2.6], neo: [7.0, 4.3, 4.1], magichour: [1.8, 1.1, 1.0] },
  { n: 2, label: "Clip 2: smiling woman, shallow focus", frames: 12, original: [2.8, 3.0, 2.3], neo: [2.9, 3.3, 1.9], magichour: [1.7, 1.5, 1.0] },
];

const avg = (v: [number, number, number]) => ((v[0] + v[1] + v[2]) / 3).toFixed(1);

function articleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": PAGE_URL,
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: TESTED,
    dateModified: TESTED,
    author: { "@id": "https://nanopocket.ai#organization" },
    publisher: { "@id": "https://nanopocket.ai#organization" },
    image: `https://nanopocket.ai${MEDIA}/p2_headswap_pro.webp`,
    about: ["AI face swap", "AI head swap", "skin texture", "image quality"],
  };
}

function Figure({ src, caption, full }: { src: string; caption: string; full?: string }) {
  return (
    <figure className="min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} loading="lazy" className="w-full rounded-lg border border-border" />
      <figcaption className="mt-1 text-xs leading-snug text-muted-foreground">
        {caption}
        {full && (
          <>
            {" · "}
            <a href={full} className="text-primary hover:underline">full size</a>
          </>
        )}
      </figcaption>
    </figure>
  );
}

export default function SkinTestPage() {
  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd()) }} />
      <Navbar />
      <article className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <p className="text-sm text-muted-foreground">Tested {TESTED} · by NanoPocket, the maker of two of the tools tested</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{TITLE}</h1>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 text-foreground">
          <h2 className="text-lg font-semibold">Short answer</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            On the same inputs, <strong className="text-foreground">Nano HeadSwap Pro</strong> kept two to seven times more
            fine skin detail than FaceFusion and roop, and carried the new person&apos;s wrinkles, age spots and freckles into
            the photo. In video, <strong className="text-foreground">Neo</strong> (Best quality in Video FaceSwap Online) kept
            about as much skin detail as the original clip, at 1080p. Magic Hour&apos;s free, no-sign-up tools returned
            640-pixel-wide results, soft when viewed at the same size. Both NanoPocket models are diffusion models: they draw
            the face again at full resolution instead of pasting a small generated face and sharpening it.
          </p>
        </section>

        <section id="setup" className="mt-10 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">What we ran</h2>
          <p>
            <strong className="text-foreground">Photos.</strong> Three pairs of AI-generated studio portraits (2816×1536, made
            with Google Gemini; no real person). Each tool got the same photo and the same new face, default settings, one run.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {PHOTO_TOOLS.map((t) => (
              <li key={t.key}>
                <strong className="text-foreground">{t.name}</strong>: {t.detail}
              </li>
            ))}
          </ul>
          <p>
            <strong className="text-foreground">Video.</strong> Two 4-second 1280×720 clips of free stock footage (the clips
            on our video page) with an AI-generated face as the new face: <strong className="text-foreground">Neo</strong> at 1080p in{" "}
            <Link href="/facestudio-v" className="text-primary hover:underline">Video FaceSwap Online</Link> against Magic
            Hour&apos;s free video face swap (640×360, with a Magic Hour watermark).
          </p>
          <p>
            HeadSwap Pro replaces the whole head; FaceFusion and roop replace the inner face and keep the original hair and
            head shape. Skin detail is compared on the cheeks and forehead, which every tool redraws.
          </p>
        </section>

        <section id="photo" className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">Photo results</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Skin detail = how much fine texture (pores, stubble, fine lines) is left, measured on the left cheek, right cheek and
            forehead after scaling every image to 2080 pixels wide. Higher is more detail. The photo before the swap is shown
            for reference.
          </p>
          {PHOTO_PAIRS.map((pair) => {
            const tools = PHOTO_TOOLS.filter((t) => pair.scores[t.key]);
            return (
              <div key={pair.n} className="mt-8">
                <h3 className="font-semibold text-foreground">{pair.label}</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <Figure src={`${MEDIA}/p${pair.n}_target.webp`} caption="Photo before" full={`${MEDIA}/p${pair.n}_target_full.webp`} />
                  <Figure src={`${MEDIA}/p${pair.n}_reference.webp`} caption="New face" full={`${MEDIA}/p${pair.n}_reference_full.webp`} />
                  {tools.map((t) => (
                    <Figure key={t.key} src={`${MEDIA}/p${pair.n}_${t.key}.webp`} caption={t.name} full={`${MEDIA}/p${pair.n}_${t.key}_full.webp`} />
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Cheek close-up, same area and size for every result:</p>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <Figure src={`${MEDIA}/p${pair.n}_target_zoom.webp`} caption="Photo before" />
                  {tools.map((t) => (
                    <Figure key={t.key} src={`${MEDIA}/p${pair.n}_${t.key}_zoom.webp`} caption={t.name} />
                  ))}
                </div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Skin detail</th>
                        <th className="px-4 py-2 text-right font-medium">Left cheek</th>
                        <th className="px-4 py-2 text-right font-medium">Right cheek</th>
                        <th className="px-4 py-2 text-right font-medium">Forehead</th>
                        <th className="px-4 py-2 text-right font-medium">Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{ name: "Photo before (reference)", v: pair.target }, ...tools.map((t) => ({ name: t.name, v: pair.scores[t.key] }))].map((row) => (
                        <tr key={row.name} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-2 text-foreground">{row.name}</td>
                          {row.v.map((x, i) => (
                            <td key={i} className="px-4 py-2 text-right tabular-nums text-foreground">{x.toFixed(1)}</td>
                          ))}
                          <td className="px-4 py-2 text-right font-medium tabular-nums text-foreground">{avg(row.v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>

        <section id="video" className="mt-14">
          <h2 className="text-xl font-semibold text-foreground">Video results</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Skin detail averaged over every 8th frame, on the face area scaled to the same size for each video. Video is
            compressed, so the numbers are lower than for photos; compare them within a clip.
          </p>
          {VIDEO_CLIPS.map((c) => (
            <div key={c.n} className="mt-8">
              <h3 className="font-semibold text-foreground">{c.label}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "original", name: "Original clip (1280×720)" },
                  { k: "neo", name: "Neo, NanoPocket (1080p)" },
                  { k: "magichour_free", name: "Magic Hour free (640×360)" },
                ].map((v) => (
                  <figure key={v.k} className="min-w-0">
                    <video src={`${MEDIA}/v${c.n}_${v.k}.mp4`} controls muted loop playsInline preload="metadata" className="w-full rounded-lg border border-border" />
                    <figcaption className="mt-1 text-xs text-muted-foreground">{v.name}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[3fr_1fr]">
                <Figure src={`${MEDIA}/v${c.n}_frame48.webp`} caption="Frame 48, face area at the same size: original, Neo, Magic Hour free" />
                <Figure src={`${MEDIA}/v${c.n}_reference.webp`} caption="New face (AI-generated)" />
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Skin detail ({c.frames} frames)</th>
                      <th className="px-4 py-2 text-right font-medium">Left cheek</th>
                      <th className="px-4 py-2 text-right font-medium">Right cheek</th>
                      <th className="px-4 py-2 text-right font-medium">Forehead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Original clip", v: c.original },
                      { name: "Neo (NanoPocket)", v: c.neo },
                      { name: "Magic Hour free", v: c.magichour },
                    ].map((row) => (
                      <tr key={row.name} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2 text-foreground">{row.name}</td>
                        {row.v.map((x, i) => (
                          <td key={i} className="px-4 py-2 text-right tabular-nums text-foreground">{x.toFixed(1)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        <section id="why" className="mt-14 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Why many face swaps look plastic</h2>
          <p>
            The classic open-source swapper, <strong className="text-foreground">inswapper_128</strong> (used by roop and as an
            option in FaceFusion), generates the new face at 128×128 pixels. That face is enlarged to fit the photo and usually
            passed through a face restorer such as GFPGAN or GPEN to look sharp again. A restorer invents a clean, even skin
            instead of the person&apos;s real pores and lines, which is the smooth, airbrushed look in the roop column above.
            Newer swappers such as HyperSwap work at 256×256: better, but on a face that fills a large photo, most of the fine
            texture is still gone.
          </p>
          <p>
            Diffusion models work differently: they draw the face, or the whole head, again at the resolution of the photo,
            guided by the new person&apos;s photo. Texture such as pores, stubble, wrinkles and freckles is drawn as part of the
            face, not added afterwards. Nano HeadSwap Pro and the Neo, Headswap Fast and Headswap Best video modes are diffusion
            models. More background:{" "}
            <Link href="/blog/diffusion-head-swap-vs-gan-face-swap" className="text-primary hover:underline">Diffusion Head Swap vs GAN Face Swap</Link>.
          </p>
        </section>

        <section id="limits" className="mt-12 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Method and limits</h2>
          <p>
            <strong className="text-foreground">The measure.</strong> On a fixed patch of each cheek and the forehead, we take the
            standard deviation of the Laplacian of the brightness (a common sharpness measure), after scaling every image to the
            same width with Lanczos resampling. It counts fine texture, so it rewards real pores and stubble, and also noise; that
            is why the close-ups are shown next to the numbers. It does not measure how much the result looks like the new person.
          </p>
          <p>
            <strong className="text-foreground">Small test.</strong> Three front-facing studio portraits and two short, well-lit
            clips, one run each. Hard angles, low light, hands in front of the face and long videos were not part of this test.
          </p>
          <p>
            <strong className="text-foreground">Free tiers.</strong> Magic Hour was tested without an account, as most people try
            it; its paid plans may give larger outputs. FaceFusion and roop were run in community Hugging Face Spaces with the
            settings each Space recommends; installed locally with other settings they can look different.
          </p>
          <p>
            <strong className="text-foreground">Not neutral.</strong> We make HeadSwap Pro and Neo. Every photo input and output is
            linked at full size (WebP at quality 92; the numbers were measured on the original downloads), and the videos are the
            files each tool returned, so the comparison can be checked or repeated.
          </p>
        </section>

        <section className="mt-12 flex flex-wrap gap-3">
          <Link href="/headswap-pro" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Try Nano HeadSwap Pro
          </Link>
          <Link href="/facestudio-v" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            Try Neo in Video FaceSwap Online
          </Link>
          <Link href="/data/face-swap-stats" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            Live job statistics
          </Link>
        </section>
      </article>
      <Footer />
    </main>
  );
}
