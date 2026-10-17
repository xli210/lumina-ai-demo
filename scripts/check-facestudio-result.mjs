// node --experimental-strip-types scripts/check-facestudio-result.mjs
// How Face Studio results are fetched (straight from storage, gateway as the fallback)
// and how a gateway that is not answering is worded for the page.
import assert from "node:assert/strict";
import { fetchResultPreferStorage, resultObjectKey } from "../lib/facestudio-result.ts";
import { GATEWAY_UNAVAILABLE_MESSAGE, normalizeUpstream } from "../lib/facestudio-upstream.ts";

const JOB = "810e12e7-2d52-44a2-816f-f3d3ff4fb7df";
const validId = (v) => /^[A-Za-z0-9-]{8,80}$/.test(v);
const png = (tag) => new Response(tag, { status: 200, headers: { "content-type": "image/png" } });
const mk = (over = {}) => {
  const calls = { storage: [], gateway: 0 };
  return {
    calls,
    deps: {
      storageUrl: (k) => `https://r2.test/video-api/${k}?sig=x`,
      fetchFn: async (u) => { calls.storage.push(u); return png("from-storage"); },
      viaGateway: async () => { calls.gateway++; return png("from-gateway"); },
      outputPrefix: "facestudio/output",
      isValidJobId: validId,
      ...over,
    },
  };
};
const text = async (r) => await r.text();

// the object key matches what the gateway reads: <S3_OUTPUT_PREFIX>/<job_id>.png
assert.equal(resultObjectKey("facestudio/output", JOB), `facestudio/output/${JOB}.png`);
assert.equal(resultObjectKey("/facestudio/output/", JOB), `facestudio/output/${JOB}.png`, "stray slashes in the setting do not matter");

// 1. storage has it: no byte goes through the gateway
let t = mk();
let r = await fetchResultPreferStorage(JOB, t.deps);
assert.equal(await text(r), "from-storage");
assert.equal(t.calls.gateway, 0, "the gateway is not asked");
assert.equal(t.calls.storage.length, 1);
assert.ok(t.calls.storage[0].includes(`/facestudio/output/${JOB}.png`));

// 2. storage says 404 (result not written yet): the gateway answers
t = mk({ fetchFn: async (u) => { t.calls.storage.push(u); return new Response("nope", { status: 404 }); } });
r = await fetchResultPreferStorage(JOB, t.deps);
assert.equal(await text(r), "from-gateway");
assert.equal(t.calls.gateway, 1);

// 3. storage refuses (403) or errors (500): the gateway answers
for (const status of [403, 500, 503]) {
  t = mk({ fetchFn: async () => new Response("x", { status }) });
  r = await fetchResultPreferStorage(JOB, t.deps);
  assert.equal(await text(r), "from-gateway", `storage ${status}`);
}

// 4. storage unreachable (network error / timeout): the gateway answers
t = mk({ fetchFn: async () => { throw new Error("connect ETIMEDOUT"); } });
r = await fetchResultPreferStorage(JOB, t.deps);
assert.equal(await text(r), "from-gateway");

// 5. storage not configured on this deployment: straight to the gateway, no storage call
t = mk({ storageUrl: () => null });
r = await fetchResultPreferStorage(JOB, t.deps);
assert.equal(await text(r), "from-gateway");
assert.equal(t.calls.storage.length, 0);

// 6. a job id that is not a job id never reaches storage
t = mk();
r = await fetchResultPreferStorage("../../etc/passwd", t.deps);
assert.equal(await text(r), "from-gateway");
assert.equal(t.calls.storage.length, 0, "no storage lookup for a malformed id");
t = mk();
await fetchResultPreferStorage("short", t.deps);
assert.equal(t.calls.storage.length, 0);

// 7. the gateway is down as well: its answer is passed on for the route to turn into a 502
t = mk({ fetchFn: async () => new Response("", { status: 404 }), viaGateway: async () => new Response("<html>Service Suspended</html>", { status: 503 }) });
r = await fetchResultPreferStorage(JOB, t.deps);
assert.equal(r.status, 503);

