import Link from "next/link";
import { Sparkles } from "lucide-react";
import { appReleases } from "@/lib/release-data";

/**
 * "A new Nano FaceSwap is out", above the Windows warning on /download.
 * Everything it says about the release comes from lib/release-data.ts, so the
 * version and the list of changes cannot drift from the release notes.
 */
export function NewVersionNotice() {
  const app = appReleases.find((a) => a.slug === "nano-faceswap");
  const latest = app?.releases[0];
  if (!app || !latest) return null;
  // The release before it is where most of the user-visible fixes are.
  const previous = app.releases[1];

  const groups = [latest, previous].filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <section className="px-6 pb-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-sky-500" />
          New: Nano FaceSwap {latest.version}, our free face swap app, is updated
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Here is what changed:
        </p>

        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {groups.map((r) => (
            <div key={r.version}>
              <p className="text-sm font-semibold text-foreground">
                {r.version}
                <span className="ml-2 text-xs font-normal text-muted-foreground">{r.date}</span>
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                {r.changes.map((c) => (
                  <li key={c.text}>{c.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We are updating our other apps one step at a time, and we hope you enjoy what is coming.{" "}
          <a
            href="#nano-faceswap"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Get Nano FaceSwap {latest.version}
          </a>
          {" · "}
          <Link
            href="/release-notes/nano-faceswap"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Full release notes
          </Link>
        </p>
      </div>
    </section>
  );
}
