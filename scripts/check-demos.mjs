#!/usr/bin/env node
/**
 * Pings each demo URL once, records the result in Supabase, and posts a
 * Discord webhook on state transitions (up→down or down→up).
 *
 * Designed to run from GitHub Actions every 5 minutes.
 *
 * Required env:
 *   SUPABASE_URL                — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   — service-role key (bypasses RLS)
 *   DEMO_DISCORD_WEBHOOK        — Discord webhook URL (alerts channel)
 *
 * Optional env:
 *   PING_TIMEOUT_MS             — default 10000
 *   QUIET                       — "1" to suppress per-demo console output
 */

import { createClient } from "@supabase/supabase-js";

// Inlined registry — keep in sync with lib/demos.ts. Duplicated here so
// the script has zero TS / Next dependency at runtime.
const DEMOS = [
  {
    id: "image",
    name: "Image FaceSwap Pro 2.0",
    origin: "https://byte-writers-york-static.trycloudflare.com",
    pingPath: "/login",
  },
  {
    id: "video",
    name: "Video FaceSwap Pro",
    origin: "https://burton-michelle-junior-surge.trycloudflare.com",
    pingPath: "/login",
  },
  {
    id: "vivid",
    name: "NanoFace Vivid",
    origin: "https://plasma-working-null-judgment.trycloudflare.com",
    pingPath: "/",
  },
];

const TIMEOUT = parseInt(process.env.PING_TIMEOUT_MS || "10000", 10);
const QUIET = process.env.QUIET === "1";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DISCORD_WEBHOOK = process.env.DEMO_DISCORD_WEBHOOK;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** A 2xx, 3xx, or 401 response means "tunnel + app are reachable". */
function isHealthyHttp(status) {
  if (status >= 200 && status < 400) return true;
  if (status === 401) return true;
  return false;
}

async function pingOne(demo) {
  const url = `${demo.origin}${demo.pingPath}`;
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: ctrl.signal,
      headers: { "user-agent": "NanoPocket-Uptime/1.0 (+https://nanopocket.ai/status)" },
    });
    const latency = Date.now() - started;
    return {
      demo_id: demo.id,
      url,
      status: isHealthyHttp(res.status) ? "up" : "down",
      http_status: res.status,
      latency_ms: latency,
      error: null,
    };
  } catch (e) {
    const latency = Date.now() - started;
    return {
      demo_id: demo.id,
      url,
      status: "down",
      http_status: null,
      latency_ms: latency,
      error: e?.message || String(e),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Look up the most recent prior status (excluding any rows we'd insert in
 * this run) so we can detect transitions. Returns null if first ever check.
 */
async function getPreviousStatus(demoId) {
  const { data, error } = await supabase
    .from("demo_health_checks")
    .select("status, checked_at")
    .eq("demo_id", demoId)
    .order("checked_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error(`Supabase read failed for ${demoId}:`, error.message);
    return null;
  }
  return data?.[0] ?? null;
}

async function getLastUp(demoId) {
  const { data } = await supabase
    .from("demo_health_checks")
    .select("checked_at")
    .eq("demo_id", demoId)
    .eq("status", "up")
    .order("checked_at", { ascending: false })
    .limit(1);
  return data?.[0]?.checked_at ?? null;
}

async function getLastDown(demoId) {
  const { data } = await supabase
    .from("demo_health_checks")
    .select("checked_at")
    .eq("demo_id", demoId)
    .eq("status", "down")
    .order("checked_at", { ascending: false })
    .limit(1);
  return data?.[0]?.checked_at ?? null;
}

function humanDuration(ms) {
  if (ms == null) return "unknown";
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h} h ${rm} min`;
}

async function postDiscord(payload) {
  if (!DISCORD_WEBHOOK) {
    if (!QUIET) console.warn("DEMO_DISCORD_WEBHOOK not set — skipping alert");
    return;
  }
  try {
    const res = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Discord webhook failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Discord webhook error:", e?.message || e);
  }
}

async function alertTransition(demo, prev, curr) {
  const isDown = curr.status === "down";
  const emoji = isDown ? "🔴" : "🟢";
  const title = isDown
    ? `Demo down — ${demo.name}`
    : `Demo recovered — ${demo.name}`;

  const lines = [];
  lines.push(`URL: ${curr.url}`);
  if (curr.http_status != null) {
    lines.push(`HTTP: ${curr.http_status} · latency ${curr.latency_ms} ms`);
  } else {
    lines.push(`HTTP: error — ${curr.error || "unknown"}`);
  }
  if (isDown) {
    const lastUp = await getLastUp(demo.id);
    if (lastUp) {
      const ago = Date.now() - new Date(lastUp).getTime();
      lines.push(`Last successful check: ${humanDuration(ago)} ago`);
    }
  } else {
    const lastDown = await getLastDown(demo.id);
    if (lastDown) {
      const since = new Date(lastDown).getTime();
      lines.push(`Total downtime: ${humanDuration(Date.now() - since)}`);
    }
  }
  lines.push("Status page: https://nanopocket.ai/status");

  const content = `${emoji} **${title}**\n${lines.join("\n")}`;
  await postDiscord({ content });
}

async function main() {
  let exitCode = 0;
  const results = [];

  for (const demo of DEMOS) {
    const prev = await getPreviousStatus(demo.id);
    const curr = await pingOne(demo);

    if (!QUIET) {
      console.log(
        `[${demo.id}] status=${curr.status} http=${curr.http_status ?? "ERR"} latency=${curr.latency_ms}ms ${curr.error ? `error=${curr.error}` : ""}`,
      );
    }

    const { error: insertErr } = await supabase
      .from("demo_health_checks")
      .insert({
        demo_id: curr.demo_id,
        url: curr.url,
        status: curr.status,
        http_status: curr.http_status,
        latency_ms: curr.latency_ms,
        error: curr.error,
      });
    if (insertErr) {
      console.error(`[${demo.id}] insert failed:`, insertErr.message);
      exitCode = 1;
    }

    if (prev && prev.status !== curr.status) {
      await alertTransition(demo, prev, curr);
    }

    results.push(curr);
  }

  if (!QUIET) {
    const up = results.filter((r) => r.status === "up").length;
    console.log(`\nDone. ${up}/${results.length} demos healthy.`);
  }
  process.exit(exitCode);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(2);
});
