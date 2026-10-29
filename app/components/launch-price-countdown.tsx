"use client";

import { useEffect, useState } from "react";
import { facestudioProLaunchTimeLeft } from "@/lib/products";

/**
 * "2 days left" for the Nano FaceStudio Pro launch price, from the viewer's clock. Filled in after
 * mount and every minute, so a cached page never shows a stale count; nothing once the price ends.
 */
export function LaunchPriceCountdown({ prefix = "" }: { prefix?: string }) {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setLeft(facestudioProLaunchTimeLeft());
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!left) return null;
  return (
    <span>
      {prefix}
      {left}
    </span>
  );
}
