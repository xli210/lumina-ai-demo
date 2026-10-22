// node --experimental-strip-types scripts/check-stripe-reconcile.mjs
// Whether a Stripe payment counts as delivered: a license for an app purchase,
// credits in the ledger for a credit pack.
import assert from "node:assert/strict";
import { CREDIT_TOPUP_KIND, classifyDelivery, summarizeRevenue } from "../lib/stripe-reconcile-classify.ts";

// the case that was wrong: a credit pack, credited, has no license and is fine
let d = classifyDelivery({ metadataKind: CREDIT_TOPUP_KIND, licenseKey: null, creditsGranted: 500 });
assert.deepEqual([d.kind, d.delivered, d.creditsGranted], ["credits", true, 500]);

// a credit pack that was paid but never credited is the real failure
d = classifyDelivery({ metadataKind: CREDIT_TOPUP_KIND, licenseKey: null, creditsGranted: null });
assert.deepEqual([d.kind, d.delivered], ["credits", false]);

// a credit pack never needs a license, even if one happens to exist
d = classifyDelivery({ metadataKind: CREDIT_TOPUP_KIND, licenseKey: "AAAA-BBBB-CCCC-DDDD", creditsGranted: 100 });
assert.equal(d.delivered, true);

// the session could not be read, but the ledger knows it was credits
d = classifyDelivery({ metadataKind: undefined, licenseKey: null, creditsGranted: 300 });
assert.deepEqual([d.kind, d.delivered], ["credits", true]);
d = classifyDelivery({ metadataKind: null, licenseKey: null, creditsGranted: 300 });
assert.equal(d.kind, "credits");

// an app purchase: delivered only when a license exists
d = classifyDelivery({ metadataKind: undefined, licenseKey: "AAAA-BBBB-CCCC-DDDD", creditsGranted: null });
assert.deepEqual([d.kind, d.delivered], ["license", true]);
d = classifyDelivery({ metadataKind: "license", licenseKey: null, creditsGranted: null });
assert.deepEqual([d.kind, d.delivered], ["license", false]);

// unreadable session, nothing found anywhere: judged as a license purchase (the old behaviour)
d = classifyDelivery({ metadataKind: undefined, licenseKey: null, creditsGranted: null });
assert.deepEqual([d.kind, d.delivered], ["license", false]);

// zero credits granted is still a grant (not null), so it is not mistaken for missing
d = classifyDelivery({ metadataKind: CREDIT_TOPUP_KIND, licenseKey: null, creditsGranted: 0 });
assert.equal(d.delivered, true);

// ---- revenue by source
const pay = (o) => ({ kind: "license", amount: 0, fee: 0, refunded: 0, product_id: null, pack_id: null, credits_granted: null, ...o });
let r = summarizeRevenue([
  pay({ kind: "credits", amount: 2000, fee: 88, pack_id: "standard", credits_granted: 2160 }),
  pay({ kind: "credits", amount: 500, fee: 45, pack_id: "starter", credits_granted: 500 }),
  pay({ kind: "credits", amount: 2000, fee: 88, pack_id: "standard", credits_granted: 2160 }),
  pay({ amount: 1990, fee: 88, product_id: "nano-imageedit" }),
  pay({ amount: 4990, fee: 145, product_id: "nano-facestudio-pro" }),
  pay({ amount: 4990, fee: 145, refunded: 4990, product_id: "nano-facestudio-pro" }),
]);
assert.deepEqual([r.credits.count, r.credits.gross, r.credits.fees, r.credits.net, r.credits.creditsGranted], [3, 4500, 221, 4279, 4820]);
assert.deepEqual([r.license.count, r.license.gross, r.license.refunded, r.license.fees, r.license.net], [3, 11970, 4990, 378, 6602]);
assert.deepEqual([r.total.count, r.total.gross, r.total.net], [6, 16470, 10881]);
assert.equal(r.total.gross, r.credits.gross + r.license.gross, "the two sources add up to the total");
assert.equal(r.total.net, r.credits.net + r.license.net);
assert.equal(r.credits.feesComplete && r.license.feesComplete, true);
// products and packs, biggest first
assert.deepEqual(r.byProduct.map((x) => [x.id, x.count, x.gross, x.refunded, x.net]), [["nano-facestudio-pro", 2, 9980, 4990, 4700], ["nano-imageedit", 1, 1990, 0, 1902]]);
assert.deepEqual(r.byPack.map((x) => [x.id, x.count, x.gross, x.creditsGranted]), [["standard", 2, 4000, 4320], ["starter", 1, 500, 500]]);
// a payment with no fee figure is counted, but the totals say the fees are incomplete
r = summarizeRevenue([pay({ kind: "credits", amount: 500, fee: null, pack_id: "starter", credits_granted: 500 })]);
assert.deepEqual([r.credits.gross, r.credits.fees, r.credits.net, r.credits.feesComplete, r.total.feesComplete], [500, 0, 500, false, false]);
// nothing sold
r = summarizeRevenue([]);
assert.deepEqual([r.total.count, r.total.gross, r.byProduct.length, r.byPack.length], [0, 0, 0, 0]);
// an unknown product or pack is still counted somewhere
r = summarizeRevenue([pay({ amount: 100, product_id: null }), pay({ kind: "credits", amount: 100, pack_id: null, credits_granted: 100 })]);
assert.equal(r.byProduct[0].id, "unknown");
assert.equal(r.byPack[0].id, "unknown");

console.log("stripe reconcile: all checks passed");
