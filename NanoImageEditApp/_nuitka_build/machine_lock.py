"""
Online License Activation — machine-lock module.

Handles:
  • Hardware fingerprinting (weighted machine_id)
  • Online activation via your web backend (/api/license/activate)
  • Secure master-key delivery (AES-256-GCM transport encryption)
  • Local .machine_lock storage (master key protected by DPAPI)
  • Online verification (heartbeat) & deactivation

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
import struct
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
_SRV = [0x68,0x74,0x74,0x70,0x73,0x3a,0x2f,0x2f,0x6c,0x75,0x6d,0x69,
        0x6e,0x61,0x2d,0x61,0x69,0x2d,0x64,0x65,0x6d,0x6f,0x2e,0x76,
        0x65,0x72,0x63,0x65,0x6c,0x2e,0x61,0x70,0x70]
SERVER_URL = os.environ.get(
    "OCR_LICENSE_SERVER",
    bytes(_SRV).decode(),
)
PRODUCT_ID = "nano-imageedit"
OFFLINE_GRACE_DAYS = 30
HEARTBEAT_INTERVAL_DAYS = 14

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
# Local lock-file helpers  (master_key is DPAPI-protected on disk)
# ---------------------------------------------------------------------------
def _dpapi_entropy() -> bytes:
    """Per-machine entropy so DPAPI blob can't be copied to another account."""
    return hashlib.sha256(
        (_get_machine_id() + ":dpapi-entropy").encode()
    ).digest()[:16]


def _save_lock(data: dict) -> None:
    from key_vault import protect

    data["saved_at"] = time.time()
    raw_key = data.pop("master_key", None)
    if raw_key:
        data["master_key_enc"] = protect(raw_key, entropy=_dpapi_entropy())
    data.pop("master_key", None)

    with open(LOCK_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _load_lock() -> dict | None:
    if not os.path.isfile(LOCK_FILE):
        return None
    try:
        with open(LOCK_FILE, "r") as f:
            data = json.load(f)
        if data.get("master_key_enc"):
            from key_vault import unprotect
            data["master_key"] = unprotect(
                data["master_key_enc"], entropy=_dpapi_entropy()
            )
        return data
    except Exception:
        return None


def _clear_lock() -> None:
    if os.path.isfile(LOCK_FILE):
        try:
            with open(LOCK_FILE, "rb+") as f:
                length = f.seek(0, 2)
                f.seek(0)
                f.write(b"\x00" * length)
                f.flush()
                os.fsync(f.fileno())
        except Exception:
            pass
        os.remove(LOCK_FILE)


def is_activated() -> bool:
    """Check if a valid .machine_lock file exists with a protected master key."""
    lock = _load_lock()
    return bool(lock and lock.get("master_key"))


def get_master_key() -> str | None:
    """Return the stored master decryption key (decrypted via DPAPI), or None."""
    lock = _load_lock()
    if lock:
        return lock.get("master_key")
    return None


# ---------------------------------------------------------------------------
# Transport-key decryption  (mirrors server-side encryptMasterKey)
# ---------------------------------------------------------------------------
_TK_SALT = bytes([0x4e,0x49,0x45,0x2d,0x74,0x72,0x61,0x6e,0x73,0x70,
                  0x6f,0x72,0x74,0x2d,0x76,0x32])
_TK_PEPPER = bytes([0xc7,0x3a,0x91,0xf2,0x5d,0x0b,0xe8,0x44,
                    0xa6,0x19,0x7c,0xd3,0x8e,0x52,0xb1,0x6f])


def _derive_transport_key(machine_id: str) -> bytes:
    """
    Derive the transport key from machine_id + embedded pepper.
    Must match the server-side derivation exactly.
    """
    raw = _TK_SALT + machine_id.encode() + _TK_PEPPER
    return hashlib.sha256(raw).digest()


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

    secret = _derive_transport_key(machine_id)
    aesgcm = AESGCM(secret)

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

        _save_lock({
            "license_key": license_key.strip().upper(),
            "machine_id": machine_id,
            "license_id": resp.get("license_id"),
            "product_id": resp.get("product_id"),
            "master_key": master_key,
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
    Returns dict with ok=True if license is still valid.
    """
    lock = _load_lock()
    if not lock:
        return {"ok": False, "error": "not_activated"}

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
        "product_id": PRODUCT_ID,
    })

    _clear_lock()

    if code == 200:
        return {"ok": True, "message": "Machine deactivated."}
    return {"ok": False, "error": resp.get("error", f"status_{code}")}


def activate_or_verify() -> dict:
    """
    High-level check used at app startup:
      • If not activated → return needs_activation=True
      • If activated → try heartbeat (if due) → return ok
    """
    lock = _load_lock()
    if not lock or not lock.get("master_key"):
        return {"ok": False, "needs_activation": True}

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
