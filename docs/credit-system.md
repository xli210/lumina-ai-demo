# Credit system

Prepaid credits for the hosted AI services. Desktop licenses are unaffected.

Phases 1 and 2 are implemented: the ledger and reservation model, Stripe
webhook de-duplication, and a working top-up flow at `/credits`. Nothing
*spends* credits yet — no service is metered against them. See
[Roadmap](#10-roadmap).

---

## 1. Positioning: what credits are, and are not

Credits apply **only to hosted cloud AI services** (VSR-Pro upscaling, the
online FaceSwap/FaceVivid consoles). Desktop applications stay exactly as
they are today: one-time purchase, machine-bound license, no metering, no
renewal.

This split is deliberate. The homepage FAQ, rendered into the `FAQPage`
JSON-LD in `app/page.tsx`, currently states:

> Desktop licenses are one-time and machine-bound, with no per-image,
> per-minute, per-frame, or per-render fees … There is no auto-renewal, no
> yearly subscription, and no usage meter.

That text has been crawled and is a public commitment. Billing cloud
rendering by the frame while keeping desktop licenses perpetual honours it;
quietly metering the desktop apps would not.

**Copy that must change when `/credits` ships** — not before, since
advertising a page that does not exist is its own problem:

| Location | Change |
| --- | --- |
| `app/page.tsx` FAQ + JSON-LD | Scope "no usage meter" explicitly to desktop apps |
| `app/components/pricing-section.tsx` | Separate desktop pricing from cloud credit pricing |
| `/trust` | State how credits are priced, and that they do not expire |
| `/terms` | Prepaid balance terms: non-expiry, refunds, negative balances |

Credit packs are one-time purchases, not subscriptions, so the "no
subscription" promise holds for both halves of the product line.

---

## 2. The model

### Units

**1 credit = $0.01 USD.** Every amount is a whole number of credits, stored
in `BIGINT` columns. Money is never represented as a float anywhere in this
system.

### An append-only ledger, not a balance column

The obvious implementation — `profiles.credits` plus
`UPDATE credits = credits - 10` — fails in three ways: it cannot explain how
a balance came to be, it loses writes when two spends race, and it has
nowhere to record a refund or a chargeback.

Instead:

- **`credit_ledger`** is append-only and is the source of truth. One row per
  movement, signed, with a reason and provenance. It cannot be updated or
  deleted by anyone, including the service role.
- **`credit_accounts`** holds the materialised balance, written in the same
  transaction as the ledger row, purely so reads do not have to sum.

`SUM(credit_ledger.amount) == credit_accounts.balance` must always hold.
`npm run verify:credits` asserts it.

Corrections are made by appending an offsetting `admin_adjust` entry, the
way any general ledger is corrected.

### Reserve, then settle

AI jobs are asynchronous and can fail, so charging at submit time and
charging at completion time are both wrong:

- Charge on submit → every failed render needs a refund, and any bug in the
  refund path takes money from users.
- Charge on completion → one credit can launch a hundred concurrent jobs.

So work is billed in two phases, the way a card authorisation is:

```
submit      credit_hold      reserve the estimate      held += n
                             (no ledger row — nothing has moved)

success     credit_capture   charge the metered cost   balance -= actual
                                                       held -= n
                                                       one 'spend' row

failure     credit_release   return everything         held -= n
                                                       no ledger row
```

Two consequences worth stating explicitly:

- **A failed render is never billable.** Release is the correct response to
  `FAILED`, `CANCELLED` and `TIMED_OUT` alike.
- **Settlement is capped at the reservation.** The user was quoted an
  estimate before submitting; if the job turns out to cost more, the
  difference is absorbed and the uncapped figure is recorded in the ledger
  reference so pricing can be recalibrated. Charging above the quote is not
  worth the support cost.

Spendable credit is always `balance - held`, exposed as `available`. Code
that reads `balance` to decide whether a job can run is wrong.

### Negative balances are allowed

A chargeback can land after the credits have been spent. `credit_accounts`
therefore has no `CHECK (balance >= 0)`: the debt is recorded rather than
written off. No extra rule is needed to stop further spending, because
`available` is negative too and every `credit_hold` fails on its own.

---

## 3. Schema

Migrations `007`–`011` in `scripts/`. All are idempotent.

| Migration | Contents |
| --- | --- |
| `007_fix_schema_drift.sql` | `licenses.is_trial` / `trial_ends_at` (used by the code, created by no migration); `profiles.stripe_customer_id` |
| `008_lock_down_profiles_writes.sql` | Closes a privilege-escalation hole on `profiles` — see [§6](#6-the-privilege-escalation-fix) |
| `009_create_credit_system.sql` | Enums, three tables, RLS, append-only trigger |
| `010_create_credit_functions.sql` | The credit functions and the expiry sweeper |
| `011_create_stripe_events.sql` | Webhook de-duplication |

### Tables

**`credit_accounts`** — one row per user.

| Column | Notes |
| --- | --- |
| `balance` | Settled credits. May be negative. |
| `held` | Sum of open holds. `CHECK (held >= 0)`. |
| `lifetime_purchased`, `lifetime_spent` | Reporting only. |

**`credit_ledger`** — append-only.

| Column | Notes |
| --- | --- |
| `amount` | Signed. A `CHECK` ties the sign to `kind`, so a `spend` of `+500` cannot be written. |
| `kind` | `purchase`, `bonus`, `signup_grant`, `promo`, `spend`, `refund`, `reversal`, `admin_adjust` |
| `balance_after` | Snapshot, so a single row explains itself in a support conversation. |
| `idempotency_key` | `UNIQUE`. The most important constraint in the system. |
| `hold_id` | Links a settlement back to its reservation. |
| `reference` | `jsonb` provenance: payment intent, pack id, job id, price version. GIN-indexed. |

`user_id` carries **no foreign key**, unlike every other table in this
schema. A cascade from `auth.users` issues a `DELETE`, and the append-only
trigger rejects `DELETE` from every role, so an FK would make deleting a
user fail outright — and `ON DELETE SET NULL` fails the same way, because a
referential action fires the `UPDATE` trigger. Dropping the FK is also the
behaviour you want: deleting an account removes its operational state and
leaves the financial record standing. Reconciliation queries should
therefore join to `credit_accounts` so orphaned rows are excluded.

`refund` and `reversal` are not synonyms: `refund` gives credits *to* the
user as a goodwill gesture (positive); `reversal` takes credits *back*
because the money returned to the card (negative).

**`credit_holds`** — reservations.

| Column | Notes |
| --- | --- |
| `status` | `open` → `captured` \| `released` \| `expired` |
| `service`, `job_ref` | `UNIQUE (service, job_ref)` where `job_ref` is not null, which is what makes settlement idempotent. |
| `expires_at` | Without it, a job that never reaches a terminal state strands the credits permanently. |
| `estimate` | What the reservation was computed from, kept for recalibration. |

### Append-only enforcement

RLS gives users `SELECT` only, but every server path here uses
`createAdminClient()` with the service-role key, which bypasses RLS
entirely. So RLS is *not* what protects the ledger — a `BEFORE UPDATE OR
DELETE` trigger is, plus a second one for `TRUNCATE`. Those fire regardless
of role.

---

## 4. Functions

All are `SECURITY DEFINER` and granted to `service_role` only. `EXECUTE` is
revoked from `PUBLIC`, `anon` and `authenticated` — a `SECURITY DEFINER`
function is executable by everyone by default, and `credit_grant` reachable
from a browser session would let any user mint themselves a balance.

| Function | Purpose |
| --- | --- |
| `credit_grant` | Add credits. Idempotent on `idempotency_key`. |
| `credit_hold` | Reserve. Returns `ok: false` with a `shortfall` rather than raising. |
| `credit_hold_attach_job` | Record the upstream job id once the gateway issues one. |
| `credit_capture` | Settle at metered cost, clamped to the reservation. |
| `credit_release` | Return a reservation in full. |
| `credit_reverse` | Claw credits back after a refund or chargeback. |
| `credit_release_expired_holds` | Sweeper for abandoned reservations. |

**Why functions and not TypeScript.** "Check the balance, write the ledger
row, update the materialised balance" must be atomic, and the Supabase JS
client cannot open a transaction across statements. Each function takes
`SELECT … FOR UPDATE` on the `credit_accounts` row before reading anything,
so concurrent calls for one user serialise. Lock order is always *account,
then hold*, so two settlements cannot deadlock.

Every function returns `jsonb` rather than raising for expected outcomes, so
the API layer can map a result to an HTTP status without parsing error
strings. Every one reports `applied: false` when a replay changed nothing.

The typed wrappers are in `lib/credits-server.ts`; shared constants, types
and idempotency-key builders are in `lib/credits.ts`.

---

## 5. Stripe webhook idempotency

Two layers, doing different jobs. Neither replaces the other.

| Layer | Key | Prevents |
| --- | --- | --- |
| `stripe_events` | `event.id` | One event being processed twice |
| `credit_ledger` | `stripe:<payment_intent_id>` | One *payment* being credited twice |

The second layer is the one that protects the money. A single payment emits
several events with different ids — `checkout.session.completed`,
`charge.succeeded`, `payment_intent.succeeded` — so de-duplicating on
`event.id` alone would not stop two of them from both granting credits.
Keying the ledger on the payment intent collapses all of them onto one
grant.

`stripe_event_begin` re-hands-out a claim that has been stuck unprocessed
for more than five minutes, so a delivery that crashed mid-handler is
retried rather than silently dropped. That is only safe because of the
second layer.

### Behaviour change in `app/api/webhooks/stripe/route.ts`

The route previously logged failures and returned `200`, which told Stripe
never to retry — a customer could pay and silently receive no license. It
now returns `500` on handler failure so the delivery is retried, which is
only safe now that duplicates are detected. A license insert that fails with
a unique violation on `stripe_payment_intent_id` is treated as already-done
rather than retried forever.

---

## 6. The privilege-escalation fix

Found while establishing the RLS baseline for the credit tables, and fixed
in `008` because the credit RLS is written in terms of `public.is_admin()`
and would be meaningless without it.

`001_create_profiles.sql` grants users `UPDATE` on their own profile row:

```sql
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
```

Postgres RLS gates *rows*, never *columns*, and Supabase grants table-level
`UPDATE` to `authenticated` by default. So any signed-in user could run:

```sql
update profiles set role = 'admin' where id = auth.uid();
```

`role = 'admin'` is the only thing gating `/admin`, every
`/private-demos/*` console (which proxy upstream AI services using
server-side API keys), and the "super license" branch in
`app/api/license/activate/route.ts`.

The fix replaces the blanket grant with column-level grants for
`display_name`, `avatar_url` and `updated_at`. `role` and `is_banned` move
to `admin_set_user_role` and `admin_set_user_banned`, which re-check admin
status server-side; `app/admin/admin-dashboard.tsx` calls those instead of
writing the columns directly. `admin_set_user_role` also refuses to let an
admin demote themselves, which would otherwise be a one-click lockout for a
single-admin project.

**Audit before trusting the data:**

```sql
select id, display_name, role, created_at
from public.profiles
where role = 'admin';
```

---

## 7. Applying and verifying

Run `scripts/007` through `scripts/011` in order in the Supabase SQL editor.

```bash
npm run verify:credits
```

Creates a throwaway user, drives every function through replayed grants,
insufficient funds, settling below and above the estimate, releasing a
failed job, a chargeback that pushes the balance negative, and the expiry
sweeper. Asserts the ledger/balance invariant, that the ledger rejects
`UPDATE` and `DELETE` from the service role, and that a signed-in user can
neither promote themselves to admin nor call `credit_grant`. Deletes the
test user afterwards.

Requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY`, most easily via `.env.local`.

---

## 8. The top-up flow

### Packs

`lib/credit-packs.ts` is the only place a credit price is defined. Because
1 credit = $0.01, a pack's base credits and its `unit_amount` in cents are
the same number, so `baseCredits()` derives one from the other and they
cannot drift apart when a price changes. Only `bonusCredits` sits on top.

| Pack | Price | Base | Bonus | Total |
| --- | --- | --- | --- | --- |
| Starter | $5 | 500 | — | 500 |
| Standard | $20 | 2,000 | +8% | 2,160 |
| Pro | $50 | 5,000 | +15% | 5,750 |
| Studio | $100 | 10,000 | +25% | 12,500 |

Nothing but a pack id crosses the wire. `startCreditCheckoutSession` in
`app/actions/credits.ts` resolves the price and the credit amount from this
file, so a client that edits the numbers changes nothing it is charged.

### Welcome credits

New accounts get `SIGNUP_GRANT_CREDITS` (100, $1). It was 200 until
2026-10-02, when it was halved after the grant, which had no condition, was
being collected repeatedly through several free email accounts.
`ensureSignupGrant` does this lazily on first balance read rather
than from the signup trigger, so the users who registered before credits
existed are covered by the same code path. It pre-checks the ledger for
`signup:<user_id>` only to keep an ordinary read off the write path;
correctness rests on that idempotency key, not on the pre-check.

### One claim per device and network

Free credits are the welcome grant **and** the daily top-up (the top-up is the
larger leak: it is paid every day, per account). Both are limited by
`free_credit_claim` (scripts/015, wrapped by `lib/free-claim.ts`):

| Rule | Value |
| --- | --- |
| Accounts per device that may receive free credits | 1, forever. The device is an httpOnly cookie `np_did`, set by `middleware.ts` |
| Accounts per network | 1 per 30 days. The network is the IP (IPv6 reduced to its /64) |
| Existing accounts | Grandfathered: they keep their credits and allowance. They count against a *device*, not against an *IP* |
| Accounts that have bought credits | Always eligible for the daily top-up |

Both keys are HMAC'd with a server secret (`FREE_CLAIM_HASH_SECRET`, falling
back to `SUPABASE_SERVICE_ROLE_KEY`) before they are stored; the table holds no
IP addresses or cookie values. A refused account gets no welcome grant and no
daily top-up, can still buy credits, and sees why on `/credits`.

**What it does not stop:** someone who changes network and clears cookies (a VPN
plus a new browser profile). **Who it can wrongly refuse:** a real person on a
network that someone else already claimed from: a dorm, an office, a mobile
carrier, a household. Buying any pack lifts the refusal for the daily top-up.
The next steps up are a CAPTCHA at signup (Supabase supports Turnstile) and
asking for a card or phone number before releasing free credits.

If the migration is not applied, `claimFreeCredits` logs
`free_credit_claim() is missing` and the grant goes ahead (reduced to 100): an
outage of the check must not take free credits away from everyone.

Looking for abuse: the queries are at the bottom of
`scripts/015_create_free_credit_claims.sql`.

### Purchase

1. `/credits` renders the balance and the packs server-side.
2. Picking a pack calls `startCreditCheckoutSession(packId)`, which
   get-or-creates a Stripe Customer (cached on `profiles.stripe_customer_id`
   so a user never accumulates duplicates) and opens an embedded Checkout
   session with `metadata.kind = 'credit_topup'`.
3. Stripe returns the browser to `/credits?session_id=…`.
4. The webhook credits the account.
5. The browser polls `/api/credits/ledger` until an entry carrying that
   `session_id` appears, then clears the query param.

Step 5 polls for the *entry*, not for a balance change, because the webhook
is a separate round trip from the redirect and a balance alone cannot tell
"already credited" from "not yet credited".

### Two ledger entries per payment

A top-up writes `purchase` for what was paid for and `bonus` for what was
thrown in free, keyed `stripe:<pi>` and `stripe:<pi>:bonus`. Separating them
keeps a statement honest about what was bought versus given away, and means
repricing a pack cannot retroactively change what a past payment was worth —
the amount sold is captured in session metadata at creation time.

Two guards sit on the grant:

- **`payment_status` must be `paid`.** An async payment method completes the
  session before the money arrives; `checkout.session.completed` for those
  is deliberately a no-op and
  `checkout.session.async_payment_succeeded` is where the credits land. The
  license branch now carries the same guard, which it previously lacked.
- **`amount_total` is a ceiling.** Credits are one per cent, so the amount
  actually collected caps what may be granted. If a discount made the charge
  smaller than list price, the smaller figure wins.

There is no email fallback for resolving the user, unlike the license
branch: credits live on an account, and guessing which account would risk
crediting the wrong one.

### Routes

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /api/credits/balance` | session | Own balance; also hands out the welcome grant |
| `GET /api/credits/ledger` | session | Own statement, `id`-keyed paging |
| `GET /api/credits/packs` | public | List prices, for the pricing page |
| `/credits` | middleware | Wallet page |

`/api/credits` is **not** in the middleware's protected prefixes: the two
session routes authenticate themselves and return a JSON 401, and `packs` is
a public price list. The user id always comes from the session, never from a
query parameter, so there is no id to substitute.

---

## 9. Admin analytics

`/admin/credits` reports revenue, consumption, what the free tier costs, and
outstanding liability. Migration `scripts/012_create_credit_analytics.sql`
adds three read-only RPCs behind it.

Aggregation happens in Postgres, not in the page. Summing the ledger in the
app stops working the first time the ledger is large, and it would put the
definition of "revenue" in two places with nothing keeping them in step.

Each RPC re-checks `is_admin()` rather than trusting its caller, and the
functions are granted to `authenticated` on purpose: a route that forgets its
own gate then fails closed with `42501` instead of leaking. `/admin/credits`
is gated three times over — middleware on the prefix, a role check on the
page, and the check inside each function.

Two definitions worth knowing before reading the numbers:

- **Revenue counts `purchase` only.** Bonus credits were given away; counting
  them would overstate takings by exactly the bonus rate.
- **Spends are reported as positive magnitudes.** The ledger stores them
  negative; `spent: −4,210` on a dashboard reads like a bug.

The figure to actually watch is **free-funded render share**. High is fine
early — it means people are trying the thing. High *and flat over months*
means the free tier has become the product rather than a funnel.

Migration 012 also adds `idx_credit_ledger_kind_created`. Every aggregate
filters by `kind`, and the only pre-existing index is on
`(user_id, created_at)`, so without it each dashboard load is a sequential
scan of the whole ledger.

### Testing them from the SQL editor

These functions are hard to test, and it is worth knowing why before trusting
one. `is_admin()` raises before the query is planned, and plpgsql compiles a
function body lazily on first execution — so **any caller that is not a real
admin gets `42501` and never compiles the body**. A syntax or
column-ambiguity error inside the query is therefore invisible to every check
that does not hold an admin session, including the Supabase SQL editor, which
runs with `auth.uid()` NULL.

Impersonate yourself to actually exercise them:

```sql
-- Your own id, from: select id, display_name, role from public.profiles where role = 'admin';
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-000000000000')::text,
  true            -- transaction-local; ends with this statement batch
);

select public.credit_admin_summary(30);
select * from public.credit_admin_daily(7);
select * from public.credit_admin_top_users(5);
```

All three must return without error. `set_config(..., true)` is
transaction-local, so the impersonation does not outlive the query.

Two bugs shipped past me here for exactly this reason: calling the RPCs with
the service-role client (whose `auth.uid()` is NULL, so `is_admin()` is always
false), and an ambiguous `user_id` between a `RETURNS TABLE` OUT parameter and
a `credit_ledger` column. Run the snippet above after touching any of these
functions.

---

## 10. Roadmap

Phases 1 and 2 are done. Each subsequent phase ends in a shippable state.

| Phase | Scope |
| --- | --- |
| 1 — **done** | Migrations 007–011, `lib/credits*.ts`, webhook idempotency, verification script |
| 2 — **done** | `lib/credit-packs.ts`, `/api/credits/*`, `/credits` page, webhook `metadata.kind` dispatch |
| 3 | `lib/credit-pricing.ts`, VSR-Pro proxy wired to hold/capture/release |
| 4 | VSR-Pro console moved off `adminGate` and opened to signed-in users |
| 5 | `charge.refunded` / dispute handling, sweeper cron, full paged statement |

**Still outstanding from phase 2:** the four public copy changes in
[§1](#1-positioning-what-credits-are-and-are-not). `/credits` now exists, so
they are safe to make.

### Notes for phase 3 pricing

Cost tracks `stage1_base` — the *source* short edge — not the delivery
preset. From the measured throughput in `docs/vsr-pro-api.zh-CN.md` §6, a
1920×1080 source costs about the same delivered at 1080p (5.9 fps) as at 4K
(4.9 fps), because the repair stage is ~70% of render time and runs at the
source base either way. A 640×360 source delivered at 1080p repairs at 540
and runs at 16.6 fps. A price table keyed on output resolution would
systematically overcharge small sources and lose money on large ones.

Bill on `frames`, not `seconds`. §6 notes both pipelines scale to zero after
~30 s idle, and a cold start roughly halves the computed `fps` on the first
job. Billing wall time would charge users for infrastructure state, and the
same clip would cost different amounts on two submissions.

---

## 11. Open decisions

- **The credits-per-frame rate.** Not yet set; it depends on the real GPU
  cost basis and target margin. The interactive model used to derive it is
  in the `credit-system-design` canvas. Pack sizes are now fixed (see
  [§8](#8-the-top-up-flow)).
- **Expiry.** Recommended non-expiring: it matches the brand and avoids most
  prepaid-balance regulation. The schema does not currently implement
  expiry; adding it later means lot-based grants and FIFO consumption.
- **Erasure requests.** `credit_accounts` and `credit_holds` cascade away
  with the user; `credit_ledger` rows are retained with a `user_id` that no
  longer resolves (see [§3](#3-schema)). If a deletion request has to cover
  the financial record too, that purge means disabling the append-only
  trigger deliberately — which is the point, since it should never happen as
  a silent side effect of a cascade.
