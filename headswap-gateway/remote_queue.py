"""A render queue in the bucket, for a GPU of ours that nothing outside can reach (a machine behind a VPN or a lab's firewall).

(Copied unchanged from the video studio, Matrix/swap_pipelines/remote_queue.py. HeadSwap Pro uses it with prefix headswap/labq: app.py is the studio's side, lab_worker/ the worker's.)

The studio cannot call that machine, so the machine calls out: a worker there (deploy/local_worker.py) asks the bucket every few seconds whether a job is waiting, renders it
with the very handler a RunPod worker runs (swap_handler.handler), and writes how it went. Nothing but HTTPS to the bucket leaves that machine; nothing comes in. The inputs
and the finished video are the same links the RunPod path uses, so they stay in the bucket and on no disk but the worker's scratch folder, which the handler empties.

    <prefix>/pending/<id>.json   a job waiting: {"id", "input", "t"}                       (the studio writes it; the worker removes it when it takes the job)
    <prefix>/state/<id>.json     how it stands: {"status": IN_PROGRESS | COMPLETED | FAILED | CANCELLED, "output", "error", "t"}   (the status words of RunPod's)
    <prefix>/cancel/<id>         present: the studio no longer wants it
    <prefix>/heartbeat.json      the worker, every few seconds: {"busy", "job", "pipelines", "gpu_free_mb", "paused"}; its age is the object's own LastModified (the bucket's clock)
    <prefix>/disabled            present: nothing is sent to the worker (the switch that needs no deploy: put or delete the object)

Hybrid is what the studio is given in place of remote.RunPod: it has the same four calls and chooses, for each job, the worker or RunPod. A job goes to the worker only when it is
alive, has said it can do that pipeline, and is free; otherwise it goes to RunPod at once, so nobody waits behind a long render on one card. A job the worker does not take within a
few seconds, or one it fails, is sent to RunPod too. A job still waiting at RunPod after STUDIO_LOCAL_BACK_S (no worker came up there) comes back to the worker once it is free,
and so does one RunPod started but whose log has not grown for STUDIO_LOCAL_STALL_S (a worker hung after downloading its weights, 2026-11-05, and held a Fast job for 70 minutes).

    STUDIO_LOCAL_WORKER=1           use it (unset: RunPod only, as before)
    STUDIO_LOCAL_PIPELINES=hyperswap-flash   which pipelines may go to the worker (a move is made one pipeline at a time)
    STUDIO_LOCAL_PREFIX=jobq        where in the bucket
    STUDIO_LOCAL_ALIVE_S=30         the worker counts as there when its heartbeat is younger than this
    STUDIO_LOCAL_CLAIM_S=45         a job not taken within this long goes to RunPod
    STUDIO_LOCAL_MAX_DEPTH=1        at most this many jobs at the worker (running and waiting)
    STUDIO_LOCAL_BACK_S=300         a job waiting at RunPod this long may come back to the worker
    STUDIO_LOCAL_STALL_S=600        a job running at RunPod whose log has not grown for this long may come back to the worker
"""
import json
import os
import secrets
import threading
import time
from typing import Callable, Dict, Optional

PREFIX = "jobq"
ID_MARK = "q-"                                   # the id of a job at the worker; RunPod's ids never start with it


def _no_such_key(exc: Exception) -> bool:
    return "NoSuchKey" in type(exc).__name__ or "NoSuchKey" in str(exc) or "404" in str(exc) or "Not Found" in str(exc)


def out_of_memory(exc: BaseException) -> bool:
    """torch's and onnxruntime's words for it; a stage reports either inside its own error."""
    text = "{} {}".format(type(exc).__name__, exc).lower()
    return any(w in text for w in ("out of memory", "outofmemory", "bfc_arena", "failed to allocate"))