// 8. releasing storage's body must never hold the fallback up (a body whose cancel() never finishes)
t = mk({ fetchFn: async () => { const res = new Response("x", { status: 404 }); Object.defineProperty(res, "body", { value: { cancel: () => new Promise(() => {}) } }); return res; } });
r = await Promise.race([fetchResultPreferStorage(JOB, t.deps), new Promise((ok) => setTimeout(() => ok("HUNG"), 1500))]);
assert.notEqual(r, "HUNG", "a stuck body release delayed the fallback");
assert.equal(await text(r), "from-gateway");

// 9. storage that never answers is given a bounded time, then the gateway answers
t = mk({ fetchFn: () => new Promise(() => {}), storageTimeoutMs: 100 });
r = await Promise.race([fetchResultPreferStorage(JOB, t.deps), new Promise((ok) => setTimeout(() => ok("HUNG"), 2000))]);
assert.notEqual(r, "HUNG", "storage that never answers held the request");
assert.equal(await text(r), "from-gateway");

// --- the gateway answering with a web page (the incident) ------------------
const SUSPENDED = '<!DOCTYPE html> <html lang="en"> <head> <title>Service Suspended</title> </head> <body> This service has been suspended by its owner. </body> </html>';
let n = normalizeUpstream(503, SUSPENDED);
assert.equal(n.status, 503);
assert.equal(n.body.error_code, "gateway_unavailable");
assert.equal(n.body.error_message, GATEWAY_UNAVAILABLE_MESSAGE);
assert.equal(n.body.retryable, true);
assert.equal(n.body.error_kind, "server");
assert.ok(!JSON.stringify(n.body).includes("<"), "no markup reaches the page");
assert.ok(!JSON.stringify(n.body).includes("suspended by its owner"), "nothing of the provider's page reaches the page");

// a cold-start page or a proxy error page
n = normalizeUpstream(502, "<html><body>Bad Gateway</body></html>");
assert.equal(n.body.error_code, "gateway_unavailable");
assert.equal(n.status, 502);
// a web page that arrived with a 200 is still the server's fault
n = normalizeUpstream(200, "<html>oops</html>");
assert.equal(n.status, 502);
assert.equal(n.body.error_code, "gateway_unavailable");
// an empty 5xx
n = normalizeUpstream(504, "");
assert.equal(n.body.error_code, "gateway_unavailable");
assert.equal(n.status, 504);
// plain-text 5xx
n = normalizeUpstream(500, "Internal Server Error");
assert.equal(n.body.error_code, "gateway_unavailable");

// the gateway's own errors are passed through untouched, 5xx or not
const own = { state: "error", error_code: "gpu_unavailable", error_kind: "server", error_message: "busy", retryable: true };
n = normalizeUpstream(503, JSON.stringify(own));
assert.deepEqual(n, { status: 503, body: own });
const user = { state: "error", error_code: "no_face_in_body", error_kind: "user", error_message: "no face" };
n = normalizeUpstream(422, JSON.stringify(user));
assert.deepEqual(n, { status: 422, body: user });
// FastAPI's own {detail} for a 4xx stays as it was
n = normalizeUpstream(404, JSON.stringify({ detail: "unknown job" }));
assert.deepEqual(n, { status: 404, body: { detail: "unknown job" } });
// a 5xx JSON with no error code of the gateway's own came from something in front of it
n = normalizeUpstream(503, JSON.stringify({ message: "upstream connect error" }));
assert.equal(n.body.error_code, "gateway_unavailable");
// success is untouched
n = normalizeUpstream(200, JSON.stringify({ job_id: "abc", faces: [] }));
assert.deepEqual(n, { status: 200, body: { job_id: "abc", faces: [] } });
// 2xx empty body and plain text 4xx keep the old behaviour
assert.deepEqual(normalizeUpstream(200, ""), { status: 200, body: {} });
assert.deepEqual(normalizeUpstream(404, "not found"), { status: 404, body: { detail: "not found" } });
// a JSON array is not an object
n = normalizeUpstream(200, "[1,2]");
assert.deepEqual(n, { status: 200, body: { detail: "[1,2]" } });

console.log("facestudio result and upstream: all checks passed");
