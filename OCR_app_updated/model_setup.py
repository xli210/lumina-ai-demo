"""
Model Setup — download and encrypt the OCR engine model locally.

On first launch (when no encrypted model exists in models/), this module:
  1. Downloads the required model components (file-by-file with real progress)
  2. Encrypts every file with the license key via engine_crypto
  3. Stores the encrypted archive in models/ (same format runner.py expects)
  4. Removes the plaintext download cache

Subsequent launches skip all of this — the encrypted model is already present.

Progress is written to .download_status (JSON) so launch_app.py can read it
and display real-time progress in the GUI.

Can also be run standalone:
    python model_setup.py
    python model_setup.py --force   # re-download + re-encrypt
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
import machine_lock as _machine_lock  # noqa: E402

MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
STATUS_FILE = os.path.join(SCRIPT_DIR, ".download_status")
# Internal — not shown to end-users
_MODEL_SOURCE = "PaddlePaddle/PaddleOCR-VL-1.5"
VERIFY_FILE = "v.dat"


def _read_license() -> str:
    """
    Read the master key from .machine_lock (online activation).
    The key is stored encrypted on disk — machine_lock.get_master_key()
    decrypts it using this machine's hardware fingerprint.
    """
    mk = _machine_lock.get_master_key()
    if mk:
        return mk
    raise RuntimeError(
        "No master key found.\n"
        "Please activate your license first:\n"
        "  Run the application and enter your license key when prompted."
    )


def is_model_ready(models_dir: str | None = None) -> bool:
    """Check if encrypted model already exists and is usable."""
    d = models_dir or MODELS_DIR
    return os.path.isfile(os.path.join(d, VERIFY_FILE))


# ---------------------------------------------------------------------------
# Status file helpers (for GUI progress)
# ---------------------------------------------------------------------------
def _write_status(phase: str, message: str, progress: float,
                  detail: str = ""):
    """Write current progress to .download_status for the GUI to read."""
    try:
        with open(STATUS_FILE, "w") as f:
            json.dump({
                "phase": phase,
                "message": message,
                "progress": round(progress, 3),
                "detail": detail,
                "ts": time.time(),
            }, f)
    except Exception:
        pass


def _clear_status():
    """Remove the status file when done."""
    try:
        if os.path.isfile(STATUS_FILE):
            os.remove(STATUS_FILE)
    except Exception:
        pass


def read_status() -> dict | None:
    """Read the current download status (called by launch_app.py)."""
    if not os.path.isfile(STATUS_FILE):
        return None
    try:
        with open(STATUS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Console progress reporter
# ---------------------------------------------------------------------------
def _progress_callback(status: str, progress: float | None = None):
    """Default console progress reporter."""
    if progress is not None:
        pct = int(progress * 100)
        bar_len = 30
        filled = int(bar_len * progress)
        bar = "#" * filled + "-" * (bar_len - filled)
        print(f"\r  [{bar}] {pct:3d}%  {status}", end="", flush=True)
        if progress >= 1.0:
            print()
    else:
        print(f"  {status}", flush=True)


# ---------------------------------------------------------------------------
# User-friendly error classification
# ---------------------------------------------------------------------------
def _classify_download_error(exc: Exception, context: str = "") -> str:
    """
    Turn a raw download exception into a clear, user-friendly message.
    Avoids leaking any internal URLs, repo names, or technical details.
    """
    msg = str(exc).lower()

    # --- Network / connectivity ---
    if any(kw in msg for kw in (
        "urlopen", "connection", "errno", "network is unreachable",
        "name or service not known", "nodename nor servname",
        "getaddrinfo", "no address associated", "dns",
    )):
        return (
            "No internet connection detected.\n"
            "Please check your network and try again."
        )

    if "timed out" in msg or "timeout" in msg:
        return (
            "Download timed out — your connection may be too slow or unstable.\n"
            "Please try again later."
        )

    # --- Auth / access ---
    if "401" in msg or "unauthorized" in msg:
        return (
            "Authentication required to download model components.\n"
            "Please check your credentials or contact support."
        )

    if "403" in msg or "forbidden" in msg:
        return (
            "Access denied when downloading model components.\n"
            "The resource may be restricted. Please contact support."
        )

    # --- Not found ---
    if "404" in msg or "not found" in msg:
        return (
            "Model resource not found on the server.\n"
            "It may have been moved or is temporarily unavailable.\n"
            "Please try again later or contact support."
        )

    # --- Disk space ---
    if any(kw in msg for kw in ("no space", "disk full", "errno 28")):
        return (
            "Not enough disk space to download the model.\n"
            "Please free up at least 10 GB and try again."
        )

    # --- Rate limit ---
    if "429" in msg or "rate limit" in msg or "too many requests" in msg:
        return (
            "Download server is rate-limiting requests.\n"
            "Please wait a few minutes and try again."
        )

    # --- SSL / certificate ---
    if "ssl" in msg or "certificate" in msg:
        return (
            "Secure connection failed (SSL/certificate error).\n"
            "Please check your system clock, firewall, or VPN settings."
        )

    # --- Catchall —
    # Sanitise the error: strip anything that looks like a URL or repo path
    import re
    sanitised = re.sub(
        r'https?://[^\s)\"\']+', '<server>', str(exc)
    )
    sanitised = re.sub(
        r'[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+', '<resource>', sanitised
    )
    return (
        f"Download failed{f' ({context})' if context else ''}.\n"
        f"Error: {sanitised}\n"
        "Please check your internet connection and try again."
    )


# ---------------------------------------------------------------------------
# Download with real progress (filenames hidden from user)
# ---------------------------------------------------------------------------
def _get_repo_file_list(repo_id: str) -> list[dict]:
    """
    Get the list of files in a repo with their sizes.
    Returns list of {"path": str, "size": int}.
    Raises on hard errors (no network, access denied).
    Returns [] only on soft errors (metadata unavailable).
    """
    from huggingface_hub import HfApi
    try:
        api = HfApi()
        info = api.repo_info(repo_id=repo_id, repo_type="model",
                             files_metadata=True)
        files = []
        for sibling in info.siblings:
            files.append({
                "path": sibling.rfilename,
                "size": sibling.size or 0,
            })
        return files
    except (ConnectionError, OSError) as e:
        # Hard network errors — propagate so the user gets a clear message
        raise
    except Exception:
        # Soft failures (e.g. metadata unavailable) — fall back to bulk
        return []


def _download_with_progress(
    repo_id: str,
    download_dir: str,
    progress_fn,
) -> str:
    """
    Download model files one by one with per-file progress reporting.
    File names and repo info are NOT shown to the user.
    Returns the local path to the downloaded model.
    """
    from huggingface_hub import hf_hub_download, snapshot_download

    progress_fn("Fetching model info...", 0.01)
    _write_status("download", "Fetching model info...", 0.01)

    try:
        repo_files = _get_repo_file_list(repo_id)
    except Exception as e:
        err = _classify_download_error(e, "fetching model info")
        raise RuntimeError(err)

    if not repo_files:
        # Fallback: bulk download
        progress_fn("Downloading model (this may take a while)...", 0.02)
        _write_status("download", "Downloading model components...", 0.02)
        try:
            local_path = snapshot_download(
                repo_id=repo_id,
                local_dir=download_dir,
            )
        except Exception as e:
            raise RuntimeError(_classify_download_error(e))
        return local_path

    # Filter hidden files
    repo_files = [f for f in repo_files
                  if not f["path"].startswith(".")
                  and f["path"] != ".gitattributes"]

    total_size = sum(f["size"] for f in repo_files)
    total_files = len(repo_files)
    downloaded_size = 0

    total_mb = total_size / (1024 * 1024)
    progress_fn(
        f"Downloading {total_files} components ({total_mb:.0f} MB)...", 0.02
    )
    _write_status(
        "download",
        f"Downloading {total_files} components ({total_mb:.0f} MB)...",
        0.02,
    )

    for i, finfo in enumerate(repo_files):
        fname = finfo["path"]
        fsize = finfo["size"]
        fsize_mb = fsize / (1024 * 1024)

        # Progress: download phase spans 0.02 → 0.38
        base_progress = 0.02 + 0.36 * (downloaded_size / max(total_size, 1))

        # User-facing message: generic "component N/M" — no file names
        msg = (
            f"Downloading component {i + 1}/{total_files} "
            f"({fsize_mb:.1f} MB)"
        )
        progress_fn(msg, base_progress)
        _write_status(
            "download", msg, base_progress,
            f"{downloaded_size / (1024 * 1024):.0f}/{total_mb:.0f} MB",
        )

        try:
            hf_hub_download(
                repo_id=repo_id,
                filename=fname,
                local_dir=download_dir,
            )
        except Exception as e:
            raise RuntimeError(
                _classify_download_error(
                    e, f"component {i + 1}/{total_files}"
                )
            )

        downloaded_size += fsize

    progress_fn("Download complete.", 0.40)
    _write_status("download", "Download complete.", 0.40,
                  f"{total_mb:.0f} MB total")
    return download_dir


# ---------------------------------------------------------------------------
# Main download + encrypt function
# ---------------------------------------------------------------------------
def download_and_encrypt(
    repo_id: str = _MODEL_SOURCE,
    models_dir: str | None = None,
    license_key: str | None = None,
    force: bool = False,
    progress_fn=None,
) -> str:
    """
    Download model and encrypt into models_dir.

    Args:
        repo_id:      Model source identifier (internal, not shown to users)
        models_dir:   Where to store encrypted files (default: ./models/)
        license_key:  Encryption key (default: read from .machine_lock)
        force:        Re-download and re-encrypt even if model exists
        progress_fn:  Callback(status_str, progress_float_or_None)

    Returns:
        Path to the models directory with encrypted files.
    """
    models_dir = models_dir or MODELS_DIR
    if progress_fn is None:
        progress_fn = _progress_callback

    if not force and is_model_ready(models_dir):
        progress_fn("Model already set up. Skipping download.", None)
        _clear_status()
        return models_dir

    if license_key is None:
        license_key = _read_license()

    # --- Step 1: Download model components ---
    progress_fn("Preparing to download OCR model...", 0.0)
    _write_status("download", "Preparing to download OCR model...", 0.0)

    try:
        from huggingface_hub import hf_hub_download  # noqa: F401
    except ImportError:
        raise RuntimeError(
            "A required download component is missing from this installation.\n"
            "Please re-install the application or contact support."
        )

    download_dir = os.path.join(SCRIPT_DIR, ".hf_download_cache")
    os.makedirs(download_dir, exist_ok=True)

    local_path = _download_with_progress(repo_id, download_dir, progress_fn)

    # --- Step 2: Collect all files to encrypt ---
    progress_fn("Scanning model components...", 0.42)
    _write_status("encrypt", "Scanning components...", 0.42)

    all_files: list[str] = []
    for root, _dirs, files in os.walk(local_path):
        _dirs[:] = [d for d in _dirs if not d.startswith(".")]
        for fname in files:
            if fname.startswith("."):
                continue
            full = os.path.join(root, fname)
            rel = os.path.relpath(full, local_path).replace("\\", "/")
            all_files.append(rel)

    if not all_files:
        raise RuntimeError("No model files found after download.")

    progress_fn(f"Found {len(all_files)} components to secure.", None)

    # --- Step 3: Encrypt all files ---
    progress_fn("Securing model files...", 0.45)
    _write_status("encrypt", "Securing model files...", 0.45)

    sys.path.insert(0, SCRIPT_DIR)
    from engine_crypto import encrypt_file, encrypt_bytes, VERIFY_PLAINTEXT

    os.makedirs(models_dir, exist_ok=True)

    if force:
        for f in os.listdir(models_dir):
            fp = os.path.join(models_dir, f)
            if os.path.isfile(fp):
                os.remove(fp)

    # Encrypt verification token
    v_path = os.path.join(models_dir, "v.dat")
    encrypt_bytes(VERIFY_PLAINTEXT, v_path, license_key)

    # Encrypt each file with obfuscated names
    manifest: dict[str, str] = {}
    total = len(all_files)

    for i, rel_path in enumerate(sorted(all_files)):
        obfuscated = f"f{i + 1:04d}.dat"
        src = os.path.join(local_path, rel_path)
        dst = os.path.join(models_dir, obfuscated)

        encrypt_file(src, dst, license_key)
        manifest[obfuscated] = rel_path

        frac = 0.45 + 0.50 * ((i + 1) / total)
        size_mb = os.path.getsize(src) / (1024 * 1024)
        # User-facing: generic "component N/M" — no original file names
        msg = f"Securing component {i + 1}/{total} ({size_mb:.1f} MB)"
        progress_fn(msg, frac)
        _write_status("encrypt", msg, frac, f"{i + 1}/{total} files")

    # Encrypt manifest
    manifest_json = json.dumps(manifest, ensure_ascii=False).encode("utf-8")
    manifest_path = os.path.join(models_dir, "manifest.dat")
    encrypt_bytes(manifest_json, manifest_path, license_key)

    progress_fn("Model secured.", 0.96)
    _write_status("encrypt", "Model secured.", 0.96)

    # --- Step 4: Clean up download cache ---
    progress_fn("Cleaning up temporary files...", 0.97)
    _write_status("cleanup", "Cleaning up temporary files...", 0.97)
    try:
        shutil.rmtree(download_dir, ignore_errors=True)
    except Exception:
        progress_fn("Warning: could not fully clean temporary files.", None)

    progress_fn("Model setup complete!", 1.0)
    _write_status("done", "Model setup complete!", 1.0)
    _clear_status()
    return models_dir


# ---------------------------------------------------------------------------
# CLI entry point (developer use only)
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Download and encrypt OCR model (developer tool)"
    )
    parser.add_argument(
        "--repo", default=_MODEL_SOURCE,
        help="Model source identifier",
    )
    parser.add_argument(
        "--models-dir", default=None,
        help=f"Output directory for encrypted model (default: {MODELS_DIR})",
    )
    parser.add_argument(
        "--force", action="store_true",
        help="Re-download and re-encrypt even if model exists",
    )
    args = parser.parse_args()

    print()
    print("  ================================================")
    print("    OCR Engine — Model Setup (developer tool)")
    print("  ================================================")
    print(f"  Output:  {args.models_dir or MODELS_DIR}")
    print()

    start = time.time()
    try:
        download_and_encrypt(
            repo_id=args.repo,
            models_dir=args.models_dir,
            force=args.force,
        )
    except Exception as e:
        print(f"\n  [ERROR] {e}", file=sys.stderr)
        sys.exit(1)

    elapsed = time.time() - start
    print(f"\n  Done in {elapsed:.0f}s.")
    print()


if __name__ == "__main__":
    main()