class Queue:
    """The objects above, and nothing else: the studio's side (submit, status, cancel, alive) and the worker's (next_job, set_state, beat)."""

    def __init__(self, s3, bucket: str, prefix: str = PREFIX, now: Callable = time.time):
        self.s3, self.bucket, self.prefix, self.now = s3, bucket, prefix.strip("/"), now

    def key(self, *parts: str) -> str:
        return "/".join((self.prefix,) + parts)

    def _put(self, key: str, obj: dict) -> None:
        self.s3.put_object(Bucket=self.bucket, Key=key, Body=json.dumps(obj, default=str).encode(), ContentType="application/json")

    def _get(self, key: str) -> Optional[dict]:
        try:
            return json.loads(self.s3.get_object(Bucket=self.bucket, Key=key)["Body"].read())
        except Exception as exc:                                    # noqa: BLE001
            if _no_such_key(exc):
                return None
            raise

    def _exists(self, key: str) -> bool:
        try:
            self.s3.head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception as exc:                                    # noqa: BLE001
            if _no_such_key(exc):
                return False
            raise

    def _delete(self, *keys: str) -> None:
        for k in keys:
            self.s3.delete_object(Bucket=self.bucket, Key=k)

    def _list(self, sub: str) -> list:
        out, token = [], None
        while True:
            args = {"Bucket": self.bucket, "Prefix": self.key(sub) + "/"}
            if token:
                args["ContinuationToken"] = token
            page = self.s3.list_objects_v2(**args)
            out += page.get("Contents", [])
            token = page.get("NextContinuationToken")
            if not token:
                return out

    # ---- the studio's side
    def submit(self, payload: dict) -> str:
        job = ID_MARK + secrets.token_hex(10)
        self._put(self.key("pending", job + ".json"), {"id": job, "input": payload, "t": self.now()})
        return job

    def status(self, job: str) -> dict:
        st = self._get(self.key("state", job + ".json"))
        if st:
            return st
        if self._exists(self.key("pending", job + ".json")):
            return {"status": "IN_QUEUE"}
        return {"status": "CANCELLED"}                              # neither waiting nor started: cancelled, or swept

    def cancel(self, job: str) -> None:
        try:
            self._put(self.key("cancel", job), {"t": self.now()})
            self._delete(self.key("pending", job + ".json"))
        except Exception:                                           # noqa: BLE001  the caller is leaving either way
            pass

    def disabled(self) -> bool:
        return self._exists(self.key("disabled"))

    def heartbeat(self) -> dict:
        """{"alive_s": seconds since the worker last said so (None: never), ...what it said}. The age is the bucket's, not the worker's clock."""
        try:
            head = self.s3.head_object(Bucket=self.bucket, Key=self.key("heartbeat.json"))
        except Exception as exc:                                    # noqa: BLE001
            if _no_such_key(exc):
                return {"alive_s": None}
            raise
        info = self._get(self.key("heartbeat.json")) or {}
        info["alive_s"] = max(0.0, self.now() - head["LastModified"].timestamp())
        return info

    def depth(self) -> int:
        """Jobs waiting at the worker (the one it is running is the heartbeat's `busy`)."""
        return len(self._list("pending"))

    # ---- the worker's side
    def beat(self, info: dict) -> None:
        self._put(self.key("heartbeat.json"), dict(info, t=self.now()))

    def next_job(self) -> Optional[dict]:
        """The oldest waiting job ({"id", "input", "t"}), None when there is none."""
        waiting = sorted(self._list("pending"), key=lambda o: o["LastModified"])
        for o in waiting:
            job = self._get(o["Key"])
            if job and job.get("id"):
                return job
        return None

    def set_state(self, job: str, status: str, output: dict = None, error: str = None) -> None:
        self._put(self.key("state", job + ".json"), {"status": status, "output": output, "error": error, "t": self.now()})

    def take(self, job: str) -> bool:
        """Start a job: state first, then the waiting copy goes (so a job is never in neither). False when the studio has cancelled it."""
        if self._exists(self.key("cancel", job)):
            self.set_state(job, "CANCELLED")
            self._delete(self.key("pending", job + ".json"), self.key("cancel", job))
            return False
        self.set_state(job, "IN_PROGRESS")
        self._delete(self.key("pending", job + ".json"))
        return True

    def sweep(self, older_than_s: float = 7200.0) -> int:
        """Remove what is left of finished jobs (state, cancel marks) and of jobs nobody took."""
        gone = []
        for sub in ("state", "cancel", "pending"):
            for o in self._list(sub):
                if self.now() - o["LastModified"].timestamp() > older_than_s:
                    gone.append(o["Key"])
        self._delete(*gone)
        return len(gone)


