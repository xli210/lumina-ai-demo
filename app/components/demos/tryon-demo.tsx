"use client";

import { useState } from "react";

const MODEL = "/images/demos/tryon-model.jpg";
const CLOTHES = "/images/demos/tryon-clothes.png";
const RESULT = "/images/demos/tryon-result.jpg";

export function TryonDemo() {
  const [applied, setApplied] = useState(false);

  return (
    <div className="flex w-full items-center justify-center gap-4 sm:gap-8">
      {/* Model */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl transition-all duration-500"
          style={{ width: 240, height: 370 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MODEL}
            alt="Model"
            className="h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: applied ? 0.3 : 1 }}
            draggable={false}
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">
            Model
          </div>
        </div>
      </div>

      {/* Floating clothing */}
      <div
        className="flex flex-col items-center gap-2 cursor-pointer"
        onMouseEnter={() => setApplied(true)}
        onMouseLeave={() => setApplied(false)}
        onClick={() => setApplied((p) => !p)}
      >
        <div
          className="relative overflow-hidden rounded-xl transition-all duration-700"
          style={{
            width: 130,
            height: 160,
            transform: applied
              ? "translateX(0px) rotate(0deg) scale(0.9)"
              : "translateX(0px) rotate(-3deg) scale(1)",
            opacity: applied ? 0.4 : 1,
            animation: applied ? "none" : "clothingFloat 3s ease-in-out infinite",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CLOTHES}
            alt="Clothing item"
            className="h-full w-full object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
          {applied ? "Applied!" : "Hover to try on"}
        </span>
      </div>

      {/* Result */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative overflow-hidden rounded-2xl border shadow-xl transition-all duration-700"
          style={{
            width: 240,
            height: 370,
            borderColor: applied ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
            opacity: applied ? 1 : 0.4,
            filter: applied ? "none" : "blur(6px) grayscale(0.5)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={RESULT} alt="Try-on result" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">
            Result
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes clothingFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
