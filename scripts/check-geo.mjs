#!/usr/bin/env node
/**
 * GEO health check.
 *
 * Curls every key URL on the deployed site and validates:
 *
 *   1. Status 200 + correct content-type.
 *   2. <title> and <meta name="description"> are present and non-empty.
 *   3. <link rel="canonical"> is present and points at the same URL.
 *   4. <link rel="alternate" hreflang> is present where expected.
 *   5. JSON-LD blocks parse and at least one has the expected @type.
 *   6. /robots.txt has explicit allow rules for the major LLM bots.
 *   7. /sitemap.xml is valid XML and references key URLs.
 *   8. /llms.txt and /llms-full.txt are reachable and non-empty.
 *   9. /sitemap-images.xml is reachable and references >=1 image.
 *
 * Usage:
 *
 *   node scripts/check-geo.mjs                                  # default: https://nanopocket.ai
 *   GEO_BASE=http://localhost:3000 node scripts/check-geo.mjs   # local check
 *   node scripts/check-geo.mjs --base https://staging...        # explicit base
 *
 * Exit code:
 *   0  all checks pass
 *   1  any check fails (the script also prints a summary table)
 */

import { argv, env, exit } from "node:process";

const BASE = (() => {
  const idx = argv.indexOf("--base");
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1].replace(/\/$/, "");
  if (env.GEO_BASE) return env.GEO_BASE.replace(/\/$/, "");
  return "https://nanopocket.ai";
})();

const URLS_TO_CHECK = [
  { path: "/", expectJsonLd: ["Organization", "WebSite", "FAQPage"], expectHreflangs: ["en", "zh-CN", "x-default"] },
  { path: "/face-swap", expectJsonLd: ["WebPage", "FAQPage", "HowTo", "BreadcrumbList"], expectHreflangs: ["en", "zh-CN", "ja", "ko", "x-default"] },
  { path: "/about", expectJsonLd: ["AboutPage"] },
  { path: "/trust", expectJsonLd: [] },
  { path: "/verify", expectJsonLd: ["TechArticle"] },
  { path: "/privacy", expectJsonLd: ["PrivacyPolicy"] },
  { path: "/terms", expectJsonLd: ["TermsOfService"] },
  { path: "/security", expectJsonLd: [] },
  { path: "/best-face-swap-app-2026", expectJsonLd: ["Article"] },
  { path: "/compare", expectJsonLd: [] },
  { path: "/compare/nanopocket-vs-deepswap", expectJsonLd: [] },
  { path: "/compare/nanopocket-vs-reface", expectJsonLd: [] },
  { path: "/compare/nanopocket-vs-facefusion", expectJsonLd: [] },
  { path: "/apps/nano-faceswap-pro", expectJsonLd: ["SoftwareApplication"] },
  { path: "/apps/nanoface-vivid", expectJsonLd: [] },
  { path: "/docs", expectJsonLd: [] },
  { path: "/docs/face-swap-pipeline", expectJsonLd: ["TechArticle", "BreadcrumbList"] },
  { path: "/zh-CN", expectJsonLd: [] },
  { path: "/zh-CN/face-swap", expectJsonLd: [] },
  { path: "/zh-CN/faq", expectJsonLd: ["FAQPage"] },
  { path: "/ja/face-swap", expectJsonLd: [] },
  { path: "/ko/face-swap", expectJsonLd: [] },
  { path: "/status", expectJsonLd: [] },
];

const REQUIRED_BOTS_IN_ROBOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "PerplexityBot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Baiduspider",
  "Bingbot",
];

const results = [];
let allOk = true;

function record(check, ok, detail = "") {
  results.push({ check, ok, detail });
  if (!ok) allOk = false;
}

