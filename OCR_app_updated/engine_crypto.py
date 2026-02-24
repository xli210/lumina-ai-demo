"""
Shared encryption / decryption helpers for OCR Engine model protection.
Uses AES-256-GCM with PBKDF2 key derivation from a license key string.

Encrypted archive layout (.engine_enc/):
    v.dat          – encrypted verification token (license check)
    manifest.dat   – encrypted JSON mapping {obfuscated_name: original_relative_path}
    f001.dat       – encrypted model file
    f002.dat       – encrypted model file
    ...

File format (each .dat):
    [16 bytes salt] [4 bytes num_chunks BE]
    For each chunk:
        [4 bytes ciphertext_len BE] [12 bytes nonce] [ciphertext + 16 bytes GCM tag]
"""
from __future__ import annotations

import json
import os
import struct
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

CHUNK_SIZE = 64 * 1024 * 1024  # 64 MB per chunk
VERIFY_PLAINTEXT = b"OCR_ENGINE_LICENSE_OK"
KDF_ITERATIONS = 480_000
VERIFY_FILE = "v.dat"
MANIFEST_FILE = "manifest.dat"


def derive_key(license_key: str, salt: bytes) -> bytes:
    """Derive a 256-bit AES key from a license string + salt."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=KDF_ITERATIONS,
    )
    return kdf.derive(license_key.encode("utf-8"))


# ── Encrypt / decrypt primitives ────────────────────────────

def encrypt_bytes(data: bytes, dst_path: str, license_key: str) -> None:
    """Encrypt raw bytes → file on disk."""
    salt = os.urandom(16)
    key = derive_key(license_key, salt)
    aesgcm = AESGCM(key)

    chunks: list[tuple[bytes, bytes]] = []
    for i in range(0, max(len(data), 1), CHUNK_SIZE):
        chunk = data[i : i + CHUNK_SIZE]
        if not chunk:
            break
        nonce = os.urandom(12)
        ct = aesgcm.encrypt(nonce, chunk, None)
        chunks.append((nonce, ct))
    if not chunks:
        nonce = os.urandom(12)
        ct = aesgcm.encrypt(nonce, b"", None)
        chunks.append((nonce, ct))

    os.makedirs(os.path.dirname(dst_path) or ".", exist_ok=True)
    with open(dst_path, "wb") as f:
        f.write(salt)
        f.write(struct.pack(">I", len(chunks)))
        for nonce, ct in chunks:
            f.write(struct.pack(">I", len(ct)))
            f.write(nonce)
            f.write(ct)


def encrypt_file(src_path: str, dst_path: str, license_key: str) -> None:
    """Encrypt a file on disk → encrypted file on disk."""
    with open(src_path, "rb") as f:
        data = f.read()
    encrypt_bytes(data, dst_path, license_key)


def decrypt_file(enc_path: str, dst_path: str, license_key: str) -> None:
    """Decrypt a .dat file → plaintext file on disk."""
    with open(enc_path, "rb") as f:
        salt = f.read(16)
        (num_chunks,) = struct.unpack(">I", f.read(4))
        key = derive_key(license_key, salt)
        aesgcm = AESGCM(key)

        os.makedirs(os.path.dirname(dst_path) or ".", exist_ok=True)
        with open(dst_path, "wb") as out:
            for _ in range(num_chunks):
                (ct_len,) = struct.unpack(">I", f.read(4))
                nonce = f.read(12)
                ct = f.read(ct_len)
                out.write(aesgcm.decrypt(nonce, ct, None))


def decrypt_to_bytes(enc_path: str, license_key: str) -> bytes:
    """Decrypt a .dat file and return raw bytes."""
    with open(enc_path, "rb") as f:
        salt = f.read(16)
        (num_chunks,) = struct.unpack(">I", f.read(4))
        key = derive_key(license_key, salt)
        aesgcm = AESGCM(key)
        parts = []
        for _ in range(num_chunks):
            (ct_len,) = struct.unpack(">I", f.read(4))
            nonce = f.read(12)
            ct = f.read(ct_len)
            parts.append(aesgcm.decrypt(nonce, ct, None))
        return b"".join(parts)


# ── High-level helpers ──────────────────────────────────────

def verify_license(enc_dir: str, license_key: str) -> bool:
    """Quick check: decrypt v.dat and confirm the license key is correct."""
    vpath = os.path.join(enc_dir, VERIFY_FILE)
    if not os.path.isfile(vpath):
        return False
    try:
        return decrypt_to_bytes(vpath, license_key) == VERIFY_PLAINTEXT
    except Exception:
        return False


def read_manifest(enc_dir: str, license_key: str) -> dict[str, str]:
    """Decrypt and parse the manifest: {obfuscated_name: original_rel_path}."""
    mpath = os.path.join(enc_dir, MANIFEST_FILE)
    raw = decrypt_to_bytes(mpath, license_key)
    return json.loads(raw.decode("utf-8"))


def decrypt_engine(enc_dir: str, tmp_dir: str, license_key: str) -> str:
    """
    Decrypt the full encrypted engine to tmp_dir.
    Returns tmp_dir (ready to use as model path).
    """
    manifest = read_manifest(enc_dir, license_key)
    for obfuscated, original_rel in manifest.items():
        enc_path = os.path.join(enc_dir, obfuscated)
        dst_path = os.path.join(tmp_dir, original_rel)
        decrypt_file(enc_path, dst_path, license_key)
    return tmp_dir
