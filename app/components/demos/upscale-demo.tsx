"use client";

import { useRef, useState, useCallback } from "react";

const LOW = "/images/demos/upscale-low.jpg";
const HIGH = "/images/demos/upscale-high.jpg";
const MAGNIFIER_SIZE = 180;
const ZOOM_RATIO = 2000 / 800;

export function UpscaleDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMove = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCursor({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const half = MAGNIFIER_SIZE / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl cursor-none select-none"
      style={{ aspectRatio: "4 / 3" }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={handleMove}
    >
      {/* Low-res base */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOW}
        alt="Low resolution"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Pixelated overlay hint when not hovering */}
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-sm px-6 py-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium text-white/70 tracking-wider uppercase">
              Hover to see enhanced detail
            </span>
          </div>
        </div>
      )}

      {/* Magnifying glass */}
      {active && (
        <div
          className="pointer-events-none absolute z-20 rounded-full border-[3px] border-white/80 shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden"
          style={{
            width: MAGNIFIER_SIZE,
            height: MAGNIFIER_SIZE,
            left: `calc(${cursor.x * 100}% - ${half}px)`,
            top: `calc(${cursor.y * 100}% - ${half}px)`,
            transition: "opacity 0.15s",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HIGH}
            alt="Enhanced detail"
            className="absolute"
            style={{
              width: `${ZOOM_RATIO * 100}%`,
              height: `${ZOOM_RATIO * 100}%`,
              left: `${-cursor.x * (ZOOM_RATIO - 1) * 100}%`,
              top: `${-cursor.y * (ZOOM_RATIO - 1) * 100}%`,
              maxWidth: "none",
            }}
            draggable={false}
          />
        </div>
      )}

      {/* Labels */}
      <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90">
        Low-Res Input
      </div>
      {active && (
        <div
          className="absolute z-30 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90"
          style={{
            left: `calc(${cursor.x * 100}% - 40px)`,
            top: `calc(${cursor.y * 100}% + ${half + 8}px)`,
          }}
        >
          AI Enhanced
        </div>
      )}
    </div>
  );
}
