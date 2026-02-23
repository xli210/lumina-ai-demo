"""
OCR Engine Desktop Launcher — one-click start.

Supports two modes:
  - Native GUI (default): launches the desktop app (ocr_app.py)
  - Web mode (--web):     starts runner + web server, opens browser

Everything runs from the pre-packaged python312.exe in this folder.

Usage:
    python312.exe launch_app.py              # native desktop app
    python312.exe launch_app.py --web        # web UI mode (legacy)
    python312.exe launch_app.py --no-gui     # console mode (web)
"""

import os
import subprocess
import sys
import threading
import time
import webbrowser
from urllib.request import Request, urlopen
from urllib.error import URLError

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(PROJECT_ROOT, "web")
RUNNER_SCRIPT = os.path.join(PROJECT_ROOT, "runner.py")
OCR_APP_SCRIPT = os.path.join(PROJECT_ROOT, "ocr_app.py")
RUNNER_HEALTH_URL = "http://127.0.0.1:38000/healthz"
WEB_URL = "http://127.0.0.1:8765"
HEALTH_TIMEOUT_SEC = 900
HEALTH_POLL_INTERVAL = 2.0

runner_process = None
server_process = None

# ---------------------------------------------------------------------------
# Find the bundled Python (python312.exe in same folder)
# ---------------------------------------------------------------------------
def _find_python() -> str:
    bundled = os.path.join(PROJECT_ROOT, "python312.exe")
    if os.path.isfile(bundled):
        return bundled
    return sys.executable

PYTHON_EXE = _find_python()

# ---------------------------------------------------------------------------
# Runner management
# ---------------------------------------------------------------------------
def check_runner_health():
    try:
        with urlopen(Request(RUNNER_HEALTH_URL, method="GET"), timeout=5) as r:
            return r.getcode() == 200
    except Exception:
        return False


def wait_for_runner(callback=None):
    start = time.monotonic()
    deadline = start + HEALTH_TIMEOUT_SEC
    dots = 0
    while time.monotonic() < deadline:
        dots = (dots + 1) % 4
        elapsed = int(time.monotonic() - start)

        # Detect if runner process has crashed
        if runner_process and runner_process.poll() is not None:
            exit_code = runner_process.returncode
            if callback:
                callback(f"Runner crashed (exit code {exit_code}). Check GPU drivers or logs.")
            return False

        if callback:
            callback(f"Loading OCR model{'.' * dots}  ({elapsed}s)")
        if check_runner_health():
            if callback:
                callback("Runner ready.")
            return True
        time.sleep(HEALTH_POLL_INTERVAL)
    if callback:
        callback("Runner did not start in time.")
    return False


def start_runner():
    global runner_process
    runner_process = subprocess.Popen(
        [PYTHON_EXE, RUNNER_SCRIPT],
        cwd=PROJECT_ROOT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )


