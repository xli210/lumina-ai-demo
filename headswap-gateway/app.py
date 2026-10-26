"""HeadSwap Pro (model id "headswap-pro") gateway: the web page's API, served on top of the RunPod serverless endpoint.

Billing hint: /api/swap and a finished /api/job carry "model" and "billable_images" (= the number of variations
delivered). Credits for a swap = credits per image x billable_images.

The page (web/index.html) talks to this server only; the RunPod key and the R2 keys stay here.

    POST /api/warm                  start a GPU while the user picks photos (at most once a minute)
    GET  /api/entitlement           {"watermark": bool, "reason"} for the caller's entitlement token
    POST /api/photo   file          upload the photo -> {"id", "status": "detecting"}; detection runs on the GPU
    GET  /api/photo/<id>            {"status": "queued|running|done|error", "phase", "width", "height", "faces", "default_face"}
    POST /api/swap    photo_id, face, variations, seed, head (file)  -> {"job", "watermark"}
    GET  /api/job/<id>              {"status": "queued|running|done|error", "phase", "step", "steps", "variation", "n",
                                     "pipeline", "before", "watermarked", "results": [{"url", "download_url", "seconds", "size"}]}
    POST /api/client-log            the page reports its own errors here (JSON)
    GET  /api/admin/logs            recent log records (header X-HS-Admin-Key: HS_ADMIN_KEY)
    GET  /api/health

Watermark (same rule as Face Studio): users who have never bought credits get a "NanoPocket.ai" watermark, users who
have bought credits at least once never do. Only the site's backend knows that, so it signs it: the page sends the
header X-HS-Entitlement with a token made by the site's backend with HS_ENTITLEMENT_SECRET (see make_token.py):
    v1.<base64url(JSON {"uid": "...", "paid": true|false, "exp": <unix time>})>.<hex HMAC-SHA256 of "v1.<payload>">
No token, a bad signature, an expired token or "paid": false -> watermark. The page never decides it. The worker
watermarks before it uploads, and a job that was asked for a watermark but comes back without "watermarked": true is
reported as an error, never delivered. HS_WATERMARK_MODE: "credits" (default, the rule above), "always", "never".

Swap tickets (added by NanoPocket): the page cannot talk to this gateway for free. With HS_TICKET_REQUIRED=1 every POST /api/swap
must carry the header X-HS-Ticket, made by the site's backend only AFTER it has reserved the credits for the swap:
    t1.<base64url(JSON {"uid", "hold", "n", "paid", "exp"})>.<hex HMAC-SHA256 of "t1.<payload>", same HS_ENTITLEMENT_SECRET>
  hold  the credit reservation this swap is paid from; a ticket works for ONE swap (a second use is refused)
  n     how many images were paid for; the swap may ask for fewer, never more
  paid  whether the user has ever bought credits: it replaces the X-HS-Entitlement header for the watermark decision
No ticket, a bad signature, an expired ticket or a used one -> HTTP 402 and nothing reaches the GPU.

Logs: one JSON line per event on stdout (Render's log view): every request (id, path, status, time, client, user),
every RunPod call that fails, every job's submission and outcome with its timings. Every response carries
X-Request-ID; error bodies carry "request_id", which the page shows, so a user's report leads to the exact lines.
The same id travels to the worker (input.request_id) and into its logs and R2 records. Errors (gateway faults, failed
or refused jobs, page errors) are also kept as JSON records in R2 under HS_LOG_PREFIX (default headswap/logs/gateway)
and in memory for /api/admin/logs.

Photos and heads go to R2 (HS_INPUT_PREFIX) and reach the worker as short-lived presigned links, so request bodies to
RunPod stay tiny whatever the photo size. Detection and swaps are RunPod async jobs polled by the page through this
server, so no request here waits through a GPU cold start (proxies such as Cloudflare cut requests at ~100 s).
State is in memory: run one instance (photos are kept HS_PHOTO_TTL seconds; the page re-uploads after that).
"""
import base64
import contextvars
import hashlib
import hmac
import json
import os
import re
import sys
import threading
import time
import traceback
import uuid
from collections import defaultdict, deque
from urllib.parse import unquote, urlsplit

