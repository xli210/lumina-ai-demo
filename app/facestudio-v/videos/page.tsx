import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { hasEverPurchased } from "@/lib/credits-server";
import { createClient } from "@/lib/supabase/server";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { downloadUrl, timeLeft } from "@/lib/facestudio-v-download";
import { studioConfig, videosOf, type MyVideo } from "@/lib/facestudio-v-server";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";

/**
 * /facestudio-v/videos: the signed-in person's videos of the last week.
 *
 * The studio makes a video even when the page that asked for it was closed, and
 * keeps it 24 hours after it was made (7 days once the account has added
 * credits), then deletes it for good (it shows a real person's face). This page is where it can be found again from any device:
 * each row is a reservation of this account with its studio job, settled first,
 * and a ready video gets a short-lived signed download link (lib/facestudio-v-download).
 */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Ui.myVideos");
  return { title: `${t("title")} | ${FACESTUDIO_V_NAME}`, robots: { index: false, follow: false } };
}

// Same keys as FACESTUDIO_V_MODES.
const MODE_KEYS = {
  fast: "modeFast",
  quality: "modeQuality",
  head: "modeHead",
  enhance_fast: "modeEnhanceFast",
  enhance_best: "modeEnhanceBest",
} as const;

export default async function MyVideosPage() {
  const t = await getTranslations("Ui.myVideos");
  const locale = await getLocale();
  const describe = (v: MyVideo, now: number): { text: string; ready: boolean } => {
    if (v.state === "done" && v.keptUntil && v.keptUntil * 1000 > now) {
      return { text: t("ready", { time: timeLeft(v.keptUntil, now) }), ready: true };
    }
    if (v.state === "done" || (v.state === "gone" && v.hold === "captured")) {
      return { text: t("deleted"), ready: false };
    }
    if (v.state === "running" || (v.hold === "open" && v.state !== "error" && v.state !== "cancelled" && v.state !== "gone")) {
      return { text: v.state === "unknown" ? t("makingUnknown") : t("making"), ready: false };
    }
    if (v.state === "cancelled") return { text: t("cancelled"), ready: false };
    return { text: t("notMade"), ready: false };
  };
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
  let paid = false;
  try {
    paid = await hasEverPurchased(user.id);
  } catch (err: unknown) {
    console.error("[facestudio-v] My videos could not tell whether the account has paid:", err instanceof Error ? err.message : err);
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle", { name: FACESTUDIO_V_NAME })}</p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          {paid ? t("noticePaid") : t("noticeFree")}{" "}
          {t("billing")}
          {paid ? null : (
            <>
              {" "}
              {t.rich("addCredits", {
                credits: (chunks) => (
                  <Link href="/credits?from=video_keep" className="font-medium text-primary underline-offset-4 hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </>
          )}
        </div>

        {failed ? (
          <p className="text-sm text-muted-foreground">{t("failed")}</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("empty")}{" "}
            <Link href={FACESTUDIO_V_LAUNCH} className="font-medium text-primary underline-offset-4 hover:underline">
              {t("openStudio")}
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
                      {v.mode && v.mode in MODE_KEYS ? t(MODE_KEYS[v.mode as keyof typeof MODE_KEYS]) : t("video")}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {new Date(v.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {d.text}
                      {v.hold === "captured" ? ` ${t("credits", { count: v.credits })}` : ""}
                    </div>
                  </div>
                  {url ? (
                    <a href={url} className={buttonVariants({ size: "sm" })}>
                      {t("download")}
                    </a>
                  ) : d.ready ? (
                    <span className="text-sm text-muted-foreground">{t("downloadUnavailable")}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          <Link href={FACESTUDIO_V_LAUNCH} className="font-medium text-primary underline-offset-4 hover:underline">
            {t("newVideo")}
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  );
}
