"""
OCR Engine - Inference backend server.

Loads the (encrypted) model ONCE, serves HTTP API on port 38000.
Supports: real progress tracking, task cancellation, multi-task queue,
VRAM cleanup, timeout enforcement, and log streaming.

Endpoints:
    GET  /healthz                 -> 200 when model is loaded
    POST /api/ocr                 -> action: create | check | cancel
    GET  /api/tasks               -> list all tasks (result truncated)
    GET  /api/status/<id>         -> full single-task status
    GET  /api/logs                -> recent log entries
    DELETE /api/tasks/<id>        -> remove finished task

Usage:  python runner.py
"""
from __future__ import annotations

import atexit
import collections
import gc
import json
import os
import queue
import shutil
import sys
import tempfile
import threading
import time
import uuid
import warnings
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# NOTE: Output suppression is deferred until AFTER model download/resolution
# so that download progress bars and status messages are visible.
# ---------------------------------------------------------------------------
import io as _io
_real_stderr = sys.stderr
_real_stdout = sys.stdout


def _suppress_library_noise():
    """Suppress noisy library output — call AFTER model download is done."""
    warnings.filterwarnings("ignore")
    os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
    os.environ["TRANSFORMERS_VERBOSITY"] = "error"
    logging.disable(logging.WARNING)
    sys.stderr = _io.StringIO()

# ---------------------------------------------------------------------------
# Paths & config
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
_ENC_DIR = os.path.join(SCRIPT_DIR, ".engine_enc")
_ENGINE_DIR = os.path.join(SCRIPT_DIR, ".engine")
_LICENSE_FILE = os.path.join(SCRIPT_DIR, ".license")
_MACHINE_LOCK_FILE = os.path.join(SCRIPT_DIR, ".machine_lock")

PORT = int(os.environ.get("OCR_RUNNER_PORT", "38000"))
MAX_TASK_HISTORY = 100          # keep last N tasks
TASK_TTL_SECONDS = 3600         # auto-purge finished tasks older than 1 hour
TASK_TIMEOUT_SECONDS = 300      # auto-cancel tasks running longer than 5 min
RESULT_PREVIEW_LEN = 200        # chars of result to include in /api/tasks list

# ---------------------------------------------------------------------------
# Log buffer (ring buffer for web UI)
# ---------------------------------------------------------------------------
_log_buffer: collections.deque = collections.deque(maxlen=500)
_log_lock = threading.Lock()


def log(msg: str, level: str = "INFO"):
    ts = time.strftime("%H:%M:%S")
    entry = {"ts": ts, "level": level, "msg": msg}
    with _log_lock:
        _log_buffer.append(entry)
    print(f"[{ts}] [{level}] {msg}", flush=True)


# ---------------------------------------------------------------------------
# Temp dir cleanup
# ---------------------------------------------------------------------------
_temp_model_dir: str | None = None


def _cleanup_temp():
    global _temp_model_dir
    if _temp_model_dir and os.path.isdir(_temp_model_dir):
        shutil.rmtree(_temp_model_dir, ignore_errors=True)
        _temp_model_dir = None


atexit.register(_cleanup_temp)


# ---------------------------------------------------------------------------
# License and model resolution
# ---------------------------------------------------------------------------
def _read_license() -> str | None:
    """
    Read the master decryption key.
    Priority:
      1. .machine_lock  (online activation stores master_key here)
      2. .license        (legacy / build-time fallback)
    """
    if os.path.isfile(_MACHINE_LOCK_FILE):
        try:
            import json as _json
            with open(_MACHINE_LOCK_FILE, "r") as f:
                lock = _json.load(f)
            mk = lock.get("master_key")
            if mk:
                return mk
        except Exception:
            pass

    if os.path.isfile(_LICENSE_FILE):
        with open(_LICENSE_FILE, "r") as f:
            return f.read().strip() or None
    return None


def _find_enc_dir() -> str | None:
    for d in (_MODELS_DIR, _ENC_DIR):
        if os.path.isdir(d) and os.path.isfile(os.path.join(d, "v.dat")):
            return d
    return None


