"use client";

import { useState } from "react";

export function VideoGenDemo() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="flex w-full items-center gap-4 sm:gap-6">
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border transition-all duration-500 ${
          showVideo ? "border-white/5 opacity-60" : "border-white/15"
        }`}
        style={{ width: 180, height: 240 }}
      >
        <img
          src="/images/demos/videogen-ref.jpg"
          alt="Reference image"
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-2 py-1">
          <span className="text-[10px] font-medium text-white/70">Reference</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-white/30">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span className="text-[10px] font-mono">i2v</span>
      </div>

      <div
        className="relative flex-1 overflow-hidden rounded-xl border border-white/15 cursor-pointer"
        onClick={() => setShowVideo((v) => !v)}
      >
        {!showVideo ? (
          <div className="relative">
            <video
              src="/videos/videogen-demo.mp4"
              muted
              playsInline
              className="w-full"
              style={{ aspectRatio: "1280 / 704" }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 transition-transform hover:scale-110">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                  <path d="M6.5 3.5v13l10-6.5z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-3 py-1.5">
              <span className="text-[10px] font-medium text-white/70">Click to play generated video</span>
            </div>
          </div>
        ) : (
          <video
            src="/videos/videogen-demo.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full"
            style={{ aspectRatio: "1280 / 704" }}
          />
        )}
      </div>
    </div>
  );
}
