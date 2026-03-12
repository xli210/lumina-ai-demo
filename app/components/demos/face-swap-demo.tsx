"use client";

import { useState } from "react";

const FACE = "/images/demos/faceswap-face.jpg";
const BODY = "/images/demos/faceswap-body.jpg";
const RESULT = "/images/demos/faceswap-result.jpg";

export function FaceSwapDemo() {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
      {/* Input column: face + body stacked */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-24 w-20 overflow-hidden rounded-lg border border-white/10 shadow-lg sm:h-28 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACE} alt="Source face" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute bottom-1 left-1 rounded bg-black/50 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/80">
            Face
          </div>
        </div>

        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 text-[10px]">
          +
        </div>

        <div className="relative h-32 w-24 overflow-hidden rounded-lg border border-white/10 shadow-lg sm:h-40 sm:w-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BODY} alt="Target body" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute bottom-1 left-1 rounded bg-black/50 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/80">
            Target
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/25">
          <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Large result — always visible */}
      <div
        className="group relative cursor-pointer"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]"
          style={{ width: 280, height: 380 }}
        >
          {/* Body (before) underneath */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BODY}
            alt="Before swap"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />

          {/* Result (after) on top — always visible, dims on hover to show before briefly */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RESULT}
            alt="Face swap result"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: hovering ? 0 : 1 }}
            draggable={false}
          />

          {/* Scanning line on hover */}
          {hovering && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 animate-[scanDown_1.5s_ease-in-out_infinite]"
            />
          )}

          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90">
            {hovering ? "Original" : "AI Swapped"}
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-widest text-white/35">
          Hover to see original
        </p>

        <style jsx>{`
          @keyframes scanDown {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
