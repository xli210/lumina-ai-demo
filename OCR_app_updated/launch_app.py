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
# Paths & license module
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)
import machine_lock  # noqa: E402
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
# License activation gate (runs BEFORE any app/runner is started)
# ---------------------------------------------------------------------------
def _ensure_activated() -> bool:
    """
    Check if the machine has a valid, decryptable license.
    If not, prompt the user to enter a license key (GUI if possible,
    otherwise console).  Returns True if activation is confirmed.
    """
    check = machine_lock.activate_or_verify()
    if check["ok"]:
        return True

    if not check.get("needs_activation"):
        # Non-recoverable license error (e.g. banned)
        msg = check.get("error", "Unknown license error.")
        print(f"\n  [LICENSE ERROR] {msg}\n")
        return False

    # Prompt message (e.g. "Stored license data is invalid…")
    prompt_msg = check.get("message", "")
    if prompt_msg:
        print(f"\n  {prompt_msg}\n")

    # Try GUI activation dialog first, fall back to console
    try:
        return _activate_gui()
    except Exception:
        return _activate_console()


def _activate_gui() -> bool:
    """Show a tkinter activation dialog. Raises on import failure."""
    import tkinter as tk
    from tkinter import ttk, messagebox

    root = tk.Tk()
    root.title("Activate OCR Engine")
    root.minsize(420, 220)
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
        style.configure("Act.TLabel", background="#1a1b26", foreground="#c0caf5",
                        font=("Segoe UI", 10))
        style.configure("Act.TButton", font=("Segoe UI", 10))
    except Exception:
        pass

    activated = [False]

    ttk.Label(root, text="Enter your license key to activate:",
              style="Act.TLabel", padding=(10, 15, 10, 5)).pack(fill=tk.X)

    key_var = tk.StringVar()
    entry = ttk.Entry(root, textvariable=key_var, font=("Consolas", 13),
                      justify="center")
    entry.pack(padx=20, pady=5, fill=tk.X)
    entry.focus_set()

    status_lbl = ttk.Label(root, text="", style="Act.TLabel",
                           padding=5, wraplength=380)
    status_lbl.pack(fill=tk.X)

    btn_frame = ttk.Frame(root)
    btn_frame.pack(pady=10)
    btn_activate = ttk.Button(btn_frame, text="Activate", style="Act.TButton")
    btn_activate.pack(side=tk.LEFT, padx=5)
    btn_quit = ttk.Button(btn_frame, text="Quit", style="Act.TButton",
                          command=root.destroy)
    btn_quit.pack(side=tk.LEFT, padx=5)

    def do_activate():
        key = key_var.get().strip()
        if not key:
            status_lbl.config(text="Please enter a license key.")
            return
        btn_activate.state(["disabled"])
        status_lbl.config(text="Contacting activation server...")
        root.update()

        result = machine_lock.activate_online(key)

        if result["ok"]:
            activated[0] = True
            status_lbl.config(text="Activated successfully!")
            root.update()
            time.sleep(1)
            root.destroy()
            return

        if result.get("error") == "activation_limit_reached":
            answer = messagebox.askyesno(
                "Activation Limit",
                f"{result['message']}\n\nDeactivate other machines and bind this one?",
                parent=root,
            )
            if answer:
                status_lbl.config(text="Force takeover in progress...")
                root.update()
                r2 = machine_lock.activate_online(key, force_takeover=True)
                if r2["ok"]:
                    activated[0] = True
                    status_lbl.config(text="Activated (previous machines deactivated).")
                    root.update()
                    time.sleep(1)
                    root.destroy()
                    return
                status_lbl.config(text=r2.get("message", "Force takeover failed."))
            else:
                status_lbl.config(text="Activation cancelled.")
        else:
            status_lbl.config(text=result.get("message", "Activation failed."))

        btn_activate.state(["!disabled"])

    btn_activate.config(command=do_activate)
    entry.bind("<Return>", lambda _: do_activate())
    root.protocol("WM_DELETE_WINDOW", root.destroy)
    root.mainloop()
    return activated[0]


def _activate_console() -> bool:
    """Console-mode activation prompt."""
    print("\n" + "=" * 50)
    print("  OCR Engine — License Activation Required")
    print("=" * 50)

    for attempt in range(3):
        try:
            key = input("\n  Enter license key (or 'q' to quit): ").strip()
        except (EOFError, KeyboardInterrupt):
            return False
        if not key or key.lower() == "q":
            return False

        print("  Contacting activation server...")
        result = machine_lock.activate_online(key)

        if result["ok"]:
            print("  ✓ Activated successfully!\n")
            return True

        if result.get("error") == "activation_limit_reached":
            try:
                answer = input("  Activation limit reached. Force takeover? (y/n): ").strip().lower()
            except (EOFError, KeyboardInterrupt):
                return False
            if answer == "y":
                r2 = machine_lock.activate_online(key, force_takeover=True)
                if r2["ok"]:
                    print("  ✓ Activated (previous machines deactivated)!\n")
                    return True
                print(f"  ✗ {r2.get('message', 'Force takeover failed.')}")
            continue

        print(f"  ✗ {result.get('message', 'Activation failed.')}")

    print("\n  Too many failed attempts.\n")
    return False


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
    # ── Activation gate — MUST pass before anything starts ──
    if not _ensure_activated():
        print("License activation required. Exiting.")
        sys.exit(1)

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
