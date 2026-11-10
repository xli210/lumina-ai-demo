"use client";

import { useState } from "react";

import type { ImageResult } from "@/lib/my-images-server";

/**
 * A made picture in "My images", without opening its product: the original and the result under one slider when the original was
 * recorded, the result alone otherwise, and the variations of a HeadSwap Pro swap as thumbnails to pick from.
 */
export function ResultView({
  result,
  labels,
}: {
  result: ImageResult;
  labels: { before: string; after: string; compare: string; variation: string; download: string };
}) {
  const [pct, setPct] = useState(50);
  const [sel, setSel] = useState(0);
  const image = result.images[Math.min(sel, result.images.length - 1)];
  const aspect = result.width && result.height ? `${result.width} / ${result.height}` : undefined;
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div
        className="relative w-full overflow-hidden rounded-md border border-border bg-muted"
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- signed storage links, not optimisable */}
        <img src={image.preview} alt={labels.after} className="block h-full w-full object-contain" loading="lazy" />
        {result.before ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.before}
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
      {result.images.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          {result.images.map((im, i) => (
            <button
              key={im.preview}
              type="button"
              onClick={() => setSel(i)}
              aria-pressed={i === sel}
              aria-label={`${labels.variation} ${i + 1}`}
              className={`h-14 w-14 overflow-hidden rounded border-2 ${i === sel ? "border-primary" : "border-transparent opacity-70"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.preview} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
          <a href={image.download} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {labels.download} {sel + 1}
          </a>
        </div>
      ) : null}
    </div>
  );
}
