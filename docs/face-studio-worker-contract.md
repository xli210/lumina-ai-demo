# Face Studio v5 worker: responses and errors (api_version 2)

Worker image `ghcr.io/yunanwu2168/face-studio-v5:20261007-1`, RunPod endpoint `kgcsaw0mpwbz4c`.

The worker now reports every problem with a stable `error_code`, a readable `error_message`, and the
input field at fault. Nothing changes for a client until it opts in: add `"api_version": 2` to the job
input. Without it, responses are exactly what the previous image returned.

## 1. Opting in

```json
{"input": {"api_version": 2, "action": "detect", "body_image": "<url | data: URI | base64>"}}
{"input": {"api_version": 2, "action": "generate", "mode": "face_swap",
           "body_image": "...", "refs": {"0": "..."}, "options": {}}}
```

With `api_version: 2`, `action` is required (it used to default to `generate`).

## 2. What comes back

| Outcome | RunPod job status | Where to look |
|---|---|---|
| Success | `COMPLETED` | `output.ok == true`, then the usual fields |
| The request cannot be served as sent (no face, bad image, missing field) | `COMPLETED` | `output.ok == false`, `output.error_code`, ... |
| The worker failed (out of memory, storage down, bug) | `FAILED` | `error` is a JSON string holding the same object |
| The worker died or the job timed out | `FAILED` / `TIMED_OUT` / `CANCELLED` | `error` is plain text or absent |

Request errors are `COMPLETED` on purpose: the GPU did its job, so they no longer count in the endpoint's
failure rate. That number now means "something is wrong with the service".

Error object (in `output` for request errors, JSON-encoded in `error` for worker errors):

```json
{
  "ok": false,
  "api_version": 2,
  "action": "generate",
  "error_code": "no_face_in_reference",
  "error_message": "No face was detected in the reference image for face 0. Use a clearer reference photo.",
  "error_kind": "user",
  "retryable": false,
  "field": "refs.0",
  "details": {"face_index": 0}
}
```

