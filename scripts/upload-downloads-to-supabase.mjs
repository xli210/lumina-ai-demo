#!/usr/bin/env node
/* global process, console */
/**
 * upload-downloads-to-supabase.mjs
 *
 * One-shot uploader for product installers.
 *
 * Reads everything in ./downloads-private/ and pushes it to the
 * `product-downloads` bucket in Supabase Storage. Re-run this whenever
 * you cut a new installer version — `upsert: true` is on, so existing
 * objects are replaced in-place.
 *
 * Prereqs (env vars, most easily via .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * One-time bucket setup (run once in the Supabase SQL editor):
 *   insert into storage.buckets (id, name, public)
 *   values ('product-downloads', 'product-downloads', false)
 *   on conflict (id) do nothing;
 *
 * Usage:
 *   node scripts/upload-downloads-to-supabase.mjs
 *   node scripts/upload-downloads-to-supabase.mjs NanoFaceStudioPro-1.0.8-windows.exe
 *
 * If you pass filenames as CLI args, only those files are uploaded.
 * Otherwise every file in ./downloads-private/ is uploaded.
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

function stripQuotes(v) {
  if (v.length < 2) return v;
  const first = v[0];
  const last = v[v.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return v.slice(1, -1);
  }
  return v;
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq === -1) return null;
  return {
    key: trimmed.slice(0, eq).trim(),
    val: stripQuotes(trimmed.slice(eq + 1).trim()),
  };
}

// Load .env.local without requiring a dotenv dependency.
async function loadDotEnvLocal() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const envPath = join(scriptDir, "..", ".env.local");
  let raw;
  try {
    raw = await readFile(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const parsed = parseEnvLine(line);
    if (parsed && !(parsed.key in process.env)) {
      process.env[parsed.key] = parsed.val;
    }
  }
}

const BUCKET = "product-downloads";

const CONTENT_TYPES = {
  ".exe": "application/vnd.microsoft.portable-executable",
  ".zip": "application/zip",
  ".dmg": "application/x-apple-diskimage",
  ".pkg": "application/octet-stream",
};

function humanBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function contentTypeFor(filename) {
  return CONTENT_TYPES[extname(filename).toLowerCase()] ?? "application/octet-stream";
}

async function main() {
  await loadDotEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env / .env.local"
    );
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dir = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "downloads-private"
  );
  const argFilter = process.argv.slice(2);
  const allFiles = (await readdir(dir))
    .filter((f) => !f.startsWith("."))
    .filter((f) => (argFilter.length === 0 ? true : argFilter.includes(f)));

  if (allFiles.length === 0) {
    console.log("Nothing to upload (empty directory or filter matched nothing).");
    return;
  }

  console.log(`Uploading ${allFiles.length} file(s) to bucket "${BUCKET}"\n`);

  let ok = 0;
  let fail = 0;
  for (const filename of allFiles) {
    const filepath = join(dir, filename);
    const s = await stat(filepath);
    process.stdout.write(
      `  ${filename.padEnd(48)} ${humanBytes(s.size).padStart(10)} ... `
    );
    const body = await readFile(filepath);
    const { error } = await admin.storage.from(BUCKET).upload(filename, body, {
      contentType: contentTypeFor(filename),
      upsert: true,
    });
    if (error) {
      console.log(`FAIL — ${error.message}`);
      fail += 1;
    } else {
      console.log("OK");
      ok += 1;
    }
  }

  console.log(
    `\nDone. ${ok} succeeded, ${fail} failed. Bucket: ${url.replace(
      /\/$/,
      ""
    )}/storage/v1/object/public/${BUCKET}/ (private — signed URLs only)`
  );
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