def _resolve_engine() -> str:
    global _temp_model_dir
    enc_dir = _find_enc_dir()

    # If no encrypted model found, try to download + encrypt from HuggingFace
    if not enc_dir:
        sys.path.insert(0, SCRIPT_DIR)
        from model_setup import is_model_ready, download_and_encrypt
        if not is_model_ready(_MODELS_DIR):
            log("No encrypted model found. Downloading OCR model...")

            def _log_progress(status, progress=None):
                log(status)

            try:
                download_and_encrypt(
                    models_dir=_MODELS_DIR,
                    progress_fn=_log_progress,
                )
            except Exception as e:
                raise RuntimeError(f"Model setup failed: {e}")
            enc_dir = _find_enc_dir()
        else:
            enc_dir = _MODELS_DIR

    if enc_dir:
        sys.path.insert(0, SCRIPT_DIR)
        from engine_crypto import verify_license, decrypt_engine
        license_key = _read_license()
        if not license_key:
            raise RuntimeError(
                "No master key found. Please activate your license first "
                "(run launch_app.py and enter your license key)."
            )
        if not verify_license(enc_dir, license_key):
            raise RuntimeError("Invalid license key.")
        _temp_model_dir = tempfile.mkdtemp(prefix="ocr_engine_")
        decrypt_engine(enc_dir, _temp_model_dir, license_key)
        return _temp_model_dir
    if os.path.isdir(_ENGINE_DIR):
        return _ENGINE_DIR
    raise RuntimeError(
        "No model available. Encrypted model not found and download failed."
    )


# ---------------------------------------------------------------------------
# Load model (with log-buffer visibility)
# ---------------------------------------------------------------------------
log("Resolving model (may download on first run)...")
engine_path = _resolve_engine()
log(f"Engine path resolved: {os.path.basename(engine_path)}")

# NOW suppress library noise — after download is done
_suppress_library_noise()

import torch
from PIL import Image
from transformers import (
    AutoProcessor,
    AutoModelForImageTextToText,
    StoppingCriteria,
    StoppingCriteriaList,
)

# --- GPU compatibility: auto-select dtype for ANY GPU ---
DEVICE = "cpu"
DTYPE = torch.float32
gpu_name = "CPU"

try:
    if torch.cuda.is_available():
        DEVICE = "cuda"
        cap = torch.cuda.get_device_capability(0)
        gpu_name = torch.cuda.get_device_name(0)
        if cap[0] >= 8:
            DTYPE = torch.bfloat16   # Ampere+ (RTX 30xx/40xx, A100)
        else:
            DTYPE = torch.float16    # Turing/Volta/Pascal (RTX 20xx, GTX 16xx/10xx)
        log(f"GPU detected: {gpu_name} (compute {cap[0]}.{cap[1]}), dtype={DTYPE}")
    else:
        log("No GPU detected - using CPU (float32)", "WARN")
except Exception as e:
    log(f"GPU detection failed ({e}) - CPU fallback", "WARN")

log("Loading model weights (this may take 30-60s)...")
MODEL = AutoModelForImageTextToText.from_pretrained(
    engine_path, torch_dtype=DTYPE, low_cpu_mem_usage=True
).to(DEVICE).eval()
PROCESSOR = AutoProcessor.from_pretrained(engine_path)
_cleanup_temp()

sys.stderr = _real_stderr
logging.disable(logging.NOTSET)
logging.getLogger().setLevel(logging.WARNING)

MODEL_READY = True
log(f"Model ready on {DEVICE.upper()} ({gpu_name})")

# ---------------------------------------------------------------------------
# OCR prompts
# ---------------------------------------------------------------------------
PROMPTS = {
    "ocr": "OCR:",
    "table": "Table Recognition:",
    "formula": "Formula Recognition:",
    "chart": "Chart Recognition:",
    "spotting": "Spotting:",
    "seal": "Seal Recognition:",
}

TASK_LABELS = {
    "ocr": "OCR", "table": "Table", "formula": "Formula",
    "chart": "Chart", "spotting": "Spotting", "seal": "Seal",
}


