#!/usr/bin/env node
/* global console, process */
/**
 * One-off asset optimizer: converts the 12 face-template PNGs (each 6-7 MB)
 * from the site_handoff 2 package into WebP (target ~500 KB each). Also
 * rewrites face_templates.local.json to point at the .webp files.
 *
 * Run once whenever new face templates are added to
 * site_handoff\ 2/faceswap/face_templates/. Idempotent: skips files that
 * already have an up-to-date .webp sibling in the destination.
 *
 * Usage:
 *   node scripts/convert-face-templates.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// sharp is a transitive dep of Next.js Image; not in top-level node_modules
// so we resolve it manually from the pnpm store.
async function loadSharp() {
  try {
    return require("sharp");
  } catch {
    // Fall through to pnpm-store lookup below. sharp is a transitive dep
    // (not top-level in package.json) so plain `require('sharp')` misses
    // it under pnpm's symlink layout.
  }
  // pnpm layout: node_modules/.pnpm/sharp@<version>/node_modules/sharp
  const pnpmRoot = path.resolve(process.cwd(), "node_modules/.pnpm");
  const dirs = await fs.readdir(pnpmRoot);
  const match = dirs.find((d) => d.startsWith("sharp@"));
  if (!match) throw new Error("sharp not installed");
  const modulePath = path.join(pnpmRoot, match, "node_modules/sharp");
  return require(pathToFileURL(modulePath).pathname);
}

const SRC_DIR = path.resolve(
  process.cwd(),
  "site_handoff 2/faceswap/face_templates"
);
const DST_DIR = path.resolve(
  process.cwd(),
  "public/private-demos/faceswap/face_templates"
);
const JSON_PATH = path.resolve(
  process.cwd(),
  "public/private-demos/faceswap/face_templates.local.json"
);

// WebP quality is a soft dial. 85 keeps face detail sharp while shrinking a
// 7 MB PNG portrait to ~400-600 KB. If you need larger, bump to 90.
const WEBP_QUALITY = 85;

async function main() {
  const sharp = await loadSharp();
  await fs.mkdir(DST_DIR, { recursive: true });

  const entries = await fs.readdir(SRC_DIR);
  const pngs = entries.filter((f) => f.toLowerCase().endsWith(".png"));
  if (pngs.length === 0) {
    console.error(`No PNGs found in ${SRC_DIR}`);
    process.exit(2);
  }

  const results = [];
  for (const png of pngs) {
    const srcPath = path.join(SRC_DIR, png);
    const webpName = png.replace(/\.png$/i, ".webp");
    const dstPath = path.join(DST_DIR, webpName);

    const srcStat = await fs.stat(srcPath);
    let dstStat = null;
    try {
      dstStat = await fs.stat(dstPath);
    } catch {
      // Missing destination file just means we haven't converted this
      // template yet — the write happens unconditionally below.
    }

    if (dstStat && dstStat.mtimeMs > srcStat.mtimeMs) {
      results.push({ png, webpName, skipped: true, bytes: dstStat.size });
      continue;
    }

    await sharp(srcPath).webp({ quality: WEBP_QUALITY }).toFile(dstPath);
    const outStat = await fs.stat(dstPath);
    results.push({
      png,
      webpName,
      skipped: false,
      bytes: outStat.size,
      srcBytes: srcStat.size,
    });
  }

  // Rebuild the JSON registry so the browser fetches the .webp instead of
  // the old .png names.
  const templates = results.map((r, i) => ({
    id: String(i),
    url: `face_templates/${r.webpName}`,
    name: r.webpName,
  }));
  await fs.writeFile(
    JSON_PATH,
    JSON.stringify({ templates, count: templates.length }, null, 2) + "\n"
  );

  const totalIn = results.reduce((s, r) => s + (r.srcBytes ?? r.bytes), 0);
  const totalOut = results.reduce((s, r) => s + r.bytes, 0);
  const ratio = totalIn ? ((1 - totalOut / totalIn) * 100).toFixed(1) : "0.0";
  console.log(
    `Converted ${results.length} templates: ${(totalIn / 1e6).toFixed(1)} MB -> ` +
      `${(totalOut / 1e6).toFixed(1)} MB (${ratio}% saved). Wrote ${JSON_PATH}.`
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(2);
});