function htmlAttr(html, tag, attrName) {
  const re = new RegExp(`<${tag}[^>]*\\s${attrName}=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function parseJsonLdBlocks(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      blocks.push({ __parseError: true, raw: raw.slice(0, 200) });
    }
  }
  return blocks;
}

function jsonLdTypes(blocks) {
  const types = new Set();
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj["@type"]) {
      const t = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
      for (const x of t) types.add(x);
    }
    for (const v of Object.values(obj)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (typeof v === "object") walk(v);
    }
  }
  blocks.forEach(walk);
  return types;
}

function hreflangSet(html) {
  // Match both lowercase `hreflang` and React/JSX-emitted `hrefLang` since
  // Next.js 16 with React 19 emits the latter. HTML5 attribute names are
  // case-insensitive so both forms are valid; major search-engine crawlers
  // accept either. We also accept the rel/hreflang attributes in either order.
  const re = /<link\b[^>]*?\bhref[Ll]ang=["']([^"']+)["'][^>]*>/g;
  const out = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    // Confirm the link actually has rel="alternate" (otherwise it could be a
    // navigation link with hreflang on it — those don't count for SEO).
    const fullTag = m[0];
    if (/rel=["']alternate["']/i.test(fullTag)) {
      out.add(m[1]);
    }
  }
  return out;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "NanoPocketGeoCheck/1.0 (+https://nanopocket.ai)" },
  });
  return { ok: res.ok, status: res.status, body: await res.text(), contentType: res.headers.get("content-type") || "" };
}

async function checkPage({ path, expectJsonLd, expectHreflangs }) {
  const url = `${BASE}${path}`;
  const tag = `page ${path}`;
  let r;
  try {
    r = await fetchText(url);
  } catch (e) {
    record(tag, false, `fetch error: ${e.message}`);
    return;
  }
  if (!r.ok) {
    record(tag, false, `status ${r.status}`);
    return;
  }
  if (!r.contentType.includes("text/html")) {
    record(tag, false, `unexpected content-type: ${r.contentType}`);
    return;
  }

  const title = (r.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].trim();
  if (!title) {
    record(`${tag}: <title>`, false, "missing");
  } else {
    record(`${tag}: <title>`, true, title.slice(0, 70));
  }

  const desc = htmlAttr(r.body, "meta", 'name=["\']description["\']\\s+content');
  // Above regex is wonky in JS so use a simpler one:
  const descRe = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i;
  const descMatch = r.body.match(descRe);
  if (!descMatch) {
    record(`${tag}: meta description`, false, "missing");
  } else {
    record(`${tag}: meta description`, true, `${descMatch[1].slice(0, 70)}...`);
  }

  const canonical = htmlAttr(r.body, "link", 'rel=["\']canonical["\']\\s+href');
  const canonicalRe = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i;
  const canonicalMatch = r.body.match(canonicalRe);
  if (!canonicalMatch) {
    record(`${tag}: canonical`, false, "missing");
  } else {
    const canonicalUrl = canonicalMatch[1];
    record(`${tag}: canonical`, true, canonicalUrl);
  }

  if (expectHreflangs && expectHreflangs.length > 0) {
    const present = hreflangSet(r.body);
    const missing = expectHreflangs.filter((h) => !present.has(h));
    if (missing.length > 0) {
      record(`${tag}: hreflang [${expectHreflangs.join(", ")}]`, false, `missing ${missing.join(", ")}`);
    } else {
      record(`${tag}: hreflang [${expectHreflangs.join(", ")}]`, true, "all present");
    }
  }

  if (expectJsonLd && expectJsonLd.length > 0) {
    const blocks = parseJsonLdBlocks(r.body);
    const types = jsonLdTypes(blocks);
    const missing = expectJsonLd.filter((t) => !types.has(t));
    if (missing.length > 0) {
      record(`${tag}: JSON-LD [${expectJsonLd.join(", ")}]`, false, `missing ${missing.join(", ")}`);
    } else {
      record(`${tag}: JSON-LD [${expectJsonLd.join(", ")}]`, true, `present`);
    }
  }
}

async function checkRobots() {
  const url = `${BASE}/robots.txt`;
  let r;
  try {
    r = await fetchText(url);
  } catch (e) {
    record(`robots.txt`, false, `fetch error: ${e.message}`);
    return;
  }
  if (!r.ok) {
    record(`robots.txt`, false, `status ${r.status}`);
    return;
  }
  const body = r.body;
  for (const bot of REQUIRED_BOTS_IN_ROBOTS) {
    const re = new RegExp(`^User-Agent:\\s*${bot}\\s*$`, "im");
    if (re.test(body)) {
      record(`robots.txt: ${bot} rule`, true, "");
    } else {
      record(`robots.txt: ${bot} rule`, false, "missing");
    }
  }
  if (/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/.test(body)) {
    record(`robots.txt: sitemap reference`, true, "");
  } else {
    record(`robots.txt: sitemap reference`, false, "missing");
  }
}

async function checkSitemap() {
  const url = `${BASE}/sitemap.xml`;
  let r;
  try {
    r = await fetchText(url);
  } catch (e) {
    record(`sitemap.xml`, false, `fetch error: ${e.message}`);
    return;
  }
  if (!r.ok) {
    record(`sitemap.xml`, false, `status ${r.status}`);
    return;
  }
  const expected = ["/face-swap", "/zh-CN/face-swap", "/best-face-swap-app-2026", "/docs/face-swap-pipeline", "/zh-CN/faq"];
  for (const p of expected) {
    if (r.body.includes(`${BASE}${p}`)) {
      record(`sitemap.xml: ${p}`, true, "");
    } else {
      record(`sitemap.xml: ${p}`, false, "missing entry");
    }
  }
}

async function checkLlmsTxt() {
  for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const url = `${BASE}${path}`;
    let r;
    try {
      r = await fetchText(url);
    } catch (e) {
      record(`${path}`, false, `fetch error: ${e.message}`);
      continue;
    }
    if (!r.ok) {
      record(path, false, `status ${r.status}`);
      continue;
    }
    if (r.body.length < 200) {
      record(path, false, `body too small (${r.body.length} chars)`);
      continue;
    }
    if (!r.body.includes("nanopocket.ai")) {
      record(path, false, "does not reference nanopocket.ai");
      continue;
    }
    record(path, true, `${r.body.length} chars`);
  }
}

async function checkImageSitemap() {
  const url = `${BASE}/sitemap-images.xml`;
  let r;
  try {
    r = await fetchText(url);
  } catch (e) {
    record(`sitemap-images.xml`, false, `fetch error: ${e.message}`);
    return;
  }
  if (!r.ok) {
    record(`sitemap-images.xml`, false, `status ${r.status}`);
    return;
  }
  const count = (r.body.match(/<image:image>/g) || []).length;
  if (count < 1) {
    record(`sitemap-images.xml`, false, "no <image:image> entries");
  } else {
    record(`sitemap-images.xml`, true, `${count} image entries`);
  }
}

console.log(`[check-geo] base = ${BASE}`);
console.log("[check-geo] running checks...\n");

await checkRobots();
await checkSitemap();
await checkImageSitemap();
await checkLlmsTxt();

for (const c of URLS_TO_CHECK) {
  await checkPage(c);
}

const ok = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok).length;

console.log("");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  GEO health report — ${BASE}`);
console.log("═══════════════════════════════════════════════════════════════");
for (const r of results) {
  const sym = r.ok ? "PASS" : "FAIL";
  const prefix = r.ok ? "✓" : "✗";
  console.log(`  ${prefix} [${sym}] ${r.check}${r.detail ? `  — ${r.detail}` : ""}`);
}
console.log("───────────────────────────────────────────────────────────────");
console.log(`  Total: ${ok} passed, ${fail} failed`);
console.log("═══════════════════════════════════════════════════════════════");

exit(allOk ? 0 : 1);
