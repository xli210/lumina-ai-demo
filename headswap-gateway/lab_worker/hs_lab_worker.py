"""HeadSwap Pro on a lab card that is not ours: the RunPod handler (/app/runpod_handler.py of the headswap-studio image), fed from the bucket queue (remote_queue.py, prefix
headswap/labq) instead of by RunPod, and only while nobody else wants the card.

    docker run ... --gpus '"device=<GPU 0 uuid>"' --pid=host ... headswap-studio:<tag> python3.10 -u /lab/hs_lab_worker.py      (see run_gpu0.sh)

The card belongs to another researcher, who lets us use it while it is idle:
  - Until the card has no process of anybody else's, the host has HS_LAB_LOAD_MIN_GB available and the video worker on the other card is not busy, nothing touches the GPU
    (no CUDA context, no weights read): the heartbeat says paused, so the gateway sends every job to RunPod.
  - Once loaded, a process of anybody else's on the card ends this worker at once (exit 3): a job it was running is reported FAILED, which the gateway answers by sending the
    same job to RunPod; the card is free again within a few seconds; docker --restart brings the worker back up cold, to wait again.
  - The video worker on the other card starts a job: no new jobs, the one running is finished, and this worker ends, so that its memory is back before the video needs it
    (a head swap reaches about 55 GB of the host's 62). It comes back up cold and loads again once the video worker has been quiet for HS_LAB_VIDEO_QUIET_S.
  - Host memory below HS_LAB_PAUSE_MIN_GB: paused (no new jobs); below HS_LAB_EXIT_MIN_GB: exit as above, so a video job on the other card never runs short because of us.
  - HS_LAB_PIN=0 (default): the transformer is streamed from the memory-mapped weight files (page cache, which the kernel takes back when anybody needs it) instead of being
    copied into ~28 GB of pinned memory, which nobody could take back.
Off switch: the object headswap/labq/disabled (the gateway then sends nothing here) or `docker stop hs-gpu0`.

Settings (env): HS_LAB_PREFIX=headswap/labq  HS_LAB_LOAD_MIN_GB=14  HS_LAB_PAUSE_MIN_GB=8  HS_LAB_EXIT_MIN_GB=4  HS_LAB_PIN=0  HS_LAB_VIDEO_PREFIX=jobq (the video worker's
queue, read only: its heartbeat's "busy")  HS_LAB_VIDEO_QUIET_S=60  HS_LAB_IDLE_EXIT_S=0 (above 0: give the card back after this long without a job).
"""
import json
import os
import subprocess
import sys
import threading
import time

sys.path.insert(0, "/app")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import remote_queue  # noqa: E402

PREFIX = os.environ.get("HS_LAB_PREFIX", "headswap/labq")
LOAD_MIN_GB = float(os.environ.get("HS_LAB_LOAD_MIN_GB", "14"))
PAUSE_MIN_GB = float(os.environ.get("HS_LAB_PAUSE_MIN_GB", "8"))
EXIT_MIN_GB = float(os.environ.get("HS_LAB_EXIT_MIN_GB", "4"))
VIDEO_PREFIX = os.environ.get("HS_LAB_VIDEO_PREFIX", "jobq")
VIDEO_QUIET_S = float(os.environ.get("HS_LAB_VIDEO_QUIET_S", "60"))
VIDEO_YIELD = os.environ.get("HS_LAB_VIDEO_YIELD", "1") != "0"     # 0: run beside a video job, and leave only for the host's memory
IDLE_EXIT_S = float(os.environ.get("HS_LAB_IDLE_EXIT_S", "0"))
PIPELINES = ["headswap"]


def log(msg):
    print(f"[lab-worker] {time.strftime('%H:%M:%S')} {msg}", flush=True)


# ------------------------------------------------------------------ the environment the handler expects (the RunPod template's), from the video worker's files
def _env():
    e = os.environ
    e.setdefault("OUTPUT_S3_ACCESS_KEY_ID", e.get("AWS_ACCESS_KEY_ID", ""))
    e.setdefault("OUTPUT_S3_SECRET_ACCESS_KEY", e.get("AWS_SECRET_ACCESS_KEY", ""))
    e.setdefault("OUTPUT_S3_ENDPOINT", e.get("WEIGHTS_S3_ENDPOINT", ""))
    e.setdefault("OUTPUT_S3_REGION", "auto")
    e["HS_RECYCLE_SLOW"] = "0"              # RunPod's slow-host recycling means nothing here