class Hybrid:
    """The four calls of remote.RunPod, answered by the worker or by RunPod, job by job."""

    def __init__(self, runpod, queue: Queue, *, pipelines=("hyperswap-flash",), alive_s: float = 30.0, claim_s: float = 45.0, max_depth: int = 1,
                 back_s: float = 300.0, stall_s: float = 600.0, now: Callable = time.time):
        self.runpod, self.queue, self.pipelines = runpod, queue, set(pipelines)
        self.alive_s, self.claim_s, self.max_depth, self.back_s, self.stall_s, self.now = alive_s, claim_s, max_depth, back_s, stall_s, now
        self.jobs: Dict[str, dict] = {}                              # id at the worker -> {"payload", "t0", "moved": RunPod's id once it was sent there, "why"}
        self.back: Dict[str, dict] = {}                              # id at RunPod of a job the worker could do -> {"payload", "t0", "local": its id at the worker once it came back}

    def local_ok(self, payload: dict) -> bool:
        name = payload.get("pipeline")
        if name not in self.pipelines or payload.get("warm_shapes") is not None or payload.get("warmup"):      # a warm-up is for RunPod's workers: here it would only keep the next person's job off the card
            return False
        try:
            if self.queue.disabled():
                return False
            hb = self.queue.heartbeat()
            if hb.get("alive_s") is None or hb["alive_s"] > self.alive_s or hb.get("paused"):
                return False
            if name not in (hb.get("pipelines") or ()):
                return False
            return (1 if hb.get("busy") else 0) + self.queue.depth() < self.max_depth
        except Exception:                                           # noqa: BLE001  the bucket cannot be read: RunPod, as before
            return False

    def local_free(self, pipeline: str) -> bool:
        """The next job of this pipeline would go to the worker, which is always up: nothing to warm."""
        return self.local_ok({"pipeline": pipeline})

    def submit(self, payload: dict) -> str:
        if self.local_ok(payload):
            try:
                job = self.queue.submit(payload)
                self.jobs[job] = {"payload": payload, "t0": self.now(), "moved": None}
                return job
            except Exception:                                       # noqa: BLE001
                pass
        job = self.runpod.submit(payload)
        if payload.get("pipeline") in self.pipelines and payload.get("warm_shapes") is None and not payload.get("warmup"):
            self.back[job] = {"payload": payload, "t0": self.now(), "local": None}
        return job

    def _move(self, job: str, why: str) -> str:
        """Send a job the worker did not do to RunPod, once."""
        info = self.jobs[job]
        self.queue.cancel(job)
        info["moved"] = self.runpod.submit(info["payload"])
        info["why"] = why
        print("[studio] job {} was not done by the local worker ({}); sent to the render service as {}".format(job, why, info["moved"]), flush=True)
        return info["moved"]

    def _status_at_runpod(self, job: str) -> dict:
        back = self.back.get(job)
        if back and back["local"]:
            return self.status(back["local"])
        st = self.runpod.status(job)
        if back and st.get("status") == "IN_QUEUE" and self.now() - back["t0"] > self.back_s and self.local_ok(back["payload"]):
            self.runpod.cancel(job)
            back["local"] = self.queue.submit(back["payload"])
            self.jobs[back["local"]] = {"payload": back["payload"], "t0": self.now(), "moved": None}
            print("[studio] job {} waited {:.0f} s at the render service; the local worker is free, sent there as {}".format(job, self.now() - back["t0"], back["local"]), flush=True)
            return {"status": "IN_QUEUE"}
        if back and st.get("status") == "IN_PROGRESS":
            # A running job shows its progress log in `output` (WORKER_PROGRESS): a log that stopped growing is a worker that hung.
            grown = len(json.dumps(st.get("output"), default=str)) if st.get("output") is not None else 0
            if back.get("grown") != grown:
                back["grown"], back["grown_t"] = grown, self.now()
            elif self.now() - back["grown_t"] > self.stall_s and self.local_ok(back["payload"]):
                self.runpod.cancel(job)
                back["local"] = self.queue.submit(back["payload"])
                self.jobs[back["local"]] = {"payload": back["payload"], "t0": self.now(), "moved": None}
                print("[studio] job {} made no progress at the render service for {:.0f} s; the local worker is free, sent there as {}".format(
                    job, self.now() - back["grown_t"], back["local"]), flush=True)
                return {"status": "IN_QUEUE"}
        return st

    def status(self, job: str) -> dict:
        if not job.startswith(ID_MARK):
            return self._status_at_runpod(job)
        info = self.jobs.get(job)
        if info and info["moved"]:
            return self.runpod.status(info["moved"])
        st = self.queue.status(job)
        if not info:
            return st                                                # made before a restart of this studio: what the bucket says
        state = st.get("status")
        if state == "IN_QUEUE" and self.now() - info["t0"] > self.claim_s:
            self._move(job, "not taken within {:.0f} s".format(self.claim_s))
            return {"status": "IN_QUEUE"}
        if state == "IN_PROGRESS":
            try:
                hb = self.queue.heartbeat()
            except Exception:                                       # noqa: BLE001
                hb = {"alive_s": 0.0}
            if hb.get("alive_s") is None or hb["alive_s"] > self.alive_s * 4:
                self._move(job, "the worker went quiet")
                return {"status": "IN_QUEUE"}
        if state in ("FAILED", "CANCELLED") and not self._cancelled_by_us(job):
            self._move(job, "it failed there: {}".format(str(st.get("error"))[:160]))
            return {"status": "IN_QUEUE"}
        return st

    def _cancelled_by_us(self, job: str) -> bool:
        return bool(self.jobs.get(job, {}).get("cancelled"))

    def cancel(self, job: str) -> None:
        back = self.back.get(job)
        if back and back["local"]:
            job = back["local"]
        info = self.jobs.get(job)
        if info:
            info["cancelled"] = True
            if info["moved"]:
                self.runpod.cancel(info["moved"])
        if job.startswith(ID_MARK):
            self.queue.cancel(job)
        else:
            self.runpod.cancel(job)

    def health(self) -> dict:
        return self.runpod.health()

    def vendor_of(self, job: str) -> tuple:
        """Who ended up with a job: ("own" | "cloud", how it moved: None | "own_to_cloud" | "cloud_to_own")."""
        back = self.back.get(job)
        if back and back["local"]:
            vendor, moved = self.vendor_of(back["local"])
            return vendor, moved or "cloud_to_own"
        info = self.jobs.get(job)
        if info and info["moved"]:
            return "cloud", "own_to_cloud"
        return ("own" if job.startswith(ID_MARK) else "cloud"), None

    def own_status(self) -> dict:
        """The worker as the operator wants to see it: {"up", "busy", "paused", "disabled", "waiting", "heartbeat_s"}."""
        hb = self.queue.heartbeat()
        age = hb.get("alive_s")
        return {"up": age is not None and age <= self.alive_s, "busy": bool(hb.get("busy")), "paused": bool(hb.get("paused")), "disabled": self.queue.disabled(),
                "waiting": self.queue.depth(), "heartbeat_s": None if age is None else round(age)}


