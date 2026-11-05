"""Tells the operators when the GPUs behind our products are about to run out, before customers notice.

Run every 5 minutes by .github/workflows/capacity-alert.yml. It asks RunPod how each serverless endpoint stands (jobs waiting, workers running / starting /
throttled, and the endpoint's worker limit), asks the video studio how long its own line is, and mails the operators when:

  - every worker of an endpoint is busy and somebody is waiting (CRITICAL),
  - somebody is waiting and no worker can start, all throttled or unhealthy (CRITICAL),
  - jobs are piling up, or every worker is busy but nobody waits yet (WARNING),
  - the studio's line is long, or the studio or RunPod cannot be asked (WARNING / CRITICAL).

A bad reading has to repeat on the next check before it is mailed (one reading is often a job just arriving), except a long line, which is mailed at once.
The same level is repeated every 30 minutes while it lasts, and a "back to normal" mail follows. The mail says what to do (docs/CAPACITY_PLAYBOOK.md).

Environment: RUNPOD_API_KEY, STUDIO_ACCESS_TOKEN (the studio's sign-in key), RESEND_API_KEY, ALERT_TO (comma separated), optional ALERT_FROM, ALERT_DISCORD_WEBHOOK, STUDIO_HEALTH_URL, STATE_FILE.
Standard library only.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

ENDPOINTS = [                                         # id, what the operators call it
    ("1jpcdjbi8ecsq7", "Video FaceSwap (swap-review)"),
    ("kgcsaw0mpwbz4c", "Face Studio images (face-studio-v5)"),
    ("0yecvjeuqqfoyo", "HeadSwap Pro images (headswap-baked)"),
    ("8zekyhvth8nfp6", "Image Edit (qwen-image-studio)"),
]
STUDIO_HEALTH_URL = "https://swap-studio.onrender.com/api/health"
REPEAT_S = 30 * 60
LONG_LINE_S = 300                                     # the studio says a new job would wait this long: warn
VERY_LONG_LINE_S = 900                                # ...and this long: critical
OK, WARN, CRIT = "ok", "warning", "critical"
RANK = {OK: 0, WARN: 1, CRIT: 2}


def judge_endpoint(h: dict, workers_max: int):
    """(level, reason, immediate) for one endpoint from its /health and its worker limit."""
    jobs, w = h.get("jobs") or {}, h.get("workers") or {}
    q = int(jobs.get("inQueue") or 0)
    busy = int(w.get("running") or 0) + int(w.get("initializing") or 0)
    throttled, unhealthy = int(w.get("throttled") or 0), int(w.get("unhealthy") or 0)
    if q > 0 and workers_max and busy >= workers_max:
        return CRIT, "all {} workers are busy and {} job(s) wait".format(workers_max, q), q >= 3
    if q > 0 and busy == 0 and (throttled or unhealthy):
        return CRIT, "{} job(s) wait and no worker can start ({} throttled, {} unhealthy)".format(q, throttled, unhealthy), q >= 3
    if q >= 2:
        return WARN, "{} jobs are waiting ({} of {} workers busy)".format(q, busy, workers_max), q >= 5
    if workers_max and busy >= workers_max:
        return WARN, "all {} workers are busy (nobody waits yet)".format(workers_max), False
    if unhealthy:
        return WARN, "{} worker(s) unhealthy".format(unhealthy), False
    return OK, "{} of {} workers busy, {} waiting".format(busy, workers_max, q), False


def judge_studio(h: dict):
    q = h.get("queue") or {}
    wait, waiting = int(q.get("wait_s") or 0), int(q.get("waiting") or 0)
    if wait >= VERY_LONG_LINE_S:
        return CRIT, "a new video would wait about {} min ({} in line)".format(wait // 60, waiting), True
    if wait >= LONG_LINE_S or waiting >= 3:
        return WARN, "a new video would wait about {} min ({} in line)".format(max(1, wait // 60), waiting), wait >= LONG_LINE_S
    return OK, "{} in line".format(waiting), False


def evaluate(readings: dict, state: dict, now: float):
    """readings: {name: (level, reason, immediate)}. Returns (mails, new_state); a mail is (subject, body-lines).

    state: {name: {"bad": consecutive bad readings, "alerted": level last mailed or "", "at": when}}
    """
    new, mails = {}, []
    lines_bad, lines_back = [], []
    for name, (level, reason, immediate) in readings.items():
        old = state.get(name) or {"bad": 0, "alerted": OK, "at": 0}
        bad = old["bad"] + 1 if level != OK else 0
        alerted, at = old["alerted"], old["at"]
        if level != OK and (bad >= 2 or immediate):
            if RANK[level] > RANK[alerted] or now - at >= REPEAT_S:
                lines_bad.append((level, name, reason))
                alerted, at = level, now
        elif level == OK and alerted != OK:
            lines_back.append((name, reason))
            alerted, at = OK, now
        new[name] = {"bad": bad, "alerted": alerted, "at": at}
    if lines_bad:
        top = max((l for l, _, _ in lines_bad), key=RANK.get)
        mails.append(("[{}] GPU capacity: {}".format(top.upper(), ", ".join(n for _, n, _ in lines_bad)),
                      ["{}: {} - {}".format(l.upper(), n, r) for l, n, r in lines_bad] + [""] + playbook(lines_bad)))
    if lines_back:
        mails.append(("[OK] GPU capacity back to normal: " + ", ".join(n for n, _ in lines_back), ["{}: {}".format(n, r) for n, r in lines_back]))
    return mails, new


def playbook(bad):
    """What to do, short; the long version is docs/CAPACITY_PLAYBOOK.md."""
    names = " ".join(n for _, n, _ in bad)
    out = ["What to do (details: docs/CAPACITY_PLAYBOOK.md):"]
    if "Video" in names or "studio" in names.lower():
        out += ["- Video: check https://swap-studio.onrender.com/api/health and /admin/reliability. The line already uses the RTX 5090 first and RunPod next.",
                "  To shed load: lower STUDIO_FREE_RUNNING / STUDIO_FREE_WAITING (free accounts wait, paid ones do not), or STUDIO_MAX_QUEUE to refuse politely when full."]
    if any(k in names for k in ("images", "Image Edit")):
        out += ["- Images: RunPod console -> the endpoint -> raise Max workers. The account allows 10 workers in all across endpoints; take them from an idle endpoint or ask RunPod for more."]
    out += ["- If workers are throttled (RunPod has no GPU to give): add GPU types to the endpoint, or set Active workers (workersMin) to 1 for the busy hours.",
            "- Tell customers: the homepage notice is in app/components/whats-new-bar.tsx."]
    return out


def get_json(url, headers, timeout=20):
    req = urllib.request.Request(url, headers=dict(headers, **{"User-Agent": "capacity-alert"}))
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def read_all(env, fetch=get_json):
    """{name: (level, reason, immediate)}; a service that cannot be asked is reported as such, never as fine."""
    out, auth = {}, {"Authorization": "Bearer " + env.get("RUNPOD_API_KEY", "")}
    for ep, name in ENDPOINTS:
        try:
            h = fetch("https://api.runpod.ai/v2/%s/health" % ep, auth)
            mx = int(fetch("https://rest.runpod.io/v1/endpoints/%s" % ep, auth).get("workersMax") or 0)
            out[name] = judge_endpoint(h, mx)
        except Exception as exc:                           # noqa: BLE001
            out[name] = (WARN, "RunPod could not be asked ({})".format(type(exc).__name__), False)
    token = env.get("STUDIO_ACCESS_TOKEN")                  # the studio answers only with its sign-in cookie
    if not token:
        out["Video studio line"] = (WARN, "STUDIO_ACCESS_TOKEN is not set: the studio's own line is not watched", False)
        return out
    try:
        out["Video studio line"] = judge_studio(fetch(env.get("STUDIO_HEALTH_URL") or STUDIO_HEALTH_URL, {"Cookie": "studio_auth=" + token}))
    except Exception as exc:                               # noqa: BLE001
        out["Video studio line"] = (CRIT, "the studio could not be asked ({})".format(type(exc).__name__), False)
    return out


def send(env, subject, lines):
    """Mail through Resend, and Discord when a webhook is set. True when at least one channel took it."""
    body, sent = "\n".join(lines), False
    key, to = env.get("RESEND_API_KEY"), [a.strip() for a in (env.get("ALERT_TO") or "").split(",") if a.strip()]
    if key and to:
        payload = {"from": env.get("ALERT_FROM") or "NanoPocket Alerts <alerts@nanopocket.ai>", "to": to, "subject": subject, "text": body}
        req = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(payload).encode(), method="POST",
                                     headers={"Authorization": "Bearer " + key, "Content-Type": "application/json", "User-Agent": "capacity-alert"})
        try:
            urllib.request.urlopen(req, timeout=20).read()
            sent = True
        except urllib.error.HTTPError as exc:
            print("mail refused:", exc.code, exc.read()[:300], file=sys.stderr)
        except Exception as exc:                           # noqa: BLE001
            print("mail failed:", type(exc).__name__, file=sys.stderr)
    hook = env.get("ALERT_DISCORD_WEBHOOK")
    if hook:
        try:
            req = urllib.request.Request(hook, data=json.dumps({"content": ("**%s**\n%s" % (subject, body))[:1900]}).encode(), method="POST",
                                         headers={"Content-Type": "application/json", "User-Agent": "capacity-alert"})
            urllib.request.urlopen(req, timeout=20).read()
            sent = True
        except Exception as exc:                           # noqa: BLE001
            print("discord failed:", type(exc).__name__, file=sys.stderr)
    return sent


def main(env=os.environ):
    path = env.get("STATE_FILE") or "capacity_state.json"
    try:
        state = json.load(open(path))
    except Exception:                                      # noqa: BLE001
        state = {}
    readings = read_all(env)
    for name, (level, reason, _) in readings.items():
        print("{:9} {:38} {}".format(level, name, reason))
    mails, new = evaluate(readings, state, time.time())
    failed = False
    for subject, lines in mails:
        print("MAIL:", subject)
        if not send(env, subject, lines):
            failed = True                                  # nowhere to send: fail the run, GitHub then mails the repository owner
            for name, n in new.items():                    # (not delivered: what was mailed before still stands, so the next check tries again)
                n["alerted"], n["at"] = (state.get(name) or {}).get("alerted", OK), (state.get(name) or {}).get("at", 0)
    json.dump(new, open(path, "w"))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
