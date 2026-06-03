"use client";

import { useEffect, useState } from "react";
import type { DemoId } from "@/lib/demos";

interface ApiResponse {
  demos: Array<{ id: DemoId; status: "up" | "down" | "unknown" }>;
}

let cached: { data: ApiResponse; ts: number } | null = null;
let inflight: Promise<ApiResponse> | null = null;
const TTL_MS = 60_000;

async function getStatus(): Promise<ApiResponse> {
  const now = Date.now();
  if (cached && now - cached.ts < TTL_MS) return cached.data;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/health/status", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as ApiResponse;
      cached = { data, ts: Date.now() };
      return data;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

interface Props {
  demoId: DemoId;
  /** Render compact (icon + label) on the dark hero cards. */
  variant?: "dark" | "light";
}

export function DemoLiveDot({ demoId, variant = "dark" }: Props) {
  const [status, setStatus] = useState<"up" | "down" | "unknown">("unknown");

  useEffect(() => {
    let alive = true;
    getStatus()
      .then((d) => {
        if (!alive) return;
        const found = d.demos.find((x) => x.id === demoId);
        setStatus(found?.status ?? "unknown");
      })
      .catch(() => {
        if (alive) setStatus("unknown");
      });
    return () => {
      alive = false;
    };
  }, [demoId]);

  if (status === "unknown") return null;

  const isUp = status === "up";
  const dark = variant === "dark";

  if (isUp) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] ring-1 ${
          dark
            ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
            : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30"
        }`}
        title="Live — independent monitor"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Live
      </span>
    );
  }

  return (
    <a
      href="/status"
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] ring-1 ${
        dark
          ? "bg-rose-500/20 text-rose-300 ring-rose-500/40 hover:bg-rose-500/25"
          : "bg-rose-500/10 text-rose-600 ring-rose-500/30 hover:bg-rose-500/15"
      }`}
      title="Down — see status page"
    >
      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
      Down
    </a>
  );
}
