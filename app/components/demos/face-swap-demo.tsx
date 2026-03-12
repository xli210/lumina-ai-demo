"use client";

import { useState } from "react";

const FACE = "/images/demos/faceswap-face.jpg";
const BODY = "/images/demos/faceswap-body.jpg";
const RESULT = "/images/demos/faceswap-result.jpg";

export function FaceSwapDemo() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex w-full items-center justify-center gap-3 sm:gap-5">
      {/* Face source */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-28 w-24 overflow-hidden rounded-xl border border-white/10 shadow-lg sm:h-36 sm:w-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACE} alt="Source face" className="h-full w-full object-cover" draggable={false} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">Source</span>
      </div>

      {/* Plus sign */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 text-lg font-light sm:h-10 sm:w-10">
        +
      </div>

      {/* Body / Result (swap on hover) */}
      <div
        className="group relative flex flex-col items-center gap-2 cursor-pointer"
        onMouseEnter={() => setRevealed(true)}
        onMouseLeave={() => setRevealed(false)}
        onClick={() => setRevealed((p) => !p)}
      >
        <div className="relative h-44 w-36 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)] sm:h-56 sm:w-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BODY}
            alt="Target body"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: revealed ? 0 : 1 }}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RESULT}
            alt="Face swap result"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: revealed ? 1 : 0 }}
            draggable={false}
          />

          {/* Scanning line animation */}
          <div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 transition-all duration-700"
            style={{
              top: revealed ? "100%" : "0%",
              opacity: revealed ? 0 : 0.6,
            }}
          />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40 transition-colors duration-300">
          {revealed ? "Result" : "Hover to swap"}
        </span>
      </div>

      {/* Equals sign */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 text-lg font-light sm:h-10 sm:w-10">
        =
      </div>

      {/* Result thumbnail (always visible) */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative h-44 w-36 overflow-hidden rounded-2xl border shadow-lg transition-all duration-500 sm:h-56 sm:w-44"
          style={{
            borderColor: revealed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
            opacity: revealed ? 1 : 0.4,
            filter: revealed ? "none" : "blur(8px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={RESULT} alt="Final result" className="h-full w-full object-cover" draggable={false} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">Output</span>
      </div>
    </div>
  );
}
