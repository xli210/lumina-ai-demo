#!/usr/bin/env python3
"""Face Studio gateway: the GPU and storage layer behind /api/facestudio/*.

Derived from facestudio_handoff/backend/server.py, with the changes needed to
sit behind nanopocket.ai's Next.js app on Vercel:

  * Every route requires `Authorization: Bearer $FACESTUDIO_GATEWAY_TOKEN`.
    This service holds the RunPod key and the R2 credentials, so it must only
    ever be reachable by our own backend, never by a browser.

  * Photos are no longer posted here. A Vercel function body caps out at
    4.5 MB and photos run to 40 MB, so the browser uploads straight to R2
    using a presigned PUT minted by POST /v5/api/uploads, and detect/generate
    take storage keys instead of files. That also means this service never
    touches image bytes on the way in, so it needs no image library and no
    request-size headroom.

  * The detect wait is bounded well below the caller's function timeout, so a
    stuck GPU produces a readable error instead of a platform 504 with no body.

  * Auth and credits are NOT here. They are enforced in the Next.js routes,
    which reserve credits before calling generate and settle them from status.
    This service is deliberately unaware of users.

    pip install -r requirements.txt
    cp .env.example .env    # fill in the keys
    python server.py        # http://127.0.0.1:8090

State: none. The detection_id is the storage key of the uploaded photo, the
job_id is RunPod's, and the worker writes each result to storage under a key
derived from the job_id. Any number of instances can run behind a load
balancer.
"""

from __future__ import annotations

import argparse
import base64
import http.client
import json
import os
import re
import secrets
import socket
import threading
import time
import urllib.error
import urllib.request
import uuid

import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field


def _load_dotenv(path: str) -> None:
    if not os.path.isfile(path):
        return
    for line in open(path):
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip("\"'"))


HERE = os.path.dirname(os.path.abspath(__file__))
_load_dotenv(os.path.join(HERE, ".env"))

RUNPOD_API_KEY = os.environ["RUNPOD_API_KEY"]
RUNPOD_ENDPOINT_ID = os.environ["RUNPOD_ENDPOINT_ID"]
GATEWAY_TOKEN = os.environ["FACESTUDIO_GATEWAY_TOKEN"]
S3_BUCKET = os.environ["S3_BUCKET"]
# Must match the endpoint's OUTPUT_S3_PREFIX: the worker writes <prefix>/<job_id>.png.
S3_OUTPUT_PREFIX = os.environ.get("S3_OUTPUT_PREFIX", "facestudio/output")
S3_INPUT_PREFIX = os.environ.get("S3_INPUT_PREFIX", "facestudio/input")

# The worker refuses inputs over 40 MB; presigned PUTs are capped to match.
MAX_UPLOAD_BYTES = 40 * 1024 * 1024
UPLOAD_URL_TTL = 900
INPUT_URL_TTL = 3600
MODES = ("face_swap", "head_swap")
# Typical warm times, for the progress bar only.
EXPECTED_S = {"face_swap": 20.0, "head_swap": 35.0}
# Bounded so the caller's 60 s function timeout is never the thing that fires.
# Only the old synchronous /detect route uses it.
DETECT_TIMEOUT_S = 45.0
# How long a job may sit IN_QUEUE (no GPU yet) before it is cancelled. The slowest
# start measured on 2026-10-07 was 405 s, for a fresh host pulling the image.
STARTING_UP_LIMIT_S = 900
# Every job input carries this, so the worker answers with stable error codes
# (see docs/face-studio-worker-contract.md).
API_VERSION = 2

