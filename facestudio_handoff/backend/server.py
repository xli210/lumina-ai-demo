#!/usr/bin/env python3
"""Face Studio backend: the /v5/api/* routes the faceswap/ page calls, backed
by the RunPod Serverless endpoint.

    pip install -r requirements.txt
    cp .env.example .env    # fill in the keys
    python server.py        # http://127.0.0.1:8090

Reference implementation. Port it to your own backend or run it as-is behind
your site; either way add your login and credit checks where marked AUTH /
CREDITS. The browser never sees a key.

State: none on this server. The detection_id is the storage key of the
uploaded photo, the job_id is RunPod's, and the worker writes each result to
storage under a key derived from the job_id. Any number of instances can run
behind a load balancer.
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
import uuid

import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps, UnidentifiedImageError


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
S3_BUCKET = os.environ["S3_BUCKET"]
# Must match the endpoint's OUTPUT_S3_PREFIX: the worker writes <prefix>/<job_id>.png.
S3_OUTPUT_PREFIX = os.environ.get("S3_OUTPUT_PREFIX", "facestudio/output")
S3_INPUT_PREFIX = os.environ.get("S3_INPUT_PREFIX", "facestudio/input")
# Optional: serve the page from this server too (same origin, API_BASE = "").
SITE_DIR = os.environ.get("SITE_DIR", "")
CORS_ORIGINS = [o for o in os.environ.get("CORS_ORIGINS", "").split(",") if o]

# The worker refuses inputs over 40 MB.
MAX_UPLOAD_BYTES = 40 * 1024 * 1024
MODES = ("face_swap", "head_swap")
# Typical warm times, for the progress bar only.
EXPECTED_S = {"face_swap": 20.0, "head_swap": 35.0}

S3 = boto3.client(
    "s3", endpoint_url=os.environ.get("S3_ENDPOINT") or None,
    region_name=os.environ.get("S3_REGION", "auto"),
    aws_access_key_id=os.environ["S3_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["S3_SECRET_ACCESS_KEY"],
)

_DET_ID = re.compile(r"^[0-9a-f]{32}\.(jpg|png)$")
_JOB_ID = re.compile(r"^[A-Za-z0-9-]{8,80}$")


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


def normalize(data: bytes) -> tuple[bytes, str]:
    """Apply EXIF rotation (the worker ignores it) at full resolution. PNG stays
    PNG; everything else becomes a high-quality JPEG."""
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image is larger than 40 MB.")
    try:
        im = Image.open(io.BytesIO(data))
        fmt = (im.format or "").upper()
        im = ImageOps.exif_transpose(im)
    except (UnidentifiedImageError, OSError):
        raise HTTPException(400, "Not a readable image.")
    buf = io.BytesIO()
    if fmt == "PNG":
        im.save(buf, "PNG")
        return buf.getvalue(), "png"
    im.convert("RGB").save(buf, "JPEG", quality=97, subsampling=0)
    return buf.getvalue(), "jpg"


def put_input(data: bytes, ext: str) -> str:
    """Store an input and return its object name. RunPod caps a job request at
    10 MB, so images go to storage and the worker gets a presigned URL."""
    name = f"{uuid.uuid4().hex}.{ext}"
    S3.put_object(Bucket=S3_BUCKET, Key=f"{S3_INPUT_PREFIX}/{name}", Body=data,
                  ContentType="image/png" if ext == "png" else "image/jpeg")
    return name


def input_url(name: str) -> str:
    return S3.generate_presigned_url(
        "get_object", Params={"Bucket": S3_BUCKET, "Key": f"{S3_INPUT_PREFIX}/{name}"},
        ExpiresIn=3600)


def check_job_id(job_id: str) -> str:
    if not _JOB_ID.match(job_id):
        raise HTTPException(404, "unknown job")
    return job_id


# ---------------------------------------------------------------------------
app = FastAPI()
if CORS_ORIGINS:
    app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS,
                       allow_methods=["GET", "POST"], allow_headers=["*"])

# job_id -> mode, for the progress estimate only; unknown ids fall back to 30 s.
_modes: dict[str, str] = {}
_running_since: dict[str, float] = {}
_last_warm = 0.0
_warm_lock = threading.Lock()


@app.post("/v5/api/visit")
def v5_visit():
    """Page opened: start a GPU worker now so its cold start overlaps the user
    choosing a photo. A blank image has no faces, so the job is a sub-second
    no-op. At most once a minute per server."""
    global _last_warm
    with _warm_lock:
        if time.time() - _last_warm < 60:
            return {"ok": True}
        _last_warm = time.time()
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), "gray").save(buf, "JPEG")
    try:
        runpod("POST", "/run", {"input": {
            "action": "detect", "segmentation": False,
            "body_image": base64.b64encode(buf.getvalue()).decode()}})
    except HTTPException:
        pass
    return {"ok": True}


@app.post("/v5/api/detect")
def v5_detect(body_image: UploadFile = File(...)):
    # AUTH: require a logged-in user. Detection is free; do not charge credits.
    data, ext = normalize(body_image.file.read())
    name = put_input(data, ext)
    st = runpod("POST", "/runsync", {"input": {"action": "detect", "body_image": input_url(name)}},
                timeout=120)
    t0 = time.time()
    while st.get("status") in ("IN_QUEUE", "IN_PROGRESS"):
        if time.time() - t0 > 600:
            runpod("POST", f"/cancel/{st['id']}")
            raise HTTPException(504, "Timed out waiting for a GPU. Please try again.")
        time.sleep(0.5)
        st = runpod("GET", f"/status/{st['id']}")
    out = st.get("output") or {}
    if st.get("status") != "COMPLETED" or out.get("error"):
        raise HTTPException(502, out.get("error") or "Face detection failed.")
    return {"detection_id": name, "count": out.get("count", 0),
            "max_faces": out.get("max_faces", 6), "faces": out.get("faces", [])}


@app.post("/v5/api/generate")
async def v5_generate(request: Request):
    # AUTH: require a logged-in user.
    # CREDITS: reject with 402 here if the user has no credit left.
    form = await request.form()
    det = str(form.get("detection_id") or "")
    if not _DET_ID.match(det):
        raise HTTPException(404, "Detection expired; upload the photo again.")
    mode = str(form.get("mode") or "face_swap")
    if mode not in MODES:
        raise HTTPException(400, f"unknown mode {mode!r}")
    try:
        preserve = json.loads(str(form.get("preserve_classes_json") or "{}"))
    except ValueError:
        raise HTTPException(400, "preserve_classes_json is not valid JSON")

    refs = {}
    for key, value in form.multi_items():
        if key.startswith("ref_") and hasattr(value, "read"):
            raw = await value.read()
            if raw:
                refs[key[4:]] = input_url(put_input(*normalize(raw)))
    if not refs:
        raise HTTPException(400, "Upload a reference for at least one face.")

    job = runpod("POST", "/run", {"input": {
        "action": "generate", "mode": mode, "body_image": input_url(det), "refs": refs,
        "options": {"preserve_classes_map": preserve} if mode == "face_swap" else {},
    }})
    _modes[job["id"]] = mode
    # AUTH: record job["id"] -> user so status/result/feedback can check ownership.
    return {"job_id": job["id"]}


@app.get("/v5/api/status/{job_id}")
def v5_status(job_id: str):
    st = runpod("GET", f"/status/{check_job_id(job_id)}")
    status = st.get("status")
    out = st.get("output") or {}
    elapsed = (st.get("delayTime", 0) + st.get("executionTime", 0)) / 1000
    if status == "COMPLETED" and not out.get("error"):
        # CREDITS: charge 1 credit the first time you see this job done (dedupe by job_id).
        return {"status": "done", "progress_pct": 1.0, "elapsed_seconds": round(elapsed, 1)}
    if status in ("FAILED", "CANCELLED", "TIMED_OUT") or out.get("error"):
        return {"status": "error", "error": out.get("error") or "Generation failed.",
                "elapsed_seconds": round(elapsed, 1)}
    if status == "IN_QUEUE":
        return {"status": "queued", "progress_pct": 0.0, "elapsed_seconds": 0}
    # RunPod reports no timings until the job ends, so a running job's elapsed
    # time is counted from when this server first saw it running.
    started = _running_since.setdefault(job_id, time.time())
    run_s = time.time() - started
    return {"status": "running",
            "progress_pct": min(0.95, run_s / EXPECTED_S.get(_modes.get(job_id), 30.0)),
            "elapsed_seconds": round(run_s, 1)}


@app.get("/v5/api/result/{job_id}")
def v5_result(job_id: str):
    # Streamed through this server rather than redirected to storage: the page
    # draws the result on a <canvas>, which needs a same-origin (or CORS) image.
    key = f"{S3_OUTPUT_PREFIX}/{check_job_id(job_id)}.png"
    try:
        obj = S3.get_object(Bucket=S3_BUCKET, Key=key)
    except ClientError:
        raise HTTPException(404, "result not ready")
    return Response(obj["Body"].read(), media_type="image/png",
                    headers={"Cache-Control": "private, max-age=86400"})


@app.post("/v5/api/feedback")
def v5_feedback(job_id: str = Form(...), rating: str = Form(...)):
    # Store (job_id, rating, user) in your database.
    print(json.dumps({"feedback": check_job_id(job_id), "rating": rating[:20]}), flush=True)
    return {"ok": True}


if SITE_DIR and os.path.isdir(SITE_DIR):
    app.mount("/", StaticFiles(directory=SITE_DIR, html=True), name="site")


if __name__ == "__main__":
    import uvicorn
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8090)
    a = ap.parse_args()
    uvicorn.run(app, host=a.host, port=a.port, log_level="info")
