import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { Button } from "@/components/ui/button";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";
import {
  VIDEO_EXAMPLES,
  VIDEO_EXAMPLES_PATH,
  isoDuration,
  videoExample,
  videoExamplePath,
} from "@/lib/video-examples";

const BASE = "https://nanopocket.ai";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return VIDEO_EXAMPLES.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

function kind(headSwap: boolean): string {
  return headSwap ? "Head swap" : "Face swap";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = videoExample(slug);
  if (!v) return {};
  const title = `${v.title}: Video ${kind(v.headSwap)} Example`;
  const description = `${v.summary} Made with ${FACESTUDIO_V_NAME}, free to start.`;
  const url = `${BASE}${videoExamplePath(v)}`;
  return {
    title,
    description,
    alternates: { canonical: videoExamplePath(v) },
    openGraph: {
      type: "video.other",
      url,
      title,
      description,
      images: [{ url: `${BASE}${v.thumbnailUrl}` }],
      videos: [{ url: `${BASE}${v.contentUrl}`, type: "video/mp4" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}${v.thumbnailUrl}`] },
  };
}

export default async function VideoExamplePage({ params }: Props) {
  const { slug } = await params;
  const v = videoExample(slug);
  if (!v) notFound();

  const url = `${BASE}${videoExamplePath(v)}`;
  const others = VIDEO_EXAMPLES.filter((o) => o.slug !== v.slug).slice(0, 6);

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: `${v.title}: ${FACESTUDIO_V_NAME}`,
    description: v.summary,
    thumbnailUrl: [`${BASE}${v.thumbnailUrl}`],
    uploadDate: v.uploadDate,
    duration: isoDuration(v.durationSeconds),
    contentUrl: `${BASE}${v.contentUrl}`,
    isFamilyFriendly: true,
    inLanguage: "en",
    publisher: { "@id": `${BASE}#organization` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: FACESTUDIO_V_NAME, item: `${BASE}${FACESTUDIO_V_PAGE}` },
      { "@type": "ListItem", position: 3, name: "Examples", item: `${BASE}${VIDEO_EXAMPLES_PATH}` },
      { "@type": "ListItem", position: 4, name: v.title, item: url },
    ],
  };

  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      <article className="px-6 pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link
            href={VIDEO_EXAMPLES_PATH}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All video face swap examples
          </Link>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            {kind(v.headSwap)} · {FACESTUDIO_V_NAME} {FACESTUDIO_V_VERSION}
          </p>
          <h1 className="mb-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{v.title}</h1>

          <video
            src={v.contentUrl}
            poster={v.thumbnailUrl}
            controls
            playsInline
            preload="metadata"
            className="mb-6 aspect-video w-full rounded-2xl border border-border/60 bg-black"
          />

          <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{v.summary}</p>

          <dl className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-border/60 p-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium text-foreground">{kind(v.headSwap)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Length</dt>
              <dd className="font-medium text-foreground">{Math.round(v.durationSeconds)} s</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Replaced</dt>
              <dd className="font-medium text-foreground">{v.headSwap ? "Face, hair and head shape" : "The face"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Kept as filmed</dt>
              <dd className="font-medium text-foreground">Everyone else, the sound</dd>
            </div>
          </dl>

          <div className="mb-12 rounded-2xl border border-border/60 bg-muted/30 p-6">
            <h2 className="mb-2 text-xl font-bold text-foreground">Make one like this</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Upload a video and a clear photo of the new face, pick the person to change, and {FACESTUDIO_V_NAME}{" "}
              does the rest in your browser. New accounts get {SIGNUP_GRANT_CREDITS} free credits, enough to try a
              short clip; after that each video is paid in credits at a price shown before it starts, with no
              subscription.
            </p>
            <Button asChild className="rounded-full bg-foreground text-background">
              <Link href={FACESTUDIO_V_PAGE}>
                Try {FACESTUDIO_V_NAME} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <h2 className="mb-4 text-xl font-bold text-foreground">More examples</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={videoExamplePath(o)} className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.thumbnailUrl}
                    alt={`${o.title}: ${o.headSwap ? "head swap" : "face swap"} result`}
                    loading="lazy"
                    className="mb-2 aspect-video w-full rounded-xl border border-border/60 object-cover"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:underline">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <Footer />
    </main>
  );
}
