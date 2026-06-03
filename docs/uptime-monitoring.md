# Demo uptime monitoring — setup guide

This guide wires up the three online demo URLs (Image FaceSwap Pro 2.0,
Video FaceSwap Pro, NanoFace Vivid) to a 5-minute uptime checker that:

1. Pings each demo from a GitHub Actions runner every 5 minutes.
2. Writes each result to a `demo_health_checks` table in Supabase.
3. Posts to a Discord webhook when a demo flips from up→down or down→up.
4. Renders live badges on `/face-swap` and a public `/status` page.

The website only ever **reads** from Supabase; only the GitHub Action
writes. No website credentials change.

---

## 1. Run the SQL migration in Supabase

Open Supabase → SQL editor → **New query**, paste, and run:

```sql
-- Per-check log. Latest row per demo_id = current state.
create table if not exists public.demo_health_checks (
  id uuid primary key default gen_random_uuid(),
  demo_id text not null,
  url text not null,
  status text not null check (status in ('up','down')),
  http_status int,
  latency_ms int,
  error text,
  checked_at timestamptz not null default now()
);

create index if not exists demo_health_recent
  on public.demo_health_checks (demo_id, checked_at desc);

-- RLS: anyone can READ (so the public /status page works), nobody but
-- the service role can write. The GitHub Action uses the service role
-- key; the website's anon client only needs SELECT.
alter table public.demo_health_checks enable row level security;

drop policy if exists demo_health_public_read on public.demo_health_checks;
create policy demo_health_public_read
  on public.demo_health_checks
  for select
  using (true);
```

(If the table already exists from a prior run, the `if not exists`
clauses make this idempotent.)

---

## 2. Create the Discord webhook

1. In your Discord server, right-click the channel you want alerts in
   (recommend `#alerts` or a new dedicated `#demo-status`).
2. **Edit Channel → Integrations → Webhooks → New Webhook**.
3. Name it `Demo Uptime`, click **Copy Webhook URL**.
4. Keep the URL secret — anyone with it can post to your channel.

---

## 3. Add three GitHub Secrets

In the repo on GitHub → **Settings → Secrets and variables → Actions →
New repository secret**. Add three secrets:

| Name                       | Value                                                                 |
| -------------------------- | --------------------------------------------------------------------- |
| `SUPABASE_URL`             | Your project's URL, e.g. `https://abc123.supabase.co`. Same value as `NEXT_PUBLIC_SUPABASE_URL`. |
| `SUPABASE_SERVICE_ROLE_KEY`| Service-role key from Supabase → Project Settings → API.              |
| `DEMO_DISCORD_WEBHOOK`     | The webhook URL you copied in step 2.                                 |

The service-role key bypasses RLS, which is exactly what we want for
the writer. Never expose this key to the browser.

---

## 4. Verify the workflow runs

The workflow file is at `.github/workflows/demo-uptime.yml`. After you
merge this commit:

1. Go to **Actions → Demo uptime check → Run workflow → main** to
   trigger the first run manually (rather than waiting for the next
   5-minute slot).
2. Open the latest run's logs. You should see one line per demo with
   the HTTP status and latency.
3. In Supabase, run `select * from demo_health_checks order by
   checked_at desc limit 10;` — there should be three new rows.
4. The `/status` page on the website should render `Live` or `Down`
   badges accordingly within 60 seconds (the page uses
   `revalidate: 60`).

---

## 5. When a tunnel rotates

Edit `lib/demos.ts` and change the `origin` for the affected demo. That
single change updates:

- The button/CTA on `/face-swap`
- The card on the homepage announcement section
- The dedicated landing pages (`/apps/nano-faceswap-pro/features`,
  `/apps/nano-faceswap-pro/video`, `/apps/nanoface-vivid`)
- The uptime checker (the GitHub Action reads the same registry)

Push the change. The next scheduled run will start checking the new
URL automatically.

---

## 6. Cost & limits

- **GitHub Actions**: ~8,640 checks/demo/month at 5-min cadence, well
  inside the free tier for any account.
- **Supabase**: ~25,920 inserts/month total across the three demos.
  Negligible.
- **Discord**: webhook is free, no rate limits at this volume.

---

## 7. What the alarm looks like

When a demo flips `up → down` or `down → up`, the Discord channel
gets a message like:

> 🔴 **Demo down — Image FaceSwap Pro 2.0**
> URL: https://technique-phd-yen-insight.trycloudflare.com/login
> HTTP: 522 — error: connection reset
> Last successful check: 14 min ago

Healthy recoveries are posted as well so you can confirm the fix:

> 🟢 **Demo recovered — Image FaceSwap Pro 2.0**
> URL: https://technique-phd-yen-insight.trycloudflare.com/login
> HTTP: 200 — latency 412 ms
> Total downtime: 12 min

No alert is sent on every check, only on **state transitions**.
