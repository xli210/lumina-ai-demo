// Who gets the free credits (lib/farm-rules.ts): the account-farm rules, without the database.
//   node --experimental-strip-types --test scripts/test-farm-rules.mjs      (Node 22.6+)
import { test } from "node:test";
import assert from "node:assert/strict";
import { farmVerdict, MAX_GRANTED_PER_SMALL_DOMAIN } from "../lib/farm-rules.ts";

const TEMP = new Set(["wabblywabble.com", "ip:159.203.157.224"]);
const MAJOR = new Set(["google.com", "outlook.com", "qq.com"]);
const v = (provider, otherDomains = 0, sameDomainGranted = 0) => farmVerdict({ provider, otherDomains, sameDomainGranted }, TEMP, MAJOR);

test("a known temp-mail server is refused, whatever else", () => {
  assert.equal(v("ip:159.203.157.224").refuse, true, "the thinkatime.com / tipsfuel.com machine");
  assert.equal(v("wabblywabble.com").refuse, true);
});

test("a big mail provider is never refused by these rules, however many sign-ups share it", () => {
  assert.equal(v("google.com", 500, 500).refuse, false, "Gmail and Google Workspace domains");
  assert.equal(v("outlook.com", 3, 40).refuse, false);
});

test("a domain's own mail server is refused once it serves one other sign-up domain", () => {
  assert.equal(v("ip:1.2.3.4", 0).refuse, false, "a company running its own mail: its own domain only");
  assert.equal(v("ip:1.2.3.4", 1).refuse, true, "the same machine for a second domain: a farm (thinkatime + tipsfuel)");
});

test("another provider needs two other domains, as before", () => {
  assert.equal(v("smallhost.net", 1).refuse, false);
  assert.equal(v("smallhost.net", 2).refuse, true);
});

test("a small domain that keeps opening free accounts is refused from the third", () => {
  assert.equal(MAX_GRANTED_PER_SMALL_DOMAIN, 2);
  assert.equal(v("ip:9.9.9.9", 0, 0).refuse, false, "first account");
  assert.equal(v("ip:9.9.9.9", 0, 1).refuse, false, "second account");
  const third = v("ip:9.9.9.9", 0, 2);
  assert.equal(third.refuse, true, "third account of the same domain in a week (four thinkatime.com accounts on 2026-11-28)");
  assert.match(third.why, /2 accounts of this domain/);
  assert.equal(v("smallhost.net", 0, 2).refuse, true);
});

test("nothing to go on: no refusal (a DNS failure must never cost a real person their credits)", () => {
  assert.deepEqual(v(null, 9, 9), { refuse: false, why: null });
  assert.equal(v("", 9, 9).refuse, false);
});

test("every refusal says why", () => {
  for (const r of [v("wabblywabble.com"), v("ip:1.2.3.4", 1), v("smallhost.net", 2), v("ip:9.9.9.9", 0, 2)]) {
    assert.equal(r.refuse, true);
    assert.ok(r.why && r.why.length > 5);
  }
});
