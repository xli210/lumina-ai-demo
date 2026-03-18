"use client";

import { useState } from "react";

const images = [
  { src: "/images/demos/facialedit-original.jpg", label: "Original" },
  { src: "/images/demos/facialedit-v1.jpg", label: "Smooth" },
  { src: "/images/demos/facialedit-v2.jpg", label: "Brighten" },
  { src: "/images/demos/facialedit-v3.jpg", label: "Contour" },
];

export function FacialEditDemo() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="flex w-full items-end justify-center gap-3 sm:gap-4">
      {images.map((img, i) => {
        const isOriginal = i === 0;
        const isActive = activeIdx === i;

        return (
          <div
            key={img.src}
            className="group flex flex-col items-center gap-2"
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <div
              className="relative overflow-hidden rounded-xl border shadow-lg transition-all duration-500 cursor-pointer"
              style={{
                width: isOriginal ? 260 : 220,
                height: isOriginal ? 400 : 350,
                borderColor: isActive
                  ? "rgba(255,255,255,0.3)"
                  : isOriginal
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.07)",
                transform: isActive ? "translateY(-8px) scale(1.05)" : "translateY(0) scale(1)",
                boxShadow: isActive
                  ? "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.05)"
                  : "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.label}
                className="h-full w-full object-cover transition-transform duration-500"
                style={{ transform: isActive ? "scale(1.06)" : "scale(1)" }}
                draggable={false}
              />

              {isOriginal && (
                <div className="absolute top-2 left-2 rounded-full bg-primary/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Original
                </div>
              )}
            </div>

            <span
              className="text-[10px] font-medium uppercase tracking-widest transition-colors duration-300"
              style={{ color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}
            >
              {img.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
