"use client";

import { useRef, useState, useCallback } from "react";

const LOW = "/images/demos/upscale-low.jpg";
const HIGH = "/images/demos/upscale-high.jpg";
const LENS_SIZE = 280;
const HI_RES_SCALE = 2000 / 800;

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

  const half = LENS_SIZE / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl cursor-none select-none transition-all duration-500 hover:border-white/20"
      style={{ aspectRatio: "4 / 3" }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={handleMove}
    >
      {/* Low-res base image — fills the entire container */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOW}
        alt="Low resolution original"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Hover hint */}
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

      {/* Large magnifying lens showing the HQ version */}
      {active && (
        <div
          className="pointer-events-none absolute z-20 rounded-full overflow-hidden"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: `calc(${cursor.x * 100}% - ${half}px)`,
            top: `calc(${cursor.y * 100}% - ${half}px)`,
            border: "3px solid rgba(255,255,255,0.85)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 0 40px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HIGH}
            alt="AI enhanced detail"
            className="absolute"
            style={{
              width: `${HI_RES_SCALE * 100}%`,
              height: `${HI_RES_SCALE * 100}%`,
              left: `${-cursor.x * (HI_RES_SCALE - 1) * 100}%`,
              top: `${-cursor.y * (HI_RES_SCALE - 1) * 100}%`,
              maxWidth: "none",
            }}
            draggable={false}
          />
        </div>
      )}

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90">
        Low-Res Original
      </div>
      {active && (
        <div
          className="pointer-events-none absolute z-30 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90"
          style={{
            left: `calc(${cursor.x * 100}% - 45px)`,
            top: `calc(${cursor.y * 100}% + ${half + 10}px)`,
          }}
        >
          AI Enhanced
        </div>
      )}
    </div>
  );
}