# ---------------------------------------------------------------------------
# Task cancellation exception
# ---------------------------------------------------------------------------
class TaskCancelled(Exception):
    pass


# ---------------------------------------------------------------------------
# Progress-tracking StoppingCriteria (also handles cancellation + timeout)
# ---------------------------------------------------------------------------
class ProgressTracker(StoppingCriteria):
    """Called once per generated token. Updates progress, checks cancel/timeout."""

    def __init__(self, task_id: str, max_new_tokens: int, started_at: float):
        super().__init__()
        self.task_id = task_id
        self.max_new_tokens = max_new_tokens
        self.started_at = started_at
        self.tokens_generated = 0
        self.cancelled = False
        self.timed_out = False

    def __call__(self, input_ids, scores, **kwargs):
        self.tokens_generated += 1
        # Progress: generation phase spans 0.3 -> 0.9
        gen_progress = min(self.tokens_generated / self.max_new_tokens, 1.0)
        progress = 0.3 + 0.6 * gen_progress
        elapsed = time.time() - self.started_at

        with tasks_lock:
            t = tasks.get(self.task_id)
            if t:
                t["progress"] = round(progress, 3)
                t["message"] = f"Generating... ({self.tokens_generated} tokens, {elapsed:.0f}s)"
                # Check user cancel
                if t.get("cancel_requested"):
                    self.cancelled = True
                # Check timeout
                elif elapsed > TASK_TIMEOUT_SECONDS:
                    t["cancel_requested"] = True
                    t["message"] = f"Timed out after {TASK_TIMEOUT_SECONDS}s"
                    self.timed_out = True
                    self.cancelled = True

        return self.cancelled


# ---------------------------------------------------------------------------
# Task storage
# ---------------------------------------------------------------------------
tasks: dict[str, dict] = {}
tasks_lock = threading.Lock()
task_queue: queue.Queue = queue.Queue()


def _update_task(task_id: str, **kwargs):
    with tasks_lock:
        t = tasks.get(task_id)
        if t:
            t.update(kwargs)


def _is_cancelled(task_id: str) -> bool:
    with tasks_lock:
        t = tasks.get(task_id)
        return bool(t and t.get("cancel_requested"))


def _check_timeout(task_id: str) -> bool:
    """Auto-cancel if task exceeded TASK_TIMEOUT_SECONDS. Returns True if timed out."""
    with tasks_lock:
        t = tasks.get(task_id)
        if not t or not t.get("started_at"):
            return False
        if time.time() - t["started_at"] > TASK_TIMEOUT_SECONDS:
            t["cancel_requested"] = True
            t["message"] = f"Timed out after {TASK_TIMEOUT_SECONDS}s"
            return True
    return False


def _should_stop(task_id: str) -> bool:
    """Check if task should stop (cancelled or timed out)."""
    return _is_cancelled(task_id) or _check_timeout(task_id)


def _purge_old_tasks():
    """Remove completed/cancelled tasks older than TTL."""
    now = time.time()
    with tasks_lock:
        to_remove = []
        terminal = ("DONE", "ERROR", "CANCELLED", "TIMEOUT")
        for tid, t in tasks.items():
            if t["status"] in terminal:
                if now - t.get("created_at", now) > TASK_TTL_SECONDS:
                    to_remove.append(tid)
        # Also trim to MAX_TASK_HISTORY
        if len(tasks) > MAX_TASK_HISTORY:
            sorted_ids = sorted(tasks.keys(),
                                key=lambda k: tasks[k].get("created_at", 0))
            excess = len(tasks) - MAX_TASK_HISTORY
            for tid in sorted_ids[:excess]:
                if tasks[tid]["status"] in terminal:
                    to_remove.append(tid)
        for tid in set(to_remove):
            tasks.pop(tid, None)


def _cleanup_vram():
    """Free GPU memory after task end (cancel, error, or normal)."""
    if DEVICE == "cuda":
        try:
            torch.cuda.empty_cache()
        except Exception:
            pass
    gc.collect()


