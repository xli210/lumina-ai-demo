"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";

/** The end of Neo's launch offer (30% fewer credits for Neo videos); the studio stops it at the same moment (STUDIO_NEO_SALE_UNTIL on Render). */
export const NEO_SALE_END = Date.UTC(2026, 10, 28, 3, 0, 0);

/**
 * "Launch week: Neo videos 30% off until …", shown only while the offer runs. Checked in the browser, so a page built before the end
 * still hides it afterwards; nothing is drawn on the server, so it never shows a stale offer.
 */
export function NeoSaleBadge({ text }: { text?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(Date.now() < NEO_SALE_END);
  }, []);
  if (!on || !text) return null;
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-600 dark:text-amber-300">
      <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </p>
  );
}
