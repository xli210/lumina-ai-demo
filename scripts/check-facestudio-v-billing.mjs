// node --experimental-strip-types scripts/check-facestudio-v-billing.mjs
// What happens to a reservation, for every thing the studio can say about its job.
import assert from "node:assert/strict";
import { billingEnabledIn, decideSettlement, parseStudioAddress, priceFits } from "../lib/facestudio-v-billing.ts";

const job = (state, billing) => ({ found: true, state, billing });

// the video was made: charge what the studio charged
assert.deepEqual(decideSettlement(90, job("done", { credits: 90, status: "settled", charge: 90, refund: 0 })), { action: "capture", amount: 90 });
// a studio charge below the reservation: only that is charged
assert.deepEqual(decideSettlement(90, job("done", { credits: 90, status: "settled", charge: 60 })), { action: "capture", amount: 60 });
// a studio charge above the reservation is capped at the reservation
assert.deepEqual(decideSettlement(20, job("done", { credits: 90, status: "settled", charge: 90 })), { action: "capture", amount: 20 });
// no charge field: fall back to the price, then to the reservation
assert.deepEqual(decideSettlement(90, job("done", { credits: 70, status: "settled" })), { action: "capture", amount: 70 });
assert.deepEqual(decideSettlement(90, job("done", { status: "settled" })), { action: "capture", amount: 90 });
// never negative, never fractional
assert.deepEqual(decideSettlement(90, job("done", { status: "settled", charge: -5 })), { action: "capture", amount: 0 });
assert.deepEqual(decideSettlement(90, job("done", { status: "settled", charge: 12.9 })), { action: "capture", amount: 12 });

// failed, cancelled, left the line: nothing is charged
assert.deepEqual(decideSettlement(90, job("error", { credits: 90, status: "refunded", refund: 90 })), { action: "release", reason: "studio_refunded" });
assert.deepEqual(decideSettlement(90, job("cancelled", { credits: 90, status: "refunded", refund: 90 })), { action: "release", reason: "studio_refunded" });
// a job with no billing block that ended badly is also free
assert.deepEqual(decideSettlement(90, job("error", null)), { action: "release", reason: "studio_error" });
assert.deepEqual(decideSettlement(90, job("cancelled", null)), { action: "release", reason: "studio_cancelled" });

// still waiting or running: keep the reservation
assert.deepEqual(decideSettlement(90, job("running", { credits: 90, status: "held" })), { action: "wait" });
assert.deepEqual(decideSettlement(90, job("queued", { credits: 90, status: "held" })), { action: "wait" });
assert.deepEqual(decideSettlement(90, job("running", null)), { action: "wait" });
// done but the studio did not say settled (should not happen): do not guess, do not charge
assert.deepEqual(decideSettlement(90, job("done", null)), { action: "wait" });

// the studio forgot the job: nothing was made
assert.deepEqual(decideSettlement(90, { found: false }), { action: "release", reason: "studio_job_missing" });
// could not ask: keep everything as it is
assert.deepEqual(decideSettlement(90, { error: "The studio did not answer." }), { action: "unreachable", message: "The studio did not answer." });

// price check when the page attaches a job to its reservation
assert.equal(priceFits(90, job("queued", { credits: 90, status: "held" })), true);
assert.equal(priceFits(90, job("queued", { credits: 20, status: "held" })), true);
assert.equal(priceFits(20, job("queued", { credits: 90, status: "held" })), false, "the page reserved less than the studio charges");
assert.equal(priceFits(90, job("queued", null)), false, "no price reported: do not accept");
assert.equal(priceFits(90, { found: false }), false);
assert.equal(priceFits(90, { error: "x" }), false);
// the studio's real /api/health shape (checked against the live studio on 2026-10-13)
assert.equal(billingEnabledIn({ ok: true, public: true, swap: { billing: { enabled: true, credits_per_usd: 100, parent_origin: "" } } }), true);
assert.equal(billingEnabledIn({ ok: true, public: true, swap: { billing: { enabled: false } } }), false, "billing off: nobody is sent in");
assert.equal(billingEnabledIn({ ok: true, public: true, swap: {} }), false, "no billing field: not ready");
assert.equal(billingEnabledIn({ billing: { enabled: true } }), true);
assert.equal(billingEnabledIn(null), false);
assert.equal(billingEnabledIn({ swap: { billing: { enabled: "true" } } }), false, "only a real true counts");
// the address from Vercel: what pasting adds must not break it
const good = { origin: "https://either-publication-findings-machines.trycloudflare.com", key: "abc123" };
assert.deepEqual(parseStudioAddress("https://either-publication-findings-machines.trycloudflare.com/?key=abc123"), good);
assert.deepEqual(parseStudioAddress("  https://either-publication-findings-machines.trycloudflare.com/?key=abc123\n"), good, "spaces and a newline");
assert.deepEqual(parseStudioAddress('"https://either-publication-findings-machines.trycloudflare.com/?key=abc123"'), good, "surrounding quotes");
assert.deepEqual(parseStudioAddress("https://either-publication-findings-machines.trycloudflare.com?key=abc123"), good, "no slash before the query");
assert.deepEqual(parseStudioAddress("https://either-publication-findings-machines.trycloudflare.com/"), { problem: "bad_address" }, "no key");
assert.deepEqual(parseStudioAddress("http://x.trycloudflare.com/?key=abc"), { problem: "bad_address" }, "not https");
assert.deepEqual(parseStudioAddress("either-publication-findings-machines.trycloudflare.com/?key=abc"), { problem: "bad_address" }, "no scheme");
assert.deepEqual(parseStudioAddress(""), { problem: "not_configured" });
assert.deepEqual(parseStudioAddress(undefined), { problem: "not_configured" });
assert.deepEqual(parseStudioAddress("   "), { problem: "not_configured" });
console.log("facestudio-v billing: all checks passed");