# ---------------------------------------------------------------------------
# Inference with real progress tracking
# ---------------------------------------------------------------------------
def do_inference(image_path: str, task_type: str, task_id: str,
                 started_at: float) -> str:
    """Run OCR with per-token progress tracking, cancellation, and timeout."""
    max_new_tokens = 4096

    # --- Stage 1: Load image (0.05 -> 0.15) ---
    _update_task(task_id, progress=0.05, message="Loading image...")
    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise RuntimeError(f"Cannot open image: {e}")

    orig_w, orig_h = image.size
    is_spotting = task_type == "spotting"
    if is_spotting and orig_w < 1500 and orig_h < 1500:
        try:
            resample = Image.Resampling.LANCZOS
        except AttributeError:
            resample = Image.LANCZOS
        image = image.resize((orig_w * 2, orig_h * 2), resample)

    _update_task(task_id, progress=0.15,
                 message=f"Image loaded ({orig_w}x{orig_h}).")

    if _should_stop(task_id):
        raise TaskCancelled()

    # --- Stage 2: Preprocess & tokenize (0.15 -> 0.30) ---
    _update_task(task_id, progress=0.2, message="Preprocessing & tokenizing...")
    max_pixels = 2048 * 28 * 28 if is_spotting else 1280 * 28 * 28
    prompt_text = PROMPTS.get(task_type, "OCR:")

    messages = [{"role": "user", "content": [
        {"type": "image", "image": image},
        {"type": "text", "text": prompt_text},
    ]}]

    inputs = PROCESSOR.apply_chat_template(
        messages, add_generation_prompt=True, tokenize=True,
        return_dict=True, return_tensors="pt",
        images_kwargs={"size": {
            "shortest_edge": PROCESSOR.image_processor.min_pixels,
            "longest_edge": max_pixels,
        }},
    ).to(MODEL.device)

    prompt_tokens = inputs["input_ids"].shape[-1]
    _update_task(task_id, progress=0.3,
                 message=f"Tokenized ({prompt_tokens} prompt tokens). Generating...")

    if _should_stop(task_id):
        raise TaskCancelled()

    # --- Stage 3: Generate with per-token progress tracking (0.3 -> 0.9) ---
    tracker = ProgressTracker(task_id, max_new_tokens, started_at)

    with torch.inference_mode():
        outputs = MODEL.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            stopping_criteria=StoppingCriteriaList([tracker]),
        )

    if tracker.cancelled:
        raise TaskCancelled()

    # --- Stage 4: Decode (0.9 -> 1.0) ---
    _update_task(task_id, progress=0.92, message="Decoding result...")
    result = PROCESSOR.decode(outputs[0][prompt_tokens:-1])

    _update_task(task_id, progress=0.98,
                 message=f"Done ({tracker.tokens_generated} tokens generated)")
    return result


