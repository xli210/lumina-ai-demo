"""
OCR Engine - Web proxy server.

Serves the UI, accepts image uploads, proxies all requests to runner.py.
Includes periodic temp file cleanup.

Endpoints:
    GET  /                -> index.html
    POST /api/upload      -> save uploaded image (max 50 MB)
    POST /api/run         -> create OCR task (proxy to runner)
    POST /api/cancel      -> cancel a task (proxy to runner)
    GET  /api/status/<id> -> task status (proxy to runner)
    GET  /api/tasks       -> all tasks (proxy to runner)
    GET  /api/logs        -> log entries (proxy to runner)
    GET  /api/health      -> runner health check
    DELETE /api/tasks/<id> -> remove finished task
"""

import json
import os
import re
import threading
import time
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

RUNNER_BASE = os.environ.get("OCR_RUNNER_URL", "http://127.0.0.1:38000")
PORT = int(os.environ.get("OCR_WEB_PORT", "8765"))
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB
TEMP_CLEANUP_INTERVAL = 600          # seconds between temp cleanups
TEMP_FILE_TTL = 1800                 # delete temp files older than 30 min

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Periodic temp file cleanup
# ---------------------------------------------------------------------------
def _temp_cleanup_loop():
    """Delete uploaded temp files older than TEMP_FILE_TTL seconds."""
    while True:
        time.sleep(TEMP_CLEANUP_INTERVAL)
        try:
            now = time.time()
            for fname in os.listdir(TEMP_DIR):
                fpath = os.path.join(TEMP_DIR, fname)
                if os.path.isfile(fpath):
                    if now - os.path.getmtime(fpath) > TEMP_FILE_TTL:
                        try:
                            os.remove(fpath)
                        except OSError:
                            pass
        except Exception:
            pass

_cleanup_thread = threading.Thread(target=_temp_cleanup_loop, daemon=True)
_cleanup_thread.start()


# ---------------------------------------------------------------------------
# Runner proxy
# ---------------------------------------------------------------------------
def call_runner(method, path, json_data=None):
    url = RUNNER_BASE.rstrip("/") + path
    body = json.dumps(json_data).encode("utf-8") if json_data is not None else None
    headers = {"Content-Type": "application/json"}
    req = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(req, timeout=300) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        try:
            out = json.loads(e.read().decode("utf-8"))
        except Exception:
            out = {"error": str(e)}
        return e.code, out
    except URLError as e:
        return 0, {"error": f"Runner unreachable: {e.reason}"}
    except Exception as e:
        return 0, {"error": str(e)}


def send_json(handler, code, data):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(body)


