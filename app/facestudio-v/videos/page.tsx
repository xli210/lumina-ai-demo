import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_MODES, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { downloadUrl, timeLeft } from "@/lib/facestudio-v-download";
import { studioConfig, videosOf, type MyVideo } from "@/lib/facestudio-v-server";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";

/**
 * /facestudio-v/videos: the signed-in person's videos of the last two days.
 *
 * The studio makes a video even when the page that asked for it was closed, and
 * keeps it 24 hours after it was made, then deletes it for good (it shows a real
 * person's face). This page is where it can be found again from any device:
 * each row is a reservation of this account with its studio job, settled first,
 * and a ready video gets a short-lived signed download link (lib/facestudio-v-download).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `My videos | ${FACESTUDIO_V_NAME}`,
  robots: { index: false, follow: false },
};

function describe(v: MyVideo, now: number): { text: string; ready: boolean } {
  if (v.state === "done" && v.keptUntil && v.keptUntil * 1000 > now) {
    return { text: `Ready. Deleted in ${timeLeft(v.keptUntil, now)}.`, ready: true };
  }
  if (v.state === "done" || (v.state === "gone" && v.hold === "captured")) {
    return { text: "Deleted for your privacy, 24 hours after it was made.", ready: false };
  }
  if (v.state === "running" || (v.hold === "open" && v.state !== "error" && v.state !== "cancelled" && v.state !== "gone")) {
    return { text: v.state === "unknown" ? "Being made. The studio could not be reached just now." : "Being made.", ready: false };
  }
  if (v.state === "cancelled") return { text: "Cancelled. Your credits were returned.", ready: false };
  return { text: "This video could not be made. Your credits were returned.", ready: false };
}

export default async function MyVideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent("/facestudio-v/videos")}`);
  }

  let videos: MyVideo[] = [];
  let failed = false;
  try {
    videos = await videosOf(user.id);
  } catch (err: unknown) {
    console.error("[facestudio-v] My videos failed:", err instanceof Error ? err.message : err);
    failed = true;
  }
  const cfg = studioConfig();
  const now = Date.now();

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">My videos</h1>
          <p className="mt-1 text-muted-foreground">{FACESTUDIO_V_NAME}: the videos you made in the last two days.</p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          To protect your privacy, every video is deleted for good 24 hours after it is made. Download the ones you want to
          keep before then. A video that was made is charged, and it is not refunded once it has been deleted. Videos that
          could not be made, or that you cancelled, are never charged.
        </div>

        {failed ? (
          <p className="text-sm text-muted-foreground">Your videos could not be loaded right now. Please try again in a minute.</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No videos in the last two days.{" "}
            <Link href={FACESTUDIO_V_LAUNCH} className="font-medium text-primary underline-offset-4 hover:underline">
              Open the studio
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {videos.map((v) => {
              const d = describe(v, now);
              const url = d.ready && cfg ? downloadUrl(cfg.origin, v.job, v.keptUntil, now) : null;
              return (
                <li key={v.job} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">
                      {(v.mode && FACESTUDIO_V_MODES[v.mode]) || "Video"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {new Date(v.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {d.text}
                      {v.hold === "captured" ? ` ${v.credits} credits.` : ""}
                    </div>
                  </div>
                  {url ? (
                    <a href={url} className={buttonVariants({ size: "sm" })}>
                      Download
                    </a>
                  ) : d.ready ? (
                    <span className="text-sm text-muted-foreground">Download unavailable right now</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          <Link href={FACESTUDIO_V_LAUNCH} className="font-medium text-primary underline-offset-4 hover:underline">
            Make a new video
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  );
}