S3 = boto3.client(
    "s3", endpoint_url=os.environ.get("S3_ENDPOINT") or None,
    region_name=os.environ.get("S3_REGION", "auto"),
    aws_access_key_id=os.environ["S3_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["S3_SECRET_ACCESS_KEY"],
)

_STORAGE_KEY = re.compile(r"^[0-9a-f]{32}\.(jpg|png)$")
_JOB_ID = re.compile(r"^[A-Za-z0-9-]{8,80}$")
_CONTENT_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "jpg"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
_bearer = HTTPBearer(auto_error=False)


def require_token(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> None:
    """Only our own backend may call this service.

    compare_digest rather than == so a wrong token cannot be recovered one
    byte at a time from response timings.
    """
    if creds is None or not secrets.compare_digest(
        creds.credentials, GATEWAY_TOKEN
    ):
        raise HTTPException(401, "Invalid gateway token")


# ---------------------------------------------------------------------------
# Errors
#
# One shape for every failure the browser can see, whether it came from the
# worker, from RunPod, or from this service. `error_code` is stable and is what
# the page switches on; `error_message` is English and safe to show. Codes the
# worker sends are listed in docs/face-studio-worker-contract.md. The ones this
# service adds: gpu_unavailable, worker_crashed, job_timed_out, job_cancelled,
# gpu_service_unreachable, gpu_service_error, bad_worker_response, job_not_found,
# missing_field, invalid_mode.
# ---------------------------------------------------------------------------
def _error(code, message, kind="server", retryable=False, field=None, details=None):
    return {"ok": False, "error_code": code, "error_message": message,
            "error_kind": kind, "retryable": retryable,
            "field": field, "details": details or {}}


class GatewayError(Exception):
    """A failure with a ready-made error body and HTTP status."""

    def __init__(self, error: dict, status: int):
        super().__init__(error["error_message"])
        self.error = error
        self.status = status


class UpstreamError(GatewayError):
    """RunPod could not be reached, or answered with an error status."""

    def __init__(self, code, message, retryable=True, http_status=None):
        super().__init__(_error(code, message, retryable=retryable,
                                details={"http_status": http_status}), 502)


# The worker adds these for diagnostics. They are logged, never sent on.
_PRIVATE_KEYS = ("worker", "diag", "timing", "timing_cpu", "timing_majflt")


def _public(result: dict) -> dict:
    """What the browser may see of a worker output or error object."""
    out = {k: v for k, v in result.items() if k not in _PRIVATE_KEYS}
    if out.get("ok") is False and out.get("error_kind") == "server":
        # details.reason holds the worker's exception text.
        out["details"] = {}
    return out


def read_job(st: dict) -> dict:
    """Turn a finished RunPod job into the worker output (ok: True) or an
    error object (ok: False), in one fixed shape."""
    status = st.get("status")
    out = st.get("output") if isinstance(st.get("output"), dict) else {}
    if status == "COMPLETED":
        if out.get("ok") is True:
            return out
        if out.get("ok") is False and out.get("error_code"):
            return out
        if "ok" not in out and not out.get("error"):
            # A job submitted before api_version 2 was sent, finishing during
            # a deploy: the old output has no `ok`. Treat it as the success it is.
            return {**out, "ok": True}
        return _error("bad_worker_response", "The GPU worker returned an unexpected response.")
    if status == "FAILED":
        try:
            info = json.loads(st.get("error") or "")
            if isinstance(info, dict) and info.get("error_code"):
                return info
        except (TypeError, ValueError):
            pass
        # Plain text or nothing: the worker process died mid-job.
        return _error("worker_crashed", "The GPU worker stopped unexpectedly. Please try again.",
                      retryable=True, details={"raw": str(st.get("error") or "")[:300]})
    if status == "TIMED_OUT":
        return _error("job_timed_out", "This took too long and was stopped. Please try again.",
                      retryable=True)
    if status == "CANCELLED":
        return _error("job_cancelled", "The job was cancelled.", retryable=True)
    return _error("bad_worker_response", f"Unexpected job status {status!r}.")


def _log_failure(job_id: str, result: dict) -> None:
    """One log line per failed job, with the worker's own details (never sent on)."""
    print(json.dumps({"job_failed": job_id, "error_code": result.get("error_code"),
                      "kind": result.get("error_kind"), "field": result.get("field"),
                      "details": result.get("details")}, default=str)[:900], flush=True)


# ---------------------------------------------------------------------------
# RunPod
# ---------------------------------------------------------------------------
def runpod(method: str, path: str, body: dict | None = None, timeout: int = 60,
           endpoint: str | None = None) -> dict:
    req = urllib.request.Request(
        f"https://api.runpod.ai/v2/{endpoint or RUNPOD_ENDPOINT_ID}{path}", method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + RUNPOD_API_KEY,
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:  # RunPod answered with an error status
        busy = e.code in (429, 500, 502, 503, 504)
        raise UpstreamError("gpu_service_error",
                            "The GPU service is having trouble. Please try again.",
                            retryable=busy, http_status=e.code) from e
    # HTTPError is a URLError, so it has to be caught first. A read that times out
    # raises socket.timeout / TimeoutError, which is neither, and used to escape as
    # an HTTP 500.
    except (urllib.error.URLError, socket.timeout, TimeoutError, ConnectionError,
            http.client.HTTPException, ValueError) as e:
        raise UpstreamError("gpu_service_unreachable",
                            "Could not reach the GPU service. Please try again.") from e


def input_url(name: str) -> str:
    """A presigned GET the worker uses to fetch an input. RunPod caps a job
    request at 10 MB, so images are passed by URL rather than inline."""
    return S3.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET, "Key": f"{S3_INPUT_PREFIX}/{name}"},
        ExpiresIn=INPUT_URL_TTL,
    )


def check_storage_key(name: str, label: str) -> str:
    """Reject anything that is not a key this service minted.

    The keys are interpolated into storage paths, so a value like
    `../../secrets` must never get through.
    """
    if not _STORAGE_KEY.match(name or ""):
        raise HTTPException(400, f"{label} is malformed; upload the photo again.")
    return name


def check_job_id(job_id: str) -> str:
    if not _JOB_ID.match(job_id or ""):
        raise HTTPException(404, "unknown job")
    return job_id


# ---------------------------------------------------------------------------
app = FastAPI()


@app.exception_handler(GatewayError)
async def _gateway_error(_request, exc: GatewayError):
    """Every failure this service produces, in the standard body. `detail` is
    kept so callers written before the error codes existed still show a message."""
    print(json.dumps({"gateway_error": exc.error["error_code"], "status": exc.status,
                      "details": exc.error.get("details")}, default=str)[:600], flush=True)
    return JSONResponse({"state": "error", **_public(exc.error), "detail": exc.error["error_message"]},
                        status_code=exc.status)

# Everything under /v5/api requires the token. /healthz is mounted on the app
# itself, because Render's health check cannot present one.
api = APIRouter(prefix="/v5/api", dependencies=[Depends(require_token)])

# job_id -> mode, for the progress estimate only; unknown ids fall back to 30 s.
_modes: dict[str, str] = {}
_running_since: dict[str, float] = {}
_last_warm = 0.0
_warm_lock = threading.Lock()


class UploadRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=200)
    content_type: str = "image/jpeg"