def _safe_read_json(handler) -> dict | None:
    """Read and parse JSON body; returns None on failure (sends 400)."""
    try:
        length = int(handler.headers.get("Content-Length", 0))
        body = handler.rfile.read(length)
        return json.loads(body.decode("utf-8"))
    except Exception as e:
        send_json(handler, 400, {"error": f"Invalid JSON: {e}"})
        return None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # ------------------------------------------------------------------ GET
    def do_GET(self):
        path = urlparse(self.path).path

        if path in ("/", "/index.html"):
            idx = os.path.join(BASE_DIR, "index.html")
            if os.path.isfile(idx):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(idx, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
            return

        if path.startswith("/api/status/"):
            tid = path.split("/api/status/")[-1].split("?")[0]
            code, data = call_runner("POST", "/api/ocr",
                                     json_data={"action": "check", "task_id": tid})
            send_json(self, code if code else 502, data)
            return

        if path == "/api/tasks":
            code, data = call_runner("GET", "/api/tasks")
            send_json(self, code if code else 502, data)
            return

        if path == "/api/logs":
            code, data = call_runner("GET", "/api/logs")
            send_json(self, code if code else 502, data)
            return

        if path == "/api/health":
            code, data = call_runner("GET", "/healthz")
            d = data if isinstance(data, dict) else {}
            send_json(self, 200, {
                "runner": "ok" if code == 200 else "unreachable",
                "device": d.get("device", "unknown"),
                "gpu": d.get("gpu", "unknown"),
            })
            return

        self.send_response(404)
        self.end_headers()

    # ----------------------------------------------------------------- POST
    def do_POST(self):
        path = urlparse(self.path).path

        # --- Upload ---
        if path == "/api/upload":
            ct = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in ct:
                send_json(self, 400, {"error": "Expect multipart/form-data"})
                return
            length = int(self.headers.get("Content-Length", 0))
            if length > MAX_UPLOAD_BYTES:
                send_json(self, 413, {
                    "error": f"File too large. Max {MAX_UPLOAD_BYTES // (1024*1024)} MB"})
                # Drain remaining data to avoid broken pipe
                self.rfile.read(length)
                return
            m = re.search(r'boundary=([^;,\s]+|"[^"]+")', ct)
            if not m:
                send_json(self, 400, {"error": "Missing boundary"})
                return
            boundary = m.group(1).strip('"\'').encode("ascii")
            body = self.rfile.read(length)
            sep = b"--" + boundary
            saved_path = None
            for part in body.split(sep):
                part = part.strip(b"\r\n")
                if not part or part == b"--":
                    continue
                if b"filename=" not in part:
                    continue
                idx = part.find(b"\r\n\r\n")
                if idx == -1:
                    idx = part.find(b"\n\n")
                if idx == -1:
                    continue
                hdr, data = part[:idx], part[idx:].lstrip(b"\r\n")
                if data.endswith(b"\r\n--"):
                    data = data[:-4]
                elif data.endswith(b"\n--"):
                    data = data[:-3]
                data = data.rstrip(b"\r\n")
                if not data:
                    continue
                ext = ".png"
                for line in hdr.split(b"\r\n"):
                    if b"filename=" in line:
                        nm = line.split(b"filename=")[-1].strip(
                            b'"\'').decode("utf-8", errors="replace")
                        ext = os.path.splitext(nm)[1] or ".png"
                        break
                fname = str(uuid.uuid4()) + ext
                saved_path = os.path.join(TEMP_DIR, fname)
                with open(saved_path, "wb") as f:
                    f.write(data)
                break
            if not saved_path:
                send_json(self, 400, {"error": "No file found in request"})
                return
            send_json(self, 200, {"path": saved_path,
                                  "filename": os.path.basename(saved_path)})
            return

        # --- Run OCR ---
        if path == "/api/run":
            data = _safe_read_json(self)
            if data is None:
                return
            image_path = data.get("image_path")
            if not image_path or not os.path.isfile(image_path):
                send_json(self, 400, {"error": "Missing or invalid image_path"})
                return
            code, resp = call_runner("POST", "/api/ocr", json_data={
                "action": "create",
                "image_path": image_path,
                "task": data.get("task", "ocr"),
            })
            send_json(self, code if code else 502, resp)
            return

        # --- Cancel ---
        if path == "/api/cancel":
            data = _safe_read_json(self)
            if data is None:
                return
            code, resp = call_runner("POST", "/api/ocr", json_data={
                "action": "cancel",
                "task_id": data.get("task_id", ""),
            })
            send_json(self, code if code else 502, resp)
            return

        self.send_response(404)
        self.end_headers()

    # --------------------------------------------------------------- DELETE
    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith("/api/tasks/"):
            tid = path.split("/api/tasks/")[-1].split("?")[0]
            code, resp = call_runner("DELETE", f"/api/tasks/{tid}")
            send_json(self, code if code else 502, resp)
            return
        self.send_response(404)
        self.end_headers()


def main():
    print(f"OCR Web UI: http://127.0.0.1:{PORT}")
    print(f"Runner:     {RUNNER_BASE}")
    print(f"Temp dir:   {TEMP_DIR} (auto-cleanup every {TEMP_CLEANUP_INTERVAL}s)")
    server = HTTPServer(("127.0.0.1", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    server.server_close()


if __name__ == "__main__":
    main()
