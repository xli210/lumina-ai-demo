"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Gauge, ImageIcon, LogIn, Video } from "lucide-react";

interface UsageState {
  signedIn: boolean;
  limit: number;
  image: number;
  video: number;
  day: string;
}

/**
 * Small live counter shown above the three demo cards on /face-swap.
 *
 * - Signed-in users see "3 / 10 image · 1 / 10 video used today" so they
 *   can plan their remaining clicks before hitting /demos/limit.
 * - Anonymous users see a short sign-in prompt (the demos require an
 *   account anyway — see the FAQ on /face-swap).
 * - Loading / fetch-error states render nothing so a Supabase hiccup never
 *   pushes a broken widget onto the page.
 */
export function DemoQuotaWidget() {
  const [state, setState] = useState<UsageState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/demos/usage", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: UsageState) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;
  if (!state) return null;

  if (!state.signedIn) {
    return (
      <div className="mb-6 inline-flex flex-wrap items-center gap-3 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
        <LogIn className="h-3.5 w-3.5" />
        <span>
          The demos are free — {" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            sign up
          </Link>{" "}
          to see today&apos;s remaining quota.
        </span>
      </div>
    );
  }

  const imageLeft = Math.max(0, state.limit - state.image);
  const videoLeft = Math.max(0, state.limit - state.video);
  const imageExhausted = state.image >= state.limit;
  const videoExhausted = state.video >= state.limit;

  return (
    <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.18em]">
        <Gauge className="h-3.5 w-3.5" />
        Today
      </span>
      <QuotaChip
        Icon={ImageIcon}
        label="Image"
        used={state.image}
        left={imageLeft}
        limit={state.limit}
        exhausted={imageExhausted}
      />
      <QuotaChip
        Icon={Video}
        label="Video"
        used={state.video}
        left={videoLeft}
        limit={state.limit}
        exhausted={videoExhausted}
      />
    </div>
  );
}

interface QuotaChipProps {
  Icon: typeof ImageIcon;
  label: string;
  used: number;
  left: number;
  limit: number;
  exhausted: boolean;
}

function QuotaChip({ Icon, label, used, left, limit, exhausted }: QuotaChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 ${
        exhausted
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      }`}
      title={
        exhausted
          ? `${label} quota used up — resets at 00:00 UTC`
          : `${left} ${label.toLowerCase()} opens left today`
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label} {used} / {limit}
    </span>
  );
}
