"""
Online License Activation — machine-lock module.

Handles:
  • Hardware fingerprinting (weighted machine_id)
  • Online activation via your web backend (/api/license/activate)
  • Secure master-key delivery (AES-256-GCM transport encryption)
  • Encrypted local storage — master key is NEVER stored in plaintext
  • Online verification (heartbeat) & deactivation
  • Product-bound license enforcement

The activation API is expected at:
    {SERVER_URL}/api/license/activate
    {SERVER_URL}/api/license/verify
    {SERVER_URL}/api/license/deactivate

Set the SERVER_URL by editing the constant below, or via the
OCR_LICENSE_SERVER env-var.
"""
from __future__ import annotations

import hashlib
import json
import os
import platform
import subprocess
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCK_FILE = os.path.join(SCRIPT_DIR, ".machine_lock")
SERVER_URL = os.environ.get(
    "OCR_LICENSE_SERVER",
    "https://lumina-ai-demo.vercel.app",       # ← your Vercel deployment
)
OFFLINE_GRACE_DAYS = 30      # app works offline for this many days after activation
HEARTBEAT_INTERVAL_DAYS = 14 # silent background re-verify interval

# ---------------------------------------------------------------------------
# ⚠️  PRODUCT BINDING — each app ships with its own product ID baked in.
#     This MUST match the product id registered on the website
#     (see lib/products.ts).  A license for a different product will be
#     rejected by the server.
# ---------------------------------------------------------------------------
PRODUCT_ID = "ocr-demo"

# ---------------------------------------------------------------------------
# Hardware fingerprint
# ---------------------------------------------------------------------------
def _run_cmd(cmd: str) -> str:
    """Run a shell command and return stripped stdout (empty on failure)."""
    try:
        r = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=5
        )
        return r.stdout.strip()
    except Exception:
        return ""


def _get_machine_id() -> str:
    """
    Build a weighted hardware fingerprint.
    Primary   (high weight): motherboard UUID, CPU serial
    Secondary (low  weight): disk serial, MAC address, hostname
    Returns a stable SHA-256 hex digest.
    """
    parts: list[str] = []

    if sys.platform == "win32":
        # Motherboard UUID (primary)
        mb = _run_cmd("wmic csproduct get uuid")
        for line in mb.splitlines():
            line = line.strip()
            if line and line.upper() != "UUID":
                parts.append(f"mb:{line}")
                break

        # CPU ID (primary)
        cpu = _run_cmd("wmic cpu get processorid")
        for line in cpu.splitlines():
            line = line.strip()
            if line and line.upper() != "PROCESSORID":
                parts.append(f"cpu:{line}")
                break

        # Disk serial (secondary)
        disk = _run_cmd("wmic diskdrive get serialnumber")
        for line in disk.splitlines():
            line = line.strip()
            if line and line.upper() != "SERIALNUMBER":
                parts.append(f"disk:{line}")
                break

        # Hostname (secondary)
        parts.append(f"host:{platform.node()}")

    elif sys.platform == "darwin":
        # macOS hardware UUID
        hw = _run_cmd("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformUUID/{print $3}'")
        hw = hw.strip('" ')
        if hw:
            parts.append(f"mb:{hw}")
        parts.append(f"host:{platform.node()}")

    else:
        # Linux
        mid = _run_cmd("cat /etc/machine-id 2>/dev/null || cat /var/lib/dbus/machine-id 2>/dev/null")
        if mid:
            parts.append(f"mid:{mid}")
        parts.append(f"host:{platform.node()}")

    raw = "|".join(parts) if parts else f"fallback:{platform.node()}:{os.getlogin()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _machine_label() -> str:
    """Human-readable label for this machine."""
    return f"{platform.node()} ({platform.system()} {platform.machine()})"


# ---------------------------------------------------------------------------
# Local-storage encryption (master key is NEVER stored in plaintext)
# ---------------------------------------------------------------------------
def _encrypt_for_storage(plaintext: str, machine_id: str) -> str:
    """
    Encrypt a string for local disk storage using the machine's fingerprint.
    Uses AES-256-GCM with a key derived from the machine_id.
    Returns hex(iv + ciphertext_with_tag).
    """
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    secret = hashlib.sha256(f"local-storage:{machine_id}".encode()).digest()
    iv = os.urandom(12)
    aesgcm = AESGCM(secret)
    ct = aesgcm.encrypt(iv, plaintext.encode("utf-8"), None)
    return (iv + ct).hex()


def _decrypt_from_storage(encrypted_hex: str, machine_id: str) -> str:
    """
    Decrypt a locally-stored encrypted string using the machine's fingerprint.
    Raises on failure (wrong machine, tampered data, etc.).
    """
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    raw = bytes.fromhex(encrypted_hex)
    iv = raw[:12]
    ct = raw[12:]

    secret = hashlib.sha256(f"local-storage:{machine_id}".encode()).digest()
    aesgcm = AESGCM(secret)
    plaintext = aesgcm.decrypt(iv, ct, None)
    return plaintext.decode("utf-8")


