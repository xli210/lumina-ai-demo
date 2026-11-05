# GPU capacity playbook

What to do when the capacity alert mails you (`scripts/capacity_alert.py`, every 5 minutes through `.github/workflows/capacity-alert.yml`).

## The limits that exist today

| Product | RunPod endpoint | Max workers | GPU types |
|---|---|---|---|
| Video FaceSwap | `swap-review` 1jpcdjbi8ecsq7 | 3 (plus our own RTX 5090, used first) | RTX 6000 Ada, L40, L40S, RTX PRO 6000 Blackwell |
| Face Studio images | `face-studio-v5` kgcsaw0mpwbz4c | 3 | A40, A6000, L40/6000 Ada, A100/H100 |
| HeadSwap Pro images | `headswap-baked` 0yecvjeuqqfoyo | 3 | same as above |
| Image Edit | `qwen-image-studio` 8zekyhvth8nfp6 | 1 | H100 |

**The account allows 10 workers in all** (3 + 3 + 3 + 1 today). Raising one endpoint means lowering another, or asking RunPod support to raise the quota.
Highest simultaneous load seen in 30 days (from the credit holds): images 2, video 3, Image Edit 3 once.

## By what the mail says

- **All workers busy, jobs waiting.** More workers is the answer, within the quota above. In the RunPod console, endpoint, Max workers. Take them from an idle endpoint.
- **Jobs wait and no worker can start (throttled).** RunPod has no GPU of that type to give. Add GPU types to the endpoint (the video endpoint has a list in its settings; the REST field is `gpuTypeIds`). For the video, a card with a new architecture compiles its TensorRT engines once on its first job (about 45 s per shape), then they are cached in the bucket.
  For the hours that matter, set Active workers (`workersMin`) to 1: it is billed all day, so turn it back when the flood is over.
- **The studio's line is long.** The studio (swap-studio.onrender.com) already sends work to the RTX 5090 first and to RunPod when the 5090 is busy. To shed load: lower `STUDIO_FREE_RUNNING` / `STUDIO_FREE_WAITING` so free accounts wait while paid ones do not, or `STUDIO_MAX_QUEUE` so a full line is refused politely. These are Render environment variables of the studio service; a change restarts it, so do it when nothing is running.
- **A flood that is not going away.** Tell people: the notice bar on the homepage is `app/components/whats-new-bar.tsx` (bump its key to show it again to people who closed it).

## Setting it up (once)

GitHub repository, Settings, Secrets and variables, Actions:

| Secret | What |
|---|---|
| `RUNPOD_API_KEY` | RunPod API key (read access is enough) |
| `STUDIO_ACCESS_TOKEN` | the studio's `STUDIO_ACCESS_TOKEN` (Render, swap-studio, Environment) |
| `RESEND_API_KEY` | Resend API key; the sending domain must be verified in Resend |
| `ALERT_TO` | `xli210@binghamton.edu,yunanwu2020@u.northwestern.edu` |
| `ALERT_FROM` | optional, `NanoPocket Alerts <alerts@nanopocket.ai>` by default |
| `ALERT_DISCORD_WEBHOOK` | optional, the same text to a Discord channel |

The schedule runs from the repository's default branch (`main`): the workflow file has to be there.
A run with nowhere to send the mail fails, and GitHub then mails the repository owner about the failed run.

Test it: Actions, GPU capacity alert, Run workflow. It prints one line per service; it mails only when something is wrong.
