"""
OCR Engine — Native Desktop Application.

A full-featured native GUI that communicates with the runner backend (port 38000).
Replicates all web UI functionality: image upload, task selection, progress tracking,
task queue management, result display, copy-to-clipboard, and log viewing.

Includes online license activation on first launch.
Includes file-based logging to ocr_engine.log for backend diagnostics.

Usage:  python ocr_app.py [--runner-url http://127.0.0.1:38000]
"""
from __future__ import annotations

import json
import logging
import os
import shutil
import subprocess
import sys
import threading
import time
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# License activation
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import machine_lock  # noqa: E402

# ---------------------------------------------------------------------------
# Paths & constants
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_PATH = os.path.join(SCRIPT_DIR, "ocr_engine.ico")
LOG_FILE = os.path.join(SCRIPT_DIR, "ocr_engine.log")
RUNNER_SCRIPT = os.path.join(SCRIPT_DIR, "runner.py")
TEMP_DIR = os.path.join(SCRIPT_DIR, "app_temp")

RUNNER_BASE = os.environ.get("OCR_RUNNER_URL", "http://127.0.0.1:38000")
RUNNER_PORT = int(os.environ.get("OCR_RUNNER_PORT", "38000"))

TASK_TYPES = [
    ("OCR (general text)", "ocr"),
    ("Table recognition", "table"),
    ("Formula recognition", "formula"),
    ("Chart recognition", "chart"),
    ("Text spotting", "spotting"),
    ("Seal / stamp", "seal"),
]

MAX_IMAGE_BYTES = 50 * 1024 * 1024  # 50 MB
POLL_INTERVAL_MS = 800
TASK_REFRESH_MS = 3000
LOG_REFRESH_MS = 3000

# ---------------------------------------------------------------------------
# File logger (backend log — not shown to user, written to disk)
# ---------------------------------------------------------------------------
_file_logger = logging.getLogger("ocr_engine")
_file_logger.setLevel(logging.DEBUG)
_fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
_fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s",
                                   datefmt="%Y-%m-%d %H:%M:%S"))
_file_logger.addHandler(_fh)


def flog(msg: str, level: str = "INFO"):
    getattr(_file_logger, level.lower(), _file_logger.info)(msg)


# ---------------------------------------------------------------------------
# Runner HTTP helpers
# ---------------------------------------------------------------------------
def call_runner(method: str, path: str, json_data: dict | None = None,
                timeout: int = 300) -> tuple[int, dict]:
    url = RUNNER_BASE.rstrip("/") + path
    body = json.dumps(json_data).encode("utf-8") if json_data is not None else None
    headers = {"Content-Type": "application/json"}
    req = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(req, timeout=timeout) as resp:
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


def runner_healthy() -> bool:
    try:
        code, _ = call_runner("GET", "/healthz", timeout=5)
        return code == 200
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Color palette (matching the web UI dark theme)
# ---------------------------------------------------------------------------
C = {
    "bg": "#1a1b26",
    "bg2": "#24283b",
    "bg3": "#16161e",
    "fg": "#a9b1d6",
    "fg_bright": "#c0caf5",
    "accent": "#7aa2f7",
    "accent_hover": "#89b4fa",
    "green": "#9ece6a",
    "red": "#f7768e",
    "orange": "#e0af68",
    "purple": "#bb9af7",
    "muted": "#565f89",
    "border": "#3b4261",
}


