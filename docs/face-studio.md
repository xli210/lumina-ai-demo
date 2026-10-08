# Nano FaceStudio Online

The credit-metered face swap at `/face-studio`, with a free allowance so
every signed-in account can use it without paying.

This is what **Nano FaceStudio Online** now serves. Its Cloudflare tunnel was
retired, and `/api/demos/open?id=image` — the single hop every "Try online"
button on the site already went through — now lands here instead, so no page
needed editing. Built from `facestudio_handoff/`, with the changes in
[§2](#2-what-changed-from-the-handoff) needed to run on Vercel.

---

## 1. Price

**Per swapped face, not per photo.**

| Unit | Credits | USD | GPU cost | Margin |
| --- | --- | --- | --- | --- |
| Face swap, per face | 10 | $0.10 | ~$0.006–0.008 | ~92% |
| Head swap | 20 | $0.20 | ~$0.010–0.016 | ~85% |
| Detection | free | — | ~$0.001 | — |

A render costs the rate times the number of **reference photos supplied** —
not faces detected. Swapping one person out of a group of six costs the same
as a portrait; swapping all six costs six times that.

This is the fix for a real mispricing. The worker runs one diffusion pass per
face, so a six-face group render is six times the GPU work of a portrait, and
the original flat per-render price charged the same for both. That is
unprofitable at the top end and overpriced at the bottom.

Head swap operates on exactly one face, so its price is unaffected. It is
twice a face swap because it costs roughly twice the GPU time — a flat price
would have face swaps subsidising head swaps.

Linear in face count is a slight overcharge: a render has fixed overhead
(decoding the source, encoding a ~20 MB PNG) that does not repeat per face.
That is deliberate for now and measurable later — `credit_holds.estimate`
records the face count and the capture reference records the measured
`elapsed_seconds`, so the curve can be fitted from real jobs rather than
guessed at again. `price_version` in the estimate is bumped whenever the
formula changes, so old holds stay interpretable.

Prices live in one place, `FACESTUDIO_PRICE_PER_FACE` in `lib/facestudio.ts`,
and `creditsForJob(mode, faceCount)` is the only correct way to price a
render. The console has its own copy in `public/face-studio/app.js` for the
button label; the server never trusts it.

### Where this makes us expensive

Against a tool that bills per photo, a crowded photo is where Nano FaceStudio Online
costs the most: six faces is $0.60 against Magic Hour's $0.013 for the same
picture. Akool also bills per face. The comparison table on `/face-studio`
states this rather than hiding it, and quotes our single-face price in the
row so the comparison is like-for-like.

### The free allowance

A signed-in account is topped up to `FREE_TOPUP_CREDITS` (30: three face swaps, or
one Nano ImageEdit) when its balance is below that. An account that has never
bought credits is topped up at most `FREE_TOPUPS_PER_WINDOW` (2) times in any
`FREE_TOPUP_WINDOW_DAYS` (7) days **and** `FREE_TOPUPS_PER_MONTH` (3) times in any
`FREE_TOPUP_MONTH_DAYS` (30) days, and never twice in one UTC day; an account
that has bought credits is topped up whenever it runs low. Credits are the
*upgrade*, not the toll gate.

It was once per UTC day for everyone until 2026-10-08, then 2 per 7 days, and
3 per 30 days was added the same day (two a week alone allows eight a month). That is a standing wage
for anyone willing to open several accounts, and it removed any reason to pay
for a person who needs one edit a day. All copy quotes the rule through
`FREE_ALLOWANCE_SHORT` / `FREE_TOPUP_FREQUENCY` / `FREE_TOPUP_RULE`, so changing the constants in
`lib/facestudio.ts` changes the pages; the static console
(`public/face-studio/index.html`, `app.js`) repeats it and must be edited by hand.

This is not a nicety. "Free for every signed-in NanoPocket account" is
published in fourteen files, including the homepage FAQ's `FAQPage` JSON-LD
and `/trust`, and `free online face swap` is a keyword the product pages rank
on. A paid-only tool would have meant rewriting all of it — and two of those
files are currently empty in the working tree, so two CTAs would have gone on
saying "Try free online" while charging. A free tier costs ~$0.024 of GPU per
top-up and keeps every published claim true.

Implemented as a `promo` grant through `ensureDailyAllowance`, not as a
parallel quota counter. That makes a free render indistinguishable from a paid
one everywhere downstream: the same reservation protects the GPU, a failed
render refunds by the same path, ownership resolves through the same hold, and
the user sees the allowance as a line on their statement rather than an
invisible counter.

It tops the balance **up to** 30, never adds 30. Adding would let the
allowance accumulate across idle days into a balance nobody paid for; topping
up bounds the free tier at 30/day however long an account sits unused. The
consequence is that an account holding a purchased balance above 30 receives
nothing, which is intended — the free tier exists so people can try the tool,
not as a volume discount.

### Why detection is free but gated

Detection costs ~$0.001 of GPU, so it is cheap but not free to us. Rather than
add a rate-limit table, `detect` and `uploads` require a balance of at least
the cheapest render (`DETECT_MIN_BALANCE`). Detecting faces is only useful as
a prelude to rendering, so a user who cannot afford a render has no
legitimate reason to be detecting — and a user who can is self-limiting,
because every render spends down the same balance.

---

## 2. What changed from the handoff

The handoff backend posts photos as multipart to `/v5/api/detect` and
`/v5/api/generate`, up to 40 MB. **A Vercel function body caps out at 4.5 MB**,
so that shape cannot be proxied through Next.js at all.

| Change | Why |
| --- | --- |
| Photos go browser → R2 via a presigned PUT; the API only ever sees keys | 40 MB will not fit through a Vercel function |
| Gateway requires `Authorization: Bearer $FACESTUDIO_GATEWAY_TOKEN` | It holds the RunPod and R2 keys; it must not be openly callable |
| EXIF rotation moved to the browser | The gateway no longer sees image bytes, and the GPU worker ignores EXIF |
| Detect wait capped at 45 s (was 600 s) | So our error surfaces instead of a platform 504 with no body |
| Charge by reserve-then-settle, not "charge when done" | See [§4](#4-how-a-render-is-charged) |
| Face templates served as 2.2 MB of WebP, not 81 MB of PNG | The optimised set already existed in `public/private-demos/faceswap/` |

The original handoff is left untouched in `facestudio_handoff/` as the
reference. The deployable gateway is `facestudio-gateway/`.

---

## 3. How it fits together

```
Browser (/face-studio)
  │
  ├── POST /api/facestudio/uploads ──┐
  │                                   │  (Next.js: auth + balance check)
  │        ┌──────────────────────────┘
  │        ▼
  ├── PUT  <presigned R2 url>            direct; up to 40 MB
  │
  ├── POST /api/facestudio/detect        { input_key }        free
  ├── POST /api/facestudio/generate      reserves credits
  ├── GET  /api/facestudio/status/{id}   settles credits
  └── GET  /api/facestudio/result/{id}   streams the PNG

  Next.js  ──Bearer token──▶  facestudio-gateway (Render)
                                   │
                                   ├──▶ RunPod Serverless (A40)
                                   └──▶ Cloudflare R2
```

Neither the RunPod key nor the R2 credentials exist anywhere the browser can
reach. The two bulk transfers stay off the Vercel path entirely.

### Routes

| Route | Charge | Gate |
| --- | --- | --- |
| `POST /api/facestudio/visit` | — | signed in |
| `POST /api/facestudio/uploads` | — | signed in + balance ≥ 10 |
| `POST /api/facestudio/detect` | — | signed in + balance ≥ 10 |
| `POST /api/facestudio/generate` | **reserves 10 or 20** | signed in + affordable + < 2 in flight |
| `GET /api/facestudio/status/{id}` | **settles** | owns the job |
| `GET /api/facestudio/result/{id}` | — | owns the job |
| `POST /api/facestudio/feedback` | — | owns the job |

Every gate calls `provisionCredits`, which hands out the welcome grant and
today's allowance before reading a balance. So a first-time visitor's first
render is free without any scheduled job existing.

### How the site link reaches it

```
"Try free online" buttons  (5 places, incl. two in files that are
                            currently empty in the working tree)
          │
          ▼
FACESWAP_PRO_DEMO_URL = demoRedirectPath(getDemo("image").id)
          │
          ▼
/api/demos/open?id=image        auth gate; metered demos skip the daily
          │                     open quota, because credits are the limit
          ▼
/face-studio/launch             auth gate again; provisions today's credits
          │
          ▼
/face-studio/index.html         the console itself
```

`lib/demos.ts` marks the `image` entry `internal` and `metered`. `internal`
means `landingPath` is a site route rather than a tunnel, which also drops it
out of `/status` and the GitHub Actions uptime checker — both of those measure
tunnel reachability, and leaving it in would have pinned it at "unknown"
forever.

---

## 4. How a render is charged

The handoff suggests charging 1 credit the first time `status` reports `done`.
That leaves a hole: with no reservation, **a user with a zero balance can
start unlimited GPU jobs** and merely fail to be charged afterwards. The GPU
time is spent either way.

So Nano FaceStudio Online uses the reserve-then-settle model from
[docs/credit-system.md](./credit-system.md) instead:

1. **`generate` reserves.** `credit_hold` puts 10 or 20 credits aside *before*
   the job reaches the GPU. Cannot afford it → `402` carrying `shortfall` and
   a link to `/credits`, and no compute is spent.
2. **`status` settles.** First `done` → `credit_capture` charges the reserved
   amount. First `error` → `credit_release` returns all of it, because a
   render that produced no image is not billable.
3. **The sweeper catches the rest.** A browser closed mid-render leaves the
   hold open; `credit_release_expired_holds` frees it after
   `FACESTUDIO_HOLD_TTL_SECONDS` (15 minutes).

Every settlement is keyed on the hold, so polling `status` repeatedly after a
job finishes changes nothing.

### Ownership

There is no separate jobs table. `credit_holds` already records
`(user_id, service, job_ref)` with a unique index on `(service, job_ref)`, so
the reservation *is* the record of who started a job. `status`, `result` and
`feedback` all resolve the RunPod job id back to a hold and compare
`user_id`. The row survives settlement, which is what keeps a finished result
downloadable.

A job id with no hold is reported as `404`, not `403`: someone else's job
should be indistinguishable from one that never existed.

### Concurrency

`MAX_CONCURRENT_RENDERS = 2` per account, counted as open holds. Without a cap
one account could occupy the whole GPU pool, and a double-clicked button would
pay twice for the same picture.

---

## 5. Deploying the gateway

`facestudio-gateway/` is a FastAPI service. Deploy it like the VSR-Pro
gateway.

**On Render:** new Web Service from this repo, root directory
`facestudio-gateway`.

```
Build:  pip install -r requirements.txt
Start:  python server.py --host 0.0.0.0
Health: /healthz
```

`/healthz` is the only route that does not require the token, because Render's
health check cannot present one.

Environment variables are listed in `facestudio-gateway/.env.example`. Three
you have to obtain:

| Variable | Where from |
| --- | --- |
| `FACESTUDIO_GATEWAY_TOKEN` | `openssl rand -hex 32`; set the same value in Vercel |
| `RUNPOD_API_KEY` | RunPod. Make a **separate** key for this service so it can be revoked alone |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Cloudflare R2, scoped to the `video-api` bucket |

The bucket must be the same one the RunPod endpoint writes results to, and
`S3_OUTPUT_PREFIX` must equal the endpoint's `OUTPUT_S3_PREFIX`.

### R2 CORS is required

The browser PUTs directly to R2, so the bucket needs a CORS rule or every
upload fails with an opaque network error. In the Cloudflare dashboard, under
the bucket's **Settings → CORS policy**:

```json
[
  {
    "AllowedOrigins": ["https://nanopocket.ai"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

Add `http://localhost:3000` while developing.

### On Vercel

Set `FACESTUDIO_GATEWAY_TOKEN` to the same value, and `FACESTUDIO_BASE_URL` if
the gateway is not at the default `https://facestudio-gateway.onrender.com`.

---

## 6. Verifying

With credits in your account (see `docs/credit-system.md`):

1. Open `/face-studio`. The header pill should show your balance.
2. Upload a photo. It uploads to R2, then faces appear. **No charge.**
3. Add a reference face. The hint reads `Costs 10 credits.` (credits only;
   the console does not show a USD conversion).
4. Render. The pill drops by 10 immediately — that is the reservation — and
   `/credits` shows the hold under **Reserved**, not yet as a spend.
5. On success, `/credits` gains a `spend` line of −10.
6. Force a failure (a photo with no face as the reference) and confirm the
   10 credits come back and no `spend` line is written.
7. Spend down to under 10 credits and confirm the render button disables and
   points at `/credits`.

Checking the reservation is visible in step 4 is the point of the exercise: it
is what proves the GPU cannot be used by someone who cannot pay.

---

## 7. Known gaps

- **Cost is not metered per render.** Every face swap costs 10 credits whether
  it took 17 s or 25 s. The gateway returns `seconds` in the RunPod output but
  `status` does not surface it, so `credit_capture` is called with the full
  reserved amount. `credit_holds.estimate` already records the mode and face
  count, so actuals can be compared against it later if a variable price is
  ever wanted.
- **No per-render history page.** Renders appear in `/credits` as `spend`
  lines with a `job_ref`, but there is no gallery of past results.
- **The old private demo is still wired to the dead tunnel.**
  `/private-demos/faceswap` and `/api/private-demos/faceswap/*` are untouched
  and still broken. Removing them is safe once `/face-studio` is confirmed
  working.
