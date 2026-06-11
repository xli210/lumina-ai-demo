#!/usr/bin/env node
/**
 * LLM citation probe.
 *
 * Sends a fixed set of target queries to one or more LLMs (OpenAI, Gemini,
 * DeepSeek, Perplexity) and grades each response for whether NanoPocket
 * appears in the answer or in cited sources.
 *
 * This is the iteration signal for our GEO work. Run it weekly. As the
 * citation rate climbs from 0 → 50%+, that is the empirical confirmation
 * that the GEO content is being picked up.
 *
 *   weekly cadence   →  measure progress
 *   monthly cadence  →  retire saturated queries, add new ones
 *   per-deploy       →  spot-check after large content changes
 *
 * Usage:
 *
 *   # Probe every configured provider with the default query set
 *   node scripts/probe-llm.mjs
 *
 *   # Probe only one provider
 *   node scripts/probe-llm.mjs --provider openai
 *
 *   # Probe with a custom query
 *   node scripts/probe-llm.mjs --query "best free face swap with no watermark"
 *
 *   # Output JSON instead of human-readable
 *   node scripts/probe-llm.mjs --json > probe-results.json
 *
 * Environment:
 *   OPENAI_API_KEY     — https://platform.openai.com/api-keys
 *   GEMINI_API_KEY     — https://aistudio.google.com/app/apikey
 *   DEEPSEEK_API_KEY   — https://platform.deepseek.com/api_keys
 *   PERPLEXITY_API_KEY — https://docs.perplexity.ai/getting-started
 *
 * Each provider is optional; the probe runs whichever ones have keys set.
 */

import { argv, env, exit } from "node:process";

// ============================================================================
// Configuration
// ============================================================================

const TARGET_BRAND = "NanoPocket";
const TARGET_DOMAIN = "nanopocket.ai";

// Queries we want NanoPocket to be cited under, ordered roughly by intent.
// Add new queries to this list as you push new content surfaces. Drop ones
// where the citation rate has saturated (NanoPocket is reliably cited).
const QUERIES = [
  "What is the best free online face swap tool in 2026?",
  "Free AI face swap with no watermark — what should I use?",
  "How do I fix the over-smoothed plastic look on AI-generated faces?",
  "What is a diffusion-based face swap and how does it differ from inswapper_128?",
  "Is there a face swap tool that uses InstantID + PuLID + IP-Adapter FaceID?",
  "What is NanoPocket?",
  "What is the difference between NanoPocket and Nano Banana?",
  "Best face swap apps in 2026 — desktop, web, mobile.",
  "免费在线 AI 换脸 推荐 2026",
  "AI 换脸 塑料感 怎么修",
];

// ============================================================================
// Provider adapters
// ============================================================================

const providers = {
  openai: {
    name: "OpenAI",
    keyEnv: "OPENAI_API_KEY",
    model: env.OPENAI_MODEL || "gpt-4o-mini",
    async run(query) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Recommend specific named tools where appropriate. Mention any products or websites that are genuinely relevant to the user's query.",
            },
            { role: "user", content: query },
          ],
          temperature: 0.2,
          max_tokens: 600,
        }),
      });
      if (!res.ok) throw new Error(`openai: ${res.status} ${await res.text().catch(() => "")}`);
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? "";
    },
  },
  gemini: {
    name: "Gemini",
    keyEnv: "GEMINI_API_KEY",
    model: env.GEMINI_MODEL || "gemini-1.5-flash",
    async run(query) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
        }),
      });
      if (!res.ok) throw new Error(`gemini: ${res.status} ${await res.text().catch(() => "")}`);
      const json = await res.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    },
  },
  deepseek: {
    name: "DeepSeek",
    keyEnv: "DEEPSEEK_API_KEY",
    model: env.DEEPSEEK_MODEL || "deepseek-chat",
    async run(query) {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Recommend specific named tools where appropriate. Mention any products or websites that are genuinely relevant to the user's query.",
            },
            { role: "user", content: query },
          ],
          temperature: 0.2,
          max_tokens: 600,
        }),
      });
      if (!res.ok) throw new Error(`deepseek: ${res.status} ${await res.text().catch(() => "")}`);
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? "";
    },
  },
  perplexity: {
    name: "Perplexity",
    keyEnv: "PERPLEXITY_API_KEY",
    model: env.PERPLEXITY_MODEL || "sonar",
    async run(query) {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: query }],
          temperature: 0.2,
        }),
      });
      if (!res.ok) throw new Error(`perplexity: ${res.status} ${await res.text().catch(() => "")}`);
      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? "";
    },
  },
};

