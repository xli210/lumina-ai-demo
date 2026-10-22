import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { appReleases } from "@/lib/release-data";

/**
 * One page that lists every app's latest release, linking to the full notes. /release-notes
 * used to be a 404, so the per-app release-note pages had no parent. Read from
 * lib/release-data.ts, the same data the per-app pages and the download notice use.
 */

const TITLE = "Release Notes: What Changed in Every App";
const DESCRIPTION =
  "The latest version of every NanoPocket desktop app and what changed in it, with links to each app's full release notes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/release-notes" },
  openGraph: { type: "website", url: "https://nanopocket.ai/release-notes", title: TITLE, description: DESCRIPTION },
};

const HIGHLIGHTS = 3;
const textLink = "font-medium text-primary underline-offset-4 hover:underline";

export default function ReleaseNotesIndex() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: "https://nanopocket.ai/release-notes",
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@type": "WebSite", name: "NanoPocket", url: "https://nanopocket.ai" },
      hasPart: appReleases.map((a) => ({
        "@type": "WebPage",
        name: `${a.app} release notes`,
        url: `https://nanopocket.ai/release-notes/${a.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai" },
        { "@type": "ListItem", position: 2, name: "Release notes", item: "https://nanopocket.ai/release-notes" },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <header className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Release notes</p>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            What changed in each app.
          </h1>
          <p className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            The latest version of every desktop app and what is new in it. Each app&apos;s full history is one click away, and the
            apps themselves are on the <Link href="/apps" className={textLink}>apps page</Link>.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {appReleases.map((a) => {
            const latest = a.releases[0];
            if (!latest) return null;
            return (
              <div key={a.slug} className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-6">
                <h2 className="mb-1 text-lg font-bold text-foreground">
                  <Link href={`/release-notes/${a.slug}`} className="hover:underline">{a.app}</Link>
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">Version {latest.version} · {latest.date}</p>
                <ul className="mb-4 flex-1 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {latest.changes.slice(0, HIGHLIGHTS).map((c) => (
                    <li key={c.text}>{c.text}</li>
                  ))}
                </ul>
                <Link href={`/release-notes/${a.slug}`} className={`${textLink} text-sm`}>
                  All changes <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
