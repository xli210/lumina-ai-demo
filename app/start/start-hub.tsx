"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ScanFace, UserRoundCog, Video, Wand2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { START_TOOLS, type StartToolId } from "@/lib/start-tools";
import type { StartSummary } from "@/lib/start-server";

const ICON = { video: Video, head: UserRoundCog, face: ScanFace, edit: Wand2 };

/** Tools not used yet come first, for anyone who has used one. */
function ordered(summary: StartSummary | null): { id: StartToolId; href: string }[] {
  const tried = summary?.tried ?? [];
  return [...START_TOOLS.filter((t) => !tried.includes(t.id)), ...START_TOOLS.filter((t) => tried.includes(t.id))];
}

export function StartHub() {
  const t = useTranslations("Ui.start");
  const nav = useTranslations("Ui.nav");
  const images = useTranslations("Ui.myImages");
  const videos = useTranslations("Ui.myVideos");
  const locale = useLocale();
  const [summary, setSummary] = useState<StartSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/credits/start")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setSummary)
      .catch(() => setFailed(true));
  }, []);

  const isNew = summary?.tried.length === 0;
  const lowest = summary ? Math.min(...summary.tools.map((x) => x.price)) : 0;

  const priceLine = (id: StartToolId): string => {
    const tool = summary?.tools.find((x) => x.id === id);
    if (!tool) return "";
    if (tool.from) return t("priceFrom", { price: tool.price });
    const count = Math.floor((summary?.available ?? 0) / tool.price);
    return count > 0 ? t("enough", { price: tool.price, count }) : t("price", { price: tool.price });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
      <h1 className="text-3xl font-bold text-foreground">{isNew ? t("titleNew") : t("title")}</h1>
      <p className="mt-2 min-h-6 text-muted-foreground">
        {failed && t("failed")}
        {summary && t("credits", { n: summary.available })}
        {summary && summary.available < lowest && (
          <>
            {" "}
            {t("notEnough")}{" "}
            <Link href="/credits?from=start" className="font-medium text-primary underline-offset-4 hover:underline">
              {t("buy")}
            </Link>
          </>
        )}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {ordered(summary).map(({ id, href }) => {
          const Icon = ICON[id];
          const untried = Boolean(summary) && !summary?.tried.includes(id);
          return (
            <li key={id} className="flex flex-col rounded-lg border border-border p-5">
              <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5 text-primary" />
                {isNew && id === "video" && <span className="text-xs font-medium text-primary">{t("popular")}</span>}
                {!isNew && untried && <span className="text-xs font-medium text-primary">{t("notTried")}</span>}
              </div>
              <h2 className="mt-3 font-semibold text-foreground">{t(`tools.${id}`)}</h2>
              <p className="mt-1 min-h-5 flex-1 text-sm text-muted-foreground">{priceLine(id)}</p>
              <a
                href={href}
                onClick={() => trackEvent("start_tool_click", { tool: id, untried, is_new: isNew })}
                className={`${buttonVariants({ size: "sm", variant: untried ? "default" : "outline" })} mt-4`}
              >
                {untried ? t("try") : t("open")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>

      {summary && summary.recent.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold text-foreground">{t("recent")}</h2>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {summary.recent.map((r) => (
              <li key={r.href} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span className="text-foreground">
                  {t(`tools.${r.tool}`)}
                  <span className="ml-2 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </span>
                <a href={r.href} className="font-medium text-primary underline-offset-4 hover:underline">
                  {t("open")}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {[
          { href: "/facestudio-v/videos", label: videos("title") },
          { href: "/my-images", label: images("title") },
          { href: "/download", label: t("desktop") },
          { href: "/account#invite", label: nav("inviteFriends") },
          { href: "/account", label: nav("account") },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {l.label}
          </Link>
        ))}
      </p>
    </div>
  );
}