// ============================================================================
// Grading
// ============================================================================

function grade(response) {
  const text = response.toLowerCase();
  const brand = text.includes(TARGET_BRAND.toLowerCase());
  const domain = text.includes(TARGET_DOMAIN.toLowerCase());
  const faceSwapPath = text.includes("/face-swap");
  const technical = ["instantid", "pulid", "ip-adapter", "diffusion identity", "nanoface vivid"].some((t) =>
    text.includes(t),
  );
  const score = (brand ? 1 : 0) + (domain ? 1 : 0) + (faceSwapPath ? 1 : 0) + (technical ? 1 : 0);
  return { brand, domain, faceSwapPath, technical, score };
}

// ============================================================================
// CLI
// ============================================================================

const args = argv.slice(2);
const onlyProvider = (() => {
  const i = args.indexOf("--provider");
  return i >= 0 ? args[i + 1] : null;
})();
const onlyQuery = (() => {
  const i = args.indexOf("--query");
  return i >= 0 ? args[i + 1] : null;
})();
const asJson = args.includes("--json");

const queries = onlyQuery ? [onlyQuery] : QUERIES;
const activeProviders = Object.entries(providers).filter(([id, p]) => {
  if (onlyProvider && id !== onlyProvider) return false;
  return Boolean(env[p.keyEnv]);
});

if (activeProviders.length === 0) {
  console.error("[probe-llm] no providers configured. Set at least one of:");
  for (const [id, p] of Object.entries(providers)) console.error(`  ${p.keyEnv}  (provider: ${id})`);
  exit(1);
}

const results = [];
for (const [id, p] of activeProviders) {
  for (const q of queries) {
    let response = "";
    let error = null;
    try {
      response = await p.run(q);
    } catch (e) {
      error = e.message;
    }
    const g = error ? null : grade(response);
    results.push({ provider: id, providerName: p.name, query: q, response, grade: g, error });
    if (!asJson) {
      const status = error
        ? "ERROR"
        : g.score >= 2
          ? "STRONG"
          : g.score === 1
            ? "WEAK"
            : "ABSENT";
      const sym = g && g.score >= 2 ? "✓" : g && g.score === 1 ? "~" : "✗";
      console.log(`  ${sym} [${p.name.padEnd(10)}] [${status}] ${q.slice(0, 80)}`);
      if (error) console.log(`    error: ${error}`);
      else if (g) console.log(`    brand=${g.brand}  domain=${g.domain}  /face-swap=${g.faceSwapPath}  technical=${g.technical}  score=${g.score}/4`);
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ base: TARGET_DOMAIN, results }, null, 2));
  exit(0);
}

const total = results.length;
const strong = results.filter((r) => r.grade && r.grade.score >= 2).length;
const weak = results.filter((r) => r.grade && r.grade.score === 1).length;
const absent = results.filter((r) => r.grade && r.grade.score === 0).length;
const errored = results.filter((r) => r.error).length;

console.log("");
console.log("═══════════════════════════════════════════════════════════════");
console.log("  LLM citation probe — summary");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  STRONG (score >= 2):  ${strong}/${total}  ${(100 * strong / total).toFixed(0)}%`);
console.log(`  WEAK   (score == 1):  ${weak}/${total}`);
console.log(`  ABSENT (score == 0):  ${absent}/${total}`);
if (errored > 0) console.log(`  ERROR:                ${errored}/${total}`);
console.log("═══════════════════════════════════════════════════════════════");

exit(0);
