"use client";

import { useState } from "react";

import type { SpotEditResult } from "@/lib/my-images-server";

/** A SpotEdit result in "My images": the original and the edit under one slider, without opening the editor. */
export function SpotEditResultView({
  edit,
  labels,
}: {
  edit: SpotEditResult;
  labels: { before: string; after: string; compare: string };
}) {
  const [pct, setPct] = useState(50);
  const aspect = edit.width && edit.height ? `${edit.width} / ${edit.height}` : undefined;
  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-md border border-border bg-muted"
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- signed storage links, not optimisable */}
      <img src={edit.preview} alt={labels.after} className="block h-full w-full object-contain" loading="lazy" />
      {edit.before ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={edit.before}
            alt={labels.before}
            className="absolute inset-0 block h-full w-full object-contain"
            style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow" style={{ left: `${pct}%` }} />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
            {labels.before}
          </span>
          <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
            {labels.after}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            aria-label={labels.compare}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </>
      ) : null}
    </div>
  );
}