# ------------------------------------------------------------------ is the card ours to use right now?
def _tree(root):
    """Host pids of this process and its descendants (the container runs with --pid=host, so nvidia-smi's pids are comparable)."""
    kids = {}
    for p in os.listdir("/proc"):
        if p.isdigit():
            try:
                ppid = int(open(f"/proc/{p}/stat").read().rsplit(")", 1)[1].split()[1])
            except (OSError, IndexError, ValueError):
                continue
            kids.setdefault(ppid, []).append(int(p))
    out, todo = set(), [root]
    while todo:
        p = todo.pop()
        out.add(p)
        todo += kids.get(p, [])
    return out


def others_on_card():
    """Pids of compute processes on the card (the only one this container sees) that are not ours. None: nvidia-smi did not answer."""
    try:
        r = subprocess.run(["nvidia-smi", "--query-compute-apps=pid", "--format=csv,noheader,nounits"], capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return None
    if r.returncode != 0:
        return None
    pids = {int(x) for x in r.stdout.split() if x.strip().isdigit()}
    return sorted(pids - _tree(os.getpid()))


def mem_available_gb():
    mi = dict((l.split(":")[0], int(l.split()[1])) for l in open("/proc/meminfo"))
    return mi["MemAvailable"] / 1024 ** 2


class Gate:
    """What the card, the host and the video worker say, read at most every few seconds."""

    def __init__(self, video_queue):
        self.video, self.cache, self.t = video_queue, {}, 0.0
        self.video_seen = time.time()                       # when the video worker was last seen busy (a start counts: what it was doing before is not known)

    def video_busy(self):
        if not VIDEO_YIELD:
            return False
        try:
            hb = self.video.heartbeat()
            return bool(hb.get("busy")) and hb.get("alive_s") is not None and hb["alive_s"] < 120
        except Exception:                                   # noqa: BLE001  cannot tell: assume busy (the safe side)
            return True

    def read(self, max_age=3.0):
        if time.time() - self.t > max_age:
            self.cache = {"others": others_on_card(), "mem_gb": round(mem_available_gb(), 1), "video_busy": self.video_busy()}
            self.t = time.time()
            if self.cache["video_busy"]:
                self.video_seen = self.t
        return self.cache

    def video_quiet_why(self):
        """None once the video worker has been quiet long enough to be worth loading for; a job right after another would only load to leave again."""
        self.read()
        left = VIDEO_QUIET_S - (time.time() - self.video_seen)
        return None if left <= 0 else "waiting for the video worker to stay quiet"

    def why_not(self, min_gb):
        """None when a job may start; otherwise the reason."""
        g = self.read()
        if g["others"] is None:
            return "the card does not answer"
        if g["others"]:
            return f"the card is in use by pid {','.join(map(str, g['others']))}"
        if g["mem_gb"] < min_gb:
            return f"host memory: {g['mem_gb']} GB available, need {min_gb}"
        if g["video_busy"]:
            return "the video worker is busy"
        return None


# ------------------------------------------------------------------ the handler, fed by the bucket
class LabWorker(remote_queue.Worker):
    def __init__(self, queue, handler, gate, **kw):
        super().__init__(queue, handler, **kw)
        self.gate, self.last_job = gate, time.time()

    def paused(self):
        return self.job is None and self.gate.why_not(PAUSE_MIN_GB) is not None

    def beat(self):
        try:
            g = self.gate.read()
            self.queue.beat({"busy": self.job is not None, "job": self.job, "pipelines": self.pipelines, "paused": self.paused(),
                             "why": self.gate.why_not(PAUSE_MIN_GB), "mem_gb": g.get("mem_gb"), "state": "ready"})
        except Exception as exc:                            # noqa: BLE001
            self.log(f"[lab-worker] heartbeat failed: {exc!r}")

    def step(self):
        did = super().step()
        if did:
            self.last_job = time.time()
        return did


def give_back(queue, job, why):
    """Somebody else wants the card (or the host its memory): report the running job as failed, so the gateway sends it to RunPod, and end now."""
    log(f"giving the card back: {why}")
    if job:
        try:
            queue.set_state(job, "FAILED", error=json.dumps({"error_code": "handed_back", "error_message": f"lab card given back: {why}"}))
        except Exception as exc:                            # noqa: BLE001
            log(f"could not report {job}: {exc!r}")
    try:
        queue.beat({"busy": False, "job": None, "pipelines": PIPELINES, "paused": True, "why": why, "state": "exiting"})
    except Exception:                                       # noqa: BLE001
        pass
    os._exit(3)


def watchdog(queue, gate, worker):
    """Every 2 s: anybody else's process on the card, or the host nearly out of memory -> give back at once, job or no job."""
    while True:
        time.sleep(2)
        g = gate.read(max_age=1.5)
        if g["others"]:
            give_back(queue, worker.job, f"pid {','.join(map(str, g['others']))} started on the card")
        if g["mem_gb"] < EXIT_MIN_GB:
            give_back(queue, worker.job, f"host memory down to {g['mem_gb']} GB")
        if g["video_busy"] and worker.job is None:          # (a job running is finished first: paused() takes no other meanwhile)
            give_back(queue, None, "the video worker started a job")
        if IDLE_EXIT_S > 0 and worker.job is None and time.time() - worker.last_job > IDLE_EXIT_S:
            give_back(queue, None, f"no job for {IDLE_EXIT_S:.0f} s")


def main():
    import boto3
    _env()
    bucket = os.environ["OUTPUT_S3_BUCKET"]
    s3 = boto3.client("s3", endpoint_url=os.environ["WEIGHTS_S3_ENDPOINT"], region_name="auto",
                      aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"], aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"])
    queue = remote_queue.Queue(s3, bucket, PREFIX)
    gate = Gate(remote_queue.Queue(s3, bucket, VIDEO_PREFIX))

    # 1. cold: nothing on the GPU until the card, the host and the video worker allow it
    said = None
    while True:
        why = gate.why_not(LOAD_MIN_GB) or gate.video_quiet_why()
        if why is None:
            break
        if why != said:
            log(f"waiting: {why}")
            said = why
        queue.beat({"busy": False, "job": None, "pipelines": PIPELINES, "paused": True, "why": why, "state": "cold"})
        time.sleep(5)

    # 2. load (the handler's own start-up: weights check, vision helper, engine + warm-up swap), still paused for the gateway
    if os.environ.get("HS_LAB_PIN", "0") != "1":
        # fast_engine reads its paths when imported: the ones the handler's _init sets for the baked weights, set first
        d = os.environ.get("HS_WEIGHTS_DIR", "/hs_models")
        os.environ.update(HS_MODEL=f"{d}/qwen-image-2.1", HS_BUILD=f"{d}/local_build", HS_SAM3=f"{d}/sam3",
                          HS_INSIGHTFACE=f"{d}/insightface", SAPIENS_CHECKPOINT=f"{d}/sapiens/sapiens2_0.4b_seg.safetensors")
        import fast_engine

        def no_pinning(self, order):
            for m in order:
                self.mode_pinned[m].set()
            self.pin_s, self.mode_pin_s = 0.0, {}
            self.pin_done.set()
            print("fast head-swap engine: pinning skipped (HS_LAB_PIN=0): blocks stream from the memory-mapped files", flush=True)

        fast_engine.FastHeadSwap._pin_all = no_pinning
    import runpod
    import runpod_handler as rh
    t = time.time()
    stop_beat = threading.Event()

    def beat_loading():
        while not stop_beat.wait(5):
            queue.beat({"busy": False, "job": None, "pipelines": PIPELINES, "paused": True, "why": f"loading: {rh.STATE.get('phase')}", "state": "loading"})
            g = gate.read()
            if g["others"]:
                give_back(queue, None, f"pid {','.join(map(str, g['others']))} started on the card while loading")
            if g["mem_gb"] < EXIT_MIN_GB:
                give_back(queue, None, f"host memory down to {g['mem_gb']} GB while loading")
            if g["video_busy"]:
                give_back(queue, None, "the video worker started a job while loading")

    threading.Thread(target=beat_loading, daemon=True).start()
    rh._init()
    stop_beat.set()
    if rh.INIT_ERROR:
        log("start-up failed; exiting")
        give_back(queue, None, "start-up failed: " + rh.INIT_ERROR[0].strip().splitlines()[-1][:200])
    log(f"ready in {time.time() - t:.0f} s ({rh.STATE.get('phases')})")

    # 3. progress goes to the bucket instead of RunPod (at most every 2 s: the handler beats every 2 s anyway)
    def progress_update(job, data):
        queue.set_state(job["id"], "IN_PROGRESS", output=data)

    runpod.serverless.progress_update = progress_update

    def handler(job):
        t0 = time.time()
        out = rh.handler(job)
        if isinstance(out, dict) and "error" in out and out.get("ok") is None:
            raise RuntimeError(out["error"])                # a worker fault: FAILED, so the gateway sends the job to RunPod
        out.pop("refresh_worker", None)
        out["lab"] = {"exec_s": round(time.time() - t0, 2), "card": "lab-gpu0"}
        return out

    worker = LabWorker(queue, handler, gate, pipelines=PIPELINES, log=log)
    threading.Thread(target=watchdog, args=(queue, gate, worker), daemon=True).start()
    log(f"asking {bucket}/{PREFIX}/pending")
    try:
        worker.run_forever()
    except SystemExit as exc:
        log(str(exc))
        os._exit(3)


if __name__ == "__main__":
    main()
