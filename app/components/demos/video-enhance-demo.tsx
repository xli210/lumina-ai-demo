"use client";

import { useRef, useState } from "react";

export function VideoEnhanceDemo() {
  const [playing, setPlaying] = useState(false);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);

  function handleToggle() {
    if (playing) {
      beforeRef.current?.pause();
      afterRef.current?.pause();
    } else {
      beforeRef.current?.play();
      afterRef.current?.play();
    }
    setPlaying((v) => !v);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg cursor-pointer"
            style={{ width: 240, height: 420 }}
            onClick={handleToggle}
          >
            <video
              ref={beforeRef}
              src="/videos/enhance-before.mp4"
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-2 py-1">
              <span className="text-[10px] font-medium text-white/70">Before · Low Quality</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-white/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-mono">4× AI</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className="relative overflow-hidden rounded-xl border border-white/15 shadow-2xl cursor-pointer"
            style={{ width: 240, height: 420 }}
            onClick={handleToggle}
          >
            <video
              ref={afterRef}
              src="/videos/enhance-after.mp4"
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 transition-transform hover:scale-110">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="white">
                    <path d="M6.5 3.5v13l10-6.5z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-2 py-1">
              <span className="text-[10px] font-medium text-white/70">After · AI Enhanced</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
        {playing ? "Click to pause" : "Click to play comparison"}
      </p>
    </div>
  );
}