# ---------------------------------------------------------------------------
# Worker thread
# ---------------------------------------------------------------------------
def worker():
    while True:
        item = task_queue.get()
        if item is None:
            break
        task_id, image_path, task_type = item

        # Skip if already cancelled while queued
        with tasks_lock:
            t = tasks.get(task_id)
            if not t:
                task_queue.task_done()
                continue
            if t.get("cancel_requested"):
                t["status"] = "CANCELLED"
                t["finished_at"] = time.time()
                t["message"] = "Cancelled before processing."
                log(f"Task {task_id[:8]} cancelled (was queued).")
                task_queue.task_done()
                continue

        now = time.time()
        _update_task(task_id, status="PROCESSING", started_at=now,
                     progress=0.02, message="Starting...")
        log(f"Task {task_id[:8]} started ({TASK_LABELS.get(task_type, task_type)})")

        try:
            result = do_inference(image_path, task_type, task_id, now)
            elapsed = time.time() - now
            _update_task(task_id, status="DONE", progress=1.0, result=result,
                         finished_at=time.time(),
                         message=f"Completed in {elapsed:.1f}s")
            log(f"Task {task_id[:8]} done in {elapsed:.1f}s")

        except TaskCancelled:
            # Distinguish user cancel vs timeout
            with tasks_lock:
                t = tasks.get(task_id)
                timed_out = False
                if t:
                    elapsed = time.time() - (t.get("started_at") or now)
                    timed_out = elapsed >= TASK_TIMEOUT_SECONDS
                    t["status"] = "TIMEOUT" if timed_out else "CANCELLED"
                    t["finished_at"] = time.time()
                    if timed_out:
                        t["message"] = f"Timed out after {elapsed:.0f}s"
                        t["error"] = f"Task exceeded {TASK_TIMEOUT_SECONDS}s limit"
                    else:
                        t["message"] = f"Cancelled by user ({elapsed:.1f}s elapsed)"
            if timed_out:
                log(f"Task {task_id[:8]} timed out", "WARN")
            else:
                log(f"Task {task_id[:8]} cancelled by user")
            _cleanup_vram()

        except Exception as e:
            elapsed = time.time() - now
            _update_task(task_id, status="ERROR", error=str(e),
                         finished_at=time.time(),
                         message=f"Error after {elapsed:.1f}s: {e}")
            log(f"Task {task_id[:8]} error: {e}", "ERROR")
            _cleanup_vram()  # FIX: also clean VRAM on error, not just cancel

        # Periodic cleanup
        _purge_old_tasks()
        task_queue.task_done()


worker_thread = threading.Thread(target=worker, daemon=True)
worker_thread.start()


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------
def send_json(handler, code, data):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(body)