class Worker:
    """The loop on the machine with the card. `handler` is swap_handler.handler (a callable taking {"id", "input"}). The card is ours (promised to us), so by default the worker
    never steps aside: it takes what it is given, and a job that cannot run because somebody else holds memory fails and is sent to RunPod by Hybrid. `min_free_mb` > 0 makes it
    pause instead (paused: the studio sends everything to RunPod) while less than that is free, judged by `gpu_free_mb`."""

    def __init__(self, queue: Queue, handler: Callable, *, pipelines=("hyperswap-flash",), gpu_free_mb: Callable = None, min_free_mb: int = 0, disk_ok: Callable = None, beat_s: float = 8.0,
                 poll_s: float = 2.0, log: Callable = print, sleep: Callable = time.sleep):
        self.queue, self.handler, self.pipelines, self.disk_ok = queue, handler, list(pipelines), disk_ok
        self.gpu_free_mb, self.min_free_mb, self.beat_s, self.poll_s, self.log, self.sleep = gpu_free_mb, min_free_mb, beat_s, poll_s, log, sleep
        self.job = None
        self._stop = threading.Event()

    def free_mb(self) -> Optional[int]:
        try:
            return self.gpu_free_mb() if self.gpu_free_mb else None
        except Exception:                                           # noqa: BLE001
            return None

    def card_gone(self) -> bool:
        """nvidia-smi no longer answers in this container (a `docker update` or a systemd reload on the host takes the devices away; only a restart brings them back)."""
        return self.gpu_free_mb is not None and self.free_mb() is None

    def paused(self) -> bool:
        """The disk is nearly full; or, only when asked for (min_free_mb > 0), less of the card is free than a job needs, unless this worker is the one using it."""
        if self.job is not None:
            return False
        if self.disk_ok is not None and not self.disk_ok():
            return True
        if self.min_free_mb <= 0:
            return False
        free = self.free_mb()
        return free is not None and free < self.min_free_mb

    def beat(self) -> None:
        try:
            self.queue.beat({"busy": self.job is not None, "job": self.job, "pipelines": self.pipelines, "gpu_free_mb": self.free_mb(), "paused": self.paused()})
        except Exception as exc:                                    # noqa: BLE001
            self.log("[local-worker] heartbeat failed: {!r}".format(exc))

    def step(self) -> bool:
        """Take and do one waiting job. False when there was nothing to do (or the card is not free)."""
        if self.paused():
            return False
        job = self.queue.next_job()
        if not job:
            return False
        jid = job["id"]
        if self.card_gone():
            raise SystemExit("[local-worker] the card cannot be reached: exiting so that the container starts with it again")
        if not self.queue.take(jid):
            self.log("[local-worker] {} was cancelled before it started".format(jid))
            return True
        self.job = jid
        self.beat()
        started = time.time()
        try:
            out = self.handler({"id": jid, "input": job.get("input") or {}})
            if isinstance(out, dict) and out.get("error") and self.card_gone():     # not a refusal: it says so only because the render could not run
                raise RuntimeError(out["error"])
            self.queue.set_state(jid, "COMPLETED", output=out)
            self.log("[local-worker] {} done in {:.0f} s".format(jid, time.time() - started))
        except BaseException as exc:                                # noqa: BLE001  RunPod's rule: an exception is a failed job (the studio then sends it elsewhere)
            self.log("[local-worker] {} failed after {:.0f} s: {!r}".format(jid, time.time() - started, exc))
            self.queue.set_state(jid, "FAILED", error=json.dumps({"error_type": type(exc).__name__, "error_message": str(exc)[:1500]}))
            if isinstance(exc, (KeyboardInterrupt, SystemExit)):
                raise
            if out_of_memory(exc) or self.card_gone():               # what crashed still holds the card, or the container lost it, and every later job would fail: end, and let the container restart clean
                raise SystemExit("[local-worker] the card ran out of memory or cannot be reached: exiting so that the container starts clean")
        finally:
            self.job = None
        return True

    def _beater(self) -> None:
        while not self._stop.wait(self.beat_s):
            self.beat()

    def run_forever(self) -> None:
        threading.Thread(target=self._beater, daemon=True).start()
        swept = 0.0
        while not self._stop.is_set():
            try:
                self.beat()
                did = self.step()
                if time.time() - swept > 600:
                    swept = time.time()
                    self.queue.sweep()
            except Exception as exc:                                # noqa: BLE001  the bucket hiccuped: ask again
                self.log("[local-worker] {!r}".format(exc))
                did = False
            if not did:
                self.sleep(self.poll_s)

    def stop(self) -> None:
        self._stop.set()
