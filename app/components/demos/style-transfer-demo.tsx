"use client";

import { useState } from "react";

const SOURCE = "/images/demos/style-source.jpg";
const STYLE_REF = "/images/demos/style-ref.jpg";
const RESULT = "/images/demos/style-result.jpg";

export function StyleTransferDemo() {
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Top row: Source + Style */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg" style={{ width: 240, height: 240 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SOURCE} alt="Source photo" className="h-full w-full object-cover" draggable={false} />
            <div className="absolute bottom-1.5 left-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">
              Photo
            </div>
          </div>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 text-sm font-light">
          +
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg" style={{ width: 240, height: 240 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STYLE_REF} alt="Style reference" className="h-full w-full object-cover" draggable={false} />
            <div className="absolute bottom-1.5 left-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">
              Style
            </div>
          </div>
        </div>
      </div>

      {/* Arrow down */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-6 w-px bg-gradient-to-b from-white/20 to-white/5" />
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
          <path d="M7 1V13M1 7L7 13L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Result — hover toggles between source and stylized */}
      <div
        className="group relative cursor-pointer"
        onMouseEnter={() => setShowResult(true)}
        onMouseLeave={() => setShowResult(false)}
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/25 hover:shadow-[0_0_40px_rgba(255,255,255,0.06)]"
          style={{ width: 400, height: 400 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SOURCE}
            alt="Original"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: showResult ? 0 : 1 }}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RESULT}
            alt="Stylized result"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: showResult ? 1 : 0 }}
            draggable={false}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">
              {showResult ? "Stylized Output" : "Hover to apply style"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
