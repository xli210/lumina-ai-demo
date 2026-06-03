"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  caption?: string;
  /** Aspect ratio of the rendered slider, e.g. "16/9" or "4/5". Defaults to "1/1". */
  aspect?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
  caption,
  aspect = "1/1",
}: Props) {
  const [pct, setPct] = useState(50);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.max(0, Math.min(100, next)));
  }, []);

  return (
    <figure className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
      <div
        ref={wrapperRef}
        className="relative w-full select-none"
        style={{ aspectRatio: aspect }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleMove(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) handleMove(e.clientX);
        }}
      >
        {/* AFTER (full) */}
        <Image
          src={afterSrc}
          alt={afterLabel}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        {/* BEFORE clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt={beforeLabel}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        {/* Labels */}
        <span className="absolute left-3 top-3 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow">
          Before
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow">
          After · Vivid
        </span>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
        <button
          type="button"
          aria-label="Drag to compare"
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg ring-2 ring-rose-500/60"
          style={{ left: `${pct}%` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Range fallback for keyboard / a11y */}
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => setPct(parseInt(e.target.value, 10))}
          aria-label="Before / after slider"
          className="absolute inset-x-0 bottom-2 mx-auto h-2 w-2/3 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 focus:opacity-100"
        />
      </div>
      {caption ? (
        <figcaption className="px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