# ---------------------------------------------------------------------------
# Local lock-file helpers
# ---------------------------------------------------------------------------
def _save_lock(data: dict) -> None:
    """
    Persist lock data.  If a plaintext `master_key` is present (just received
    from the server), it is encrypted for storage and the plaintext is removed.
    """
    if "master_key" in data and data["master_key"]:
        mid = data.get("machine_id") or _get_machine_id()
        data["mk_enc"] = _encrypt_for_storage(data["master_key"], mid)
        del data["master_key"]          # ← never store plaintext
    data["saved_at"] = time.time()
    with open(LOCK_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _load_lock() -> dict | None:
    if not os.path.isfile(LOCK_FILE):
        return None
    try:
        with open(LOCK_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return None


def _clear_lock() -> None:
    if os.path.isfile(LOCK_FILE):
        os.remove(LOCK_FILE)


def is_activated() -> bool:
    """Check if a valid .machine_lock file exists with an encrypted master key
    AND the product_id matches this app."""
    lock = _load_lock()
    if not lock:
        return False
    # Must have encrypted master key (or legacy plaintext for migration)
    if not lock.get("mk_enc") and not lock.get("master_key"):
        return False
    # If there's a stored product_id, make sure it matches this app
    stored_product = lock.get("product_id")
    if stored_product and stored_product != PRODUCT_ID:
        return False
    return True


def get_master_key() -> str | None:
    """
    Return the master decryption key, or None.

    The key is stored encrypted on disk (tied to this machine's hardware).
    If a legacy plaintext key is found, it is automatically migrated to
    encrypted storage.
    """
    lock = _load_lock()
    if not lock:
        return None

    # Only return the key if it belongs to this product
    stored_product = lock.get("product_id")
    if stored_product and stored_product != PRODUCT_ID:
        return None

    machine_id = _get_machine_id()

    # New format: encrypted master key
    mk_enc = lock.get("mk_enc")
    if mk_enc:
        try:
            return _decrypt_from_storage(mk_enc, machine_id)
        except Exception:
            # Wrong machine or corrupted → require re-activation
            return None

    # Legacy migration: plaintext master_key found → encrypt and save
    mk = lock.get("master_key")
    if mk:
        lock["mk_enc"] = _encrypt_for_storage(mk, machine_id)
        del lock["master_key"]
        lock["saved_at"] = time.time()
        try:
            with open(LOCK_FILE, "w") as f:
                json.dump(lock, f, indent=2)
        except Exception:
            pass
        return mk

    return None


# ---------------------------------------------------------------------------
# Transport-key decryption  (mirrors server-side encryptMasterKey)
# ---------------------------------------------------------------------------
def _decrypt_master_key(encrypted_hex: str, machine_id: str) -> str:
    """
    Decrypt the master key that was encrypted by the server with
    AES-256-GCM using a machine-specific transport key.

    Server format (hex):  iv(12) + authTag(16) + ciphertext
    """
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    raw = bytes.fromhex(encrypted_hex)
    iv = raw[:12]
    tag = raw[12:28]
    ct = raw[28:]

    # Derive same transport key as server
    secret = hashlib.sha256(f"machine-transport:{machine_id}".encode()).digest()
    aesgcm = AESGCM(secret)

    # GCM: ciphertext || tag
    plaintext = aesgcm.decrypt(iv, ct + tag, None)
    return plaintext.decode("utf-8")


# ---------------------------------------------------------------------------
# HTTP helper
# ---------------------------------------------------------------------------
def _api_call(endpoint: str, payload: dict, timeout: int = 30) -> tuple[int, dict]:
    """POST JSON to the server. Returns (http_status, response_dict)."""
    url = SERVER_URL.rstrip("/") + endpoint
    data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")

    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        try:
            body = json.loads(e.read().decode("utf-8"))
        except Exception:
            body = {"error": str(e)}
        return e.code, body
    except URLError as e:
        return 0, {"error": f"Cannot reach server: {e.reason}"}
    except Exception as e:
        return 0, {"error": str(e)}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def activate_online(license_key: str, force_takeover: bool = False) -> dict:
    """
    Activate this machine online.

    The PRODUCT_ID is sent to the server so it can verify that the
    license key actually belongs to this application.

    Returns dict with keys:
        ok       : bool
        message  : str
        error    : str | None          (present when ok=False)
        status   : str | None          (server status field)
    """
    machine_id = _get_machine_id()

    code, resp = _api_call("/api/license/activate", {
        "license_key": license_key.strip(),
        "machine_id": machine_id,
        "machine_label": _machine_label(),
        "product_id": PRODUCT_ID,
        "force_takeover": force_takeover,
    })

    if code == 200 and resp.get("status") == "activated":
        master_key = None
        enc = resp.get("encrypted_master_key")
        if enc:
            try:
                master_key = _decrypt_master_key(enc, machine_id)
            except Exception as e:
                return {
                    "ok": False,
                    "message": f"Activation succeeded but master-key decryption failed: {e}",
                    "error": "decrypt_error",
                }

        # _save_lock will encrypt master_key before writing to disk
        _save_lock({
            "license_key": license_key.strip().upper(),
            "machine_id": machine_id,
            "license_id": resp.get("license_id"),
            "product_id": resp.get("product_id"),
            "master_key": master_key,          # encrypted by _save_lock
            "activated_at": time.time(),
            "last_verified": time.time(),
        })
        return {"ok": True, "message": resp.get("message", "Activated"), "status": "activated"}

    # Specific error codes
    if code == 409:
        return {
            "ok": False,
            "message": resp.get("message", "Activation limit reached."),
            "error": resp.get("error", "activation_limit_reached"),
            "current_activations": resp.get("current_activations"),
            "max_activations": resp.get("max_activations"),
        }
    if code == 429:
        return {
            "ok": False,
            "message": resp.get("message", "Force takeover on cooldown."),
            "error": resp.get("error", "force_takeover_cooldown"),
        }
    if code == 403:
        return {
            "ok": False,
            "message": resp.get("error", "Forbidden"),
            "error": "forbidden",
        }
    if code == 404:
        return {
            "ok": False,
            "message": "Invalid license key.",
            "error": "invalid_key",
        }
    if code == 0:
        return {
            "ok": False,
            "message": resp.get("error", "Cannot reach activation server. Check your internet."),
            "error": "network_error",
        }

    return {
        "ok": False,
        "message": resp.get("error", f"Server returned {code}"),
        "error": "server_error",
    }


def verify_online() -> dict:
    """
    Silent heartbeat check. Call periodically (e.g. every 14 days).
    Sends product_id so the server can also validate product binding.
    Returns dict with ok=True if license is still valid.
    """
    lock = _load_lock()
    if not lock:
        return {"ok": False, "error": "not_activated"}

    # Verify the stored lock is for this product
    stored_product = lock.get("product_id")
    if stored_product and stored_product != PRODUCT_ID:
        _clear_lock()
        return {"ok": False, "error": "product_mismatch",
                "needs_activation": True}

    code, resp = _api_call("/api/license/verify", {
        "license_key": lock["license_key"],
        "machine_id": lock["machine_id"],
        "product_id": PRODUCT_ID,
    })

    if code == 200 and resp.get("valid"):
        lock["last_verified"] = time.time()
        _save_lock(lock)
        return {"ok": True}

    # License revoked or banned
    if code in (403, 404):
        _clear_lock()
        return {"ok": False, "error": resp.get("error", "revoked")}

    # Network error — allow offline grace
    if code == 0:
        last_v = lock.get("last_verified", lock.get("activated_at", 0))
        days_offline = (time.time() - last_v) / 86400
        if days_offline <= OFFLINE_GRACE_DAYS:
            return {"ok": True, "offline": True, "days_offline": round(days_offline, 1)}
        _clear_lock()
        return {"ok": False, "error": "offline_expired"}

    return {"ok": False, "error": resp.get("error", f"status_{code}")}


def deactivate_online() -> dict:
    """Deactivate this machine (free up the license slot)."""
    lock = _load_lock()
    if not lock:
        return {"ok": False, "error": "not_activated"}

    code, resp = _api_call("/api/license/deactivate", {
        "license_key": lock["license_key"],
        "machine_id": lock["machine_id"],
    })

    _clear_lock()

    if code == 200:
        return {"ok": True, "message": "Machine deactivated."}
    return {"ok": False, "error": resp.get("error", f"status_{code}")}


def activate_or_verify() -> dict:
    """
    High-level check used at app startup:
      • If not activated → return needs_activation=True
      • If activated for wrong product → clear & re-activate
      • If activated → try heartbeat (if due) → return ok
    """
    lock = _load_lock()
    if not lock or (not lock.get("mk_enc") and not lock.get("master_key")):
        return {"ok": False, "needs_activation": True}

    # If the stored product_id doesn't match, require re-activation
    stored_product = lock.get("product_id")
    if stored_product and stored_product != PRODUCT_ID:
        _clear_lock()
        return {"ok": False, "needs_activation": True,
                "message": "This license was activated for a different application. "
                           "Please enter a license key for this product."}

    # Check if heartbeat is due
    last_v = lock.get("last_verified", lock.get("activated_at", 0))
    days_since = (time.time() - last_v) / 86400

    if days_since >= HEARTBEAT_INTERVAL_DAYS:
        result = verify_online()
        if not result["ok"] and result.get("error") != "offline_expired":
            # Still within grace period — allow
            if result.get("offline"):
                return {"ok": True, "offline": True}
        return result

    return {"ok": True}