def _task_summary(task_id: str, t: dict, include_full_result: bool = True,
                  queue_position: int | None = None) -> dict:
    """Build a JSON-safe task summary."""
    result = t.get("result", "")
    if not include_full_result and result and len(result) > RESULT_PREVIEW_LEN:
        result = result[:RESULT_PREVIEW_LEN] + "..."

    return {
        "task_id": task_id,
        "status": t["status"],
        "progress": t.get("progress", 0),
        "message": t.get("message", ""),
        "result": result,
        "error": t.get("error", ""),
        "task_type": t.get("task_type", ""),
        "task_label": TASK_LABELS.get(t.get("task_type", ""), ""),
        "created_at": t.get("created_at", 0),
        "started_at": t.get("started_at"),
        "finished_at": t.get("finished_at"),
        "queue_position": queue_position,
    }


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------
class RunnerHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress default logging; we use log()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # ------------------------------------------------------------------ GET
    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/healthz":
            send_json(self, 200 if MODEL_READY else 503,
                      {"status": "ok" if MODEL_READY else "loading",
                       "device": DEVICE, "gpu": gpu_name})
            return

        if path.startswith("/api/status/"):
            task_id = path.split("/api/status/")[-1].split("?")[0]
            with tasks_lock:
                t = tasks.get(task_id)
                resp = _task_summary(task_id, t, include_full_result=True) if t else None
            if resp is None:
                send_json(self, 404, {"error": "Task not found"})
            else:
                send_json(self, 200, resp)
            return

        if path == "/api/tasks":
            with tasks_lock:
                # Compute queue positions for active tasks
                active_ids = sorted(
                    [tid for tid, t in tasks.items()
                     if t["status"] in ("QUEUED", "PROCESSING")],
                    key=lambda k: tasks[k].get("created_at", 0))
                pos_map = {tid: i for i, tid in enumerate(active_ids)}

                items = [_task_summary(tid, t,
                                       include_full_result=False,
                                       queue_position=pos_map.get(tid))
                         for tid, t in tasks.items()]

            items.sort(key=lambda x: x["created_at"], reverse=True)
            send_json(self, 200, {"tasks": items,
                                  "queue_size": task_queue.qsize(),
                                  "active_count": len(active_ids)})
            return

        if path == "/api/logs":
            with _log_lock:
                entries = list(_log_buffer)
            send_json(self, 200, {"logs": entries})
            return

        self.send_response(404)
        self.end_headers()

    # ----------------------------------------------------------------- POST
    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/ocr":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body.decode("utf-8"))
        except Exception:
            send_json(self, 400, {"error": "Invalid JSON"})
            return

        action = data.get("action", "create")

        # ---- CHECK ----
        if action == "check":
            task_id = data.get("task_id", "")
            with tasks_lock:
                t = tasks.get(task_id)
                resp = _task_summary(task_id, t, include_full_result=True) if t else None
            if resp is None:
                send_json(self, 404, {"error": "Task not found"})
            else:
                send_json(self, 200, resp)
            return

        # ---- CANCEL ----
        if action == "cancel":
            task_id = data.get("task_id", "")
            with tasks_lock:
                t = tasks.get(task_id)
                if not t:
                    resp_code, resp_data = 404, {"error": "Task not found"}
                elif t["status"] in ("DONE", "ERROR", "CANCELLED", "TIMEOUT"):
                    resp_code = 200
                    resp_data = {"message": "Task already finished.",
                                 **_task_summary(task_id, t)}
                else:
                    t["cancel_requested"] = True
                    if t["status"] == "QUEUED":
                        t["status"] = "CANCELLED"
                        t["finished_at"] = time.time()
                        t["message"] = "Cancelled while queued."
                    resp_code = 200
                    resp_data = {"message": "Cancel requested.",
                                 "task_id": task_id}
            # FIX: send_json OUTSIDE the lock
            if resp_code != 404:
                log(f"Task {task_id[:8]} cancel requested.")
            send_json(self, resp_code, resp_data)
            return

        # ---- CREATE ----
        if action == "create":
            image_path = data.get("image_path")
            task_type = data.get("task", "ocr")
            if not image_path or not os.path.isfile(image_path):
                send_json(self, 400, {"error": "Missing or invalid image_path"})
                return
            if task_type not in PROMPTS:
                send_json(self, 400, {
                    "error": f"Unknown task: {task_type}. "
                             f"Valid: {list(PROMPTS.keys())}"})
                return

            task_id = uuid.uuid4().hex
            now = time.time()
            with tasks_lock:
                tasks[task_id] = {
                    "status": "QUEUED",
                    "progress": 0,
                    "result": "",
                    "error": "",
                    "message": "Queued.",
                    "image_path": image_path,
                    "task_type": task_type,
                    "created_at": now,
                    "started_at": None,
                    "finished_at": None,
                    "cancel_requested": False,
                }
                queue_pos = sum(1 for t in tasks.values()
                                if t["status"] in ("QUEUED", "PROCESSING"))
            task_queue.put((task_id, image_path, task_type))
            log(f"Task {task_id[:8]} queued "
                f"({TASK_LABELS.get(task_type, task_type)}, pos #{queue_pos})")

            send_json(self, 200, {"task_id": task_id, "status": "QUEUED",
                                  "queue_position": queue_pos})
            return

        send_json(self, 400, {"error": f"Unknown action: {action}"})

    # --------------------------------------------------------------- DELETE
    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith("/api/tasks/"):
            task_id = path.split("/api/tasks/")[-1].split("?")[0]
            with tasks_lock:
                t = tasks.get(task_id)
                if not t:
                    resp_code, resp_data = 404, {"error": "Task not found"}
                elif t["status"] in ("DONE", "ERROR", "CANCELLED", "TIMEOUT"):
                    tasks.pop(task_id, None)
                    resp_code, resp_data = 200, {"message": "Removed."}
                else:
                    resp_code, resp_data = 400, {"error": "Cannot remove active task."}
            # FIX: send_json OUTSIDE the lock
            send_json(self, resp_code, resp_data)
            return
        self.send_response(404)
        self.end_headers()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    log(f"Runner listening on http://127.0.0.1:{PORT}")
    log(f"Device: {DEVICE.upper()}, GPU: {gpu_name}, DType: {DTYPE}")
    log(f"Task timeout: {TASK_TIMEOUT_SECONDS}s, History limit: {MAX_TASK_HISTORY}")
    server = HTTPServer(("127.0.0.1", PORT), RunnerHandler)
    try:
        server.serve_forever()
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        log("Shutting down.")
        task_queue.put(None)
        server.server_close()


if __name__ == "__main__":
    main()
