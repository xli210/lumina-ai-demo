import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";
import { VIDEO_EXAMPLES, VIDEO_EXAMPLES_PATH, videoExamplePath } from "@/lib/video-examples";

const BASE = "https://nanopocket.ai";
const PAGE_URL = `${BASE}${VIDEO_EXAMPLES_PATH}`;
const TITLE = `Video Face Swap Examples: ${VIDEO_EXAMPLES.length} Real Results`;
const DESCRIPTION = `${VIDEO_EXAMPLES.length} real video face swap and head swap results from ${FACESTUDIO_V_NAME}: profile turns, hands over the face, low light, group selfies. Free to start with ${SIGNUP_GRANT_CREDITS} sign-up credits.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: VIDEO_EXAMPLES_PATH },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${BASE}${VIDEO_EXAMPLES[0].thumbnailUrl}` }],
  },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": PAGE_URL,
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${BASE}#website` },
  publisher: { "@id": `${BASE}#organization` },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: VIDEO_EXAMPLES.length,
    itemListElement: VIDEO_EXAMPLES.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}${videoExamplePath(v)}`,
      name: v.title,
    })),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: FACESTUDIO_V_NAME, item: `${BASE}${FACESTUDIO_V_PAGE}` },
    { "@type": "ListItem", position: 3, name: "Examples", item: PAGE_URL },
  ],
};

export default function VideoExamplesPage() {
  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      <section className="px-6 pt-28 pb-10 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            {FACESTUDIO_V_NAME} {FACESTUDIO_V_VERSION}
          </p>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Video face swap examples
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every clip below is a real render from {FACESTUDIO_V_NAME}: one person&apos;s face, or their whole head,
            replaced with a reference photo while everyone else and the original sound stay as filmed. The first five
            are the hard cases: a full profile turn, a hand over the face, an arm sweeping past, low light, a laughing
            head tilt. Footage and faces come from free stock libraries (Pexels, Mixkit) and were used only to test the
            product; only swap a face you have permission to use.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background">
              <Link href={FACESTUDIO_V_PAGE}>
                Try it free to start <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="self-center text-sm text-muted-foreground">
              New accounts get {SIGNUP_GRANT_CREDITS} free credits, enough to try a short clip.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEO_EXAMPLES.map((v) => (
            <li key={v.slug}>
              <Link
                href={videoExamplePath(v)}
                className="group block overflow-hidden rounded-2xl border border-border/60 bg-background/60 transition hover:border-border"
              >
                <div className="relative aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumbnailUrl}
                    alt={`${v.title}: ${v.headSwap ? "head swap" : "face swap"} result`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:scale-110">
                      <Play className="h-5 w-5" />
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {v.headSwap ? "Head swap" : "Face swap"} · {Math.round(v.durationSeconds)} s
                  </p>
                  <h2 className="text-base font-semibold text-foreground">{v.title}</h2>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
