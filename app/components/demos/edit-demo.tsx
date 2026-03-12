"use client";

import { useState } from "react";

const variants = [
  { src: "/images/demos/edit-original.jpg", prompt: "Original photo", color: "white/50" },
  { src: "/images/demos/edit-blue.jpg", prompt: '"Make it blue"', color: "blue-400" },
  { src: "/images/demos/edit-gray.jpg", prompt: '"Silver metallic"', color: "slate-400" },
  { src: "/images/demos/edit-red.jpg", prompt: '"Cherry red"', color: "red-400" },
];

export function EditDemo() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
      {variants.map((v, i) => {
        const isActive = hovered === i;
        const isOriginal = i === 0;

        return (
          <div
            key={v.src}
            className="group relative cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="relative overflow-hidden rounded-xl border shadow-lg transition-all duration-500"
              style={{
                aspectRatio: "1",
                borderColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                transform: isActive ? "translateY(-6px) scale(1.03)" : "translateY(0) scale(1)",
                boxShadow: isActive
                  ? "0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.04)"
                  : "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.src}
                alt={v.prompt}
                className="h-full w-full object-cover transition-transform duration-500"
                style={{ transform: isActive ? "scale(1.06)" : "scale(1)" }}
                draggable={false}
              />

              {/* Prompt overlay */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 transition-opacity duration-300"
                style={{ opacity: isActive ? 1 : 0.5 }}
              >
                <p className="text-xs font-mono text-white/80 truncate">
                  {isOriginal ? "Original" : v.prompt}
                </p>
              </div>

              {isOriginal && (
                <div className="absolute top-2 left-2 rounded-full bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
                  Input
                </div>
              )}
              {!isOriginal && (
                <div className="absolute top-2 right-2 rounded-full bg-primary/60 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90">
                  AI Edit
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
