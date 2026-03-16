"use client";

import { useRef, useState, useCallback } from "react";

const LOW = "/images/demos/upscale-low.jpg";
const HIGH = "/images/demos/upscale-high.jpg";

const IMG_W = 800;
const IMG_H = 533;

const LENS_SIZE = 300;
const ZOOM = 2.8;

export function UpscaleDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPx, setCursorPx] = useState({ x: 0, y: 0 });
  const [cursorRatio, setCursorRatio] = useState({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);

  const handleMove = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCursorPx(px);
    setCursorRatio({
      x: Math.max(0, Math.min(1, px.x / rect.width)),
      y: Math.max(0, Math.min(1, px.y / rect.height)),
    });
  }, []);

  const half = LENS_SIZE / 2;

  const lensStyle = active
    ? {
        backgroundImage: `url(${HIGH})`,
        backgroundSize: `${(containerRef.current?.offsetWidth ?? IMG_W) * ZOOM}px ${(containerRef.current?.offsetHeight ?? IMG_H) * ZOOM}px`,
        backgroundPosition: `${-cursorPx.x * ZOOM + half}px ${-cursorPx.y * ZOOM + half}px`,
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl cursor-none select-none transition-all duration-500 hover:border-white/20"
      style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={handleMove}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOW}
        alt="Low resolution original"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {!active && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-sm px-6 py-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-medium text-white/70 tracking-wider uppercase">
              Hover to see AI enhanced detail
            </span>
          </div>
        </div>
      )}

      {active && (
        <div
          className="pointer-events-none absolute z-20 rounded-full"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: cursorPx.x - half,
            top: cursorPx.y - half,
            border: "3px solid rgba(255,255,255,0.85)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 0 40px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)",
            ...lensStyle,
          }}
        />
      )}

      <div className="absolute top-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90">
        Low-Res Original
      </div>
      {active && (
        <div
          className="pointer-events-none absolute z-30 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90"
          style={{
            left: `calc(${cursorRatio.x * 100}% - 45px)`,
            top: `calc(${cursorRatio.y * 100}% + ${half + 10}px)`,
          }}
        >
          AI Enhanced
        </div>
      )}
    </div>
  );
}
