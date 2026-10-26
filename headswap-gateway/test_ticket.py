"""Checks for the swap-ticket gate and the direct-upload flow: python test_ticket.py
(needs fastapi, httpx, boto3, requests, python-multipart)

No network: the RunPod and R2 calls are replaced, and the environment is filled with dummy values before the app is imported.
"""
import base64
import hashlib
import hmac
import json
import os
import time
from urllib.parse import parse_qs, urlsplit

os.environ.update(
    RUNPOD_API_KEY="x", RUNPOD_ENDPOINT_ID="e", R2_BUCKET="b", R2_ENDPOINT="https://example.invalid",
    R2_ACCESS_KEY_ID="k", R2_SECRET_ACCESS_KEY="s", HS_ENTITLEMENT_SECRET="secret", HS_TICKET_REQUIRED="1",
    HS_WATERMARK_MODE="credits", HS_SWAPS_PER_HOUR="1000", HS_UPLOADS_PER_HOUR="1000", HS_PHOTOS_PER_HOUR="1000",
)
import app as gw  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

gw.link = lambda *a, **k: "https://example.invalid/x"
SENT = []
gw.rp_run = lambda inp: (SENT.append(inp), "job-%d" % len(SENT))[1]
STORED = {}      # object key -> size: what "arrived" in R2


class FakeS3:
    def __init__(self, real):
        self.real = real

    def head_object(self, Bucket, Key):
        if Key not in STORED:
            raise RuntimeError("404")
        return {"ContentLength": STORED[Key]}

    def delete_object(self, Bucket, Key):
        STORED.pop(Key, None)

    def __getattr__(self, name):
        return getattr(self.real, name)


gw.s3 = FakeS3(gw.s3)
client = TestClient(gw.app)
fails = []


def check(name, cond):
    print(("ok   " if cond else "FAIL ") + name)
    if not cond:
        fails.append(name)


def b64(d):
    return base64.urlsafe_b64encode(json.dumps(d, separators=(",", ":")).encode()).decode().rstrip("=")


def ticket(hold="h1", n=2, paid=False, exp=None, secret="secret", ver="t1", uid="u1"):
    p = b64({"uid": uid, "hold": hold, "n": n, "paid": paid, "exp": int(time.time()) + 600 if exp is None else exp})
    return f"{ver}.{p}." + hmac.new(secret.encode(), f"{ver}.{p}".encode(), hashlib.sha256).hexdigest()


def ent(uid="u1", paid=False):
    p = b64({"uid": uid, "paid": paid, "exp": int(time.time()) + 600})
    return f"v1.{p}." + hmac.new(b"secret", f"v1.{p}".encode(), hashlib.sha256).hexdigest()


def upload(kind, uid="u1", size=3, arrive=True, ctype="image/png"):
    """Ask for an upload link; when `arrive`, pretend the browser PUT the file. -> the key (or the response)."""
    r = client.post("/api/upload-url", json={"kind": kind, "content_type": ctype, "size": size}, headers={"X-HS-Entitlement": ent(uid)})
    if r.status_code != 200:
        return r
    key = r.json()["key"]
    if arrive:
        STORED[key] = size
    return key


def photo_key(uid="u1"):
    return upload("photo", uid)


def new_photo():
    r = client.post("/api/photo", data={"key": photo_key()}, headers={"X-HS-Entitlement": ent()})
    assert r.status_code == 200, r.text
    pid = r.json()["id"]
    gw.PHOTOS[pid].update(faces=[{"box": [0, 0, 1, 1]}], width=10, height=10, default_face=0)
    return pid


def swap(headers=None, n=1, head_key=None):
    return client.post("/api/swap", data={"photo_id": new_photo(), "face": 0, "variations": n, "head_key": head_key or upload("head")},
                       headers=headers or {})