import boto3
import requests
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

RUNPOD_KEY = os.environ["RUNPOD_API_KEY"]
ENDPOINT = os.environ["RUNPOD_ENDPOINT_ID"]
RP = f"https://api.runpod.ai/v2/{ENDPOINT}"
BUCKET = os.environ["R2_BUCKET"]
INPUT_PREFIX = os.environ.get("HS_INPUT_PREFIX", "headswap/input").strip("/")
LOG_PREFIX = os.environ.get("HS_LOG_PREFIX", "headswap/logs/gateway").strip("/")
MAX_UPLOAD = int(os.environ.get("HS_MAX_UPLOAD_BYTES", 25 << 20))
PHOTO_TTL = int(os.environ.get("HS_PHOTO_TTL", 3 * 3600))
SWAPS_PER_HOUR = int(os.environ.get("HS_SWAPS_PER_HOUR", 30))
PHOTOS_PER_HOUR = int(os.environ.get("HS_PHOTOS_PER_HOUR", 60))
CLIENT_LOGS_PER_HOUR = int(os.environ.get("HS_CLIENT_LOGS_PER_HOUR", 60))
ENTITLEMENT_SECRET = os.environ.get("HS_ENTITLEMENT_SECRET", "")
WATERMARK_MODE = os.environ.get("HS_WATERMARK_MODE", "credits").strip().lower()
ADMIN_KEY = os.environ.get("HS_ADMIN_KEY", "")
TICKET_REQUIRED = os.environ.get("HS_TICKET_REQUIRED", "0").strip() == "1"
MODEL_ID = os.environ.get("HS_MODEL_ID", "headswap-pro")
LINK_TTL = 2 * 3600        # how long the worker may take to fetch an input
assert WATERMARK_MODE in ("credits", "always", "never"), f"HS_WATERMARK_MODE must be credits/always/never"
s3 = boto3.client("s3", endpoint_url=os.environ["R2_ENDPOINT"], region_name="auto",
                  aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"], aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"])
session = requests.Session()
session.headers.update({"Authorization": f"Bearer {RUNPOD_KEY}", "Content-Type": "application/json"})

PHOTOS = {}        # photo id -> {"key", "job", "t", "faces", "width", "height", "default_face", "error", "rid", "uid"}
USED_TICKETS = {}  # reservation id -> time it was used (a ticket pays for one swap)
JOBS = {}          # RunPod job id -> {"t", "n", "photo", "watermark", "uid", "rid", "done"}
LOCK = threading.Lock()
HITS = defaultdict(deque)
RECENT = deque(maxlen=500)          # recent log records, for /api/admin/logs
_last_warm = [0.0]
class _Ctx:
    """Request id / user of the request being served, for log lines. ContextVars (not threading.local) because
    FastAPI runs sync endpoints in a thread pool; Starlette copies the request's context into that thread."""
    _rid = contextvars.ContextVar("rid", default=None)
    _uid = contextvars.ContextVar("uid", default=None)
    rid = property(lambda self: self._rid.get(), lambda self, v: self._rid.set(v))
    uid = property(lambda self: self._uid.get(), lambda self, v: self._uid.set(v))


_ctx = _Ctx()
# 64 x 64 grey PNG: a detect on it finds no face in a few ms, but it makes RunPod start a worker
WARM_PNG = ("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAATUlEQVR42u3PQQ0AAAgEIDX5RTeFDzdoQCepz6aeExAQEBAQEBAQ"
            "EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQELi3oiwCAJt186UAAAAASUVORK5CYII=")

app = FastAPI(title="HeadSwap Pro gateway", docs_url="/api/docs", redoc_url=None, openapi_url="/api/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get("HS_CORS_ORIGINS", "*").split(","),
                   allow_methods=["GET", "POST"], allow_headers=["*"], expose_headers=["X-Request-ID"])


