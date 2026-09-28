#!/usr/bin/env node
/* global process, console */
/**
 * check-downloads-storage.mjs
 *
 * Read-only diagnosis of why /api/downloads/<file> is returning
 * "Download temporarily unavailable".
 *
 * That message is the route's 502 branch, which fires only when
 * `createSignedUrl` fails. Reaching it proves the license lookup already
 * succeeded on the same service-role client, so the key is valid and the
 * fault is in Storage: the bucket is gone, or the object is.
 *
 * This checks, in order:
 *   1. the bucket exists, and is private
 *   2. every expected installer is present
 *   3. the stored size matches the local file in downloads-private/
 *   4. signing actually works end to end
 *
 * Step 3 matters because an upload can "succeed" with a truncated body and
 * leave a file that serves a corrupt download rather than an error.
 *
 * Nothing here writes. To repair, run:
 *   node scripts/upload-downloads-to-supabase.mjs
 *
 * Usage:
 *   node scripts/check-downloads-storage.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BUCKET = "product-downloads";

/** Must stay in step with FILE_PRODUCT_MAP in the download route. */
const EXPECTED = [
  "NanoImageEdit-1.0.5-release.zip",
  "NanoVideoGen-1.1.2-release.zip",
  "NanoVideoEnhance-1.0.5-release.zip",
  "NanoFacialEdit-1.0.2-release.zip",
  "NanoFaceSwap-1.0.4-release.zip",
  "NanoImageEnh-3.0.0-windows.zip",
  "NanoImageEnh-3.0.0-macos.zip",
  "NanoImageTryon-1.0.0-release.zip",
  "NanoFaceStudioPro-1.0.0-windows.exe",
];

function stripQuotes(v) {
  if (v.length < 2) return v;
  const first = v[0];
  const last = v[v.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return v.slice(1, -1);
  }
  return v;
}

async function loadDotEnvLocal() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  let raw;
  try {
    raw = await readFile(join(scriptDir, "..", ".env.local"), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!(key in process.env)) {
      process.env[key] = stripQuotes(trimmed.slice(eq + 1).trim());
    }
  }
}

function human(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

async function main() {
  await loadDotEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Put them in .env.local, or pass them inline:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/check-downloads-storage.mjs"
    );
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\nProject: ${url}`);

  /* 1. Bucket ---------------------------------------------------------- */
  const { data: buckets, error: bucketErr } = await admin.storage.listBuckets();
  if (bucketErr) {
    console.error(`\nCannot list buckets: ${bucketErr.message}`);
    console.error(
      "A 401/403 here means the service-role key is wrong. Anything else " +
        "means Storage itself is unreachable."
    );
    process.exit(1);
  }

  const bucket = buckets.find((b) => b.name === BUCKET);
  console.log(`\nBuckets on this project: ${buckets.map((b) => b.name).join(", ") || "(none)"}`);

  if (!bucket) {
    console.error(
      `\nFAULT: bucket "${BUCKET}" does not exist. Every download will 502.\n\n` +
        "Fix: node scripts/upload-downloads-to-supabase.mjs\n" +
        "(it creates the bucket private, then uploads)\n"
    );
    process.exit(1);
  }

  console.log(
    `Bucket "${BUCKET}": exists, ${bucket.public ? "PUBLIC (should be private)" : "private (correct)"}`
  );

  /* 2 + 3. Objects vs local files -------------------------------------- */
  const { data: objects, error: listErr } = await admin.storage
    .from(BUCKET)
    .list("", { limit: 200 });

  if (listErr) {
    console.error(`\nCannot list objects: ${listErr.message}`);
    process.exit(1);
  }

  const stored = new Map(
    objects.map((o) => [o.name, o.metadata?.size ?? null])
  );

  const localDir = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "downloads-private"
  );
  let localFiles = [];
  try {
    localFiles = await readdir(localDir);
  } catch {
    // Fine — size comparison is skipped, presence checks still run.
  }

  console.log(`\nObjects in bucket: ${objects.length}\n`);

  let missing = 0;
  let mismatched = 0;

  for (const name of EXPECTED) {
    const size = stored.get(name);
    let localSize = null;
    if (localFiles.includes(name)) {
      localSize = (await stat(join(localDir, name))).size;
    }

    if (size === undefined) {
      console.log(`  MISSING   ${name.padEnd(44)} not in bucket`);
      missing += 1;
      continue;
    }
    if (localSize !== null && size !== localSize) {
      console.log(
        `  MISMATCH  ${name.padEnd(44)} bucket ${human(size)} vs local ${human(localSize)}`
      );
      mismatched += 1;
      continue;
    }
    console.log(`  OK        ${name.padEnd(44)} ${human(size ?? 0)}`);
  }

  const extra = objects.filter((o) => !EXPECTED.includes(o.name));
  if (extra.length > 0) {
    console.log(
      `\n  ${extra.length} object(s) in the bucket are not in the download ` +
        `route's allowlist and can never be served: ` +
        extra.map((o) => o.name).join(", ")
    );
  }

  /* 4. Signing --------------------------------------------------------- */
  const probe = EXPECTED.find((n) => stored.has(n));
  if (probe) {
    const { error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(probe, 60, { download: probe });
    console.log(
      signErr
        ? `\nSigning ${probe}: FAILED — ${signErr.message}`
        : `\nSigning ${probe}: OK`
    );
  }

  /* Verdict ------------------------------------------------------------ */
  if (missing === 0 && mismatched === 0) {
    console.log("\nStorage looks correct. The 502 is coming from somewhere else.\n");
    process.exit(0);
  }

  console.error(
    `\nFAULT: ${missing} missing, ${mismatched} wrong size.\n\n` +
      "Fix: node scripts/upload-downloads-to-supabase.mjs\n" +
      "(upsert is on, so re-running is safe and repairs both cases)\n"
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