# ---------------------------------------------------------------------------
# Main Application
# ---------------------------------------------------------------------------
class OCRApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("OCR Engine")
        self.geometry("960x780")
        self.minsize(700, 600)
        self.configure(bg=C["bg"])

        if os.path.isfile(ICON_PATH):
            try:
                self.iconbitmap(ICON_PATH)
            except Exception:
                pass

        self._runner_proc: subprocess.Popen | None = None
        self._image_path: str | None = None
        self._active_task_id: str | None = None
        self._poll_gen = 0
        self._tasks_cache: list[dict] = []
        self._log_visible = False
        self._shutting_down = False

        os.makedirs(TEMP_DIR, exist_ok=True)

        # --- License activation gate ---
        if not self._check_activation():
            self.destroy()
            return

        self._build_styles()
        self._build_ui()
        self.protocol("WM_DELETE_WINDOW", self._on_close)

        flog("Application started")
        self.after(500, self._init_runner)

    # ── License activation ──────────────────────────────────
    def _check_activation(self) -> bool:
        """Returns True if license is valid, False to abort launch."""
        check = machine_lock.activate_or_verify()
        if check["ok"]:
            return True
        if check.get("needs_activation"):
            return self._show_activation_dialog()
        messagebox.showerror("License Error",
                             check.get("error", "Unknown license error."))
        return False

    def _show_activation_dialog(self) -> bool:
        """Show a license-key entry dialog. Returns True on success."""
        win = tk.Toplevel(self)
        win.title("Activate OCR Engine")
        win.minsize(420, 210)
        win.resizable(True, True)
        try:
            win.configure(bg=C["bg"])
        except Exception:
            pass
        if os.path.isfile(ICON_PATH):
            try:
                win.iconbitmap(ICON_PATH)
            except Exception:
                pass

        style = ttk.Style()
        try:
            style.configure("Act.TLabel", background=C["bg"], foreground=C["fg_bright"],
                            font=("Segoe UI", 10))
            style.configure("Act.TButton", font=("Segoe UI", 10))
        except Exception:
            pass

        activated = [False]

        ttk.Label(win, text="Enter your license key to activate:", style="Act.TLabel",
                  padding=(10, 15, 10, 5)).pack(fill=tk.X)

        key_var = tk.StringVar()
        entry = ttk.Entry(win, textvariable=key_var, font=("Consolas", 13), justify="center")
        entry.pack(padx=20, pady=5, fill=tk.X)
        entry.focus_set()

        status_lbl = ttk.Label(win, text="", style="Act.TLabel", padding=5, wraplength=380)
        status_lbl.pack(fill=tk.X)

        btn_frame = ttk.Frame(win)
        btn_frame.pack(pady=10)
        btn_activate = ttk.Button(btn_frame, text="Activate", style="Act.TButton")
        btn_activate.pack(side=tk.LEFT, padx=5)
        btn_quit = ttk.Button(btn_frame, text="Quit", style="Act.TButton",
                              command=lambda: win.destroy())
        btn_quit.pack(side=tk.LEFT, padx=5)

        def do_activate():
            key = key_var.get().strip()
            if not key:
                status_lbl.config(text="Please enter a license key.")
                return
            btn_activate.state(["disabled"])
            status_lbl.config(text="Contacting activation server...")
            win.update()

            result = machine_lock.activate_online(key)

            if result["ok"]:
                activated[0] = True
                status_lbl.config(text="Activated successfully!")
                win.update()
                time.sleep(1)
                win.destroy()
                return

            if result.get("error") == "activation_limit_reached":
                answer = messagebox.askyesno(
                    "Activation Limit",
                    f"{result['message']}\n\nDo you want to deactivate all other machines "
                    "and bind this one?",
                    parent=win,
                )
                if answer:
                    status_lbl.config(text="Force takeover in progress...")
                    win.update()
                    result2 = machine_lock.activate_online(key, force_takeover=True)
                    if result2["ok"]:
                        activated[0] = True
                        status_lbl.config(text="Activated (previous machines deactivated).")
                        win.update()
                        time.sleep(1)
                        win.destroy()
                        return
                    status_lbl.config(text=result2.get("message", "Force takeover failed."))
                else:
                    status_lbl.config(text="Activation cancelled.")
            else:
                status_lbl.config(text=result.get("message", "Activation failed."))

            btn_activate.state(["!disabled"])

        btn_activate.config(command=do_activate)
        entry.bind("<Return>", lambda _e: do_activate())

        win.protocol("WM_DELETE_WINDOW", win.destroy)
        win.transient(self)
        win.grab_set()
        self.wait_window(win)

        return activated[0]

    # ── Styles ──────────────────────────────────────────────
    def _build_styles(self):
        style = ttk.Style(self)
        style.theme_use("clam")

        style.configure(".", background=C["bg"], foreground=C["fg"],
                        fieldbackground=C["bg2"], borderwidth=0)
        style.configure("TFrame", background=C["bg"])
        style.configure("Card.TFrame", background=C["bg2"])
        style.configure("TLabel", background=C["bg"], foreground=C["fg"],
                        font=("Segoe UI", 10))
        style.configure("Title.TLabel", foreground=C["fg_bright"],
                        font=("Segoe UI", 16, "bold"), background=C["bg"])
        style.configure("Sub.TLabel", foreground=C["muted"],
                        font=("Segoe UI", 9), background=C["bg"])
        style.configure("CardTitle.TLabel", foreground=C["accent"],
                        font=("Segoe UI", 9, "bold"), background=C["bg2"])
        style.configure("Status.TLabel", foreground=C["green"],
                        font=("Segoe UI", 9), background=C["bg"])
        style.configure("StatusErr.TLabel", foreground=C["red"],
                        font=("Segoe UI", 9), background=C["bg"])
        style.configure("StatusWarn.TLabel", foreground=C["orange"],
                        font=("Segoe UI", 9), background=C["bg"])
        style.configure("GPU.TLabel", foreground=C["accent"],
                        font=("Segoe UI", 8), background=C["bg"])
        style.configure("Muted.TLabel", foreground=C["muted"],
                        font=("Segoe UI", 8), background=C["bg2"])

        style.configure("Accent.TButton", background=C["accent"],
                        foreground=C["bg"], font=("Segoe UI", 10, "bold"),
                        padding=(12, 6))
        style.map("Accent.TButton",
                  background=[("disabled", C["muted"]), ("active", C["accent_hover"])],
                  foreground=[("disabled", C["fg"])])

        style.configure("Green.TButton", background=C["green"],
                        foreground=C["bg"], font=("Segoe UI", 9, "bold"),
                        padding=(8, 4))
        style.map("Green.TButton",
                  background=[("active", "#b5e88a")])

        style.configure("Red.TButton", background=C["red"],
                        foreground="#fff", font=("Segoe UI", 8, "bold"),
                        padding=(6, 2))
        style.map("Red.TButton",
                  background=[("active", "#ff99a8")])

        style.configure("Muted.TButton", background=C["border"],
                        foreground=C["muted"], font=("Segoe UI", 8),
                        padding=(6, 2))
        style.map("Muted.TButton",
                  background=[("active", C["muted"])])

        style.configure("Link.TButton", background=C["bg2"],
                        foreground=C["accent"], font=("Segoe UI", 8),
                        padding=(6, 2))
        style.map("Link.TButton",
                  background=[("active", C["border"])])

        style.configure("TCombobox", fieldbackground=C["bg2"],
                        background=C["bg2"], foreground=C["fg_bright"],
                        arrowcolor=C["accent"], selectbackground=C["accent"],
                        selectforeground=C["bg"])
        style.map("TCombobox",
                  fieldbackground=[("readonly", C["bg2"])],
                  foreground=[("readonly", C["fg_bright"])])

        style.configure("Horizontal.TProgressbar",
                        troughcolor=C["bg3"], background=C["purple"],
                        thickness=8)

    # ── UI Layout ───────────────────────────────────────────
    def _build_ui(self):
        container = ttk.Frame(self, padding=15)
        container.pack(fill=tk.BOTH, expand=True)

        # Title row
        title_frame = ttk.Frame(container)
        title_frame.pack(fill=tk.X, pady=(0, 5))
        ttk.Label(title_frame, text="OCR Engine", style="Title.TLabel").pack(side=tk.LEFT)
        self._gpu_label = ttk.Label(title_frame, text="", style="GPU.TLabel")
        self._gpu_label.pack(side=tk.LEFT, padx=(10, 0))

        btn_deactivate = ttk.Button(title_frame, text="Deactivate",
                                    style="Muted.TButton", command=self._do_deactivate)
        btn_deactivate.pack(side=tk.RIGHT, padx=5)

        ttk.Label(container, text="Upload an image, choose a task, extract text.",
                  style="Sub.TLabel").pack(anchor=tk.W, pady=(0, 10))

        # Scrollable body
        canvas = tk.Canvas(container, bg=C["bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(container, orient=tk.VERTICAL, command=canvas.yview)
        self._scroll_frame = ttk.Frame(canvas)
        self._scroll_frame.bind("<Configure>",
                                lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=self._scroll_frame, anchor=tk.NW)
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Mousewheel scrolling
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        self._canvas = canvas

        body = self._scroll_frame

        # ── Card 1: Upload & Run ──
        card1 = self._make_card(body, "Upload & Run")

        # Image selection area
        img_frame = ttk.Frame(card1, style="Card.TFrame")
        img_frame.pack(fill=tk.X, pady=(0, 8))

        self._drop_label = tk.Label(
            img_frame, text="Click to choose an image\nor drag & drop",
            bg=C["bg3"], fg=C["muted"], font=("Segoe UI", 10),
            relief="groove", bd=1, cursor="hand2", padx=20, pady=25,
        )
        self._drop_label.pack(fill=tk.X, padx=5, pady=5)
        self._drop_label.bind("<Button-1>", lambda e: self._pick_image())

        self._preview_label = tk.Label(img_frame, bg=C["bg3"])

        # Task type selection
        opt_frame = ttk.Frame(card1, style="Card.TFrame")
        opt_frame.pack(fill=tk.X, pady=(0, 8))
        ttk.Label(opt_frame, text="Task:", style="CardTitle.TLabel").pack(
            side=tk.LEFT, padx=(0, 8))
        self._task_var = tk.StringVar(value=TASK_TYPES[0][1])
        self._task_combo = ttk.Combobox(
            opt_frame, textvariable=self._task_var, state="readonly",
            values=[t[0] for t in TASK_TYPES], width=25,
        )
        self._task_combo.current(0)
        self._task_combo.pack(side=tk.LEFT)

        # Run button
        self._run_btn = ttk.Button(card1, text="Run OCR", style="Accent.TButton",
                                   command=self._run_ocr, state="disabled")
        self._run_btn.pack(fill=tk.X, pady=(0, 5))

        # Status
        self._status_label = ttk.Label(card1, text="", style="Status.TLabel")
        self._status_label.pack(fill=tk.X)

        # Progress bar
        self._progress_frame = ttk.Frame(card1, style="Card.TFrame")
        self._progress_var = tk.DoubleVar(value=0)
        self._progress_bar = ttk.Progressbar(
            self._progress_frame, variable=self._progress_var,
            maximum=100, style="Horizontal.TProgressbar",
        )
        self._progress_bar.pack(fill=tk.X, pady=(4, 2))
        self._progress_text = ttk.Label(self._progress_frame, text="",
                                        style="Muted.TLabel")
        self._progress_text.pack(fill=tk.X)

        # ── Card 2: Result ──
        self._result_card = self._make_card(body, "Result")
        self._result_card.master.pack_forget()  # hidden initially

        result_panes = ttk.Frame(self._result_card, style="Card.TFrame")
        result_panes.pack(fill=tk.BOTH, expand=True)
        result_panes.columnconfigure(0, weight=1)
        result_panes.columnconfigure(1, weight=1)

        # Input preview
        left_pane = ttk.Frame(result_panes, style="Card.TFrame")
        left_pane.grid(row=0, column=0, sticky="nsew", padx=(0, 5))
        ttk.Label(left_pane, text="INPUT", style="CardTitle.TLabel").pack(anchor=tk.W)
        self._result_image_label = tk.Label(left_pane, bg=C["bg3"])
        self._result_image_label.pack(fill=tk.BOTH, expand=True, pady=(4, 0))

        # OCR output
        right_pane = ttk.Frame(result_panes, style="Card.TFrame")
        right_pane.grid(row=0, column=1, sticky="nsew", padx=(5, 0))
        ttk.Label(right_pane, text="OCR OUTPUT", style="CardTitle.TLabel").pack(anchor=tk.W)

        self._result_text = tk.Text(
            right_pane, bg=C["bg3"], fg=C["fg_bright"],
            font=("Consolas", 9), wrap=tk.WORD, relief="flat",
            insertbackground=C["fg_bright"], selectbackground=C["accent"],
            height=12, bd=0, padx=8, pady=8,
        )
        self._result_text.pack(fill=tk.BOTH, expand=True, pady=(4, 0))

        self._copy_btn = ttk.Button(right_pane, text="Copy to clipboard",
                                    style="Green.TButton", command=self._copy_result)
        self._copy_btn.pack(fill=tk.X, pady=(6, 0))

        # ── Card 3: Task Queue ──
        card3 = self._make_card(body, "Task Queue")
        self._queue_count_label = ttk.Label(card3, text="0 tasks",
                                            style="Muted.TLabel")
        self._queue_count_label.pack(anchor=tk.E)

        self._task_list_frame = ttk.Frame(card3, style="Card.TFrame")
        self._task_list_frame.pack(fill=tk.BOTH, expand=True)
        self._empty_queue_label = ttk.Label(
            self._task_list_frame,
            text="No tasks yet. Upload an image and click Run OCR.",
            style="Muted.TLabel",
        )
        self._empty_queue_label.pack(pady=15)

        # ── Card 4: Server Logs ──
        card4 = self._make_card(body, "Server Logs")
        self._log_toggle_btn = ttk.Button(
            card4, text="Show Logs", style="Link.TButton",
            command=self._toggle_logs,
        )
        self._log_toggle_btn.pack(anchor=tk.W)

        self._log_text = tk.Text(
            card4, bg="#0a0a0f", fg=C["muted"],
            font=("Consolas", 8), wrap=tk.WORD, relief="flat",
            height=10, bd=0, padx=6, pady=6,
            insertbackground=C["muted"],
        )
        self._log_text.tag_configure("INFO", foreground=C["fg"])
        self._log_text.tag_configure("WARN", foreground=C["orange"])
        self._log_text.tag_configure("ERROR", foreground=C["red"])
        self._log_text.tag_configure("ts", foreground=C["muted"])

        # DnD support via TkDND if available, otherwise file dialog only
        self._setup_dnd()

    def _make_card(self, parent, title: str) -> ttk.Frame:
        outer = ttk.Frame(parent, style="TFrame")
        outer.pack(fill=tk.X, pady=(0, 10))
        card = ttk.Frame(outer, style="Card.TFrame", padding=12)
        card.pack(fill=tk.X)
        if title:
            ttk.Label(card, text=title.upper(), style="CardTitle.TLabel").pack(
                anchor=tk.W, pady=(0, 8))
        return card

    # ── Drag and Drop ───────────────────────────────────────
    def _setup_dnd(self):
        try:
            self.tk.eval('package require tkdnd')
            self._has_dnd = True
            self._drop_label.drop_target_register('DND_Files')
            self._drop_label.dnd_bind('<<Drop>>', self._on_dnd_drop)
            self._drop_label.dnd_bind('<<DragEnter>>', lambda e: self._drop_label.configure(bg=C["border"]))
            self._drop_label.dnd_bind('<<DragLeave>>', lambda e: self._drop_label.configure(bg=C["bg3"]))
        except Exception:
            self._has_dnd = False

    def _on_dnd_drop(self, event):
        self._drop_label.configure(bg=C["bg3"])
        path = event.data.strip().strip("{}")
        if os.path.isfile(path):
            ext = os.path.splitext(path)[1].lower()
            if ext in (".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".tif", ".webp"):
                self._load_image(path)
            else:
                self._set_status(f"Unsupported file type: {ext}", "err")

    # ── Image handling ──────────────────────────────────────
    def _pick_image(self):
        path = filedialog.askopenfilename(
            title="Select Image",
            filetypes=[
                ("Image files", "*.png *.jpg *.jpeg *.bmp *.gif *.tiff *.tif *.webp"),
                ("All files", "*.*"),
            ],
        )
        if path:
            self._load_image(path)

    def _load_image(self, path: str):
        size = os.path.getsize(path)
        if size > MAX_IMAGE_BYTES:
            self._set_status(f"File too large ({size / 1024 / 1024:.1f} MB, max 50 MB)", "err")
            return

        dest = os.path.join(TEMP_DIR, os.path.basename(path))
        if os.path.abspath(path) != os.path.abspath(dest):
            shutil.copy2(path, dest)
        self._image_path = dest

        self._show_preview(path, self._drop_label.master, self._drop_label, max_h=180)
        self._run_btn.state(["!disabled"])
        self._set_status("Ready. Choose a task and click Run OCR.", "ok")
        flog(f"Image loaded: {os.path.basename(path)} ({size / 1024:.0f} KB)")

    def _show_preview(self, path: str, parent: tk.Widget,
                      replace_widget: tk.Widget | None = None,
                      max_h: int = 200):
        try:
            from PIL import Image, ImageTk
            img = Image.open(path)
            w, h = img.size
            ratio = min(400 / w, max_h / h, 1.0)
            new_w, new_h = int(w * ratio), int(h * ratio)
            img = img.resize((new_w, new_h), Image.LANCZOS)
            photo = ImageTk.PhotoImage(img)

            if replace_widget:
                replace_widget.pack_forget()

            label = tk.Label(parent, image=photo, bg=C["bg3"], cursor="hand2")
            label.image = photo
            label.pack(fill=tk.X, padx=5, pady=5)
            label.bind("<Button-1>", lambda e: self._pick_image())

            if replace_widget is self._drop_label:
                self._preview_label = label
        except ImportError:
            if replace_widget:
                replace_widget.configure(
                    text=f"Selected: {os.path.basename(path)}\n(Click to change)",
                    fg=C["green"],
                )

    # ── Runner management ───────────────────────────────────
    def _init_runner(self):
        self._set_status("Checking runner...", "warn")
        flog("Checking runner health")

        def check():
            if runner_healthy():
                self.after(0, self._on_runner_ready)
            else:
                flog("Runner not running, starting it...")
                self.after(0, lambda: self._set_status(
                    "Starting OCR runner (loading model, may take 30-120s)...", "warn"))
                self._start_runner()
                self._wait_for_runner()

        threading.Thread(target=check, daemon=True).start()

    def _start_runner(self):
        python_exe = os.path.join(SCRIPT_DIR, "python312.exe")
        if not os.path.isfile(python_exe):
            python_exe = sys.executable

        flog(f"Starting runner: {python_exe} {RUNNER_SCRIPT}")
        try:
            self._runner_proc = subprocess.Popen(
                [python_exe, RUNNER_SCRIPT],
                cwd=SCRIPT_DIR,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
        except Exception as e:
            flog(f"Failed to start runner: {e}", "ERROR")
            self.after(0, lambda: self._set_status(f"Failed to start runner: {e}", "err"))

    def _read_download_status(self) -> dict | None:
        """Read the .download_status file written by model_setup.py."""
        status_path = os.path.join(SCRIPT_DIR, ".download_status")
        if not os.path.isfile(status_path):
            return None
        try:
            with open(status_path, "r") as f:
                return json.load(f)
        except Exception:
            return None

    def _wait_for_runner(self):
        def wait():
            start = time.monotonic()
            timeout = 900
            dots = 0
            while time.monotonic() - start < timeout:
                dots = (dots + 1) % 4
                elapsed = int(time.monotonic() - start)

                # Detect runner crash
                if self._runner_proc and self._runner_proc.poll() is not None:
                    exit_code = self._runner_proc.returncode
                    self.after(0, lambda ec=exit_code: self._set_status(
                        f"Runner crashed (exit code {ec}). Check GPU drivers or logs.", "err"))
                    self.after(0, self._hide_progress)
                    flog(f"Runner crashed with exit code {exit_code}", "ERROR")
                    return

                # Check if model_setup.py is writing download progress
                dl_status = self._read_download_status()
                if dl_status:
                    msg = dl_status.get("message", "Working...")
                    pct = dl_status.get("progress", 0)
                    phase = dl_status.get("phase", "")
                    detail = dl_status.get("detail", "")
                    if phase == "download":
                        display = f"Downloading model: {msg}  ({elapsed}s)"
                    elif phase == "encrypt":
                        display = f"Encrypting model: {msg}  ({elapsed}s)"
                    else:
                        display = f"{msg}  ({elapsed}s)"
                    self.after(0, lambda d=display: self._set_status(d, "warn"))
                    self.after(0, lambda p=pct * 100, det=detail:
                               self._show_progress(p, det or f"{p:.0f}%"))
                else:
                    self.after(0, lambda d=dots, e=elapsed: self._set_status(
                        f"Loading OCR model{'.' * d}  ({e}s)", "warn"))

                if runner_healthy():
                    self.after(0, self._hide_progress)
                    self.after(0, self._on_runner_ready)
                    return
                time.sleep(2)
            self.after(0, lambda: self._set_status(
                "Runner failed to start. Check GPU/drivers.", "err"))
            self.after(0, self._hide_progress)
            flog("Runner startup timed out", "ERROR")

        threading.Thread(target=wait, daemon=True).start()

    def _on_runner_ready(self):
        flog("Runner is ready")
        self._set_status("Runner ready.", "ok")
        code, data = call_runner("GET", "/healthz", timeout=5)
        if code == 200:
            gpu = data.get("gpu", "")
            device = data.get("device", "")
            if gpu and gpu not in ("CPU", "unknown"):
                self._gpu_label.configure(text=f"GPU: {gpu}")
            elif device == "cpu":
                self._gpu_label.configure(text="CPU mode", foreground=C["red"])
            flog(f"Device: {device}, GPU: {gpu}")

        self._start_task_refresh()
        self._start_log_refresh()

    # ── Deactivation ───────────────────────────────────────
    def _do_deactivate(self):
        if not messagebox.askyesno("Deactivate",
                                   "Deactivate this machine?\nYou can re-activate later."):
            return
        machine_lock.deactivate_online()
        messagebox.showinfo("Deactivated", "Machine deactivated. The app will now close.")
        self._on_close()

    # ── Run OCR ─────────────────────────────────────────────
    def _run_ocr(self):
        if not self._image_path or not os.path.isfile(self._image_path):
            self._set_status("No image selected.", "err")
            return

        combo_val = self._task_combo.get()
        task_type = "ocr"
        for label, val in TASK_TYPES:
            if label == combo_val:
                task_type = val
                break

        self._set_status("Submitting...", "warn")
        self._show_progress(0, "Queued...")
        self._run_btn.state(["disabled"])
        flog(f"Submitting OCR task: type={task_type}, image={os.path.basename(self._image_path)}")

        def submit():
            code, data = call_runner("POST", "/api/ocr", json_data={
                "action": "create",
                "image_path": self._image_path,
                "task": task_type,
            })
            if code == 200 and data.get("task_id"):
                tid = data["task_id"]
                self._active_task_id = tid
                pos = data.get("queue_position", 0)
                flog(f"Task created: {tid[:8]}, queue position #{pos}")
                self.after(0, lambda: self._set_status(
                    f"Task queued (position #{pos})." if pos > 1 else "Task queued.", "ok"))
                self.after(0, lambda: self._start_poll(tid))
                self.after(0, self._refresh_tasks)
            else:
                err = data.get("error", "Unknown error")
                flog(f"Task creation failed: {err}", "ERROR")
                self.after(0, lambda: self._set_status(f"Error: {err}", "err"))
                self.after(0, self._hide_progress)
                self.after(0, lambda: self._run_btn.state(["!disabled"]))

        threading.Thread(target=submit, daemon=True).start()

    # ── Poll active task ────────────────────────────────────
    def _start_poll(self, task_id: str):
        self._poll_gen += 1
        my_gen = self._poll_gen
        image_path = self._image_path

        def tick():
            if my_gen != self._poll_gen or self._shutting_down:
                return
            try:
                code, data = call_runner("POST", "/api/ocr", json_data={
                    "action": "check", "task_id": task_id,
                })
            except Exception:
                return

            if my_gen != self._poll_gen:
                return

            status = (data.get("status") or "").upper()
            progress = (data.get("progress") or 0) * 100
            msg = data.get("message") or status

            self.after(0, lambda: self._show_progress(progress, f"{msg}  ({progress:.0f}%)"))

            if status == "DONE":
                result = data.get("result", "")
                flog(f"Task {task_id[:8]} completed")
                self.after(0, lambda: self._on_task_done(result, image_path, msg))
                return
            elif status == "ERROR":
                err = data.get("error") or data.get("message") or "Unknown"
                flog(f"Task {task_id[:8]} error: {err}", "ERROR")
                self.after(0, lambda: self._set_status(f"Error: {err}", "err"))
                self.after(0, self._hide_progress)
                self.after(0, lambda: self._run_btn.state(["!disabled"]))
                self.after(0, self._refresh_tasks)
                return
            elif status in ("CANCELLED", "TIMEOUT"):
                flog(f"Task {task_id[:8]} {status.lower()}")
                self.after(0, lambda: self._set_status(msg, "warn"))
                self.after(0, self._hide_progress)
                self.after(0, lambda: self._run_btn.state(["!disabled"]))
                self.after(0, self._refresh_tasks)
                return

            self.after(POLL_INTERVAL_MS, tick)

        self.after(POLL_INTERVAL_MS, tick)

    def _on_task_done(self, result: str, image_path: str | None, msg: str):
        self._hide_progress()
        self._set_status(msg or "Done.", "ok")
        self._run_btn.state(["!disabled"])

        self._result_text.delete("1.0", tk.END)
        self._result_text.insert("1.0", result or "(empty)")

        if image_path and os.path.isfile(image_path):
            try:
                from PIL import Image, ImageTk
                img = Image.open(image_path)
                w, h = img.size
                ratio = min(350 / w, 300 / h, 1.0)
                img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
                photo = ImageTk.PhotoImage(img)
                self._result_image_label.configure(image=photo)
                self._result_image_label.image = photo
            except ImportError:
                self._result_image_label.configure(text=os.path.basename(image_path))

        self._result_card.master.pack(fill=tk.X, pady=(0, 10))
        self._refresh_tasks()

    # ── Cancel task ─────────────────────────────────────────
    def _cancel_task(self, task_id: str):
        flog(f"Cancelling task {task_id[:8]}")

        def do_cancel():
            call_runner("POST", "/api/ocr", json_data={
                "action": "cancel", "task_id": task_id,
            })
            self.after(0, self._refresh_tasks)

        threading.Thread(target=do_cancel, daemon=True).start()

    # ── Remove task ─────────────────────────────────────────
    def _remove_task(self, task_id: str):
        def do_remove():
            call_runner("DELETE", f"/api/tasks/{quote(task_id, safe='')}")
            self.after(0, self._refresh_tasks)

        threading.Thread(target=do_remove, daemon=True).start()

    # ── View result of a completed task ─────────────────────
    def _view_result(self, task_id: str):
        self._set_status("Loading result...", "warn")

        def fetch():
            code, data = call_runner("POST", "/api/ocr", json_data={
                "action": "check", "task_id": task_id,
            })
            if code == 200:
                result = data.get("result", "(empty)")
                self.after(0, lambda: self._show_result_text(result, task_id))
            else:
                err = data.get("error", "Failed to load")
                self.after(0, lambda: self._set_status(f"Error: {err}", "err"))

        threading.Thread(target=fetch, daemon=True).start()

    def _show_result_text(self, result: str, task_id: str):
        self._result_text.delete("1.0", tk.END)
        self._result_text.insert("1.0", result)
        self._result_card.master.pack(fill=tk.X, pady=(0, 10))
        self._set_status(f"Showing result for task {task_id[:8]}.", "ok")

    # ── Task queue refresh ──────────────────────────────────
    def _start_task_refresh(self):
        self._refresh_tasks()

    def _refresh_tasks(self):
        if self._shutting_down:
            return

        def fetch():
            try:
                code, data = call_runner("GET", "/api/tasks", timeout=5)
                if code == 200:
                    items = data.get("tasks", [])
                    self.after(0, lambda: self._render_task_list(items))
            except Exception:
                pass

        threading.Thread(target=fetch, daemon=True).start()
        if not self._shutting_down:
            self.after(TASK_REFRESH_MS, self._refresh_tasks)

    def _render_task_list(self, items: list[dict]):
        for w in self._task_list_frame.winfo_children():
            w.destroy()

        if not items:
            ttk.Label(
                self._task_list_frame,
                text="No tasks yet. Upload an image and click Run OCR.",
                style="Muted.TLabel",
            ).pack(pady=15)
            self._queue_count_label.configure(text="0 tasks")
            return

        active = sum(1 for t in items if t.get("status") in ("QUEUED", "PROCESSING"))
        total = len(items)
        count_text = f"{total} task{'s' if total != 1 else ''}"
        if active:
            count_text += f"  ({active} active)"
        self._queue_count_label.configure(text=count_text)

        status_colors = {
            "QUEUED": C["orange"],
            "PROCESSING": C["accent"],
            "DONE": C["green"],
            "ERROR": C["red"],
            "CANCELLED": C["muted"],
            "TIMEOUT": C["orange"],
        }

        now = time.time()

        for t in items:
            row = ttk.Frame(self._task_list_frame, style="Card.TFrame")
            row.pack(fill=tk.X, pady=1)

            st = (t.get("status") or "").upper()
            color = status_colors.get(st, C["muted"])

            dot = tk.Canvas(row, width=10, height=10, bg=C["bg2"], highlightthickness=0)
            dot.create_oval(1, 1, 9, 9, fill=color, outline="")
            dot.pack(side=tk.LEFT, padx=(4, 6), pady=4)

            label = t.get("task_label") or t.get("task_type") or "?"
            info_frame = ttk.Frame(row, style="Card.TFrame")
            info_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)

            time_info = ""
            if st in ("DONE", "ERROR", "CANCELLED", "TIMEOUT"):
                if t.get("started_at") and t.get("finished_at"):
                    dur = t["finished_at"] - t["started_at"]
                    time_info = f"{dur:.1f}s"
                if t.get("created_at"):
                    ago = now - t["created_at"]
                    ago_str = (f"{int(ago)}s ago" if ago < 60
                               else f"{int(ago / 60)}m ago" if ago < 3600
                               else f"{int(ago / 3600)}h ago")
                    time_info += f" - {ago_str}" if time_info else ago_str
            elif st == "PROCESSING" and t.get("started_at"):
                elapsed = now - t["started_at"]
                time_info = f"running {elapsed:.0f}s"
            elif st == "QUEUED":
                if t.get("queue_position") is not None:
                    time_info = f"position #{t['queue_position'] + 1}"

            ttk.Label(info_frame, text=f"{label}  {st}  {time_info}",
                      foreground=color, font=("Segoe UI", 8),
                      background=C["bg2"]).pack(anchor=tk.W)

            if t.get("message") and st in ("PROCESSING", "QUEUED"):
                ttk.Label(info_frame, text=t["message"],
                          foreground=C["accent"], font=("Segoe UI", 7),
                          background=C["bg2"]).pack(anchor=tk.W)

            # Progress mini-bar
            pct = (t.get("progress") or 0) * 100
            if pct > 0:
                mini = tk.Canvas(row, width=60, height=6, bg=C["bg3"], highlightthickness=0)
                fill_w = max(1, int(60 * pct / 100))
                mini.create_rectangle(0, 0, fill_w, 6, fill=C["purple"], outline="")
                mini.pack(side=tk.LEFT, padx=4, pady=4)

            # Action buttons
            tid = t.get("task_id", "")
            if st in ("QUEUED", "PROCESSING"):
                btn = ttk.Button(row, text="Cancel", style="Red.TButton",
                                 command=lambda _tid=tid: self._cancel_task(_tid))
                btn.pack(side=tk.RIGHT, padx=2, pady=2)
            elif st == "DONE":
                btn_view = ttk.Button(row, text="View", style="Link.TButton",
                                      command=lambda _tid=tid: self._view_result(_tid))
                btn_view.pack(side=tk.RIGHT, padx=2, pady=2)
                btn_rm = ttk.Button(row, text="x", style="Muted.TButton",
                                    command=lambda _tid=tid: self._remove_task(_tid))
                btn_rm.pack(side=tk.RIGHT, padx=0, pady=2)
            else:
                btn_rm = ttk.Button(row, text="x", style="Muted.TButton",
                                    command=lambda _tid=tid: self._remove_task(_tid))
                btn_rm.pack(side=tk.RIGHT, padx=2, pady=2)

    # ── Log viewer ──────────────────────────────────────────
    def _toggle_logs(self):
        self._log_visible = not self._log_visible
        if self._log_visible:
            self._log_text.pack(fill=tk.BOTH, expand=True, pady=(6, 0))
            self._log_toggle_btn.configure(text="Hide Logs")
            self._refresh_logs()
        else:
            self._log_text.pack_forget()
            self._log_toggle_btn.configure(text="Show Logs")

    def _start_log_refresh(self):
        self._do_log_refresh()

    def _do_log_refresh(self):
        if self._shutting_down:
            return
        if self._log_visible:
            self._refresh_logs()
        if not self._shutting_down:
            self.after(LOG_REFRESH_MS, self._do_log_refresh)

    def _refresh_logs(self):
        def fetch():
            try:
                code, data = call_runner("GET", "/api/logs", timeout=5)
                if code == 200:
                    logs = data.get("logs", [])
                    self.after(0, lambda: self._render_logs(logs))
            except Exception:
                pass

        threading.Thread(target=fetch, daemon=True).start()

    def _render_logs(self, logs: list[dict]):
        self._log_text.configure(state=tk.NORMAL)
        self._log_text.delete("1.0", tk.END)
        for entry in logs:
            ts = entry.get("ts", "")
            level = entry.get("level", "INFO")
            msg = entry.get("msg", "")
            self._log_text.insert(tk.END, f"{ts}  ", "ts")
            self._log_text.insert(tk.END, f"{msg}\n", level)
        self._log_text.see(tk.END)
        self._log_text.configure(state=tk.DISABLED)

    # ── Status & progress helpers ───────────────────────────
    def _set_status(self, msg: str, kind: str = ""):
        style_map = {"ok": "Status.TLabel", "err": "StatusErr.TLabel",
                     "warn": "StatusWarn.TLabel"}
        self._status_label.configure(text=msg,
                                     style=style_map.get(kind, "Status.TLabel"))

    def _show_progress(self, pct: float, msg: str = ""):
        self._progress_frame.pack(fill=tk.X, pady=(4, 0))
        self._progress_var.set(min(pct, 100))
        self._progress_text.configure(text=msg or f"{pct:.0f}%")

    def _hide_progress(self):
        self._progress_frame.pack_forget()

    # ── Copy result ─────────────────────────────────────────
    def _copy_result(self):
        text = self._result_text.get("1.0", tk.END).strip()
        if not text:
            return
        self.clipboard_clear()
        self.clipboard_append(text)
        self._copy_btn.configure(text="Copied!")
        self.after(1200, lambda: self._copy_btn.configure(text="Copy to clipboard"))

    # ── Cleanup ─────────────────────────────────────────────
    def _on_close(self):
        self._shutting_down = True
        flog("Application closing")

        if self._runner_proc and self._runner_proc.poll() is None:
            flog("Stopping runner process")
            self._runner_proc.terminate()
            try:
                self._runner_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self._runner_proc.kill()

        try:
            shutil.rmtree(TEMP_DIR, ignore_errors=True)
        except Exception:
            pass

        flog("Application closed")
        self.destroy()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    import argparse
    parser = argparse.ArgumentParser(description="OCR Engine Desktop App")
    parser.add_argument("--runner-url", default=None,
                        help="Runner backend URL (default: http://127.0.0.1:38000)")
    args = parser.parse_args()

    if args.runner_url:
        global RUNNER_BASE
        RUNNER_BASE = args.runner_url

    flog("=" * 50)
    flog("OCR Engine Desktop App starting")
    flog(f"Runner URL: {RUNNER_BASE}")

    app = OCRApp()
    app.mainloop()


if __name__ == "__main__":
    main()
