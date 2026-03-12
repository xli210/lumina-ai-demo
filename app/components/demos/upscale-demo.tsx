"use client";

import { useRef, useState, useCallback } from "react";

const LOW = "/images/demos/upscale-low.jpg";
const HIGH = "/images/demos/upscale-high.jpg";
const MAGNIFIER_SIZE = 200;
const ZOOM = 2.5;

export function UpscaleDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);

  const handleMove = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCursor({
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    });
  }, []);

  const half = MAGNIFIER_SIZE / 2;

  return (
    <div className="flex w-full items-center gap-5 sm:gap-8">
      {/* Small low-res input */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-lg" style={{ width: 140, height: 94 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOW} alt="Low resolution input" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/80 bg-black/40 rounded px-2 py-0.5">
              Low-Res
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/30 font-mono">450×300</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/20">
          <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[8px] font-bold uppercase tracking-wider text-primary/60">AI Enhance</span>
      </div>

      {/* Large enhanced result with magnifier */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl cursor-crosshair select-none transition-all duration-500 hover:border-white/20"
        style={{ aspectRatio: "3 / 2", maxHeight: "55vh" }}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onPointerMove={handleMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HIGH}
          alt="AI enhanced"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* Hover hint */}
        {!active && (
          <div className="absolute inset-0 flex items-end justify-center pb-4">
            <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm px-4 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/70">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-medium text-white/70 tracking-wider uppercase">
                Hover to magnify
              </span>
            </div>
          </div>
        )}

        {/* Magnifying lens */}
        {active && (
          <div
            className="pointer-events-none absolute z-20 rounded-full border-[3px] border-white/80 shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden"
            style={{
              width: MAGNIFIER_SIZE,
              height: MAGNIFIER_SIZE,
              left: `calc(${cursor.x * 100}% - ${half}px)`,
              top: `calc(${cursor.y * 100}% - ${half}px)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HIGH}
              alt="Zoomed detail"
              className="absolute"
              style={{
                width: `${ZOOM * 100}%`,
                height: `${ZOOM * 100}%`,
                left: `${-cursor.x * (ZOOM - 1) * 100}%`,
                top: `${-cursor.y * (ZOOM - 1) * 100}%`,
                maxWidth: "none",
              }}
              draggable={false}
            />
          </div>
        )}

        {/* Labels */}
        <div className="absolute top-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90">
          AI Enhanced
        </div>
        <div className="absolute top-3 right-3 z-10 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-[9px] font-mono text-white/60">
          3000×2000
        </div>
      </div>
    </div>
  );
}
