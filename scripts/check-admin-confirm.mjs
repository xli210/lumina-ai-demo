// node --experimental-strip-types scripts/check-admin-confirm.mjs
// The rules behind the admin dashboard's confirmation dialog.
import assert from "node:assert/strict";
import {
  CONFIRM_DELAY_SECONDS,
  NEW_ACCOUNT_HOURS,
  accountAgeHours,
  canBecomeAdmin,
  confirmationMatches,
  describeAge,
  secondsLeft,
} from "../lib/admin-confirm.ts";

// typed confirmation
assert.equal(confirmationMatches("alice@example.com", "alice@example.com"), true);
assert.equal(confirmationMatches("  ALICE@Example.COM  ", "alice@example.com"), true, "case and stray spaces do not matter");
assert.equal(confirmationMatches("alice", "alice@example.com"), false, "a part of the email is not enough");
assert.equal(confirmationMatches("alice@example.com ", "alice@example.org"), false);
assert.equal(confirmationMatches("", ""), false, "an empty target never matches an empty entry");
assert.equal(confirmationMatches("   ", "   "), false);
assert.equal(confirmationMatches("x", ""), false);

// countdown
const t0 = 1_000_000;
assert.equal(secondsLeft(t0, t0), CONFIRM_DELAY_SECONDS, "full delay at the moment it opens");
assert.equal(secondsLeft(t0, t0 + 1), CONFIRM_DELAY_SECONDS, "a millisecond later still the full count");
assert.equal(secondsLeft(t0, t0 + 1000), CONFIRM_DELAY_SECONDS - 1);
assert.equal(secondsLeft(t0, t0 + 3999), 1);
assert.equal(secondsLeft(t0, t0 + 4000), 0, "ready exactly at the delay");
assert.equal(secondsLeft(t0, t0 + 60_000), 0);
assert.equal(secondsLeft(t0, t0 - 500), CONFIRM_DELAY_SECONDS, "a clock that went backwards does not shorten it below the delay");

// account age
const now = Date.parse("2026-10-14T14:33:00Z");
const ago = (h) => new Date(now - h * 3_600_000).toISOString();
assert.equal(Math.round(accountAgeHours(ago(2), now) * 10) / 10, 2);
assert.equal(accountAgeHours("not a date", now), Number.POSITIVE_INFINITY, "an unreadable date is treated as old, not new: the database still decides");
assert.equal(describeAge(ago(0.01), now), "1 minute");
assert.equal(describeAge(ago(0.5), now), "30 minutes");
assert.equal(describeAge(ago(1), now), "1 hour");
assert.equal(describeAge(ago(2.2), now), "2 hours");
assert.equal(describeAge(ago(47), now), "47 hours");
assert.equal(describeAge(ago(48), now), "2 days");
assert.equal(describeAge(ago(24 * 200), now), "200 days");

// who can become an admin: the incident was a two-hour-old account
assert.equal(NEW_ACCOUNT_HOURS, 24);
let e = canBecomeAdmin(ago(2.1), true, now);
assert.equal(e.ok, false);
assert.match(e.reason, /only 2 hours old/);
e = canBecomeAdmin(ago(23.9), true, now);
assert.equal(e.ok, false, "just under 24 hours is still too new");
e = canBecomeAdmin(ago(24), true, now);
assert.equal(e.ok, true, "24 hours is old enough");
e = canBecomeAdmin(ago(24 * 90), false, now);
assert.equal(e.ok, false);
assert.match(e.reason, /not confirmed its email/);
e = canBecomeAdmin(ago(24 * 90), true, now);
assert.equal(e.ok, true);

console.log("admin confirm: all checks passed");
