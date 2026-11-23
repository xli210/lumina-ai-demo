"use client";

import { useEffect, useState } from "react";

/**
 * Days / hours / minutes / seconds to a real deadline (the start of the sale, then its end). Drawn only
 * after mount, so the server and the browser never disagree about the time; until then the boxes show
 * dashes. Nothing here invents urgency: the target is the date the prices actually change.
 */
export function BlackFridayCountdown({
  startsAt,
  endsAt,
  labels,
}: {
  startsAt: number;
  endsAt: number;
  labels: { startsIn: string; endsIn: string; days: string; hours: string; minutes: string; seconds: string };
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const before = now !== null && now < startsAt;
  const target = before ? startsAt : endsAt;
  const ms = now === null ? null : Math.max(0, target - now);
  if (ms === 0) return null;
  const parts =
    ms === null
      ? null
      : [Math.floor(ms / 86_400_000), Math.floor(ms / 3_600_000) % 24, Math.floor(ms / 60_000) % 60, Math.floor(ms / 1000) % 60];
  const names = [labels.days, labels.hours, labels.minutes, labels.seconds];

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">{before ? labels.startsIn : labels.endsIn}</p>
      <div className="flex gap-2 sm:gap-3" role="timer" aria-live="off">
        {names.map((name, i) => (
          <div
            key={name}
            className="flex w-16 flex-col items-center rounded-2xl border border-white/15 bg-white/[0.06] py-2.5 backdrop-blur sm:w-20 sm:py-3"
          >
            <span className="font-mono text-2xl font-bold tabular-nums text-white sm:text-4xl" suppressHydrationWarning>
              {parts ? String(parts[i]).padStart(2, "0") : "--"}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-white/55 sm:text-[11px]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