def start_server():
    global server_process
    server_process = subprocess.Popen(
        [PYTHON_EXE, "server.py"],
        cwd=WEB_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def stop_all():
    global runner_process, server_process
    for proc, name, timeout in [
        (server_process, "server", 5),
        (runner_process, "runner", 10),
    ]:
        if proc and proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                proc.kill()
    server_process = None
    runner_process = None


# ---------------------------------------------------------------------------
# Native desktop app launcher (NEW — default mode)
# ---------------------------------------------------------------------------
def _tkinter_available() -> bool:
    """Check if tkinter works in the current Python."""
    try:
        result = subprocess.run(
            [PYTHON_EXE, "-c", "import tkinter; tkinter.Tk().destroy()"],
            capture_output=True, timeout=10,
        )
        return result.returncode == 0
    except Exception:
        return False


def run_native_app():
    """Launch the native desktop GUI (ocr_app.py) directly."""
    if not os.path.isfile(OCR_APP_SCRIPT):
        print(f"ocr_app.py not found, falling back to web mode.")
        return False

    if not _tkinter_available():
        print("tkinter not available, falling back to web mode.")
        return False

    try:
        proc = subprocess.Popen(
            [PYTHON_EXE, OCR_APP_SCRIPT],
            cwd=PROJECT_ROOT,
        )
        proc.wait()
        return True
    except KeyboardInterrupt:
        return True
    except Exception as e:
        print(f"Error launching desktop app: {e}")
        return False


# ---------------------------------------------------------------------------
# GUI launcher (tkinter) — web mode
# ---------------------------------------------------------------------------
def run_launcher_gui():
    import tkinter as tk
    from tkinter import ttk

    root = tk.Tk()
    root.title("OCR Engine")
    root.minsize(400, 180)
    root.resizable(True, True)
    try:
        root.configure(bg="#1a1b26")
    except Exception:
        pass

    icon_path = os.path.join(PROJECT_ROOT, "ocr_engine.ico")
    if os.path.isfile(icon_path):
        try:
            root.iconbitmap(icon_path)
        except Exception:
            pass

    style = ttk.Style()
    try:
        style.configure("TLabel", background="#1a1b26", foreground="#c0caf5",
                         font=("Segoe UI", 10))
        style.configure("TButton", font=("Segoe UI", 10))
    except Exception:
        pass

    lbl = ttk.Label(root, text="Starting...", padding=10, wraplength=360)
    lbl.pack(fill=tk.X)

    btn_open = ttk.Button(root, text="Open interface",
                           command=lambda: webbrowser.open(WEB_URL))
    btn_open.pack(pady=5)
    btn_open.state(["disabled"])

    def on_closing():
        lbl["text"] = "Stopping..."
        root.update()
        stop_all()
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_closing)

    def startup():
        try:
            root.after(0, lambda: lbl.config(text="Starting OCR runner (loading model)..."))
            start_runner()
            if not wait_for_runner(callback=lambda m: root.after(0, lambda: lbl.config(text=m))):
                root.after(0, lambda: lbl.config(text="Runner failed to start. Check GPU/drivers."))
                return
            root.after(0, lambda: lbl.config(text="Starting web server..."))
            start_server()
            time.sleep(1)
            root.after(0, lambda: lbl.config(text="Ready. OCR Engine is running."))
            root.after(0, lambda: webbrowser.open(WEB_URL))
            root.after(0, lambda: btn_open.state(["!disabled"]))
        except Exception as e:
            root.after(0, lambda: lbl.config(text=f"Error: {e}"))

    threading.Thread(target=startup, daemon=True).start()
    root.mainloop()


# ---------------------------------------------------------------------------
# Console launcher — web mode
# ---------------------------------------------------------------------------
def run_launcher_console():
    print("OCR Engine launcher (console mode)")
    print(f"Python: {PYTHON_EXE}")
    print("Starting runner (loading model)...")
    start_runner()
    if not wait_for_runner(callback=print):
        print("Runner failed. Check GPU/drivers.")
        stop_all()
        sys.exit(1)
    print("Starting web server...")
    start_server()
    time.sleep(1)
    print(f"\nReady: {WEB_URL}")
    webbrowser.open(WEB_URL)
    try:
        input("Press Enter to stop...\n")
    except (EOFError, KeyboardInterrupt):
        pass
    stop_all()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    use_web = "--web" in sys.argv
    use_console = "--no-gui" in sys.argv

    if use_web:
        if use_console:
            run_launcher_console()
        else:
            try:
                run_launcher_gui()
            except ImportError:
                print("(tkinter not available — console mode)")
                run_launcher_console()
            except Exception as e:
                print(f"Error: {e}")
                stop_all()
                sys.exit(1)
    else:
        if not run_native_app():
            print("Falling back to web UI mode...")
            try:
                run_launcher_gui()
            except ImportError:
                run_launcher_console()
            except Exception as e:
                print(f"Error: {e}")
                stop_all()
                sys.exit(1)


if __name__ == "__main__":
    main()