class DetectRequest(BaseModel):
    input_key: str


class GenerateRequest(BaseModel):
    detection_id: str
    mode: str = "face_swap"
    # face index (as a string) -> storage key of that face's reference photo
    refs: dict[str, str] = Field(default_factory=dict)
    preserve_classes_map: dict[str, list[int]] = Field(default_factory=dict)


class FeedbackRequest(BaseModel):
    job_id: str
    rating: str = Field(max_length=20)


@api.post("/visit")
def v5_visit():
    """Console opened: start a GPU worker now so its cold start overlaps the
    user choosing a photo. A blank image has no faces, so the job is a
    sub-second no-op. At most once a minute per instance."""
    global _last_warm
    with _warm_lock:
        if time.time() - _last_warm < 60:
            return {"ok": True, "skipped": True}
        _last_warm = time.time()
    # A 64x64 grey JPEG is small enough to inline, so this path needs no
    # storage round trip. (The previous constant was not a decodable image: the
    # worker rejected it every time. It still woke the GPU, but each warm-up
    # counted as a failed job.)
    blank = (
        "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR"
        "0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgV"
        "GC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2"
        "NjY2NjY2NjY2P/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAA"
        "AAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhBy"
        "JxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpT"
        "VFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqr"
        "KztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QA"
        "HwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQ"
        "J3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRom"
        "JygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiI"
        "mKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk"
        "5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwAooooAKKKKACiiigAooooAKKKKAC"
        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9k="
    )
    try:
        runpod("POST", "/run", {"input": {
            "api_version": API_VERSION, "action": "detect", "segmentation": False,
            "body_image": blank}}, timeout=20)
    except UpstreamError:
        pass
    return {"ok": True}


