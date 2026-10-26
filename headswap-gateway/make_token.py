"""Entitlement tokens for the HeadSwap Pro (headswap-pro) gateway: the site's backend makes one for the logged-in user and the page sends
it as the X-HS-Entitlement header. Copy `make_token` into the site's backend (or port it; a Node version is in
README.md). The secret is HS_ENTITLEMENT_SECRET, the same value on the site's backend and on the gateway.

    python make_token.py --uid user123 --paid          # print a token (for testing)
    python make_token.py --uid user123                 # a never-purchased user: results get the watermark

Token: v1.<base64url(JSON {"uid", "paid", "exp"})>.<hex HMAC-SHA256(secret, "v1.<base64url part>")>
  uid   the site's user id (shows up in the gateway and worker logs)
  paid  true if the user has EVER bought credits (balance and credit type don't matter), else false
  exp   unix time after which the gateway treats the token as missing (= watermark); 1-24 h is sensible
"""
import argparse
import base64
import hashlib
import hmac
import json
import os
import time


def make_token(secret: str, uid: str, paid: bool, ttl_s: int = 6 * 3600) -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"uid": str(uid), "paid": bool(paid), "exp": int(time.time()) + ttl_s},
                                                  separators=(",", ":")).encode()).decode().rstrip("=")
    sig = hmac.new(secret.encode(), f"v1.{payload}".encode(), hashlib.sha256).hexdigest()
    return f"v1.{payload}.{sig}"


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--uid", required=True)
    ap.add_argument("--paid", action="store_true")
    ap.add_argument("--ttl", type=int, default=6 * 3600)
    ap.add_argument("--secret", default=os.environ.get("HS_ENTITLEMENT_SECRET"))
    a = ap.parse_args()
    if not a.secret:
        raise SystemExit("set HS_ENTITLEMENT_SECRET or pass --secret")
    print(make_token(a.secret, a.uid, a.paid, a.ttl))
