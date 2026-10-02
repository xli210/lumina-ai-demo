# Nano ImageEdit 2.0 Online

A prompt-driven photo editor at `/image-edit`: add, remove, replace, change text,
light & style, season, restore, and a brush-limited free-form edit. Full-resolution
output; for object edits every pixel outside the edited area stays bit-identical.

Built from the `image-edit-studio` package (kept out of this public repo, see
`.gitignore`). That package is a standalone FastAPI server; here its page is
re-hosted on nanopocket.ai and its server is replaced by Next.js routes plus three
routes on the existing gateway, so the editor uses the site's login and credits.

---

## 1. How it fits together

```
browser (/image-edit/index.html, static, sign-in required)
  │
  ├── POST /api/imageedit/uploads ─────► presigned PUT ──► R2  imageedit/src/<user>/…png
  ├── POST /api/imageedit/edit          reserves 30 credits per variation
  │        └──► gateway POST /ie/api/run ──► RunPod 8zekyhvth8nfp6 (qwen-image-studio, H100)
  ├── GET  /api/imageedit/jobs/{id}     settles: capture on done, release on error/cancel
  │        └──► gateway GET /ie/api/status/{id}
  ├── POST /api/imageedit/jobs/{id}/cancel
  └── GET  /api/imageedit/files/{id}/{name} ──► 302 to presigned R2 GET
                                               imageedit/out/<user>/<hold id>/<name>
```

No new credentials were added. Two existing ones are reused:

| What | Where it already lived | Used for |
| --- | --- | --- |
| `FACESTUDIO_GATEWAY_TOKEN` | Vercel + Render | Next.js → gateway. The gateway holds the RunPod key. |
| `R2_DOWNLOADS_*` | Vercel | Signing upload and download URLs for `imageedit/` in `video-api`. |

The GPU worker's template already points at `video-api` (`IO_S3_BUCKET`), which is
why the shared bucket works without any RunPod configuration change.

### Storage layout (bucket `video-api`)

| Key | Written by |
| --- | --- |
| `imageedit/src/<user id>/src_<12 hex>.png` | the browser, on a presigned PUT |
| `imageedit/out/<user id>/<hold id>/<file>` | the worker |
| `imageedit/samples/<name>.png` | uploaded once; 12 samples, 2400 px long side |

The user id in every key is what makes ownership checkable from the key alone
(`userMayEdit` in `lib/imageedit-server.ts`). The output folder is named after
the credit hold, which exists before the job does; the hold also records who
started the job, so `/files` resolves a result only for its owner.

**There is no lifecycle rule on `imageedit/` yet.** Uploads and results accumulate.
Add one in the Cloudflare dashboard (R2 → `video-api` → Settings → Object
lifecycle rules → prefix `imageedit/src/` and `imageedit/out/`, delete after 7 days).
Do not apply it to `imageedit/samples/`. The R2 token cannot set lifecycle rules.

---

## 2. Price

**30 credits ($0.30) per finished edit; each variation is an edit.** Failed and
cancelled edits are refunded in full (reserve-then-settle, as Face Studio).

Measured on 2026-10-01: a 12-step remove billed 26–32 s on an H100, the owner's
estimate is $0.05 per edit, and the cold start (no worker up) queued 50 s.
30 credits keeps margin near Face Studio's after Stripe fees on small packs and
refunded failures, and equals the free daily allowance (`FREE_DAILY_CREDITS`),
so every signed-in account gets one free edit a day. The allowance is shared
with Face Studio.

Each capture records RunPod's `billed_ms` in the ledger reference, so the real
cost per edit can be computed from `credit_ledger` and the price revisited.

---

## 3. Limits and behaviour

- Up to 4 open edits per account (`IMAGEEDIT_MAX_OPEN_EDITS`), 1–4 variations per request.
- Holds expire after 30 minutes (`IMAGEEDIT_HOLD_TTL_SECONDS`).
- Uploads are re-encoded in the browser: orientation fixed, long side ≤ 4096 px
  (iOS canvas limit), PNG. 40 MB input cap.
- **The endpoint has `workersMax = 1`.** Jobs from all users run one at a time; with
  real traffic the queue grows. Raise Max workers on the RunPod endpoint
  `qwen-image-studio` when needed (each worker is an H100 while busy).
- First edit after ~60 s idle waits for a cold start (~50 s measured).

---

## 4. Deploying

- **Vercel**: push to `release`.
- **Gateway** (`facestudio-gateway/`, Render): the three `/ie/api/*` routes ship with
  it. If Render does not auto-deploy on push, use **Manual Deploy** on the
  `facestudio-gateway` service. Check: `POST /ie/api/run` without a token must
  return 401 (404 means the old build is still running).
- The gateway's `RUNPOD_API_KEY` must be allowed to use endpoint `8zekyhvth8nfp6`.
  If it is a key restricted to Face Studio's endpoint, edits fail with
  "GPU service error 401"; give the key access or set `IMAGEEDIT_ENDPOINT_ID`
  and a broader key on Render.

---

## 5. Verifying

1. Signed out, `/image-edit` loads (public); `/image-edit/launch` redirects to login.
2. Signed in, `/image-edit/launch` lands on the editor with the credit pill filled.
3. Pick the `cars` sample, Remove → "the grey car", Generate. The pill drops by 30
   (reserved), the job card goes Queue → Generating → done.
4. `/credits` shows a `spend` of −30. Cancel a second edit mid-way: no spend, credits back.
5. Download saves a PNG named `nano-imageedit-edit_….png`.