@api.post("/uploads")
def v5_uploads(body: UploadRequest):
    """Mint a presigned PUT so the browser can upload a photo directly.

    The URL is a capability: anyone holding it can write that one object until
    it expires, with no credentials. It is returned to our backend, which
    passes it to the one browser that asked, and it is never logged.
    """
    ext = _CONTENT_TYPES.get(body.content_type)
    if ext is None:
        raise HTTPException(400, "Unsupported image type; send JPEG, PNG or WebP.")

    name = f"{uuid.uuid4().hex}.{ext}"
    url = S3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": S3_BUCKET,
            "Key": f"{S3_INPUT_PREFIX}/{name}",
            "ContentType": body.content_type,
        },
        ExpiresIn=UPLOAD_URL_TTL,
    )
    return {
        "upload_url": url,
        "input_key": name,
        "content_type": body.content_type,
        "max_bytes": MAX_UPLOAD_BYTES,
        "expires_in": UPLOAD_URL_TTL,
    }


def _detect_input(name: str) -> dict:
    return {"api_version": API_VERSION, "action": "detect", "body_image": input_url(name)}


@api.post("/detect")
def v5_detect(body: DetectRequest):
    """Find faces in an already-uploaded photo, waiting for the answer.

    Kept for pages that have not moved to /detect/start yet. A cold start longer
    than DETECT_TIMEOUT_S fails here; the asynchronous routes below do not.
    """
    name = check_storage_key(body.input_key, "input_key")
    st = runpod("POST", "/run", {"input": _detect_input(name)}, timeout=30)
    t0 = time.time()
    while st.get("status") in ("IN_QUEUE", "IN_PROGRESS"):
        if time.time() - t0 > DETECT_TIMEOUT_S:
            runpod("POST", f"/cancel/{st['id']}")
            raise GatewayError(_error("gpu_unavailable", "The GPU is busy. Please try again.",
                                      retryable=True), 504)
        time.sleep(0.5)
        st = runpod("GET", f"/status/{st['id']}")
    result = read_job(st)
    if not result.get("ok"):
        _log_failure(st.get("id", "?"), result)
        raise GatewayError(_public(result), 400 if result.get("error_kind") == "user" else 502)
    return {"detection_id": name, "count": result.get("count", 0),
            "max_faces": result.get("max_faces", 6), "faces": result.get("faces", [])}


@api.post("/detect/start")
def v5_detect_start(body: DetectRequest):
    """Queue a detect job and return at once; the page polls /detect/status.

    Detect is the first GPU job of every session, so it absorbs the whole cold
    start (0.4 s warm, up to ~400 s on a fresh host). Holding the browser's
    request open through that is what produced "Timed out waiting for a GPU".
    """
    name = check_storage_key(body.input_key, "input_key")
    job = runpod("POST", "/run", {"input": _detect_input(name)}, timeout=20)
    if not job.get("id"):
        raise UpstreamError("gpu_service_error", "The GPU service did not accept the job.")
    # The submit time rides in the id, so this service keeps no state.
    return {"job_id": f"{job['id']}.{int(time.time())}", "state": "starting"}


_DETECT_JOB_ID = re.compile(r"^([A-Za-z0-9-]{8,80})\.(\d{9,11})$")


