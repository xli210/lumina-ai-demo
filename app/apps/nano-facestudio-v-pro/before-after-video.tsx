"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A before/after pair of short clips, one over the other, with a divider the visitor drags (or moves
 * with the arrow keys). The "after" clip follows the "before" clip's time so the two stay in step, and
 * both play only while they are on screen.
 */
export function BeforeAfterVideo({
  before,
  after,
  beforePoster,
  afterPoster,
  beforeLabel = "Original",
  afterLabel = "V Pro",
  className = "",
}: {
  before: string;
  after: string;
  beforePoster: string;
  afterPoster: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState(50);
  const touched = useRef(false);

  // Keep the two clips on the same frame.
  useEffect(() => {
    const lead = a.current;
    const follow = b.current;
    if (!lead || !follow) return;
    const sync = () => {
      if (Math.abs(follow.currentTime - lead.currentTime) > 0.08) follow.currentTime = lead.currentTime;
    };
    lead.addEventListener("timeupdate", sync);
    lead.addEventListener("seeked", sync);
    return () => {
      lead.removeEventListener("timeupdate", sync);
      lead.removeEventListener("seeked", sync);
    };
  }, []);

  // Play only while visible; respect reduced motion (then the posters stay).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let swept = false;
    let raf = 0;
    // The first time the pair comes into view, sweep the divider once so it is clear it can move.
    const sweep = () => {
      const t0 = performance.now();
      const frames: [number, number][] = [
        [0, 50],
        [700, 15],
        [1600, 85],
        [2300, 50],
      ];
      const step = (t: number) => {
        const dt = t - t0;
        if (touched.current) return;
        const k = frames.findIndex(([at]) => at > dt);
        if (k === -1) return setPos(50);
        const [ta, pa] = frames[k - 1];
        const [tb, pb] = frames[k];
        const x = (dt - ta) / (tb - ta);
        setPos(pa + (pb - pa) * (0.5 - Math.cos(Math.PI * x) / 2));
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !swept) {
          swept = true;
          window.setTimeout(sweep, 600);
        }
        for (const v of [a.current, b.current]) {
          if (!v) continue;
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const moveTo = (clientX: number) => {
    touched.current = true;
    const r = wrap.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={wrap}
      className={`relative aspect-video select-none overflow-hidden bg-black ${className}`}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1 || e.pointerType === "mouse") moveTo(e.clientX);
      }}
      style={{ touchAction: "pan-y" }}
    >
      <video
        ref={a}
        src={before}
        poster={beforePoster}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        aria-label={beforeLabel}
      />
      <video
        ref={b}
        src={after}
        poster={afterPoster}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        aria-label={afterLabel}
      />

      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.5)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/50 text-white backdrop-blur">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4 2 8l4 4M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-emerald-400/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => {
          touched.current = true;
          setPos(Number(e.target.value));
        }}
        aria-label={`Drag to compare ${beforeLabel} and ${afterLabel}`}
        className="absolute inset-x-0 bottom-0 h-8 w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
