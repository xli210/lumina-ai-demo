"""Finishing a free render through the gateway, with RunPod and storage replaced by fakes.

    python test_free_finish.py        (needs fastapi, pydantic, boto3, httpx, Pillow)
    python test_free_finish.py out.png   also writes the finished sample, to look at

What it pins down:
  * `?finish=free` on a finished job answers "running" until the free version
    is in storage, then `done` with `free_finished: true`;
  * the stored PNG is at most FREE_MAX_SIDE on its longer side, carries the
    marker, the AI-generated description and the IPTC XMP, and differs from
    the worker's only in the bottom-right corner (the small mark);
  * an already finished PNG is not finished twice;
  * a status without `?finish=free` is exactly as before (no free_finished);
  * a finish that keeps failing becomes an ordinary error.
"""

import io
import os
import sys
import time

for key, value in {
    "RUNPOD_API_KEY": "test", "RUNPOD_ENDPOINT_ID": "ep", "FACESTUDIO_GATEWAY_TOKEN": "tok",
    "S3_BUCKET": "bucket", "S3_ACCESS_KEY_ID": "id", "S3_SECRET_ACCESS_KEY": "secret",
}.items():
    os.environ.setdefault(key, value)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

HEADERS = {"Authorization": "Bearer tok"}
JOB = "0123456789abcdef-free"
KEY = f"{server.S3_OUTPUT_PREFIX}/{JOB}.png"


class FakeS3:
    def __init__(self):
        self.objects: dict[str, bytes] = {}
        self.puts = 0
        self.fail = False

    def get_object(self, Bucket, Key):
        if self.fail:
            raise RuntimeError("storage down")
        return {"Body": io.BytesIO(self.objects[Key])}

    def put_object(self, Bucket, Key, Body, ContentType):
        assert ContentType == "image/png"
        self.puts += 1
        self.objects[Key] = Body


s3 = FakeS3()
server.S3 = s3
server.runpod = lambda method, path, body=None, timeout=60, **_kw: {
    "status": "COMPLETED", "delayTime": 100, "executionTime": 2000,
    "output": {"ok": True, "output_url": "https://r2/x.png"},
}
client = TestClient(server.app)


def check(name, cond):
    print(("ok   " if cond else "FAIL ") + name)
    if not cond:
        check.failed += 1


check.failed = 0


def sample(w, h) -> bytes:
    img = Image.new("RGB", (w, h), (120, 90, 70))
    d = ImageDraw.Draw(img)
    for i in range(0, w, 40):
        d.line([(i, 0), (i, h)], fill=(140 + i % 60, 100, 80), width=3)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def status(finish=True, job=JOB):
    url = f"/v5/api/status/{job}" + ("?finish=free" if finish else "")
    return client.get(url, headers=HEADERS).json()


def wait_done(job=JOB):
    st = status(job=job)
    for _ in range(100):
        if st.get("status") != "running":
            break
        time.sleep(0.05)
        st = status(job=job)
    return st


original = sample(3000, 2000)
s3.objects[KEY] = original

first = status()
check("first poll after the worker finished says running (finishing)",
      first.get("status") == "running" and first.get("finishing") is True)
st = wait_done()
check("then done with free_finished", st.get("status") == "done" and st.get("free_finished") is True)
check("stored once", s3.puts == 1)

out = Image.open(io.BytesIO(s3.objects[KEY]))
check("longer side capped at 1536", max(out.size) == 1536 and out.size == (1536, 1024))
check("marker chunk", out.text.get(server.FREE_MARKER_KEY) == "1")
check("AI-generated description", "AI-generated" in out.text.get("Description", ""))
check("IPTC trainedAlgorithmicMedia in XMP", "trainedAlgorithmicMedia" in out.text.get("XML:com.adobe.xmp", ""))

# The mark sits in the bottom-right corner only.
ref = Image.open(io.BytesIO(original)).convert("RGB").resize(out.size, Image.LANCZOS).load()
got = out.convert("RGB").load()
diff = [(x, y) for y in range(0, out.size[1], 4) for x in range(0, out.size[0], 4)
        if sum(abs(a - b) for a, b in zip(got[x, y], ref[x, y])) > 30]
xs = [x for x, _ in diff]
ys = [y for _, y in diff]
check("something was drawn", len(diff) > 20)
check("only in the bottom-right corner",
      bool(diff) and min(xs) > out.size[0] * 0.75 and min(ys) > out.size[1] * 0.9)

# Finishing an already finished PNG is a no-op.
check("already finished -> None", server.finish_free_png(s3.objects[KEY]) is None)
server._free_done.discard(JOB)
st = wait_done()
check("a restarted instance re-checks and does not store again", st.get("free_finished") is True and s3.puts == 1)

# A small render is not enlarged.
small = Image.open(io.BytesIO(server.finish_free_png(sample(900, 1200))))
check("smaller than the cap keeps its size", small.size == (900, 1200))

# Without ?finish=free nothing changes.
plain = status(finish=False)
check("plain status: done, no free_finished", plain.get("status") == "done" and "free_finished" not in plain)

# Storage failing three times is an error the caller can refund on.
s3.fail = True
for _ in range(server.FREE_FINISH_ATTEMPTS + 1):
    st = wait_done(job="failing-job-1234")
check("repeated failure -> error finish_failed",
      st.get("status") == "error" and st.get("error_code") == "finish_failed")

if len(sys.argv) > 1:
    open(sys.argv[1], "wb").write(s3.objects[KEY])

sys.exit(1 if check.failed else 0)