@api.get("/detect/status/{job_id}")
def v5_detect_status(job_id: str):
    m = _DETECT_JOB_ID.match(job_id or "")
    if not m:
        raise GatewayError(_error("job_not_found", "Unknown job.", kind="user"), 404)
    rp_id, started = m.group(1), int(m.group(2))
    waited = max(0, int(time.time()) - started)
    st = runpod("GET", f"/status/{rp_id}", timeout=20)
    status = st.get("status")
    if status == "IN_QUEUE":
        if waited > STARTING_UP_LIMIT_S:
            runpod("POST", f"/cancel/{rp_id}", timeout=15)
            return {"state": "error", **_error(
                "gpu_unavailable", "No GPU became available. Please try again in a minute.",
                retryable=True, details={"waited_s": waited})}
        return {"state": "starting", "waited_s": waited}
    if status == "IN_PROGRESS":
        return {"state": "processing", "waited_s": waited}
    result = read_job(st)
    if not result.get("ok"):
        _log_failure(rp_id, result)
    return {"state": "done" if result.get("ok") else "error", **_public(result)}


@api.post("/generate")
def v5_generate(body: GenerateRequest):
    """Start a render. Returns immediately with RunPod's job id.

    Credits were already reserved by the caller, so this route only has to
    validate and dispatch. It must stay fast: the caller is holding a
    reservation open while it waits.
    """
    det = check_storage_key(body.detection_id, "detection_id")
    if body.mode not in MODES:
        raise GatewayError(_error("invalid_mode", "That swap mode is not available.",
                                  kind="user", field="mode"), 400)
    if not body.refs:
        raise GatewayError(_error("missing_field", "Upload a reference for at least one face.",
                                  kind="user", field="refs"), 400)
    if body.mode == "head_swap" and len(body.refs) != 1:
        raise GatewayError(_error("head_swap_needs_one_face", "Head swap works on exactly one face.",
                                  kind="user", field="body_image"), 400)

    refs = {
        index: input_url(check_storage_key(key, f"refs[{index}]"))
        for index, key in body.refs.items()
    }

    job = runpod("POST", "/run", {"input": {
        "api_version": API_VERSION, "action": "generate", "mode": body.mode,
        "body_image": input_url(det), "refs": refs,
        "options": (
            {"preserve_classes_map": body.preserve_classes_map}
            if body.mode == "face_swap" else {}
        ),
    }})
    _modes[job["id"]] = body.mode
    return {"job_id": job["id"]}


@api.get("/status/{job_id}")
def v5_status(job_id: str):
    """State of a render.

    `status` (queued | running | done | error) is what the Vercel route settles
    credits on, and is unchanged. `state` and the error fields are the same
    information in the shared shape the page reads.
    """
    st = runpod("GET", f"/status/{check_job_id(job_id)}", timeout=20)
    status = st.get("status")
    elapsed = (st.get("delayTime", 0) + st.get("executionTime", 0)) / 1000
    if status in ("COMPLETED", "FAILED", "TIMED_OUT", "CANCELLED"):
        result = read_job(st)
        if result.get("ok"):
            return {"status": "done", "state": "done", "ok": True, "progress_pct": 1.0,
                    "elapsed_seconds": round(elapsed, 1)}
        _log_failure(job_id, result)
        public = _public(result)
        return {"status": "error", "state": "error", **public,
                "error": public["error_message"], "elapsed_seconds": round(elapsed, 1)}
    if status == "IN_QUEUE":
        return {"status": "queued", "state": "starting", "progress_pct": 0.0, "elapsed_seconds": 0}
    # RunPod reports no timings until the job ends, so a running job's elapsed
    # time is counted from when this instance first saw it running.
    started = _running_since.setdefault(job_id, time.time())
    run_s = time.time() - started
    return {"status": "running", "state": "processing",
            "progress_pct": min(0.95, run_s / EXPECTED_S.get(_modes.get(job_id), 30.0)),
            "elapsed_seconds": round(run_s, 1)}


