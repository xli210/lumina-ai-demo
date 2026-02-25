"""
FLUX.2 Klein - Inference backend server.

Loads the model ONCE, serves HTTP API on port 38000.
Supports: real progress tracking, task cancellation, multi-task queue,
VRAM cleanup, timeout enforcement, and log streaming.

Endpoints:
    GET  /healthz                 -> 200 when model is loaded
    POST /api/generate            -> action: create | check | cancel
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
_LOCAL_WEIGHTS_DIR = os.path.join(SCRIPT_DIR, "model_weights")
_LICENSE_FILE = os.path.join(SCRIPT_DIR, ".license")
_MACHINE_LOCK_FILE = os.path.join(SCRIPT_DIR, ".machine_lock")
_OUTPUT_DIR = os.path.join(SCRIPT_DIR, "outputs")

PORT = int(os.environ.get("FLUX_RUNNER_PORT", "38000"))
MAX_TASK_HISTORY = 100
TASK_TTL_SECONDS = 3600
TASK_TIMEOUT_SECONDS = 600
RESULT_PREVIEW_LEN = 200

os.makedirs(_OUTPUT_DIR, exist_ok=True)

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
    """Resolve the model path - try encrypted, then local model_weights/, then download."""
    global _temp_model_dir
    enc_dir = _find_enc_dir()

    if not enc_dir:
        # Check if local model_weights/ directory exists with model files
        if os.path.isdir(_LOCAL_WEIGHTS_DIR) and os.path.isfile(
                os.path.join(_LOCAL_WEIGHTS_DIR, "model_index.json")):
            log("Using local model_weights/ directory (unencrypted)")
            return _LOCAL_WEIGHTS_DIR

        sys.path.insert(0, SCRIPT_DIR)
        from model_setup import is_model_ready, download_and_encrypt
        if not is_model_ready(_MODELS_DIR):
            log("No model found. Downloading FLUX.2 Klein model...")

            def _log_progress(status, progress=None):
                log(status)

            try:
                download_and_encrypt(models_dir=_MODELS_DIR, progress_fn=_log_progress)
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
                "(run the app and enter your license key)."
            )
        if not verify_license(enc_dir, license_key):
            raise RuntimeError("Invalid license key.")
        _temp_model_dir = tempfile.mkdtemp(prefix="flux_engine_")
        decrypt_engine(enc_dir, _temp_model_dir, license_key)
        return _temp_model_dir

    if os.path.isdir(_ENGINE_DIR):
        return _ENGINE_DIR
    raise RuntimeError(
        "No model available. Model not found and download failed."
    )


# ---------------------------------------------------------------------------
# Load model
# ---------------------------------------------------------------------------
MODEL_READY = False
PIPE = None
DEVICE = "cpu"
DTYPE = None
gpu_name = "CPU"
device = None
USE_STREAMING = False
_streaming_wrapper = None

try:
    log("Resolving model (may download on first run)...")
    engine_path = _resolve_engine()
    log(f"Engine path resolved: {os.path.basename(engine_path)}")

    import torch
    import torch.nn as nn
    from PIL import Image

    DTYPE = torch.float32

    try:
        if torch.cuda.is_available():
            DEVICE = "cuda"
            cap = torch.cuda.get_device_capability(0)
            gpu_name = torch.cuda.get_device_name(0)
            total_vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            if cap[0] >= 8:
                DTYPE = torch.bfloat16
            else:
                DTYPE = torch.float16
            log(f"GPU detected: {gpu_name} ({total_vram:.1f}GB VRAM, "
                f"compute {cap[0]}.{cap[1]}), dtype={DTYPE}")
            USE_STREAMING = total_vram < 12
            if USE_STREAMING:
                log(f"VRAM < 12GB — will use streaming DiT mode for faster inference")
        else:
            log("No GPU detected - using CPU (float32)", "WARN")
    except Exception as e:
        log(f"GPU detection failed ({e}) - CPU fallback", "WARN")

    device = torch.device(DEVICE)

    log("Loading FLUX.2 Klein pipeline (this may take 30-120s)...")
    try:
        from diffusers import Flux2KleinPipeline
    except ImportError:
        log("ERROR: Flux2KleinPipeline not found in diffusers.", "ERROR")
        log("This model requires a dev version of diffusers. Install with:", "ERROR")
        log("  pip install git+https://github.com/huggingface/diffusers.git@"
            "8abcf351c99ee6e6a4b7f405a2cf489851e36672", "ERROR")
        print("\n" + "=" * 70, file=_real_stderr, flush=True)
        print("  ERROR: Flux2KleinPipeline not found.", file=_real_stderr, flush=True)
        print("  Install with:", file=_real_stderr, flush=True)
        print("    pip install git+https://github.com/huggingface/diffusers.git@"
              "8abcf351c99ee6e6a4b7f405a2cf489851e36672", file=_real_stderr, flush=True)
        print("=" * 70, file=_real_stderr, flush=True)
        sys.exit(1)

    PIPE = Flux2KleinPipeline.from_pretrained(engine_path, torch_dtype=DTYPE)

    if USE_STREAMING and DEVICE == "cuda":
        log("Setting up streaming DiT (pinned memory + CUDA streams)...")
        sys.path.insert(0, SCRIPT_DIR)
        from test import StreamingFlux2Transformer, clear_memory, _patch_execution_device

        # Move VAE to GPU (small, ~0.3GB)
        PIPE.vae.to(device=device, dtype=DTYPE)

        # Set up streaming transformer
        _streaming_wrapper = StreamingFlux2Transformer(
            transformer=PIPE.transformer, device=device, dtype=DTYPE)
        _streaming_wrapper.prepare_streaming()
        PIPE.transformer.forward = _streaming_wrapper.__call__

        # Patch execution device so pipeline creates tensors on GPU
        _patch_execution_device(PIPE, device)

        clear_memory(device)
        vram_after = torch.cuda.memory_allocated(device) / (1024**3)
        log(f"Streaming DiT ready (VRAM: {vram_after:.2f}GB, "
            f"peak ~3-4GB during inference)")
    else:
        PIPE.enable_model_cpu_offload()
        if USE_STREAMING:
            log("Streaming not available (CPU mode), using cpu_offload")

    _cleanup_temp()
    _suppress_library_noise()

    MODEL_READY = True
    mode_str = "streaming DiT" if USE_STREAMING and DEVICE == "cuda" else "cpu_offload"
    log(f"Model ready on {DEVICE.upper()} ({gpu_name}) — mode: {mode_str}")

except SystemExit:
    raise
except Exception as e:
    log(f"FATAL: Model loading failed: {e}", "ERROR")
    print(f"\nFATAL: Model loading failed: {e}", file=_real_stderr, flush=True)
    import traceback
    traceback.print_exc(file=_real_stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Task types
# ---------------------------------------------------------------------------
TASK_LABELS = {
    "text2img": "Text-to-Image",
    "img2img": "Image-to-Image",
}


# ---------------------------------------------------------------------------
# Task cancellation exception
# ---------------------------------------------------------------------------
class TaskCancelled(Exception):
    pass


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
    return _is_cancelled(task_id) or _check_timeout(task_id)


def _purge_old_tasks():
    now = time.time()
    with tasks_lock:
        to_remove = []
        terminal = ("DONE", "ERROR", "CANCELLED", "TIMEOUT")
        for tid, t in tasks.items():
            if t["status"] in terminal:
                if now - t.get("created_at", now) > TASK_TTL_SECONDS:
                    to_remove.append(tid)
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
    if DEVICE == "cuda":
        try:
            torch.cuda.empty_cache()
        except Exception:
            pass
    gc.collect()


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------
def _encode_prompt_streaming(prompt: str, guidance_scale: float):
    """Encode prompt for streaming mode: text encoder CPU -> GPU -> encode -> CPU."""
    from test import clear_memory

    log("Encoding prompt (text encoder -> GPU temporarily)...")
    PIPE.text_encoder.to(device=device)
    torch.cuda.synchronize(device)

    with torch.inference_mode():
        prompt_embeds, _text_ids = PIPE.encode_prompt(
            prompt=prompt, device=device,
            num_images_per_prompt=1, max_sequence_length=512,
        )
        negative_prompt_embeds = None
        if guidance_scale > 1.0:
            negative_prompt_embeds, _ = PIPE.encode_prompt(
                prompt="", device=device,
                num_images_per_prompt=1, max_sequence_length=512,
            )

    prompt_embeds = prompt_embeds.detach().to(device)
    if negative_prompt_embeds is not None:
        negative_prompt_embeds = negative_prompt_embeds.detach().to(device)

    PIPE.text_encoder.to('cpu')
    torch.cuda.synchronize(device)
    clear_memory(device)
    log("Prompt encoded, text encoder back on CPU")

    return prompt_embeds, negative_prompt_embeds


def _load_reference_images(image_paths: list[str]) -> list | None:
    """Load and validate reference images. Returns list of PIL Images or None."""
    loaded = []
    for p in image_paths:
        if p and os.path.isfile(p):
            try:
                img = Image.open(p).convert("RGB")
                loaded.append(img)
                log(f"Loaded reference image: {os.path.basename(p)} ({img.width}x{img.height})")
            except Exception as e:
                log(f"Failed to load image {os.path.basename(p)}: {e}", "WARN")
    if not loaded:
        return None
    return loaded if len(loaded) > 1 else loaded[0]


def do_inference(task_id: str, started_at: float, params: dict) -> str:
    """Run FLUX.2 Klein image generation and return output path."""
    prompt = params.get("prompt", "A cat holding a sign that says hello world")
    height = params.get("height", 1024)
    width = params.get("width", 1024)
    num_steps = params.get("steps", 4)
    guidance_scale = params.get("guidance_scale", 1.0)
    seed = params.get("seed", 0)
    image_paths = params.get("image_paths") or []

    _update_task(task_id, progress=0.05, message="Preparing generation...")

    if _should_stop(task_id):
        raise TaskCancelled()

    n_imgs = len([p for p in image_paths if p and os.path.isfile(p)])
    mode_label = f"img2img ({n_imgs} ref)" if n_imgs else "text2img"
    _update_task(task_id, progress=0.1,
                 message=f"Generating {width}x{height} ({num_steps} steps, {mode_label})...")

    generator = torch.Generator(device="cpu").manual_seed(seed)

    if USE_STREAMING and DEVICE == "cuda":
        _update_task(task_id, progress=0.12, message="Encoding prompt...")
        prompt_embeds, negative_prompt_embeds = _encode_prompt_streaming(
            prompt, guidance_scale)

        call_kwargs = dict(
            prompt_embeds=prompt_embeds,
            height=height,
            width=width,
            guidance_scale=guidance_scale,
            num_inference_steps=num_steps,
            generator=generator,
        )
        if negative_prompt_embeds is not None:
            call_kwargs["negative_prompt_embeds"] = negative_prompt_embeds
    else:
        call_kwargs = dict(
            prompt=prompt,
            height=height,
            width=width,
            guidance_scale=guidance_scale,
            num_inference_steps=num_steps,
            generator=generator,
        )

    input_images = _load_reference_images(image_paths)
    if input_images is not None:
        call_kwargs["image"] = input_images
        count = len(input_images) if isinstance(input_images, list) else 1
        _update_task(task_id, progress=0.15,
                     message=f"Image-to-image generation ({count} reference image{'s' if count > 1 else ''})...")

    _update_task(task_id, progress=0.2, message="Running inference...")

    if _should_stop(task_id):
        raise TaskCancelled()

    t0 = time.time()
    with torch.inference_mode():
        out_image = PIPE(**call_kwargs).images[0]
    if DEVICE == "cuda":
        torch.cuda.synchronize(device)
    elapsed = time.time() - t0
    log(f"Inference completed in {elapsed:.1f}s")

    _update_task(task_id, progress=0.9, message="Saving result...")

    output_filename = f"flux_{task_id[:8]}_{int(time.time())}.png"
    output_path = os.path.join(_OUTPUT_DIR, output_filename)
    out_image.save(output_path)

    _update_task(task_id, progress=0.98, message="Done")
    return output_path


# ---------------------------------------------------------------------------
# Worker thread
# ---------------------------------------------------------------------------
def worker():
    while True:
        item = task_queue.get()
        if item is None:
            break
        task_id, params = item

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
        task_type = params.get("task_type", "text2img")
        log(f"Task {task_id[:8]} started ({TASK_LABELS.get(task_type, task_type)})")

        try:
            result_path = do_inference(task_id, now, params)
            elapsed = time.time() - now
            _update_task(task_id, status="DONE", progress=1.0, result=result_path,
                         finished_at=time.time(),
                         message=f"Completed in {elapsed:.1f}s")
            log(f"Task {task_id[:8]} done in {elapsed:.1f}s")

        except TaskCancelled:
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
            _cleanup_vram()

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
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

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
                active_ids = sorted(
                    [tid for tid, t in tasks.items()
                     if t["status"] in ("QUEUED", "PROCESSING")],
                    key=lambda k: tasks[k].get("created_at", 0))
                pos_map = {tid: i for i, tid in enumerate(active_ids)}
                items = [_task_summary(tid, t, include_full_result=False,
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

        # Serve output images
        if path.startswith("/outputs/"):
            fname = path.split("/outputs/")[-1]
            fpath = os.path.join(_OUTPUT_DIR, fname)
            if os.path.isfile(fpath):
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(fpath, "rb") as f:
                    self.wfile.write(f.read())
                return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/generate":
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
                    resp_data = {"message": "Cancel requested.", "task_id": task_id}
            if resp_code != 404:
                log(f"Task {task_id[:8]} cancel requested.")
            send_json(self, resp_code, resp_data)
            return

        if action == "create":
            prompt = data.get("prompt", "A cat holding a sign that says hello world")
            task_type = data.get("task_type", "text2img")

            image_paths = data.get("image_paths") or []
            if not image_paths and data.get("image_path"):
                image_paths = [data["image_path"]]

            params = {
                "prompt": prompt,
                "height": data.get("height", 1024),
                "width": data.get("width", 1024),
                "steps": data.get("steps", 4),
                "guidance_scale": data.get("guidance_scale", 1.0),
                "seed": data.get("seed", 0),
                "task_type": task_type,
                "image_paths": image_paths,
            }

            task_id = uuid.uuid4().hex
            now = time.time()
            with tasks_lock:
                tasks[task_id] = {
                    "status": "QUEUED",
                    "progress": 0,
                    "result": "",
                    "error": "",
                    "message": "Queued.",
                    "task_type": task_type,
                    "created_at": now,
                    "started_at": None,
                    "finished_at": None,
                    "cancel_requested": False,
                }
                queue_pos = sum(1 for t in tasks.values()
                                if t["status"] in ("QUEUED", "PROCESSING"))
            task_queue.put((task_id, params))
            log(f"Task {task_id[:8]} queued "
                f"({TASK_LABELS.get(task_type, task_type)}, pos #{queue_pos})")

            send_json(self, 200, {"task_id": task_id, "status": "QUEUED",
                                  "queue_position": queue_pos})
            return

        send_json(self, 400, {"error": f"Unknown action: {action}"})

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
