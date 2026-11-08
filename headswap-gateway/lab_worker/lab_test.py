"""Test from the lab box, no GPU: put HeadSwap jobs into the queue as the gateway would and follow them.

    docker run --rm --env-file hs0.env --env-file secrets.env -e HS_LAB_PREFIX=... -v lab:/lab -v inputs:/in headswap-studio python3.10 /lab/lab_test.py PHOTO HEAD [variations]
Images go inline (base64), so nothing is uploaded for the test. Prints each state change and the final output (without links).
"""
import base64
import json
import os
import sys
import time

sys.path.insert(0, "/lab")
import boto3  # noqa: E402
import remote_queue  # noqa: E402

s3 = boto3.client("s3", endpoint_url=os.environ["WEIGHTS_S3_ENDPOINT"], region_name="auto")
q = remote_queue.Queue(s3, os.environ["OUTPUT_S3_BUCKET"], os.environ.get("HS_LAB_PREFIX", "headswap/labq"))
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()  # noqa: E731
hb = q.heartbeat()
print("heartbeat", {k: v for k, v in hb.items() if k != "pipelines"})
jobs = [("detect", {"action": "detect", "photo": b64(sys.argv[1])}),
        ("swap", {"action": "swap", "photo": b64(sys.argv[1]), "head": b64(sys.argv[2]), "variations": int(sys.argv[3]) if len(sys.argv) > 3 else 1,
                  "seed": 7, "watermark": False, "request_id": "lab-test"})]
for name, inp in jobs:
    t0 = time.time()
    jid = q.submit(inp)
    last = None
    while True:
        st = q.status(jid)
        s = st.get("status")
        out = st.get("output") if isinstance(st.get("output"), dict) else {}
        line = (s, out.get("phase"), out.get("variation"), out.get("step"))
        if line != last:
            print(f"{time.time() - t0:6.1f}s {name} {jid} {line}", flush=True)
            last = line
        if s in ("COMPLETED", "FAILED", "CANCELLED"):
            break
        if s == "IN_QUEUE" and time.time() - t0 > 600:
            print("not taken in 600 s"); q.cancel(jid); break
        time.sleep(1)
    if isinstance(out, dict):
        out = {k: v for k, v in out.items() if k not in ("before_url",)}
        for r in out.get("results") or []:
            r.pop("url", None)
    print(name, "total", round(time.time() - t0, 1), "s:", json.dumps(out if s == "COMPLETED" else st, default=str)[:3000], flush=True)
