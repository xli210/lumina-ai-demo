// node --experimental-strip-types scripts/check-facestudio-v-download.mjs
// "My videos" download links: signed here, checked by the studio (swap_pipelines/results.py).
import assert from "node:assert/strict";
import { DOWNLOAD_LINK_SECONDS, downloadUrl, signDownload, timeLeft } from "../lib/facestudio-v-download.ts";

const S = "test-secret-123";
// The studio's own code gives this for the same job, expiry and secret:
//   python -c "from swap_pipelines import results; print(results.sign('0123456789ab', 1893456000, b'test-secret-123'))"
assert.equal(signDownload("0123456789ab", 1893456000, S), "df037947d291b2415fbbbb878539de98");

const now = Date.parse("2026-10-26T12:00:00Z");
const nowS = Math.floor(now / 1000);
const kept = nowS + 5 * 3600;
const u = new URL(downloadUrl("https://studio.example", "0123456789ab", kept, now, S));
assert.equal(u.pathname, "/api/outputs/0123456789ab.mp4");
assert.equal(Number(u.searchParams.get("exp")), nowS + DOWNLOAD_LINK_SECONDS, "an hour from now");
assert.equal(u.searchParams.get("sig"), signDownload("0123456789ab", nowS + DOWNLOAD_LINK_SECONDS, S));
assert.equal(u.searchParams.get("dl"), "1");

// never past the 24 hours the video is kept
const soon = nowS + 600;
assert.equal(Number(new URL(downloadUrl("https://studio.example", "0123456789ab", soon, now, S)).searchParams.get("exp")), soon);
assert.equal(downloadUrl("https://studio.example", "0123456789ab", nowS - 1, now, S), null, "already deleted: no link");

// no secret, a bad id: no link
assert.equal(downloadUrl("https://studio.example", "0123456789ab", kept, now, undefined), null);
assert.equal(downloadUrl("https://studio.example", "../etc/passwd", kept, now, S), null);
assert.equal(signDownload("0123456789ab", 1, ""), null);

assert.equal(timeLeft(nowS + 5 * 3600 + 12 * 60, now), "5 h 12 min");
assert.equal(timeLeft(nowS + 7 * 60, now), "7 min");
assert.equal(timeLeft(nowS - 10, now), "0 min");
console.log("facestudio-v download links: all checks passed");
