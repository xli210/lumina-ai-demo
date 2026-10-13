// node --experimental-strip-types scripts/check-facestudio-v-token.mjs
// The studio page's billing token: signed, expiring, bound to one user.
import assert from "node:assert/strict";
import { signStudioToken, verifyStudioToken, bearerToken, FSV_TOKEN_TTL_SECONDS } from "../lib/facestudio-v-token.ts";

const S = "service-role-secret-for-test";
const now = Date.UTC(2026, 9, 13, 12, 0, 0);
const t = signStudioToken("user-1", S, now);

assert.equal(verifyStudioToken(t, S, now), "user-1", "a fresh token names its user");
assert.equal(verifyStudioToken(t, S, now + (FSV_TOKEN_TTL_SECONDS - 1) * 1000), "user-1", "still valid just before expiry");
assert.equal(verifyStudioToken(t, S, now + FSV_TOKEN_TTL_SECONDS * 1000), null, "expired at its expiry time");
assert.equal(verifyStudioToken(t, "another-secret", now), null, "another secret does not verify it");
assert.equal(verifyStudioToken(null, S, now), null);
assert.equal(verifyStudioToken("", S, now), null);
assert.equal(verifyStudioToken("abc", S, now), null);
assert.equal(verifyStudioToken(t + ".x", S, now), null, "extra segment");

// tampering: change the user inside the body, keep the signature
const [body, sig] = t.split(".");
const forged = Buffer.from(JSON.stringify({ u: "user-2", e: JSON.parse(Buffer.from(body, "base64url")).e })).toString("base64url");
assert.equal(verifyStudioToken(`${forged}.${sig}`, S, now), null, "a body edit breaks the signature");
// a signature for another user's body does not transfer
const t2 = signStudioToken("user-2", S, now);
assert.equal(verifyStudioToken(`${body}.${t2.split(".")[1]}`, S, now), null, "signatures do not transfer");
assert.notEqual(t, t2);
assert.throws(() => signStudioToken("u", undefined, now), /secret/);
assert.equal(verifyStudioToken(t, undefined, now), null, "no secret means nothing verifies");

const req = (h) => new Request("https://x.test/", { headers: h });
assert.equal(bearerToken(req({ authorization: `Bearer ${t}` })), t);
assert.equal(bearerToken(req({ authorization: `bearer ${t}` })), t);
assert.equal(bearerToken(req({ authorization: `Basic ${t}` })), null);
assert.equal(bearerToken(req({})), null);
console.log("facestudio-v token: all checks passed");
