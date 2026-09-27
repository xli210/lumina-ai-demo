# Face Studio: integration guide

This package contains everything needed to put Face Studio (multi-face swap and
head swap) on our website:

```
facestudio_handoff/
├── faceswap/                 The page. Static files, no build step.
│   ├── index.html
│   ├── app.js                ← the only file you edit: API_BASE on line 28
│   ├── style.css, base.css, logo.png
│   ├── face_templates.local.json   virtual-face picker data (static)
│   └── face_templates/             virtual-face images (static)
├── backend/                  Reference backend for the page's API (Python/FastAPI)
│   ├── server.py
│   ├── requirements.txt
│   └── .env.example          settings; the keys are sent to you separately
└── README_INTEGRATION.md     this file
```

## 1. How it fits together

```
Browser (faceswap/)  ──/v5/api/*──▶  Our backend  ──▶  RunPod Serverless GPU endpoint
                                          │                      │
                                          └──── R2 storage ◀─────┘
                                           (input photos, result PNGs)
```

- **The page** does everything visual in the browser, at no cost: upload, the
  face cards, the occluder toggles (keep hair, hands and so on), the
  before/after viewer, the "bring back original" brush, and the virtual-face
  picker.
- **Our backend** exposes six routes under `/v5/api/`. It holds the RunPod and
  storage keys, uploads photos to storage, starts GPU jobs, and returns results.
  This is also where login and credit checks go.
- **RunPod** runs the models on an A40 GPU and scales from 0 to 2 workers
  automatically. It writes each result PNG to storage.

Keys never go to the browser.

## 2. Frontend setup

Copy `faceswap/` to any static host, or into our site's pages. Then set
`API_BASE` at the top of `faceswap/app.js`:

```js
const API_BASE = "";                              // API on the same origin as the page
const API_BASE = "/faceswap";                     // API under a path on our site
const API_BASE = "https://api.yourdomain.com";    // separate API domain (needs CORS_ORIGINS)
```

Every network call in `app.js` goes through `API_BASE`; search for `REPOINT` to
see them. Nothing else in the page needs to change. It is plain HTML, CSS and
JavaScript with no framework, so you can embed it in a React/Vue/WordPress page
or restyle it freely, as long as the element IDs used by `app.js` stay.

## 3. Backend setup

There are two ways to run the backend:

