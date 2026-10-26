"""Checks for the swap-ticket gate: python test_ticket.py   (needs fastapi, httpx, boto3, requests, python-multipart)

No network: the RunPod and R2 calls are replaced, and the environment is filled with dummy values before the app is imported.
"""
import base64
import hashlib
import hmac
import json
import os
import time

os.environ.update(
    RUNPOD_API_KEY="x", RUNPOD_ENDPOINT_ID="e", R2_BUCKET="b", R2_ENDPOINT="https://example.invalid",
    R2_ACCESS_KEY_ID="k", R2_SECRET_ACCESS_KEY="s", HS_ENTITLEMENT_SECRET="secret", HS_TICKET_REQUIRED="1",
    HS_WATERMARK_MODE="credits", HS_SWAPS_PER_HOUR="1000",
)
import app as gw  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

gw.put_input = lambda data, name: "k/" + name
gw.link = lambda *a, **k: "https://example.invalid/x"
SENT = []
gw.rp_run = lambda inp: (SENT.append(inp), "job-%d" % len(SENT))[1]
client = TestClient(gw.app)
fails = []


def check(name, cond):
    print(("ok   " if cond else "FAIL ") + name)
    if not cond:
        fails.append(name)


def ticket(hold="h1", n=2, paid=False, exp=None, secret="secret", ver="t1"):
    p = base64.urlsafe_b64encode(json.dumps({"uid": "u1", "hold": hold, "n": n, "paid": paid,
                                             "exp": int(time.time()) + 600 if exp is None else exp},
                                            separators=(",", ":")).encode()).decode().rstrip("=")
    return f"{ver}.{p}." + hmac.new(secret.encode(), f"{ver}.{p}".encode(), hashlib.sha256).hexdigest()


def new_photo():
    pid = "p%d" % len(gw.PHOTOS)
    gw.PHOTOS[pid] = {"key": "k", "job": "j", "t": time.time(), "faces": [{"box": [0, 0, 1, 1]}], "width": 10, "height": 10,
                      "default_face": 0, "rid": "r", "uid": None}
    return pid


def swap(headers=None, n=1):
    return client.post("/api/swap", data={"photo_id": new_photo(), "face": 0, "variations": n},
                       files={"head": ("h.png", b"123", "image/png")}, headers=headers or {})


r = swap()
check("no ticket -> 402", r.status_code == 402 and not SENT)
r = swap({"X-HS-Ticket": ticket(secret="wrong")})
check("bad signature -> 402", r.status_code == 402 and not SENT)
r = swap({"X-HS-Ticket": ticket(exp=int(time.time()) - 5)})
check("expired -> 402", r.status_code == 402 and not SENT)
r = swap({"X-HS-Ticket": ticket(ver="v1")})
check("wrong version -> 402", r.status_code == 402 and not SENT)
r = swap({"X-HS-Ticket": ticket(n=1)}, n=2)
check("more images than reserved -> 402", r.status_code == 402 and not SENT)

r = swap({"X-HS-Ticket": ticket(hold="a", n=2)}, n=2)
check("valid ticket -> 200", r.status_code == 200 and len(SENT) == 1 and r.json()["variations"] == 2)
check("never-purchased ticket -> watermark asked of the worker", SENT[0]["watermark"] is True and r.json()["watermark"] is True)
r = swap({"X-HS-Ticket": ticket(hold="a", n=2)}, n=1)
check("same ticket twice -> 409", r.status_code == 409 and len(SENT) == 1)
r = swap({"X-HS-Ticket": ticket(hold="b", n=1, paid=True)})
check("paid ticket -> no watermark", r.status_code == 200 and SENT[-1]["watermark"] is False)
r = swap({"X-HS-Ticket": ticket(hold="c", n=4), "X-HS-Entitlement": "junk"}, n=1)
check("ticket's paid flag decides, not the entitlement header", r.status_code == 200 and SENT[-1]["watermark"] is True)
r = client.post("/api/photo", files={"file": ("p.png", b"123", "image/png")})
check("photo upload without a sign-in token -> 401", r.status_code == 401 and not any(i.get("action") == "detect" for i in SENT))
ent = lambda uid="u9", paid=False: ("v1." + base64.urlsafe_b64encode(json.dumps({"uid": uid, "paid": paid, "exp": int(time.time()) + 600}, separators=(",", ":")).encode()).decode().rstrip("=")) 
def ent_token(**kw):
    head = ent(**kw)
    return head + "." + hmac.new(b"secret", head.encode(), hashlib.sha256).hexdigest()
r = client.post("/api/photo", files={"file": ("p.png", b"123", "image/png")}, headers={"X-HS-Entitlement": ent_token()})
check("photo upload with a signed-in token -> 200", r.status_code == 200)
r = client.get("/api/health")
check("health reports the switch", r.json().get("ticket_required") is True)

print("\n%d failed" % len(fails) if fails else "\nall passed")
raise SystemExit(1 if fails else 0)
