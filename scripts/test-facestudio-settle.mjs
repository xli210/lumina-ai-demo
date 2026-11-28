// Closed-tab settle of photo face swaps (lib/facestudio-settle-rules.ts): the status route's rules, without the database or the gateway.
//   node --experimental-strip-types --import ./scripts/ts-alias-hooks.mjs --test scripts/test-facestudio-settle.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { decidePhotoSettlement } from "../lib/facestudio-settle-rules.ts";

const up = (status, body) => ({ status, body });

test("a finished render is charged", () => {
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done" }), {}), { action: "capture" });
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done", watermarked: true }), { watermark: true }), { action: "capture" });
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done", watermarked: true, free_finished: true }), { watermark: true, free_output: true }), { action: "capture" },
    "a free render with its free version made");
});

test("a render owed the mark but without it is returned, never billed", () => {
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done" }), { watermark: true }), { action: "release", reason: "watermark_missing" });
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done", watermarked: false }), { watermark: true }), { action: "release", reason: "watermark_missing" });
});

test("a free render without its free version is returned, never billed", () => {
  const d = decidePhotoSettlement(up(200, { status: "done", watermarked: true }), { watermark: true, free_output: true });
  assert.deepEqual(d, { action: "release", reason: "free_finish_missing" });
});

test("a failed render is returned, and whose fault it was is kept", () => {
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "error", error_kind: "user" }), {}), { action: "release", reason: "input_rejected" });
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "error", error_kind: "server" }), {}), { action: "release", reason: "render_failed" });
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "error" }), {}), { action: "release", reason: "render_failed" });
});

test("a render still on its way is left alone", () => {
  for (const s of ["queued", "running", "starting", undefined, 3]) {
    assert.deepEqual(decidePhotoSettlement(up(200, { status: s }), {}), { action: "wait" }, String(s));
  }
  assert.deepEqual(decidePhotoSettlement(up(404, { detail: "Unknown job." }), {}), { action: "wait" });
});

test("a gateway that cannot be asked leaves the reservation open (and holds the expiry sweep back)", () => {
  assert.equal(decidePhotoSettlement({ error: "timeout" }, {}).action, "unreachable");
  assert.equal(decidePhotoSettlement(up(502, { detail: "bad gateway" }), {}).action, "unreachable");
  assert.equal(decidePhotoSettlement(up(503, { status: "done" }), {}).action, "unreachable", "a 5xx is never read as a finished render");
});

test("no estimate recorded (a render from before the watermark): charged when done, as the page does", () => {
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done" }), null), { action: "capture" });
  assert.deepEqual(decidePhotoSettlement(up(200, { status: "done" }), undefined), { action: "capture" });
});
