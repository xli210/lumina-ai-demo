#!/usr/bin/env node
/**
 * IndexNow ping script.
 *
 * IndexNow is a free protocol that pushes URL changes directly to Bing,
 * Yandex, Naver, Yep, and Seznam (and through Bing → ChatGPT search). It
 * dramatically reduces the lag between deploying a page and the page being
 * available in those engines from "days" to "minutes".
 *
 *   Spec: https://www.indexnow.org/documentation
 *   API:  https://api.indexnow.org/IndexNow
 *
 * Usage:
 *
 *   # Submit a single URL
 *   node scripts/indexnow.mjs https://nanopocket.ai/face-swap
 *
 *   # Submit a list of URLs from stdin (one per line)
 *   echo -e "https://nanopocket.ai/face-swap\nhttps://nanopocket.ai/" | node scripts/indexnow.mjs --stdin
 *
 *   # Submit every URL in the public sitemap (best run after a deploy)
 *   node scripts/indexnow.mjs --from-sitemap
 *
 * Environment:
 *   INDEXNOW_KEY — 32-character hex IndexNow key. Generate once with
 *                  `openssl rand -hex 16` and host at
 *                  https://nanopocket.ai/<key>.txt with the key as the body.
 *
 * The key file must be reachable at https://nanopocket.ai/<INDEXNOW_KEY>.txt
 * for the protocol to validate the submission. We serve that file via the
 * dynamic Next.js route at app/[indexnow_key].txt/route.ts.
 */

import { argv, env, exit } from "node:process";

const HOST = "nanopocket.ai";
const SITE = `https://${HOST}`;
const SITEMAP_URLS = [
  `${SITE}/sitemap.xml`,
  `${SITE}/sitemap-images.xml`,
];

const INDEXNOW_KEY = env.INDEXNOW_KEY;
if (!INDEXNOW_KEY) {
  console.error("[indexnow] INDEXNOW_KEY is not set in the environment.");
  console.error("[indexnow] Generate one with `openssl rand -hex 16` and add it to .env.local.");
  exit(1);
}

const KEY_LOCATION = `${SITE}/${INDEXNOW_KEY}.txt`;

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks)
    .toString("utf-8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function urlsFromSitemap(sitemapUrl) {
  const res = await fetch(sitemapUrl);
  if (!res.ok) {
    console.error(`[indexnow] failed to fetch ${sitemapUrl}: ${res.status}`);
    return [];
  }
  const xml = await res.text();
  // Accept both <loc>...</loc> and image:loc (we only want page locations,
  // not image locations, so anchor on <loc>...</loc>).
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
    .map((m) => m[1])
    .filter((u) => u.startsWith(SITE));
}

async function gatherUrls() {
  const args = argv.slice(2);
  if (args.includes("--stdin")) {
    return readStdin();
  }
  if (args.includes("--from-sitemap")) {
    const all = [];
    for (const sm of SITEMAP_URLS) {
      const urls = await urlsFromSitemap(sm);
      all.push(...urls);
    }
    return Array.from(new Set(all));
  }
  const direct = args.filter((a) => a.startsWith("http"));
  if (direct.length === 0) {
    console.error("[indexnow] usage:");
    console.error("  node scripts/indexnow.mjs <url> [<url>...]");
    console.error("  node scripts/indexnow.mjs --stdin");
    console.error("  node scripts/indexnow.mjs --from-sitemap");
    exit(1);
  }
  return direct;
}

async function pingIndexNow(urls) {
  // IndexNow accepts up to 10,000 URLs per submission. We chunk just in case.
  const CHUNK = 1000;
  const chunks = [];
  for (let i = 0; i < urls.length; i += CHUNK) chunks.push(urls.slice(i, i + CHUNK));

  let ok = 0;
  let fail = 0;
  for (const chunk of chunks) {
    const body = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: chunk,
    };
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    if (res.ok || res.status === 202) {
      console.log(`[indexnow] submitted ${chunk.length} url(s) — status ${res.status}`);
      ok += chunk.length;
    } else {
      const text = await res.text().catch(() => "");
      console.error(`[indexnow] submission failed: ${res.status} ${res.statusText}`);
      if (text) console.error(`[indexnow] body: ${text.slice(0, 400)}`);
      fail += chunk.length;
    }
  }

  console.log(`[indexnow] done — ${ok} submitted, ${fail} failed`);
  return fail === 0;
}

const urls = await gatherUrls();
if (urls.length === 0) {
  console.error("[indexnow] no URLs to submit.");
  exit(1);
}
console.log(`[indexnow] submitting ${urls.length} url(s) to api.indexnow.org`);
const success = await pingIndexNow(urls);
exit(success ? 0 : 1);
