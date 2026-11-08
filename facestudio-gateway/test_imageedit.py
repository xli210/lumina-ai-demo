"""Image Edit (SpotEdit) through the gateway, with RunPod and the bucket replaced by fakes.

    python test_imageedit.py          (needs fastapi, pydantic, boto3, httpx, Pillow)

What it pins down:
  * the size the price is computed from is read from the file, not told by the caller;
  * a photo over the limits never reaches the GPU;
  * the watermark is forwarded as a real true/false and is required;
  * waking a GPU is limited, per person and overall.
"""

import io
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
from PIL import Image  # noqa: E402

HEADERS = {"Authorization": "Bearer tok"}
client = TestClient(server.app)
sent: list[dict] = []
stored: dict[str, bytes] = {}
reads: list[int | None] = []


def fake_runpod(method, path, body=None, timeout=60, endpoint=None):
    assert endpoint == server.IMAGEEDIT_ENDPOINT_ID
    sent.append(body)
    return {"id": "job-12345678"}


def fake_read(url, first_bytes):
    reads.append(first_bytes)
    data = stored[url]
    return (data[:first_bytes] if first_bytes else data), len(data)


server.runpod = fake_runpod
server._ie_read = fake_read


def photo(size, fmt="JPEG", **kw):
    buf = io.BytesIO()
    Image.new("RGB", size).save(buf, fmt, **kw)
    return buf.getvalue()


def probe(data):
    stored["u"] = data
    return client.post("/ie/api/probe", headers=HEADERS, json={"url": "u"})


def run(**over):
    body = {"photo_url": "https://x/p", "prompt": "Remove it", "seed": 7, "watermark": True, "request_id": "r", "user": "u"}
    return client.post("/ie/api/run", headers=HEADERS, json={**body, **over})


def test_probe_reads_the_real_size():
    for fmt in ("JPEG", "PNG", "WEBP", "TIFF"):
        r = probe(photo((640, 480), fmt))
        assert r.status_code == 200 and r.json() == {"width": 640, "height": 480}, (fmt, r.text)


def test_probe_reads_only_the_start_of_a_big_file():
    reads.clear()
    assert probe(photo((640, 480)) + b"\0" * (5 << 20)).status_code == 200
    assert reads == [server._IE_PROBE_BYTES]


def test_probe_falls_back_to_the_whole_file_when_the_start_is_not_enough():
    reads.clear()
    # A valid-looking start only once the whole file is there: a TIFF whose directory is at the end.
    tiff = photo((640, 480), "TIFF")
    padded = tiff[:4] + (len(tiff) + server._IE_PROBE_BYTES).to_bytes(4, "little") + tiff[8:] + b"\0" * server._IE_PROBE_BYTES
    padded += tiff[int.from_bytes(tiff[4:8], "little"):]
    assert probe(padded).status_code == 200
    assert reads == [server._IE_PROBE_BYTES, None]


def test_probe_refuses_what_the_worker_cannot_take():
    assert probe(b"not an image at all").status_code == 400
    assert probe(photo((200, 800))).status_code == 400
    r = probe(photo((8000, 6200), "PNG", compress_level=1))
    assert r.status_code == 413 and "49 MP" in r.json()["detail"]
    stored["u"] = b"x"
    server_read = server._ie_read
    server._ie_read = lambda url, first: (b"x", server._IE_MAX_UPLOAD_BYTES + 1)
    try:
        assert client.post("/ie/api/probe", headers=HEADERS, json={"url": "u"}).status_code == 413
    finally:
        server._ie_read = server_read


def test_probe_accepts_exactly_the_limit():
    assert probe(photo((7000, 7000), "PNG", compress_level=1)).status_code == 200


def test_run_forwards_the_edit():
    sent.clear()
    assert run(mask="QUJD").json() == {"job_id": "job-12345678"}
    assert sent[0]["input"] == {"action": "edit", "photo": "https://x/p", "prompt": "Remove it", "seed": 7, "watermark": True,
                                "request_id": "r", "user": "u", "mask": "QUJD"}


def test_run_leaves_out_an_absent_mask():
    sent.clear()
    assert run(watermark=False).status_code == 200
    assert "mask" not in sent[0]["input"] and sent[0]["input"]["watermark"] is False


def test_run_requires_a_real_watermark_choice():
    sent.clear()
    assert run(watermark="false").status_code == 422
    assert run(watermark=None).status_code == 422
    assert sent == []


def test_run_limits_the_fields_that_grow():
    sent.clear()
    assert run(prompt="x" * 2001).status_code == 422
    assert run(prompt="").status_code == 422
    assert run(mask="x" * (server._IE_MAX_MASK_CHARS + 1)).status_code == 422
    assert sent == []


def test_routes_need_the_token():
    assert client.post("/ie/api/probe", json={"url": "u"}).status_code == 401
    assert client.post("/ie/api/warm", json={"user": "u"}).status_code == 401


def test_warm_is_limited_overall_and_per_person():
    now = [1_000_000.0]
    real_time = server.time.time
    server.time.time = lambda: now[0]
    server._ie_warm_last[0] = 0.0
    server._ie_warms.clear()
    sent.clear()
    try:
        warm = lambda u: client.post("/ie/api/warm", headers=HEADERS, json={"user": u}).json()["started"]
        assert warm("a") is True
        assert sent == [{"input": {"action": "ping"}}]
        assert warm("b") is False, "once a minute overall"
        for _ in range(5):
            now[0] += 61
            assert warm("a") is True
        now[0] += 61
        assert warm("a") is False, "six an hour for one person"
        assert warm("b") is True, "someone else still can"
        now[0] += 3700
        assert warm("a") is True, "the hour has passed"
        assert "b" not in server._ie_warms, "people who have left are forgotten"
    finally:
        server.time.time = real_time


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_")]
    for name, fn in tests:
        fn()
        print("ok", name)
    print(len(tests), "passed")
