"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt: string;
  width: number;
  height: number;
}

export function BeforeAfterSlider({
  before,
  after,
  alt,
  width,
  height,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [updatePosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const up = () => setIsDragging(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [isDragging]);

  const aspect = `${width} / ${height}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-col-resize select-none overflow-hidden"
      style={{ aspectRatio: aspect }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After image — full layer */}
      <Image
        src={after}
        alt={`${alt} — after`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />

      {/* Before image — clip-path reveals left portion */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`${alt} — before`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-10 w-[2px] bg-white/90"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          boxShadow: "0 0 12px rgba(0,0,0,0.6)",
        }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-white bg-black/30 backdrop-blur-md shadow-xl"
        style={{
          left: `${position}%`,
          transform: `translate(-50%, -50%) scale(${isDragging ? 1.12 : 1})`,
          transition: isDragging ? "none" : "transform 0.2s",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="text-white"
        >
          <path
            d="M6 4L2 9L6 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 4L16 9L12 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Before / After labels */}
      <div
        className="absolute top-3 left-3 z-10 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 transition-opacity duration-200"
        style={{ opacity: position > 12 ? 1 : 0 }}
      >
        Before
      </div>
      <div
        className="absolute top-3 right-3 z-10 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 transition-opacity duration-200"
        style={{ opacity: position < 88 ? 1 : 0 }}
      >
        After
      </div>
    </div>
  );
}
