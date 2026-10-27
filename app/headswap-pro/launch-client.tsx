"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/**
 * The interactive parts of the HeadSwap Pro launch page. Everything here is built so the page stays light:
 *  - Reveal: text fades in as it scrolls into view (a CSS transition, no animation library).
 *  - TeaserVideo: a 700 KB silent loop that starts only after the page has loaded, never on a slow or data-saving
 *    connection, never for people who asked for reduced motion, and pauses when it is off screen.
 *  - FilmFacade: the full launch film is a picture and a button; YouTube is not contacted until someone presses play.
 *  - Compare: a before/after slider over two lazy-loaded images (an invisible range input, so it works by mouse,
 *    touch and keyboard).
 */

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

type Conn = { saveData?: boolean; effectiveType?: string };

export function TeaserVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: Conn }).connection;
    const slow = conn?.saveData || (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType));
    if (slow || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let io: IntersectionObserver | undefined;
    const start = () => {
      v.src = src;
      v.load();
      v.play().catch(() => {});
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.1 });
      io.observe(v);
    };
    // After the page and its images are done, when the browser is idle, so the video never competes with them.
    const kick = () => ("requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 1500));
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("load", kick);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}

export function FilmFacade({ id, poster, title }: { id: string; poster: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
      {on ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`Play: ${title}`} className="group absolute inset-0 block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <span className="absolute left-1/2 top-1/2 inline-flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-white/25">
            <Play className="ml-1 h-8 w-8" fill="currentColor" />
          </span>
          <span className="absolute bottom-4 left-5 text-xs font-medium uppercase tracking-[0.3em] text-white/80">The launch film · 0:53</span>
        </button>
      )}
    </div>
  );
}

export interface CompareItem {
  id: string;
  title: string;
  note: string;
  ratio: string; // CSS aspect-ratio, e.g. "3 / 2"
  original: string;
  /** The earlier head swap's result. Missing when it could not do this photo at all. */
  earlier?: string;
  pro: string;
  face: string;
  /** CSS object-position for the small picture of the new head. */
  facePosition?: string;
}

type Base = "original" | "earlier";

export function Compare({ item }: { item: CompareItem }) {
  const [chosen, setBase] = useState<Base>("earlier");
  const [pos, setPos] = useState(50);
  const base: Base = item.earlier ? chosen : "original";
  const left = base === "earlier" && item.earlier ? item.earlier : item.original;
  const tab = (b: Base, label: string) => (
    <button
      key={b}
      type="button"
      onClick={() => setBase(b)}
      aria-pressed={base === b}
      className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition ${base === b ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
    >
      {label}
    </button>
  );
  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {item.earlier ? (
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1" role="group" aria-label="Compare HeadSwap Pro with">
            {tab("earlier", "vs earlier head swap")}
            {tab("original", "vs original photo")}
          </div>
        ) : (
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70">Original photo vs HeadSwap Pro</span>
        )}
        <div className="flex items-center gap-3 text-xs text-white/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.face} alt="The new head used" width={56} height={56} loading="lazy" decoding="async" style={{ objectPosition: item.facePosition ?? "center" }} className="h-10 w-14 rounded-md border border-white/15 object-cover" />
          <span>the new head</span>
        </div>
      </div>
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 select-none" style={{ aspectRatio: item.ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.pro} alt={`${item.title}: result with HeadSwap Pro`} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={left} alt={base === "earlier" ? `${item.title}: result of the earlier head swap` : `${item.title}: the original photo`} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white backdrop-blur">
          {base === "earlier" ? "Earlier" : "Original"}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-black">Pro</span>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)]" style={{ left: `${pos}%` }} />
        <div
          className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg"
          style={{ left: `${pos}%` }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Compare ${base === "earlier" ? "the earlier head swap" : "the original"} with HeadSwap Pro`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-4">
        <p className="text-base font-semibold text-white">{item.title}</p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/60">{item.note}</p>
      </figcaption>
    </figure>
  );
}