@api.get("/result/{job_id}")
def v5_result(job_id: str):
    """The finished PNG, read from storage rather than from RunPod.

    RunPod forgets a job after about 30 minutes, but the worker also writes
    every result to the bucket, so this stays available indefinitely.
    """
    key = f"{S3_OUTPUT_PREFIX}/{check_job_id(job_id)}.png"
    try:
        obj = S3.get_object(Bucket=S3_BUCKET, Key=key)
    except ClientError:
        raise HTTPException(404, "result not ready")
    return Response(obj["Body"].read(), media_type="image/png",
                    headers={"Cache-Control": "private, max-age=86400"})


@api.post("/feedback")
def v5_feedback(body: FeedbackRequest):
    print(json.dumps({"feedback": check_job_id(body.job_id),
                      "rating": body.rating}), flush=True)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Nano ImageEdit Online
#
# Same token and RunPod account as Face Studio, different endpoint. No image
# bytes pass through here: the Vercel app signs R2 URLs itself (lib/r2-sign.ts)
# and the worker reads and writes the bucket directly, so this router only
# relays job JSON. See docs/image-edit.md.
# ---------------------------------------------------------------------------
IMAGEEDIT_ENDPOINT_ID = os.environ.get("IMAGEEDIT_ENDPOINT_ID", "8zekyhvth8nfp6")
# Keys the Vercel app minted. Interpolated into storage paths by the worker, so
# nothing outside imageedit/ and nothing with ".." may get through.
_IE_SRC_KEY = re.compile(r"^imageedit/(src|out|samples)/[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+){0,3}\.png$")
_IE_OUT_PREFIX = re.compile(r"^imageedit/out/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$")
_IE_TOOLS = {"magic", "add", "remove", "replace", "text", "style", "season", "restore"}
# RunPod rejects a /run body over 10 MB; the brush mask is the only large field.
_IE_MAX_REQ_BYTES = 8 * 1024 * 1024

ie = APIRouter(prefix="/ie/api", dependencies=[Depends(require_token)])


class ImageEditRunRequest(BaseModel):
    src_key: str
    out_prefix: str
    req: dict


@ie.post("/run")
def ie_run(body: ImageEditRunRequest):
    if not _IE_SRC_KEY.match(body.src_key) or ".." in body.src_key:
        raise HTTPException(400, "Unknown source image; upload the photo again.")
    if not _IE_OUT_PREFIX.match(body.out_prefix):
        raise HTTPException(400, "Bad output location.")
    if body.req.get("tool") not in _IE_TOOLS:
        raise HTTPException(400, "Unknown tool.")
    if len(json.dumps(body.req)) > _IE_MAX_REQ_BYTES:
        raise HTTPException(413, "The brush mask is too large.")
    job = runpod("POST", "/run", {"input": {
        "src_key": body.src_key, "out_prefix": body.out_prefix, "req": body.req,
    }}, timeout=30, endpoint=IMAGEEDIT_ENDPOINT_ID)
    if not job.get("id"):
        raise HTTPException(502, "The edit could not be queued.")
    return {"job_id": job["id"]}


@ie.get("/status/{job_id}")
def ie_status(job_id: str):
    st = runpod("GET", f"/status/{check_job_id(job_id)}", timeout=20,
                endpoint=IMAGEEDIT_ENDPOINT_ID)
    # Passed through as-is; the Vercel app maps it to the console's job view
    # and settles the credit hold. delayTime/executionTime are RunPod's queue
    # and billed milliseconds, kept for cost tracking.
    return {k: st.get(k) for k in ("id", "status", "output", "error", "delayTime", "executionTime")}


@ie.post("/cancel/{job_id}")
def ie_cancel(job_id: str):
    runpod("POST", f"/cancel/{check_job_id(job_id)}", timeout=15,
           endpoint=IMAGEEDIT_ENDPOINT_ID)
    return {"ok": True}


@app.get("/healthz")
def healthz():
    """Liveness probe. Render calls this, so it is the one unauthenticated
    route. It reports nothing a caller could not already guess."""
    return {"status": "ok"}


app.include_router(api)
app.include_router(ie)


if __name__ == "__main__":
    import uvicorn
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8090)))
    a = ap.parse_args()
    uvicorn.run(app, host=a.host, port=a.port, log_level="info")