# ------------------------------------------------------------------ logging
def jlog(event, level="info", **fields):
    """One JSON line per event; also kept in memory for /api/admin/logs."""
    rec = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "level": level, "event": event,
           "request_id": getattr(_ctx, "rid", None), "user": getattr(_ctx, "uid", None)}
    rec.update({k: v for k, v in fields.items() if v is not None})
    rec = {k: v for k, v in rec.items() if v is not None}
    RECENT.append(rec)
    print(json.dumps(rec, default=str, ensure_ascii=False), file=sys.stdout, flush=True)
    return rec


def record(kind, body):
    """Keep an error record in R2 (<HS_LOG_PREFIX>/<kind>/<day>/<time>_<id>.json) in the background."""
    rid = body.get("request_id") or getattr(_ctx, "rid", None) or uuid.uuid4().hex[:12]
    key = f"{LOG_PREFIX}/{kind}/{time.strftime('%Y-%m-%d', time.gmtime())}/{time.strftime('%H%M%S', time.gmtime())}_{rid}.json"
    rec = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "endpoint": ENDPOINT, "request_id": rid,
           "user": getattr(_ctx, "uid", None), **body}

    def put():
        try:
            s3.put_object(Bucket=BUCKET, Key=key, ContentType="application/json",
                          Body=json.dumps(rec, default=str, ensure_ascii=False, indent=1).encode())
        except Exception as e:  # noqa: BLE001
            print(json.dumps({"level": "error", "event": "record_write_failed", "key": key, "error": repr(e)}), flush=True)

    threading.Thread(target=put, daemon=True).start()
    return key


def client_ip(request: Request):
    return (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "?")).split(",")[0].strip()


_RID_OK = re.compile(r"^[A-Za-z0-9._-]{6,64}$")


@app.middleware("http")
async def request_log(request: Request, call_next):
    incoming = request.headers.get("x-request-id", "")
    _ctx.rid = incoming if _RID_OK.match(incoming) else uuid.uuid4().hex[:16]
    _ctx.uid = None
    t = time.time()
    path = request.url.path
    try:
        response = await call_next(request)
    except Exception as e:  # noqa: BLE001  (normally handled by on_error below)
        tb = traceback.format_exc()
        jlog("unhandled_error", level="error", path=path, error=f"{type(e).__name__}: {e}", traceback=tb)
        record("errors", {"kind": "gateway_exception", "path": path, "error": f"{type(e).__name__}: {e}", "traceback": tb})
        response = JSONResponse({"detail": "Something went wrong on our side. Please try again.",
                                 "request_id": _ctx.rid}, status_code=500)
    response.headers["X-Request-ID"] = _ctx.rid
    quiet = request.method == "GET" and response.status_code < 400 and (path.startswith(("/api/job/", "/api/photo/"))
                                                                        or path == "/api/health")
    if not quiet:          # polls are logged only when they change state (see job / photo_status)
        jlog("request", level="warning" if response.status_code >= 400 else "info", method=request.method, path=path,
             status=response.status_code, ms=round(1000 * (time.time() - t)), ip=client_ip(request))
    return response


