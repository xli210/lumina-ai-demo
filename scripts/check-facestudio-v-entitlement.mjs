// node --experimental-strip-types scripts/check-facestudio-v-entitlement.mjs
// The watermark token: signed here, checked the way the studio checks it.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { ENTITLEMENT_TTL_SECONDS, accountOf, readEntitlement, signEntitlement } from "../lib/facestudio-v-entitlement.ts";

const S = "test-secret";
const now = Date.now();
const paid = signEntitlement(true, S, now);
const free = signEntitlement(false, S, now);

assert.deepEqual(readEntitlement(paid, S, now), { paid: true });
assert.deepEqual(readEntitlement(free, S, now), { paid: false });
assert.match(paid, /^[A-Za-z0-9_-]+\.[0-9a-f]{32}$/, "base64url (no padding) + 32 hex");
assert.notEqual(signEntitlement(true, S, now), paid, "random nonce differs per token");

// the shape the studio documents: {"p","e","n"}
const body = JSON.parse(Buffer.from(paid.split(".")[0], "base64url").toString());
assert.equal(body.p, 1);
assert.equal(body.e, Math.floor(now / 1000) + ENTITLEMENT_TTL_SECONDS);
assert.match(body.n, /^[0-9a-f]{8}$/);
// signature is HMAC-SHA256 of the base64url text, first 32 hex chars (their Node sample)
assert.equal(paid.split(".")[1], createHmac("sha256", S).update(paid.split(".")[0]).digest("hex").slice(0, 32));

// forged, tampered, expired, wrong secret, missing
assert.equal(readEntitlement(paid, "other", now), null);
const [raw, sig] = free.split(".");
const flipped = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(raw, "base64url")), p: 1 })).toString("base64url");
assert.equal(readEntitlement(`${flipped}.${sig}`, S, now), null, "unpaid token edited to paid");
assert.equal(readEntitlement(paid, S, now + (ENTITLEMENT_TTL_SECONDS + 1) * 1000), null, "expired");
assert.equal(readEntitlement("", S, now), null);
assert.equal(readEntitlement("a.b.c", S, now), null);

// the account: opaque, the same for one user, different for another, and covered by the signature
const mine = signEntitlement(false, S, now, "user-1");
assert.deepEqual(readEntitlement(mine, S, now), { paid: false, account: accountOf("user-1", S) });
assert.equal(accountOf("user-1", S), createHmac("sha256", S).update("account:user-1").digest("hex").slice(0, 24));
assert.notEqual(accountOf("user-1", S), accountOf("user-2", S));
assert.ok(!JSON.parse(Buffer.from(mine.split(".")[0], "base64url").toString()).a.includes("user-1"));
const [mraw, msig] = mine.split(".");
const swapped = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(mraw, "base64url")), a: accountOf("user-2", S) })).toString("base64url");
assert.equal(readEntitlement(`${swapped}.${msig}`, S, now), null, "account edited");

// no secret: no token (the video is marked, the hold still works)
assert.equal(signEntitlement(true, undefined, now), null);
assert.equal(signEntitlement(true, "", now), null);
console.log("facestudio-v entitlement: all checks passed");
