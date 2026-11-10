# Nano ImageEdit 2.0 Online

A prompt-driven photo editor at `/image-edit`, on the SpotEdit model: only the part
of the photo the prompt names changes, and the photo comes back at its full
resolution, up to 49 MP.

Built from the `spotedit_web` package (kept out of this public repo). That package is a
standalone FastAPI server; here its page is re-hosted on nanopocket.ai and its server
is replaced by Next.js routes plus four routes on the existing gateway, so the editor
uses the site's login and credits.

---

## 1. How it fits together

```
browser (/image-edit/index.html, static, sign-in required)
  │
  ├── GET  /api/imageedit/me            watermark?, balance
  ├── POST /api/imageedit/warm          wakes the gateway; with {gpu:true} starts a GPU
  │        └──► gateway POST /ie/api/warm
  ├── POST /api/imageedit/uploads ─────► presigned PUT ──► R2  spotedit/input/<user>/…
  ├── POST /api/imageedit/photo         real size and price, read from the file
  │        └──► gateway POST /ie/api/probe
  ├── POST /api/imageedit/edit          probes again, reserves the price, starts the job
  │        └──► gateway POST /ie/api/run ──► RunPod 8zekyhvth8nfp6 (spotedit, H100)
  └── GET  /api/imageedit/jobs/{id}     settles: capture on done, release on error
           └──► gateway GET /ie/api/status/{id}
```

The gateway holds the RunPod key and never sees a user; auth and credits are in the
Next.js routes. Only signed R2 URLs and job JSON pass through it, plus the first 2 MB of
a photo for `/probe`.

### Storage layout (bucket `video-api`)

| Key | What |
|---|---|
| `spotedit/input/<user>/src_<12 hex>_photo` | An uploaded photo, as sent |
| `spotedit/output/<yyyymmdd>/<job id>/spotedit.png` | The full-resolution result |
| `spotedit/output/<yyyymmdd>/<job id>/spotedit.jpg` | The 2048 px view |

The user id in an input key, and the job id in an output key (its credit hold says who
started it), are what `userMayEdit` checks. The bucket needs a lifecycle rule on
`spotedit/`: results at 49 MP can be over 100 MB each.

---

## 2. Price

`IMAGEEDIT_CREDIT_TIERS` in `lib/imageedit.ts`:

| Photo | Credits per finished edit |
|---|---|
| up to 12 MP | 40 |
| up to 24 MP | 50 |
| up to 49 MP | 60 |

MP is rounded to a whole number first, so a 12.2 MP phone photo counts as 12 MP. The
size comes from the stored file, never from the browser. "Try another version" is a new
edit. A failed edit costs nothing.

Watermark: an account that has never bought credits gets the NanoPocket.ai mark, and
results of those accounts cannot be edited further. A marked job whose result comes back
unmarked is failed and refunded (`toEditJob`).

---

## 3. Limits and behaviour

- JPEG, PNG, TIFF or WebP; at least 256 px per side; at most 49 MP and 120 MB.
- An account can hold two edits at a time (`IMAGEEDIT_MAX_OPEN_EDITS`), because the
  endpoint has two workers.
- A reservation lasts 30 minutes. An edit whose page was closed is listed in "My images"
  for a day and opens with `?job=`. It is settled when the person comes back or reaches the
  limit (`settleOpenEdits`), and for everyone when the editor opens, `/admin/reliability` is
  read, or before the expiry sweep (`settleStaleEdits`): charged if the file
  was made, returned if not. RunPod forgets a job about 30 minutes after it ends, so later
  readings use the file in R2.
- A made edit is shown in its "My images" row itself, original and result under one slider,
  with a download link, as "My videos" does, so seeing it does not depend on the editor, whose
  page also follows an edit still being made. Opening an older edit with `?job=` leaves the
  editor's memory of the edit being made alone.
- Starting a GPU from `/warm` needs a signed-in account that can pay for an edit; the
  gateway allows it once a minute overall and six times an hour per person.

---

## 4. Deploying

The site deploys from the `release` branch on Vercel. The gateway is the Render service
`facestudio-gateway`, rooted at `facestudio-gateway/`, and has to be deployed first: the
new page calls `/ie/api/probe`, which the old gateway does not have. No new secrets.

---

## 5. Verifying

```bash
python facestudio-gateway/test_imageedit.py
```

Then one real edit on the site with a free account (watermarked, no "Keep editing this")
and one with a paid account (clean, charged the right tier), and check the hold in
`credit_holds` carries `estimate.model = "spotedit"`.
