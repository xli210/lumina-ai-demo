import Link from "next/link";
import { BadgeCheck, Sparkles } from "lucide-react";
import { appReleases } from "@/lib/release-data";
import { SIGNED_DOWNLOADS } from "@/lib/download-hashes";

/**
 * "New versions are out", above the Windows warning on /download.
 * Everything it says about a release (version, date, what changed) comes from
 * lib/release-data.ts, and whether a version is signed comes from
 * SIGNED_DOWNLOADS in lib/download-hashes.ts, so the notice cannot drift from the
 * release notes or claim a signature a file does not have.
 */

/** In the order they should be seen: the flagship first. */
const FEATURED = [
  { slug: "nano-facestudio-pro", note: "Our flagship desktop studio" },
  { slug: "nano-facialedit", note: "Free facial editing" },
  { slug: "nano-faceswap", note: "Free face swap" },
] as const;

/** How many changes each card lists; the rest are one click away. */
const HIGHLIGHTS = 3;

export function NewVersionNotice() {
  const cards = FEATURED.flatMap((f) => {
    const app = appReleases.find((a) => a.slug === f.slug);
    const latest = app?.releases[0];
    if (!app || !latest) return [];
    const signed = SIGNED_DOWNLOADS.some((d) => d.app === app.app && d.version === latest.version);
    return [{ ...f, name: app.app, latest, signed }];
  });
  if (cards.length === 0) return null;

  return (
    <section className="px-6 pb-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-sky-500" />
          New versions are out: {cards.map((c) => c.name).join(", ")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Here is what changed in the latest version of each:
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.slug} className="rounded-xl border border-border/60 bg-background/40 p-4">
              <p className="text-sm font-semibold text-foreground">
                {c.name} {c.latest.version}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{c.note}</span>
                <span aria-hidden>·</span>
                <span>{c.latest.date}</span>
                {c.signed && (
                  <span className="inline-flex items-center gap-1 text-emerald-500">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Code-signed
                  </span>
                )}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                {c.latest.changes.slice(0, HIGHLIGHTS).map((ch) => (
                  <li key={ch.text}>{ch.text}</li>
                ))}
              </ul>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <a href={`#${c.slug}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  Get {c.latest.version}
                </a>
                <Link
                  href={`/release-notes/${c.slug}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  All changes
                </Link>
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We are still updating our other local apps, one at a time, and we hope you enjoy what is
          coming.
        </p>
      </div>
    </section>
  );
}
