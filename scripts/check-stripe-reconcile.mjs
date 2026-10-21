// node --experimental-strip-types scripts/check-stripe-reconcile.mjs
// Whether a Stripe payment counts as delivered: a license for an app purchase,
// credits in the ledger for a credit pack.
import assert from "node:assert/strict";
import { CREDIT_TOPUP_KIND, classifyDelivery } from "../lib/stripe-reconcile-classify.ts";

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

console.log("stripe reconcile: all checks passed");
