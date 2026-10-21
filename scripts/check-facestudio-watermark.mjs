// node --experimental-strip-types scripts/check-facestudio-watermark.mjs
// Who gets the Face Studio watermark, and the check on a finished render.
import assert from "node:assert/strict";
import {
  WATERMARK_MISSING_BODY,
  needsWatermark,
  owesMissingWatermark,
  upstreamWatermarked,
  watermarkEnabled,
} from "../lib/facestudio-watermark.ts";

// off unless exactly "1": nothing changes until the owner turns it on
assert.equal(watermarkEnabled(undefined), false);
assert.equal(watermarkEnabled(""), false);
assert.equal(watermarkEnabled("0"), false);
assert.equal(watermarkEnabled("true"), false);
assert.equal(watermarkEnabled("1"), true);

// the rule: never bought -> marked; bought once -> never marked
assert.equal(needsWatermark(false), true);
assert.equal(needsWatermark(true), false);
// a failed lookup marks (the safe side), it never gives a free user a clean image
assert.equal(needsWatermark(null), true);

// the worker says "watermarked": true only on marked renders
assert.equal(upstreamWatermarked({ watermarked: true }), true);
assert.equal(upstreamWatermarked({ watermarked: false }), false);
assert.equal(upstreamWatermarked({ watermarked: "true" }), false, "only a real boolean true counts");
assert.equal(upstreamWatermarked({}), false);
assert.equal(upstreamWatermarked(undefined), false);

// owed a mark and got none -> refuse; got one -> fine
assert.equal(owesMissingWatermark(true, { status: "done" }), true);
assert.equal(owesMissingWatermark(true, { status: "done", watermarked: true }), false);
// not owed (a paying user), or started before the rollout -> never refused
assert.equal(owesMissingWatermark(false, { status: "done" }), false);
assert.equal(owesMissingWatermark(undefined, { status: "done" }), false);
assert.equal(owesMissingWatermark(null, { status: "done" }), false);

// the failure the console shows is retryable and says nothing was charged
assert.equal(WATERMARK_MISSING_BODY.retryable, true);
assert.match(WATERMARK_MISSING_BODY.error_message, /not been charged/);
assert.equal(WATERMARK_MISSING_BODY.status, "error");

console.log("facestudio watermark: all checks passed");
