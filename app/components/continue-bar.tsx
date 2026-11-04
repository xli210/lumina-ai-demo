"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { START_PATH, START_TOOLS } from "@/lib/start-tools";
import type { StartSummary } from "@/lib/start-server";

/**
 * The home page's first line for someone signed in: their credits, a tool they have not used, the way to their tools.
 * It appears in the page, never over it, and only once a session is found, so the HTML stays the same for everyone and
 * signed-out visitors never see it (a panel over their first screen coincided with fewer sign-ups on 10/29).
 *
 * The page's first section keeps its own space for the navbar, so `offsetClass` gives that space to this bar instead.
 */
export function ContinueBar({ offsetClass }: { offsetClass: string }) {
  const t = useTranslations("Ui.start");
  const [summary, setSummary] = useState<StartSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await createClient().auth.getSession();
        if (!data.session?.user) return;
        const r = await fetch("/api/credits/start");
        if (r.ok && !cancelled) setSummary(await r.json());
      } catch {
        /* no bar: the page is the same as for anyone else */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!summary) return null;
  const next = START_TOOLS.find((tool) => !summary.tried.includes(tool.id));

  return (
    <div className={`relative z-10 ${offsetClass}`}>
      <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
        <span className="text-foreground">
          {t("credits", { n: summary.available })}
          {next && <span className="text-muted-foreground"> {t("notTriedTool", { tool: t(`tools.${next.id}`) })}</span>}
        </span>
        <Link
          href={START_PATH}
          onClick={() => trackEvent("continue_bar_click", { untried: Boolean(next) })}
          className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("title")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
