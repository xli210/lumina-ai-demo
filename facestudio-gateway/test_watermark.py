"""The watermark option through the gateway, with RunPod replaced by a fake.

    python test_watermark.py          (needs fastapi, pydantic, boto3, httpx)

What it pins down:
  * the option is forwarded as a real true/false, for both modes, and left out
    when the caller says nothing (so old callers behave exactly as before);
  * only a real boolean is accepted (the caller sends JSON booleans);
  * a finished job reports `watermarked: true` only when the worker said so.
"""

import os
import sys

for key, value in {
    "RUNPOD_API_KEY": "test", "RUNPOD_ENDPOINT_ID": "ep", "FACESTUDIO_GATEWAY_TOKEN": "tok",
    "S3_BUCKET": "bucket", "S3_ACCESS_KEY_ID": "id", "S3_SECRET_ACCESS_KEY": "secret",
}.items():
    os.environ.setdefault(key, value)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

HEADERS = {"Authorization": "Bearer tok"}
sent: list[dict] = []
runpod_status: dict = {}


def fake_runpod(method, path, body=None, timeout=60, **_kw):
    if method == "POST" and path == "/run":
        sent.append(body["input"])
        return {"id": "job-abc-12345678"}
    if method == "GET" and path.startswith("/status/"):
        return runpod_status
    raise AssertionError((method, path))


server.runpod = fake_runpod
# Storage keys are checked for shape only; no storage is touched.
KEY = "0123456789abcdef0123456789abcdef.jpg"
client = TestClient(server.app)


def generate(extra=None, mode="face_swap"):
    sent.clear()
    body = {"detection_id": KEY, "mode": mode, "refs": {"0": KEY}, "preserve_classes_map": {"0": [1, 4]}}
    body.update(extra or {})
    r = client.post("/v5/api/generate", json=body, headers=HEADERS)
    return r


def check(name, cond):
    print(("ok   " if cond else "FAIL ") + name)
    if not cond:
        check.failed += 1


check.failed = 0

# forwarded, face swap: true and false are both explicit, preserve map kept
r = generate({"watermark": True})
check("face_swap watermark=true accepted", r.status_code == 200)
check("face_swap forwards watermark true", sent[0]["options"].get("watermark") is True)
check("face_swap keeps preserve_classes_map", sent[0]["options"].get("preserve_classes_map") == {"0": [1, 4]})
r = generate({"watermark": False})
check("face_swap forwards watermark false explicitly", sent[0]["options"].get("watermark") is False)

# head swap carries it too, and nothing else in options
r = generate({"watermark": True}, mode="head_swap")
check("head_swap forwards watermark true", r.status_code == 200 and sent[0]["options"] == {"watermark": True})

# not said: nothing forwarded, exactly the old behaviour
generate()
check("no watermark field: options unchanged (face_swap)", sent[0]["options"] == {"preserve_classes_map": {"0": [1, 4]}})
generate(mode="head_swap")
check("no watermark field: options unchanged (head_swap)", sent[0]["options"] == {})

# only real booleans; never a string, a number, or a guess
for bad in ("true", "yes", 1, "maybe", {"x": 1}):
    r = generate({"watermark": bad})
    check(f"watermark={bad!r} rejected", r.status_code == 422 and not sent)

# the token is still required
r = client.post("/v5/api/generate", json={"detection_id": KEY, "refs": {"0": KEY}, "watermark": True})
check("generate still needs the bearer token", r.status_code in (401, 403))

# a finished job says whether the worker marked it
runpod_status.clear()
runpod_status.update({"status": "COMPLETED", "delayTime": 100, "executionTime": 2000,
                      "output": {"ok": True, "watermarked": True, "output_url": "https://r2/x.png"}})
st = client.get("/v5/api/status/0123456789abcdef", headers=HEADERS).json()
check("done + worker watermarked -> watermarked true", st.get("status") == "done" and st.get("watermarked") is True)
check("worker-private fields and the url are not leaked", "output_url" not in st and "worker" not in st)

runpod_status["output"] = {"ok": True, "output_url": "https://r2/x.png"}
st = client.get("/v5/api/status/0123456789abcdef", headers=HEADERS).json()
check("done + unmarked worker -> no watermarked field", st.get("status") == "done" and "watermarked" not in st)

runpod_status["output"] = {"ok": True, "watermarked": "yes"}
st = client.get("/v5/api/status/0123456789abcdef", headers=HEADERS).json()
check("only a real true counts", "watermarked" not in st)

# a failure, including a mark that failed to apply, is an ordinary error
runpod_status.clear()
runpod_status.update({"status": "FAILED", "error": '{"error_code": "internal_error", "error_message": "x", "error_kind": "server"}'})
st = client.get("/v5/api/status/0123456789abcdef", headers=HEADERS).json()
check("FAILED job is an error with no watermarked field", st.get("status") == "error" and "watermarked" not in st)

sys.exit(1 if check.failed else 0)

