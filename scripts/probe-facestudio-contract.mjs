#!/usr/bin/env node
/* global process, console */
/**
 * probe-facestudio-contract.mjs
 *
 * Submits one real detect job to the Face Studio RunPod endpoint and checks
 * the response against what lib/facestudio.ts and public/face-studio/app.js
 * expect. Run before deploying the gateway: if the worker's output shape has
 * drifted from README_INTEGRATION.md §4, the console breaks in ways that look
 * like frontend bugs, and this is much cheaper to read than that.
 *
 * Costs about $0.001 of GPU per run.
 *
 * Needs, from the gateway's own environment:
 *   RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID,
 *   S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET,
 *   S3_INPUT_PREFIX
 *
 * Usage:
 *   node scripts/probe-facestudio-contract.mjs <existing-input-object-name>
 */

import { createHmac, createHash } from "node:crypto";

const REQUIRED = [
  "RUNPOD_API_KEY",
  "RUNPOD_ENDPOINT_ID",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET",
];

/* ------------------------------------------------------------------ */
/* Minimal SigV4 presigner                                             */
/*                                                                     */
/* Hand-rolled rather than pulled from @aws-sdk because this repo has  */
/* no S3 client and adding one for a diagnostic script is not worth a  */
/* dependency. Only the one case is covered: a presigned GET.          */
/* ------------------------------------------------------------------ */

function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key, value) {
  return createHmac("sha256", key).update(value).digest();
}

function presignGet(objectPath, expiresIn) {
  const url = new URL(process.env.S3_ENDPOINT);
  const host = url.host;
  const region = process.env.S3_REGION || "auto";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${region}/s3/aws4_request`;

  const canonicalUri = `/${process.env.S3_BUCKET}/${objectPath}`
    .split("/")
    .map((seg, i) => (i === 0 ? seg : encodeURIComponent(seg)))
    .join("/");

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${process.env.S3_ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });
  // The signature is computed over sorted query parameters.
  query.sort();

  const canonicalRequest = [
    "GET",
    canonicalUri,
    query.toString(),
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  let signing = hmac(`AWS4${process.env.S3_SECRET_ACCESS_KEY}`, dateStamp);
  signing = hmac(signing, region);
  signing = hmac(signing, "s3");
  signing = hmac(signing, "aws4_request");
  const signature = createHmac("sha256", signing)
    .update(stringToSign)
    .digest("hex");

  return `${url.origin}${canonicalUri}?${query.toString()}&X-Amz-Signature=${signature}`;
}

/* ------------------------------------------------------------------ */
/* RunPod                                                              */
/* ------------------------------------------------------------------ */

async function runpod(method, path, body) {
  const res = await fetch(
    `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`RunPod ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

/* ------------------------------------------------------------------ */
/* Assertions                                                          */
/* ------------------------------------------------------------------ */

const results = [];

function check(name, passed, detail = "") {
  results.push(passed);
  console.log(`  [${passed ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const objectName = process.argv[2];
  if (!objectName) {
    console.error(
      "Usage: node scripts/probe-facestudio-contract.mjs <input-object-name>\n" +
        "Pass the name of an object that already exists under S3_INPUT_PREFIX."
    );
    process.exit(1);
  }

  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const prefix = process.env.S3_INPUT_PREFIX || "facestudio/input";
  const url = presignGet(`${prefix}/${objectName}`, 3600);

  // Confirm the presigned URL actually works before blaming the GPU for
  // anything: a signing bug and a worker bug look identical from the output.
  const head = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
  check("presigned GET resolves", head.status === 200 || head.status === 206,
    `HTTP ${head.status}`);
  if (head.status >= 400) {
    console.error("\nCannot read the input object; stopping before spending GPU time.");
    process.exit(1);
  }

  console.log(`\nSubmitting detect on ${prefix}/${objectName} …`);
  let job = await runpod("POST", "/runsync", {
    input: { action: "detect", body_image: url },
  });

  const started = Date.now();
  while (["IN_QUEUE", "IN_PROGRESS"].includes(job.status)) {
    if (Date.now() - started > 120_000) {
      console.error("Timed out after 120 s.");
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 1000));
    job = await runpod("GET", `/status/${job.id}`);
  }

  console.log(`Job ${job.id} finished as ${job.status}\n`);
  check("job COMPLETED", job.status === "COMPLETED", job.status);

  const out = job.output ?? {};
  check("no error in output", !out.error, out.error ?? "");
  check("count is a number", typeof out.count === "number", String(out.count));
  check("max_faces is a number", typeof out.max_faces === "number",
    String(out.max_faces));
  check("faces is an array", Array.isArray(out.faces),
    `${out.faces?.length ?? 0} faces`);

  const face = out.faces?.[0];
  if (face) {
    // Every one of these is read by app.js to build a face card; a rename
    // upstream shows up as a blank card, not as an error.
    for (const field of [
      "index",
      "bbox_max_dim",
      "thumb_b64",
      "seg_panel_b64",
      "seg_map_b64",
      "seg_w",
      "seg_h",
      "present_classes",
    ]) {
      check(`faces[0].${field} present`, face[field] !== undefined);
    }
    const cls = face.present_classes?.[0];
    if (cls) {
      for (const field of ["id", "name", "color", "area_pct", "default_preserve"]) {
        check(`present_classes[0].${field} present`, cls[field] !== undefined);
      }
    }
  } else {
    console.log("  (no faces in this photo — field checks skipped)");
  }

  const failed = results.filter((ok) => !ok).length;
  console.log(
    failed === 0
      ? `\nAll ${results.length} checks passed. The worker matches the contract.\n`
      : `\n${failed} of ${results.length} checks FAILED.\n`
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
