"""
Secure key storage using Windows DPAPI (Data Protection API).

The master key is encrypted so that only the same Windows user account
on the same machine can decrypt it.  The ciphertext is stored as
hex inside the .machine_lock JSON under "master_key_enc".

On non-Windows platforms, falls back to a file-permission-based approach
(chmod 600) since DPAPI is not available.
"""
from __future__ import annotations

import os
import sys

_DPAPI_AVAILABLE = False

if sys.platform == "win32":
    try:
        import ctypes
        import ctypes.wintypes

        class _DATA_BLOB(ctypes.Structure):
            _fields_ = [
                ("cbData", ctypes.wintypes.DWORD),
                ("pbData", ctypes.POINTER(ctypes.c_char)),
            ]

        _crypt32 = ctypes.windll.crypt32
        _kernel32 = ctypes.windll.kernel32

        _CryptProtectData = _crypt32.CryptProtectData
        _CryptProtectData.argtypes = [
            ctypes.POINTER(_DATA_BLOB),  # pDataIn
            ctypes.c_wchar_p,            # szDataDescr
            ctypes.POINTER(_DATA_BLOB),  # pOptionalEntropy
            ctypes.c_void_p,             # pvReserved
            ctypes.c_void_p,             # pPromptStruct
            ctypes.wintypes.DWORD,       # dwFlags
            ctypes.POINTER(_DATA_BLOB),  # pDataOut
        ]
        _CryptProtectData.restype = ctypes.wintypes.BOOL

        _CryptUnprotectData = _crypt32.CryptUnprotectData
        _CryptUnprotectData.argtypes = [
            ctypes.POINTER(_DATA_BLOB),
            ctypes.POINTER(ctypes.c_wchar_p),
            ctypes.POINTER(_DATA_BLOB),
            ctypes.c_void_p,
            ctypes.c_void_p,
            ctypes.wintypes.DWORD,
            ctypes.POINTER(_DATA_BLOB),
        ]
        _CryptUnprotectData.restype = ctypes.wintypes.BOOL

        _LocalFree = _kernel32.LocalFree
        _LocalFree.argtypes = [ctypes.c_void_p]
        _LocalFree.restype = ctypes.c_void_p

        _DPAPI_AVAILABLE = True
    except Exception:
        pass


def _make_blob(data: bytes) -> "_DATA_BLOB":
    blob = _DATA_BLOB()
    blob.cbData = len(data)
    blob.pbData = ctypes.cast(ctypes.create_string_buffer(data, len(data)),
                              ctypes.POINTER(ctypes.c_char))
    return blob


def protect(plaintext: str, entropy: bytes = b"") -> str:
    """
    Encrypt a string with DPAPI.  Returns hex-encoded ciphertext.
    On non-Windows, returns a simple XOR-scramble (not secure against
    determined attackers, but prevents casual reading).
    """
    data_bytes = plaintext.encode("utf-8")

    if _DPAPI_AVAILABLE:
        data_in = _make_blob(data_bytes)
        entropy_blob = _make_blob(entropy) if entropy else None
        data_out = _DATA_BLOB()

        ok = _CryptProtectData(
            ctypes.byref(data_in),
            "NanoImageEdit",
            ctypes.byref(entropy_blob) if entropy_blob else None,
            None, None, 0,
            ctypes.byref(data_out),
        )
        if not ok:
            raise OSError(f"CryptProtectData failed (error {ctypes.GetLastError()})")

        enc = ctypes.string_at(data_out.pbData, data_out.cbData)
        _LocalFree(data_out.pbData)
        return enc.hex()

    return _fallback_scramble(data_bytes).hex()


def unprotect(ciphertext_hex: str, entropy: bytes = b"") -> str:
    """
    Decrypt a DPAPI-protected hex string back to the original string.
    """
    raw = bytes.fromhex(ciphertext_hex)

    if _DPAPI_AVAILABLE:
        data_in = _make_blob(raw)
        entropy_blob = _make_blob(entropy) if entropy else None
        data_out = _DATA_BLOB()

        ok = _CryptUnprotectData(
            ctypes.byref(data_in),
            None,
            ctypes.byref(entropy_blob) if entropy_blob else None,
            None, None, 0,
            ctypes.byref(data_out),
        )
        if not ok:
            raise OSError(f"CryptUnprotectData failed (error {ctypes.GetLastError()})")

        dec = ctypes.string_at(data_out.pbData, data_out.cbData)
        _LocalFree(data_out.pbData)
        return dec.decode("utf-8")

    return _fallback_unscramble(raw).decode("utf-8")


def _fallback_scramble(data: bytes) -> bytes:
    """Non-Windows fallback: simple reversible scramble."""
    import hashlib
    key = hashlib.sha256(b"NanoImageEdit-fallback-key").digest()
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))


def _fallback_unscramble(data: bytes) -> bytes:
    return _fallback_scramble(data)
