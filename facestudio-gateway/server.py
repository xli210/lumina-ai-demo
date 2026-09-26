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
import json
import os
import re
import secrets
import threading
import time
import urllib.error
import urllib.request
import uuid

import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.responses import Response
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
DETECT_TIMEOUT_S = 45.0

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
# RunPod
# ---------------------------------------------------------------------------
def runpod(method: str, path: str, body: dict | None = None, timeout: int = 60) -> dict:
    req = urllib.request.Request(
        f"https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}{path}", method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + RUNPOD_API_KEY,
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise HTTPException(502, f"GPU service error {e.code}")
    except urllib.error.URLError:
        raise HTTPException(502, "GPU service unreachable")


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
    # storage round trip.
    blank = base64.b64decode(
        "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U"
        "HRofHh0aHBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPDIzNP/AABEIAEAAQAMBIgAC"
        "EQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQD"
        "BQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZ"
        "GiUmJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeI"
        "iYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk"
        "5ebn6Onq8fLz9PX29/j5+v/aAAwDAQACEQMRAD8A9/oAKACgD//Z"
    )
    try:
        runpod("POST", "/run", {"input": {
            "action": "detect", "segmentation": False,
            "body_image": base64.b64encode(blank).decode()}})
    except HTTPException:
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


@api.post("/detect")
def v5_detect(body: DetectRequest):
    """Find faces in an already-uploaded photo.

    Synchronous: the console cannot draw its face cards until it has them.
    The wait is capped at DETECT_TIMEOUT_S so the caller's function timeout is
    never what fires — this way the user sees our message, not a bare 504.
    """
    name = check_storage_key(body.input_key, "input_key")
    st = runpod(
        "POST", "/runsync",
        {"input": {"action": "detect", "body_image": input_url(name)}},
        timeout=int(DETECT_TIMEOUT_S) + 10,
    )
    t0 = time.time()
    while st.get("status") in ("IN_QUEUE", "IN_PROGRESS"):
        if time.time() - t0 > DETECT_TIMEOUT_S:
            runpod("POST", f"/cancel/{st['id']}")
            raise HTTPException(504, "The GPU is busy. Please try again.")
        time.sleep(0.5)
        st = runpod("GET", f"/status/{st['id']}")
    out = st.get("output") or {}
    if st.get("status") != "COMPLETED" or out.get("error"):
        raise HTTPException(502, out.get("error") or "Face detection failed.")
    return {"detection_id": name, "count": out.get("count", 0),
            "max_faces": out.get("max_faces", 6), "faces": out.get("faces", [])}


@api.post("/generate")
def v5_generate(body: GenerateRequest):
    """Start a render. Returns immediately with RunPod's job id.

    Credits were already reserved by the caller, so this route only has to
    validate and dispatch. It must stay fast: the caller is holding a
    reservation open while it waits.
    """
    det = check_storage_key(body.detection_id, "detection_id")
    if body.mode not in MODES:
        raise HTTPException(400, f"unknown mode {body.mode!r}")
    if not body.refs:
        raise HTTPException(400, "Upload a reference for at least one face.")
    if body.mode == "head_swap" and len(body.refs) != 1:
        raise HTTPException(400, "Head swap works on exactly one face.")

    refs = {
        index: input_url(check_storage_key(key, f"refs[{index}]"))
        for index, key in body.refs.items()
    }

    job = runpod("POST", "/run", {"input": {
        "action": "generate", "mode": body.mode,
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
    st = runpod("GET", f"/status/{check_job_id(job_id)}")
    status = st.get("status")
    out = st.get("output") or {}
    elapsed = (st.get("delayTime", 0) + st.get("executionTime", 0)) / 1000
    if status == "COMPLETED" and not out.get("error"):
        return {"status": "done", "progress_pct": 1.0,
                "elapsed_seconds": round(elapsed, 1)}
    if status in ("FAILED", "CANCELLED", "TIMED_OUT") or out.get("error"):
        return {"status": "error", "error": out.get("error") or "Generation failed.",
                "elapsed_seconds": round(elapsed, 1)}
    if status == "IN_QUEUE":
        return {"status": "queued", "progress_pct": 0.0, "elapsed_seconds": 0}
    # RunPod reports no timings until the job ends, so a running job's elapsed
    # time is counted from when this instance first saw it running.
    started = _running_since.setdefault(job_id, time.time())
    run_s = time.time() - started
    return {"status": "running",
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


@app.get("/healthz")
def healthz():
    """Liveness probe. Render calls this, so it is the one unauthenticated
    route. It reports nothing a caller could not already guess."""
    return {"status": "ok"}


app.include_router(api)


if __name__ == "__main__":
    import uvicorn
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8090)))
    a = ap.parse_args()
    uvicorn.run(app, host=a.host, port=a.port, log_level="info")