@app.exception_handler(HTTPException)
async def on_http_error(request: Request, exc: HTTPException):
    return JSONResponse({"detail": exc.detail, "request_id": getattr(_ctx, "rid", None)}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def on_validation_error(request: Request, exc: RequestValidationError):
    jlog("bad_request", level="warning", path=request.url.path, errors=exc.errors())
    return JSONResponse({"detail": "The request is missing a field or has a wrong value.",
                         "request_id": getattr(_ctx, "rid", None)}, status_code=400)


@app.exception_handler(Exception)
async def on_error(request: Request, exc: Exception):
    tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    jlog("unhandled_error", level="error", path=request.url.path, error=f"{type(exc).__name__}: {exc}", traceback=tb)
    record("errors", {"kind": "gateway_exception", "path": request.url.path, "method": request.method,
                      "error": f"{type(exc).__name__}: {exc}", "traceback": tb})
    return JSONResponse({"detail": "Something went wrong on our side. Please try again.",
                         "request_id": getattr(_ctx, "rid", None)}, status_code=500)


# ------------------------------------------------------------------ watermark entitlement
def _b64d(s):
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def entitlement(request: Request):
    """-> (watermark: bool, reason, uid). Only a valid token signed by the site's backend removes the watermark."""
    if WATERMARK_MODE == "never":
        return False, "mode_never", None
    if WATERMARK_MODE == "always":
        return True, "mode_always", None
    tok = (request.headers.get("x-hs-entitlement") or "").strip()
    if not tok:
        return True, "no_token", None
    if not ENTITLEMENT_SECRET:
        return True, "server_has_no_secret", None
    try:
        ver, payload, sig = tok.split(".")
        if ver != "v1":
            return True, "bad_version", None
        want = hmac.new(ENTITLEMENT_SECRET.encode(), f"{ver}.{payload}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(want, sig.lower()):
            return True, "bad_signature", None
        data = json.loads(_b64d(payload))
    except Exception:  # noqa: BLE001
        return True, "malformed_token", None
    uid = str(data.get("uid") or "")[:64] or None
    if not isinstance(data.get("exp"), (int, float)) or data["exp"] < time.time():
        return True, "expired", uid
    if data.get("paid") is True:
        return False, "purchased", uid
    return True, "never_purchased", uid


def swap_ticket(request: Request):
    """-> (ticket dict | None, reason). A ticket is the site's signed word that credits are reserved for this swap."""
    tok = (request.headers.get("x-hs-ticket") or "").strip()
    if not tok:
        return None, "no_ticket"
    if not ENTITLEMENT_SECRET:
        return None, "server_has_no_secret"
    try:
        ver, payload, sig = tok.split(".")
        if ver != "t1":
            return None, "bad_version"
        want = hmac.new(ENTITLEMENT_SECRET.encode(), f"{ver}.{payload}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(want, sig.lower()):
            return None, "bad_signature"
        data = json.loads(_b64d(payload))
    except Exception:  # noqa: BLE001
        return None, "malformed_ticket"
    if not isinstance(data, dict) or not isinstance(data.get("exp"), (int, float)) or data["exp"] < time.time():
        return None, "expired"
    if not isinstance(data.get("n"), int) or not 1 <= data["n"] <= 4 or not data.get("hold"):
        return None, "malformed_ticket"
    return data, "ok"


# ------------------------------------------------------------------ helpers
def limit(request: Request, kind: str, per_hour: int):
    """Sliding one-hour window per client IP (X-Forwarded-For first: Render and Cloudflare sit in front)."""
    ip = client_ip(request)
    q, now = HITS[(kind, ip)], time.time()
    while q and now - q[0] > 3600:
        q.popleft()
    if len(q) >= per_hour:
        jlog("rate_limited", level="warning", kind=kind, ip=ip, per_hour=per_hour)
        raise HTTPException(429, "Too many requests. Please wait a little and try again.")
    q.append(now)


def gc():
    now = time.time()
    with LOCK:
        for pid in [p for p, v in PHOTOS.items() if now - v["t"] > PHOTO_TTL]:
            PHOTOS.pop(pid, None)
        for jid in [j for j, v in JOBS.items() if now - v["t"] > 24 * 3600]:
            JOBS.pop(jid, None)
        for hid in [h for h, t in USED_TICKETS.items() if now - t > 24 * 3600]:
            USED_TICKETS.pop(hid, None)


def put_input(data: bytes, name: str) -> str:
    key = f"{INPUT_PREFIX}/{time.strftime('%Y%m%d')}/{uuid.uuid4().hex}_{name}"
    s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType="application/octet-stream")
    return key


def link(key: str, ttl=LINK_TTL, download_name=None) -> str:
    params = {"Bucket": BUCKET, "Key": key}
    if download_name:
        params["ResponseContentDisposition"] = f'attachment; filename="{download_name}"'
    return s3.generate_presigned_url("get_object", Params=params, ExpiresIn=ttl)


def key_from_url(url: str):
    """Object key of a presigned R2 URL made by the worker (path-style: /<bucket>/<key>)."""
    path = unquote(urlsplit(url).path).lstrip("/")
    return path[len(BUCKET) + 1:] if path.startswith(BUCKET + "/") else None


def rp_run(inp: dict) -> str:
    inp = {**inp, "request_id": getattr(_ctx, "rid", None)}
    if getattr(_ctx, "uid", None):
        inp["user"] = _ctx.uid
    t = time.time()
    try:
        r = session.post(f"{RP}/run", json={"input": inp}, timeout=30)
    except requests.RequestException as e:
        jlog("runpod_error", level="error", call="run", action=inp.get("action"), error=repr(e))
        record("errors", {"kind": "runpod_unreachable", "call": "run", "action": inp.get("action"), "error": repr(e)})
        raise HTTPException(503, "The GPU service could not be reached. Please try again.")
    if r.status_code != 200:
        jlog("runpod_error", level="error", call="run", action=inp.get("action"), http=r.status_code,
             body=r.text[:300], ms=round(1000 * (time.time() - t)))
        record("errors", {"kind": "runpod_rejected", "call": "run", "action": inp.get("action"), "http": r.status_code,
                          "body": r.text[:2000]})
        raise HTTPException(503, f"The GPU service did not accept the request (HTTP {r.status_code}).")
    return r.json()["id"]


def rp_status(jid: str) -> dict:
    try:
        r = session.get(f"{RP}/status/{jid}", timeout=30)
    except requests.RequestException as e:
        jlog("runpod_error", level="warning", call="status", job=jid, error=repr(e))
        return {"status": "UNREACHABLE"}
    if r.status_code == 404:
        return {"status": "LOST"}
    if r.status_code != 200:
        jlog("runpod_error", level="warning", call="status", job=jid, http=r.status_code, body=r.text[:300])
        return {"status": "UNREACHABLE"}
    return r.json()


def slim(status: dict) -> dict:
    """A RunPod /status payload without image data, for logs and records."""
    out = status.get("output")
    if isinstance(out, dict):
        out = {k: v for k, v in out.items() if k not in ("before_base64",)}
        out["results"] = [{k: v for k, v in r.items() if k not in ("base64", "url")} for r in out.get("results") or []]
        out.pop("before_url", None)
    return {k: v for k, v in {**status, "output": out}.items() if v is not None}


async def read_upload(f: UploadFile, what: str) -> bytes:
    data = await f.read()
    if not data:
        raise HTTPException(400, f"The {what} file is empty.")
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, f"The {what} is over {MAX_UPLOAD >> 20} MB.")
    return data


def phase_text(progress) -> str:
    if not isinstance(progress, dict):
        return ""
    p = progress.get("phase", "")
    if p.startswith("starting"):
        return "Starting the GPU (after a quiet period this takes about a minute)"
    return ""


def worker_error(status: dict):
    """(error_code, message) of a FAILED job: the worker puts a JSON object in "error"."""
    err = status.get("error")
    try:
        e = json.loads(err) if isinstance(err, str) else (err or {})
        return e.get("error_code"), e.get("error_message")
    except (ValueError, AttributeError):
        return None, str(err)[:400] if err else None


# ------------------------------------------------------------------ API
@app.get("/api/health")
def health():
    try:
        h = session.get(f"{RP}/health", timeout=10).json()
    except Exception:  # noqa: BLE001
        h = None
    return {"status": "ready", "endpoint": ENDPOINT, "runpod": h, "photos": len(PHOTOS), "jobs": len(JOBS),
            "watermark_mode": WATERMARK_MODE, "entitlement_secret_set": bool(ENTITLEMENT_SECRET), "ticket_required": TICKET_REQUIRED, "model": MODEL_ID}


@app.post("/api/warm")
def warm():
    """Wake a worker when the page opens; harmless and cheap if one is already up."""
    if time.time() - _last_warm[0] > 60:
        _last_warm[0] = time.time()
        try:
            rp_run({"action": "detect", "photo": WARM_PNG})
        except Exception:  # noqa: BLE001
            pass
    return {"ok": True}


@app.get("/api/entitlement")
def get_entitlement(request: Request):
    wm, reason, uid = entitlement(request)
    _ctx.uid = uid
    return {"watermark": wm, "reason": reason}


@app.post("/api/photo")
async def photo(request: Request, file: UploadFile = File(...)):
    _ctx.uid = entitlement(request)[2]
    if TICKET_REQUIRED and not _ctx.uid:        # detection runs on a GPU: only signed-in accounts (a valid token from the site)
        raise HTTPException(401, "Sign in to NanoPocket.ai to upload a photo.")
    limit(request, "photo", PHOTOS_PER_HOUR)
    gc()
    data = await read_upload(file, "photo")
    key = put_input(data, "photo")
    jid = rp_run({"action": "detect", "photo": link(key)})
    pid = uuid.uuid4().hex
    with LOCK:
        PHOTOS[pid] = {"key": key, "job": jid, "t": time.time(), "faces": None, "rid": _ctx.rid, "uid": _ctx.uid}
    jlog("photo_submitted", photo=pid, job=jid, bytes=len(data), filename=(file.filename or "")[:80])
    return {"id": pid, "status": "detecting"}


@app.get("/api/photo/{pid}")
def photo_status(pid: str):
    st = PHOTOS.get(pid)
    if st is None:
        raise HTTPException(404, "This photo has expired. Please upload it again.")
    _ctx.uid = st.get("uid")
    if st["faces"] is not None or st.get("error"):
        return photo_view(pid, st)
    s = rp_status(st["job"])
    if s["status"] in ("IN_QUEUE", "UNREACHABLE"):
        return {"id": pid, "status": "queued", "phase": "Waiting for a GPU"}
    if s["status"] == "IN_PROGRESS":
        return {"id": pid, "status": "running", "phase": phase_text(s.get("output")) or "Finding people"}
    out = s.get("output") or {}
    elapsed = round(time.time() - st["t"], 1)
    if s["status"] == "COMPLETED" and out.get("ok"):
        # the worker leaves out null fields: default_face is missing when no face was found
        st.update(faces=out.get("faces") or [], width=out["width"], height=out["height"],
                  default_face=out.get("default_face"))
        jlog("photo_detected", request_id=st.get("rid"), photo=pid, job=st["job"], faces=len(st["faces"]),
             elapsed_s=elapsed,
             queue_s=round((s.get("delayTime") or 0) / 1000, 1), exec_s=round((s.get("executionTime") or 0) / 1000, 1))
    elif s["status"] == "COMPLETED":
        st["error"] = out.get("error_message") or "The photo could not be read."
        jlog("photo_refused", level="warning", request_id=st.get("rid"), photo=pid, job=st["job"], error_code=out.get("error_code"),
             error=out.get("error_message"))
        record("jobs", {"kind": "detect_refused", "photo": pid, "job": st["job"], "photo_request_id": st.get("rid"),
                        "runpod": slim(s)})
    else:
        code, msg = worker_error(s)
        st["error"] = "Finding people failed. Please try again."
        jlog("photo_failed", level="error", request_id=st.get("rid"), photo=pid, job=st["job"], status=s["status"], error_code=code, error=msg)
        record("jobs", {"kind": "detect_failed", "photo": pid, "job": st["job"], "photo_request_id": st.get("rid"),
                        "runpod": slim(s)})
    return photo_view(pid, st)


def photo_view(pid, st):
    if st.get("error"):
        return {"id": pid, "status": "error", "error": st["error"], "request_id": st.get("rid")}
    return {"id": pid, "status": "done", "width": st["width"], "height": st["height"], "faces": st["faces"],
            "default_face": st["default_face"]}


@app.post("/api/swap")
async def swap(request: Request, photo_id: str = Form(...), face: int = Form(0), variations: int = Form(1),
               seed: int = Form(-1), head: UploadFile = File(...)):
    wm, reason, uid = entitlement(request)
    ticket = None
    if TICKET_REQUIRED:
        ticket, why = swap_ticket(request)
        if ticket is None:
            jlog("swap_refused_no_ticket", level="warning", reason=why, ip=client_ip(request))
            raise HTTPException(402, "Credits need to be reserved before a swap. Please reload the page and try again.")
        uid = str(ticket.get("uid") or "")[:64] or uid
        # the ticket is signed by the site, so its "paid" decides the watermark the same way the entitlement token does
        if WATERMARK_MODE == "credits":
            wm, reason = (ticket.get("paid") is not True), ("purchased" if ticket.get("paid") is True else "never_purchased")
    _ctx.uid = uid
    st = PHOTOS.get(photo_id)
    if st is None:
        raise HTTPException(404, "This photo has expired. Please upload it again.")
    if not st.get("faces"):
        raise HTTPException(400, "No face was found in the photo." if st.get("faces") == [] else
                            "The photo is still being checked. Please wait a moment.")
    if not 0 <= face < len(st["faces"]):
        raise HTTPException(400, "Choose a person in the photo.")
    limit(request, "swap", SWAPS_PER_HOUR)
    n = max(1, min(4, int(variations)))
    if ticket is not None:
        if n > ticket["n"]:
            raise HTTPException(402, "That is more images than were reserved. Please reload the page and try again.")
        with LOCK:
            if str(ticket["hold"]) in USED_TICKETS:
                raise HTTPException(409, "This swap was already started.")
            USED_TICKETS[str(ticket["hold"])] = time.time()
    data = await read_upload(head, "head photo")
    head_key = put_input(data, "head")
    jid = rp_run({"action": "swap", "photo": link(st["key"]), "head": link(head_key), "face": face,
                  "variations": n, "seed": seed, "watermark": wm})
    with LOCK:
        JOBS[jid] = {"t": time.time(), "n": n, "photo": photo_id, "watermark": wm, "uid": uid, "rid": _ctx.rid,
                     "done": False, "last": None, "hold": (str(ticket["hold"]) if ticket else None)}
    jlog("swap_submitted", job=jid, photo=photo_id, face=face, faces=len(st["faces"]), variations=n, seed=seed,
         watermark=wm, watermark_reason=reason, head_bytes=len(data), model=MODEL_ID, hold=(str(ticket["hold"]) if ticket else None))
    return {"job": jid, "watermark": wm, "model": MODEL_ID, "variations": n}


@app.get("/api/job/{jid}")
def job(jid: str):
    j = JOBS.get(jid)
    if j is None:                      # only jobs started through this gateway can be read
        raise HTTPException(404, "Unknown job.")
    _ctx.uid = j.get("uid")
    _ctx.rid = j["rid"]                # log the job's lines under the id of the request that started it
    s = rp_status(jid)
    base = {"id": jid, "n": j["n"], "elapsed": round(time.time() - j["t"], 1), "results": [], "error": None,
            "step": 0, "steps": 8, "variation": 0, "watermark": j["watermark"]}
    status = s["status"]
    if status != j.get("last") and status in ("IN_QUEUE", "IN_PROGRESS"):
        j["last"] = status
        jlog("swap_progress", job=jid, status=status, elapsed_s=base["elapsed"])
    if status in ("IN_QUEUE", "UNREACHABLE"):
        return {**base, "status": "queued", "phase": "Waiting for a GPU", "ahead": 0}
    if status == "IN_PROGRESS":
        p = s.get("output") if isinstance(s.get("output"), dict) else {}
        if p.get("phase") == "swapping":
            return {**base, "status": "running", "phase": "", "step": p.get("step", 0), "steps": p.get("steps", 8),
                    "variation": p.get("variation", 1)}
        return {**base, "status": "running", "phase": phase_text(p) or "Preparing"}
    out = s.get("output") or {}
    timing = {"elapsed_s": base["elapsed"], "queue_s": round((s.get("delayTime") or 0) / 1000, 1),
              "exec_s": round((s.get("executionTime") or 0) / 1000, 1)}
    first = not j["done"]
    j["done"] = True
    if status == "COMPLETED" and out.get("ok"):
        if j["watermark"] and out.get("watermarked") is not True:
            # asked for a watermark, got none (old worker or a fault): never hand a clean image to a free user
            if first:
                jlog("watermark_missing", level="critical", job=jid, **timing, worker=out.get("worker"))
                record("errors", {"kind": "watermark_missing", "job": jid, "swap_request_id": j["rid"],
                                  "runpod": slim(s)})
            return {**base, "status": "error", "request_id": j["rid"],
                    "error": "The swap could not be finished. Please try again."}
        results = []
        for i, r in enumerate(out.get("results", [])):
            k = key_from_url(r.get("url", ""))
            results.append({"url": r["url"], "seconds": r.get("seconds"), "size": r.get("size"),
                            "download_url": link(k, 86400, f"headswap-pro-{i + 1}.png") if k else r["url"]})
        if first:
            w = out.get("worker") or {}
            jlog("swap_done", job=jid, **timing, model=MODEL_ID, billable_images=len(results), results=len(results),
                 pipeline=out.get("pipeline"),
                 watermarked=bool(out.get("watermarked")), model_total_s=out.get("total_s"), gpu=w.get("gpu"),
                 worker_job_number=w.get("job_number"), waited_for_startup_s=w.get("waited_for_startup_s"))
        return {**base, "status": "done", "pipeline": out.get("pipeline"), "seed": out.get("seed"), "results": results,
                "before": out.get("before_url"), "total_s": out.get("total_s"), "variation": len(results),
                "step": 8, "watermarked": bool(out.get("watermarked")), "model": MODEL_ID,
                "billable_images": len(results)}
    if status == "COMPLETED":
        if first:
            jlog("swap_refused", level="warning", job=jid, **timing, error_code=out.get("error_code"),
                 error=out.get("error_message"), field=out.get("field"))
            record("jobs", {"kind": "swap_refused", "job": jid, "swap_request_id": j["rid"], "runpod": slim(s)})
        return {**base, "status": "error", "request_id": j["rid"],
                "error": out.get("error_message") or "The swap could not be done."}
    code, msg = worker_error(s)
    if first:
        jlog("swap_failed", level="error", job=jid, status=status, **timing, error_code=code, error=msg)
        record("errors", {"kind": "swap_failed", "job": jid, "status": status, "swap_request_id": j["rid"],
                          "error_code": code, "error_message": msg, "runpod": slim(s)})
    text = {"TIMED_OUT": "The swap took too long and was stopped.", "CANCELLED": "The swap was cancelled.",
            "LOST": "This job is no longer available.",
            }.get(status, "The GPU ran out of memory. Please try a smaller photo." if code == "gpu_out_of_memory"
                  else "Something went wrong on the GPU. Please try again.")
    return {**base, "status": "error", "request_id": j["rid"], "error": text}


@app.post("/api/client-log")
async def client_log(request: Request):
    """Errors the page runs into (failed requests, script errors), so they show up next to the server's."""
    limit(request, "client_log", CLIENT_LOGS_PER_HOUR)
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        raise HTTPException(400, "Expected JSON.")
    if not isinstance(body, dict):
        raise HTTPException(400, "Expected a JSON object.")
    clip = {k: (str(v)[:2000] if not isinstance(v, (int, float, bool)) else v) for k, v in list(body.items())[:20]}
    _ctx.uid = entitlement(request)[2]
    jlog("client_error", level="warning", ip=client_ip(request), ua=request.headers.get("user-agent", "")[:200], **clip)
    record("client", {"kind": "client_error", "ip": client_ip(request),
                      "ua": request.headers.get("user-agent", "")[:300], **clip})
    return {"ok": True, "request_id": _ctx.rid}


@app.get("/api/admin/logs")
def admin_logs(request: Request, n: int = 100, level: str = "", event: str = "", request_id: str = ""):
    if not ADMIN_KEY or not hmac.compare_digest(request.headers.get("x-hs-admin-key", ""), ADMIN_KEY):
        raise HTTPException(403, "Forbidden.")
    order = {"debug": 0, "info": 1, "warning": 2, "error": 3, "critical": 4}
    out = [r for r in RECENT if (not level or order.get(r.get("level"), 1) >= order.get(level, 0))
           and (not event or r.get("event") == event)
           and (not request_id or request_id in (r.get("request_id"), r.get("swap_request_id")))]
    return {"count": len(out[-n:]), "records": out[-max(1, min(n, 500)):]}