**A. Run `backend/server.py` as a small service** (quickest)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in the keys we send you
python server.py --host 0.0.0.0 --port 8090
```
Proxy `/v5/api/*` from our site to it, and add login and credits (section 5).
Set `SITE_DIR=../faceswap` and it serves the page too.

**B. Rewrite the six routes in our existing backend** (Node, PHP, Go and so on).
`server.py` is about 200 lines of straightforward logic to port. Sections 4 and
6 give the exact request and response formats.

`server.py` keeps no state of its own and writes nothing to disk, so it can run
as several instances behind a load balancer.

## 4. The routes the page calls

All errors are returned as an HTTP 4xx/5xx status with JSON
`{"detail": "<message shown to the user>"}`.

### `POST /v5/api/visit` (optional)
Called when the page opens. It starts a GPU worker early so the user doesn't
wait for a cold start. It returns `{"ok": true}` and is limited to once a minute.

### `POST /v5/api/detect` (free, don't charge)
Request: multipart form with `body_image` (the user's photo, up to 40 MB).
It waits for the result, which takes 2–6 s when a worker is warm and up to
about 25 s from cold.
```json
{
  "detection_id": "3f2a…e1.jpg",
  "count": 2,
  "max_faces": 6,
  "faces": [{
    "index": 0,
    "bbox_max_dim": 1098,          // face size in px, shown on the card
    "thumb_b64": "<png base64>",   // face crop for the card
    "seg_panel_b64": "<png>",      // crop used by the occluder picker
    "seg_map_b64": "<png>",        // class-id map for that crop
    "seg_w": 214, "seg_h": 224,
    "present_classes": [{"id": 4, "name": "Hair", "color": [255, 0, 109],
                         "area_pct": 37.35, "default_preserve": true}]
  }]
}
```

### `POST /v5/api/generate` (costs credit)
Request: multipart form with these fields:

| Field | Value |
|---|---|
| `detection_id` | from detect |
| `mode` | `face_swap` or `head_swap` (head swap needs exactly one face) |
| `ref_0`, `ref_1`, … | reference photo file for face index 0, 1, …; at least one is required |
| `preserve_classes_json` | e.g. `{"0":[4]}`: class ids (from `present_classes`) to keep from the original, per face (face swap only) |

Response: `{"job_id": "…"}`

### `GET /v5/api/status/{job_id}`
The page polls this every 1.5 s.
```json
{"status": "queued" | "running" | "done" | "error",
 "progress_pct": 0.0–1.0, "elapsed_seconds": 12.4, "error": "<if error>"}
```

### `GET /v5/api/result/{job_id}`
Returns the result as `image/png`, at full resolution (for example 4080×4080,
about 20 MB). Serve it from the same origin as the page, or with CORS headers,
because the page draws it on a `<canvas>`.

### `POST /v5/api/feedback` (optional)
Request: form with `job_id` and `rating` (`up` or `down`). Store it however you like.

## 5. Login, credits and ownership

`server.py` has comments marking where each of these goes:

- **AUTH:** require a logged-in user on `detect` and `generate`. Record
  `job_id → user` when a job is created, and check it on `status`, `result`
  and `feedback`, so users can only see their own results.
- **CREDITS:**
  - In `generate`, return **402** if the user has no credit left.
  - In `status`, charge **1 credit** the first time a job comes back as
    `"done"`, and dedupe by `job_id`. Don't charge on `result`, because
    downloads can repeat.
- **Rate limits:** each generate uses real GPU time, so add a per-user limit on
  concurrent jobs, for example one or two at a time.

## 6. RunPod worker contract (for porting)

The backend talks to RunPod's standard API. Every call sends the header
`Authorization: Bearer <RUNPOD_API_KEY>`.

- `POST https://api.runpod.ai/v2/{ENDPOINT_ID}/run` with body `{"input": {...}}`
  returns `{"id": "<job_id>"}`.
- Use `/runsync` instead of `/run` to wait up to about 90 s for the result.
- `GET https://api.runpod.ai/v2/{ENDPOINT_ID}/status/{job_id}` returns
  `{"status": "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED", "output": {...}, "delayTime", "executionTime"}`.
  Timings are in ms. RunPod keeps a finished job's status for about 30 minutes.

RunPod rejects job requests over 10 MB, so photos are passed as URLs: upload
the photo to storage and send a presigned GET URL that is valid for about an
hour.

**Detect:**
```json
{"input": {"action": "detect", "body_image": "<https url>"}}
→ output: {"count", "max_faces", "faces": [ … as in section 4 … ]}
```

**Generate:**
```json
{"input": {"action": "generate", "mode": "face_swap",
           "body_image": "<https url>",
           "refs": {"0": "<https url>", "1": "<https url>"},
           "options": {"preserve_classes_map": {"0": [4]}}}}
→ output: {"output_url": "<presigned url, 24 h>", "width", "height", "seconds"}
```

- The worker also saves the result permanently at
  `{S3_OUTPUT_PREFIX}/{job_id}.png` in the bucket. `server.py` reads it from
  there, so results can still be fetched after RunPod forgets the job.
- When a job fails, `output` is `{"error": "<message>"}`, for example
  "no face detected in body_image".
- Generate runs detection again on the worker itself, so the backend only
  needs to keep the photo's storage key between detect and generate. In
  `server.py` that key is the `detection_id`.

## 7. Speed and cost

These figures are for 4000-px photos on a warm A40, at $0.00034 per GPU second.

| Step | Time | GPU cost |
|---|---|---|
| detect | 2–6 s | ≈ $0.001 |
| face swap | 17–25 s | ≈ $0.006–0.008 |
| head swap | 30–47 s | ≈ $0.010–0.016 |

- With no traffic there are 0 workers, and the cost is $0.
- The first request after a quiet period waits for a worker to start, which
  takes about 1–20 s. `/v5/api/visit` starts one when the page opens to hide
  that wait.
- A worker stays on for 30 s after its last job, which costs about $0.01 per
  burst of use.

## 8. What you'll receive separately (never commit these)

- `RUNPOD_API_KEY`: for the Face Studio endpoint `kgcsaw0mpwbz4c`.
- Storage credentials (`S3_*`): must be the same R2 bucket the endpoint writes
  results to.

Everything else, including the GPU worker, its Docker image and model weights,
stays on our side. The only interface to it is the RunPod contract in section 6.