- `error_code`: switch on this. It will not change. `error_message` is English text and may be reworded.
- `error_kind`: `user` (the input has to change) or `server` (not the caller's fault).
- `retryable`: `true` means sending the same request again can succeed.
- `field`: the input at fault: `body_image`, `refs`, `refs.<index>`, `mode`, `action`, `options.<name>`,
  `segmentation`, `api_version`, or `null`.
- `details`: extra facts for some codes (listed below). May be empty.

Reading a finished job, in any language:

```python
def read_job(status):                      # status = RunPod /status/<id> response
    if status["status"] == "COMPLETED":
        out = status.get("output") or {}
        return out if out.get("ok") else error_from(out)
    try:
        info = json.loads(status.get("error") or "")
        if isinstance(info, dict) and "error_code" in info:
            return error_from(info)        # structured worker error
    except ValueError:
        pass
    return error_from({"error_code": "worker_crashed", "error_kind": "server", "retryable": True,
                       "error_message": "The GPU worker stopped unexpectedly. Please try again."})
```

`worker_crashed` is not sent by the worker; it is the name suggested for "FAILED with no structured error".

## 3. Error codes

Suggested wording is for the page; replace freely.

### The user can fix these (`error_kind: user`, job `COMPLETED`)

| error_code | When | field | details | Suggested message |
|---|---|---|---|---|
| `no_face_in_body` | No face found in the photo to edit | `body_image` | | We couldn't find a face in this photo. Try a clearer one. |
| `no_face_in_reference` | No face found in a reference photo | `refs.<i>` | `face_index` | We couldn't find a face in the reference for face N. |
| `head_swap_needs_one_face` | Head swap on a photo with 0 or 2+ faces | `body_image` | `faces_detected` | Head swap works on photos with exactly one face. |
| `head_swap_no_usable_face` | Head swap: face too small, turned or covered | `body_image` | | Try a clearer, more front-facing photo, or use face swap. |
| `unreadable_image` | The file is not a JPEG, PNG or WebP | the image field | `reason` | This file isn't a supported image. |
| `image_too_large` | Over 40 MB, or too many pixels | the image field | `limit_mb` | This image is too large. |
| `invalid_image_data` | Not valid base64, or 0 bytes | the image field | | The upload didn't arrive intact. Please try again. |
| `image_download_failed` | The image URL answered 4xx (expired or wrong link) | the image field | `http_status` | The upload expired. Please upload the photo again. |

### Integration bugs: log them, show a generic message (`error_kind: user`, job `COMPLETED`)

| error_code | When | field |
|---|---|---|
| `missing_field` | `action`, `body_image`, `refs` or a `refs` value is absent or empty. If the input holds unknown keys, they are named in the message and in `details.ignored_fields`. | the missing field |
| `invalid_type` | A field has the wrong JSON type | that field |
| `invalid_action` | `action` is not `detect` or `generate` | `action` |
| `invalid_mode` | `mode` is not `face_swap` or `head_swap` | `mode` |
| `invalid_option` | An `options` value, or `segmentation`, cannot be parsed | `options.<name>` |
| `invalid_ref_index` | A `refs` key is not a number | `refs` |
| `ref_index_out_of_range` | A `refs` key names a face that was not detected (`details.faces_detected`) | `refs.<i>` |
| `unsupported_api_version` | `api_version` is not 1 or 2 | `api_version` |
| `invalid_input` | `input` is not a JSON object (reported as plain text, job `FAILED`) | `input` |
| `pipeline_rejected` | The pipeline declined for a reason not listed above; read `error_message` | |

### Not the user's fault (`error_kind: server`, job `FAILED`)

| error_code | When | retryable | Suggested message |
|---|---|---|---|
| `gpu_out_of_memory` | The GPU ran out of memory on this image | yes | Please try again, or use a smaller photo. |
| `output_upload_failed` | The result was generated but could not be stored | yes | Please try again. |
| `image_download_failed` | The image URL answered 5xx, timed out or was unreachable | yes | Please try again. |
| `output_too_large` | Deployment problem: no result bucket configured | no | Something went wrong on our side. |
| `internal_error` | Unexpected failure; `details.reason` has the exception | no | Something went wrong on our side. |

A photo with no faces is not an error for `detect`: it returns `ok: true` with `count: 0`.

## 4. Other changes in this image

- **Detect response is half the size** with `api_version: 2` (241 KB to 122 KB for one face). Each face has
  `thumb_b64`, `seg_panel_b64`, `seg_map_b64`; the duplicates `thumb_base64` and `seg_panel_base64` are gone.
- **Booleans sent as strings are read correctly.** `"use_faceshaper": "false"` used to switch FaceShaper
  **on** (any non-empty string counted as true). `"false"`, `"0"`, `"no"`, `"off"` now mean false, for
  `options.use_faceshaper` and `segmentation`, with or without `api_version`.
- **Numbers sent as strings are accepted** for `mask_dilate_pixels`, `pre_stage1_noise`, `inter_pass_noise`;
  `null` means "use the default".
- **Line-wrapped base64 is accepted.**
- **Download errors no longer leak the presigned URL**; only the host is named.
- **Clearer text for clients that have not opted in** (still job `FAILED`, plain text in `error`):
  - a missing image now reads `input.body_image is required (an http(s) URL, a data: URI or base64)` and
    names any unrecognised keys that were sent instead;
  - an expired link reads `could not download input.body_image from <host>: HTTP 403 (the link has expired
    or is not readable by the worker)` instead of `HTTPError: HTTP Error 403: Forbidden`;
  - `no face detected in body_image` and `Could not detect a face in reference for Face N. ...` are unchanged.

## 5. Gateway changes still to make (`backend/server.py`)

These are not deployed: the gateway source was not available when the worker was updated.

1. Send `"api_version": 2` in every job input, and replace the current "FAILED or `{"error"}` means
   Generation failed" check with `read_job` above. Pass `error_code`, `error_message`, `field` and
   `retryable` through to the browser unchanged.
2. Make detect asynchronous, like generate, so a cold start is a visible state and not a timeout:

```python
STARTING_UP_LIMIT_S = 900     # was 600; a fresh host took 405 s to pull the image on 2026-10-07

@app.post("/v5/api/detect")                   # returns at once
def detect_submit(...):
    job = runpod("POST", "/run", {"input": {"api_version": 2, "action": "detect", "body_image": url}})
    return {"job_id": f"{job['id']}.{int(time.time())}", "state": "starting"}

@app.get("/v5/api/detect/{job_id}")           # the page polls this every 0.5-1 s
def detect_status(job_id):
    rp_id, _, started = job_id.rpartition(".")
    st = runpod("GET", f"/status/{rp_id}")
    if st["status"] == "IN_QUEUE":
        if time.time() - int(started) > STARTING_UP_LIMIT_S:
            runpod("POST", f"/cancel/{rp_id}")
            return {"state": "error", "error_code": "gpu_unavailable", "retryable": True,
                    "error_message": "No GPU became available. Please try again in a minute."}
        return {"state": "starting", "message": "Starting up. This can take a few minutes."}
    if st["status"] == "IN_PROGRESS":
        return {"state": "processing"}
    result = read_job(st)
    return {"state": "done" if result.get("ok") else "error", **result}
```

3. In the `runpod()` helper, catch `socket.timeout` / `TimeoutError` as well as `HTTPError` / `URLError`;
   today a slow RunPod response becomes an unhandled HTTP 500.
4. Retry once, automatically, when a job ends `FAILED` with no structured error or with `retryable: true`.

## 6. Checking and rolling back

- Offline tests (pipeline faked, everything else real):
  `python test_handler.py runpod_handler.py runpod_handler.20260929-2.orig.py`
- Tests on a live endpoint: `python accept.py <endpoint id> --baseline <endpoint id of the old image>`
- Roll back by pointing the RunPod template `face-studio-v5` back at
  `ghcr.io/yunanwu2168/face-studio-v5:20260929-2`. That image is untouched.
