"use client";

import { useEffect, useState } from "react";
import { blackFridayTimeLeft } from "@/lib/black-friday";

/**
 * "23 days left" until the Nano FaceStudio V Pro launch price ends (the end of the Black Friday
 * sale), from the viewer's clock. Filled in after mount and every minute, so a cached page never
 * shows a stale count; nothing once the launch price has ended.
 */
export function VProLaunchCountdown({ prefix = "" }: { prefix?: string }) {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setLeft(blackFridayTimeLeft());
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
