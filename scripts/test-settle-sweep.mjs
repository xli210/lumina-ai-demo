// The timed settle's logic (lib/settle-sweep.ts): who may call it, the order of the steps, and when
// the expiry sweep is held back. No database: the steps are stand-ins.
//   node --experimental-strip-types --test scripts/test-settle-sweep.mjs      (Node 22.6+)
import { test } from "node:test";
import assert from "node:assert/strict";
import { newStaleReport, partnerAllowed, runSweep, settledOrThrow } from "../lib/settle-sweep.ts";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function steps(over = {}, calls = []) {
  const step = (name, value) => over[name] ?? (async () => { calls.push(name); return value; });
  return {
    settleVideo: step("settleVideo", { settled: 2 }),
    settleHeadswap: step("settleHeadswap", { settled: 0 }),
    settleEdits: step("settleEdits", undefined),
    settlePhotos: step("settlePhotos", { settled: 1 }),
    releaseExpired: step("releaseExpired", 3),
  };
}

test("only the partner secret is let in", () => {
  assert.equal(partnerAllowed("s3cret-value", "s3cret-value"), true);
  assert.equal(partnerAllowed(" s3cret-value ", "s3cret-value\n"), true, "pasted spaces and newlines");
  assert.equal(partnerAllowed("s3cret-valuX", "s3cret-value"), false, "same length, wrong");
  assert.equal(partnerAllowed("s3cret", "s3cret-value"), false, "a prefix");
  assert.equal(partnerAllowed("s3cret-value-and-more", "s3cret-value"), false, "longer");
  assert.equal(partnerAllowed("", "s3cret-value"), false);
  assert.equal(partnerAllowed(null, "s3cret-value"), false);
  assert.equal(partnerAllowed(undefined, "s3cret-value"), false);
  assert.equal(partnerAllowed("", ""), false, "no secret configured: nobody");
  assert.equal(partnerAllowed("anything", ""), false);
  assert.equal(partnerAllowed("anything", undefined), false);
  assert.equal(partnerAllowed("   ", "   "), false, "a secret of spaces is no secret");
});

test("all settles finish: then the expiry sweep, in that order", async () => {
  const calls = [];
  const r = await runSweep(steps({}, calls), 5000);
  assert.deepEqual(calls, ["settleVideo", "settleHeadswap", "settleEdits", "settlePhotos", "releaseExpired"]);
  assert.deepEqual(r.photos, { ok: true, value: { settled: 1 } });
  assert.deepEqual(r.video, { ok: true, value: { settled: 2 } });
  assert.deepEqual(r.expired, { ok: true, value: 3 });
  assert.equal(r.held_back, undefined);
});

test("a settle that fails holds the expiry sweep back (it would return made work)", async () => {
  for (const which of ["settleVideo", "settleHeadswap", "settleEdits", "settlePhotos"]) {
    const calls = [];
    const r = await runSweep(steps({ [which]: async () => { calls.push(which); throw new Error("studio did not answer"); } }, calls), 5000);
    assert.equal(r.expired, null, which);
    assert.ok(!calls.includes("releaseExpired"), which + ": the sweep must not run");
    assert.match(r.held_back, /error/, which);
    // the other settles still ran
    assert.equal(calls.length, 4, which);
  }
});

test("a settle that throws at once is caught like any other failure", async () => {
  const r = await runSweep(steps({ settleVideo: () => { throw new TypeError("boom"); } }), 5000);
  assert.equal(r.video.ok, false);
  assert.equal(r.video.why, "error");
  assert.equal(r.video.message, "boom");
  assert.equal(r.expired, null);
});

test("a settle past the budget is cut off and holds the sweep back; the answer still comes in time", async () => {
  const calls = [];
  const t0 = Date.now();
  const r = await runSweep(steps({ settleHeadswap: async () => { calls.push("settleHeadswap"); await sleep(2000); return 1; } }, calls), 300);
  const took = Date.now() - t0;
  assert.ok(took < 1500, `answered after ${took} ms`);
  assert.deepEqual(r.headswap, { ok: false, why: "timeout" });
  assert.equal(r.expired, null);
  assert.ok(!calls.includes("releaseExpired"));
  assert.match(r.held_back, /headswap timeout/);
  // no time left for edits: not even started
  assert.deepEqual(r.edits, { ok: false, why: "timeout" });
  assert.ok(!calls.includes("settleEdits"), "a step with no time left must not start");
});

test("a budget of zero starts nothing", async () => {
  const calls = [];
  const r = await runSweep(steps({}, calls), 0);
  assert.deepEqual(calls, []);
  assert.equal(r.expired, null);
});

test("the budget is shared: what the first step uses, the later ones do not get", async () => {
  let now = 0;
  const clock = () => now;
  const r = await runSweep(
    steps({
      settleVideo: async () => { now += 900; return 1; },          // takes 900 of 1000
      settleHeadswap: async () => { now += 50; return 0; },
      settleEdits: async () => { await sleep(200); return 0; },   // 50 left on the clock: cut off
    }),
    1000,
    clock
  );
  assert.equal(r.video.ok, true);
  assert.equal(r.headswap.ok, true);
  assert.deepEqual(r.edits, { ok: false, why: "timeout" });
  assert.equal(r.expired, null);
});

test("the expiry sweep failing is reported, not thrown", async () => {
  const r = await runSweep(steps({ releaseExpired: async () => { throw new Error("rpc down"); } }), 5000);
  assert.deepEqual(r.expired, { ok: false, why: "error", message: "rpc down" });
});

test("settledOrThrow: an unanswered or failed reservation is an error, the rest is fine", async () => {
  const ok = await settledOrThrow(async (rep) => { rep.seen = 3; rep.settled = 2; });         // one still being made
  assert.deepEqual(ok, { seen: 3, settled: 2, unreachable: 0, failed: 0 });
  await assert.rejects(settledOrThrow(async (rep) => { rep.seen = 2; rep.settled = 1; rep.unreachable = 1; }), /1 not answered/);
  await assert.rejects(settledOrThrow(async (rep) => { rep.seen = 1; rep.failed = 1; }), /1 failed/);
  await assert.rejects(settledOrThrow(async () => { throw new Error("list failed"); }), /list failed/);
  assert.deepEqual(newStaleReport(), { seen: 0, settled: 0, unreachable: 0, failed: 0 });
});

test("an unanswered video reservation keeps the expiry sweep from running (end to end)", async () => {
  const calls = [];
  const r = await runSweep(
    steps({ settleVideo: () => settledOrThrow(async (rep) => { calls.push("settleVideo"); rep.seen = 1; rep.unreachable = 1; }) }, calls),
    5000
  );
  assert.equal(r.video.ok, false);
  assert.equal(r.expired, null);
  assert.ok(!calls.includes("releaseExpired"));
});