# ---- tickets
r = swap()
check("no ticket -> 402", r.status_code == 402 and not any(i.get("action") == "swap" for i in SENT))
r = swap({"X-HS-Ticket": ticket(secret="wrong")})
check("bad signature -> 402", r.status_code == 402)
r = swap({"X-HS-Ticket": ticket(exp=int(time.time()) - 5)})
check("expired -> 402", r.status_code == 402)
r = swap({"X-HS-Ticket": ticket(ver="v1")})
check("wrong version -> 402", r.status_code == 402)
r = swap({"X-HS-Ticket": ticket(n=1)}, n=2)
check("more images than reserved -> 402", r.status_code == 402)
swaps = lambda: [i for i in SENT if i.get("action") == "swap"]
r = swap({"X-HS-Ticket": ticket(hold="a", n=2)}, n=2)
check("valid ticket -> 200", r.status_code == 200 and len(swaps()) == 1 and r.json()["variations"] == 2)
check("never-purchased ticket -> watermark asked of the worker", swaps()[0]["watermark"] is True and r.json()["watermark"] is True)
r = swap({"X-HS-Ticket": ticket(hold="a", n=2)}, n=1)
check("same ticket twice -> 409", r.status_code == 409 and len(swaps()) == 1)
r = swap({"X-HS-Ticket": ticket(hold="b", n=1, paid=True)})
check("paid ticket -> no watermark", r.status_code == 200 and swaps()[-1]["watermark"] is False)
r = swap({"X-HS-Ticket": ticket(hold="c", n=4), "X-HS-Entitlement": "junk"}, n=1)
check("ticket's paid flag decides, not the entitlement header", r.status_code == 200 and swaps()[-1]["watermark"] is True)

# ---- direct uploads
r = client.post("/api/upload-url", json={"kind": "photo", "content_type": "image/png", "size": 3})
check("upload link without a sign-in token -> 401", r.status_code == 401)
r = client.post("/api/upload-url", json={"kind": "photo", "content_type": "image/png", "size": 3}, headers={"X-HS-Entitlement": ent()})
j = r.json()
q = parse_qs(urlsplit(j.get("url", "")).query)
check("upload link issued", r.status_code == 200 and j["key"].endswith("_photo") and j["headers"] == {"Content-Type": "image/png"})
check("link is a PUT presigned for this exact size and type", "content-length" in q.get("X-Amz-SignedHeaders", [""])[0] and "content-type" in q.get("X-Amz-SignedHeaders", [""])[0])
for bad, why in [({"kind": "video", "content_type": "image/png", "size": 3}, "kind"),
                 ({"kind": "photo", "content_type": "text/html", "size": 3}, "type"),
                 ({"kind": "photo", "content_type": "image/png", "size": 0}, "zero size"),
                 ({"kind": "photo", "content_type": "image/png", "size": "9"}, "size not a number"),
                 ({"kind": "photo", "content_type": "image/png", "size": gw.MAX_UPLOAD + 1}, "too large")]:
    r = client.post("/api/upload-url", json=bad, headers={"X-HS-Entitlement": ent()})
    check("upload link refused: " + why, r.status_code in (400, 413))

r = client.post("/api/photo", data={"key": "headswap/input/20260101/" + "0" * 32 + "_photo"}, headers={"X-HS-Entitlement": ent()})
check("a key this server never issued -> 400", r.status_code == 400)
k = upload("photo", arrive=False)
r = client.post("/api/photo", data={"key": k}, headers={"X-HS-Entitlement": ent()})
check("upload that never arrived -> 400", r.status_code == 400)
k = upload("head")
r = client.post("/api/photo", data={"key": k}, headers={"X-HS-Entitlement": ent()})
check("a head key used as a photo -> 400", r.status_code == 400)
k = upload("photo", uid="u1")
r = client.post("/api/photo", data={"key": k}, headers={"X-HS-Entitlement": ent("someone-else")})
check("someone else's upload -> 403", r.status_code == 403)
k = upload("photo", size=gw.MAX_UPLOAD)
STORED[k] = gw.MAX_UPLOAD + 5            # the browser sent more than it declared
r = client.post("/api/photo", data={"key": k}, headers={"X-HS-Entitlement": ent()})
check("object larger than allowed -> 413 and removed", r.status_code == 413 and k not in STORED)
r = client.post("/api/photo", files={"file": ("p.png", b"123", "image/png")}, headers={"X-HS-Entitlement": ent()})
check("file bytes through the server are refused while tickets are required", r.status_code == 400)
r = client.post("/api/photo", data={"key": photo_key()}, headers={"X-HS-Entitlement": ent()})
check("photo by key -> 200 and detection started", r.status_code == 200 and any(i.get("action") == "detect" for i in SENT))
r = client.post("/api/photo", data={"key": photo_key()})
check("photo without a sign-in token -> 401", r.status_code == 401)
r = client.get("/api/health")
check("health reports the switches", r.json().get("ticket_required") is True and r.json().get("file_uploads") is False)

print("\n%d failed" % len(fails) if fails else "\nall passed")
raise SystemExit(1 if fails else 0)
