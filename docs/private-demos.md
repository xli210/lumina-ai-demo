# Private Demo Previews — API-proxy architecture

Internal admin-only preview of the two API-driven face demo pages. This
replaces the pattern where user-facing buttons redirected out to a
Cloudflare tunnel URL; instead, the UI now lives on nanopocket.ai and
calls the upstream model APIs through a same-origin Next.js proxy that
injects a secret `X-API-Key` server-side.

## URLs

| Public URL | Description |
|---|---|
| `/private-demos` | Admin-only index with two cards (FaceVivid + FaceSwap). |
| `/private-demos/facevivid` | Redirects to the handoff HTML wrapper for NanoFace Vivid. |
| `/private-demos/faceswap` | Redirects to the handoff HTML wrapper for Face Studio face-swap. |

All three paths are:
- Gated by `lib/supabase/middleware.ts` (anonymous → `/auth/login`, non-admin → `/account`).
- Emitted with `robots: noindex,nofollow`.
- Listed under `PRIVATE_DISALLOW` in `app/robots.ts`.
- Not registered in `app/sitemap.ts` and never linked from the navbar,
  footer, `/face-swap`, or any what's-new bar.

## Backend proxy

Frontend calls (from `public/private-demos/{facevivid,faceswap}/app.js`) hit:

### NanoFace Vivid — 5 routes

| Frontend | Forwarded to upstream |
|---|---|
| `POST /api/private-demos/facevivid/run` (multipart: `image`, `detail_strength`) | `POST {FACEVIVID_UPSTREAM}/api/run` |
| `GET  /api/private-demos/facevivid/status/{jobId}` | `GET {FACEVIVID_UPSTREAM}/api/status/{jobId}` |
| `GET  /api/private-demos/facevivid/result/{jobId}` | `GET {FACEVIVID_UPSTREAM}/api/result/{jobId}` (image/png, streamed) |
| `POST /api/private-demos/facevivid/feedback` | `POST {FACEVIVID_UPSTREAM}/api/feedback` |
| `POST /api/private-demos/facevivid/visit` | `POST {FACEVIVID_UPSTREAM}/api/visit` |

### Face Studio face-swap — 6 routes (v5 API contract)

| Frontend | Forwarded to upstream |
|---|---|
| `POST /api/private-demos/faceswap/v5/api/detect` (multipart: `body_image`) | `POST {FACESWAP_UPSTREAM}/v5/api/detect` |
| `POST /api/private-demos/faceswap/v5/api/generate` (multipart: `detection_id`, `ref_0…`, `preserve_classes_json`, `mode`) | `POST {FACESWAP_UPSTREAM}/v5/api/generate` |
| `GET  /api/private-demos/faceswap/v5/api/status/{jobId}` | `GET {FACESWAP_UPSTREAM}/v5/api/status/{jobId}` |
| `GET  /api/private-demos/faceswap/v5/api/result/{jobId}` | `GET {FACESWAP_UPSTREAM}/v5/api/result/{jobId}` (image/png, streamed) |
| `POST /api/private-demos/faceswap/v5/api/feedback` | `POST {FACESWAP_UPSTREAM}/v5/api/feedback` |
| `POST /api/private-demos/faceswap/v5/api/visit` | `POST {FACESWAP_UPSTREAM}/v5/api/visit` |

Every route:
1. Runs `adminGate()` from `lib/private-demo-proxy.ts` (401 on anon, 403 on non-admin).
2. Copies through the request headers (minus hop-by-hop + Vercel-specific ones).
3. Injects `X-API-Key: <env>` and `X-Forwarded-By: nanopocket-private-demo-proxy/1.0`.
4. Streams the body pass-through (`duplex: 'half'` on Node 18+).
5. Returns the upstream response with `cache-control: private, no-store`.

## Environment variables

Set these on Vercel (Production, Preview, and Development scopes) **and**
in your local `.env.local`:

```env
# --- NanoFace Vivid upstream ---
FACEVIVID_UPSTREAM_URL=https://sagem-julie-personnel-msg.trycloudflare.com
FACEVIVID_API_KEY=nfv_ecy6x9XMEJQGvFAJ3woT8mantnOHqLEp

# --- Face Studio face-swap upstream ---
FACESWAP_UPSTREAM_URL=https://paying-colorado-ment-cingular.trycloudflare.com
FACESWAP_API_KEY=fsw_qwPil6sPYGHq-IellDaWgBgR_C8sVqQ8
```

Notes:
- Both `*_UPSTREAM_URL` values fall back to the Cloudflare tunnel URLs
  above if the env var is missing, so a partial config still works for
  a first test. `*_API_KEY` has no fallback — a missing key returns 503
  from the proxy so the frontend surfaces a clean error.
- Rotating a tunnel URL is just a Vercel env-var edit + redeploy; no
  code changes.

## Vercel setup checklist

1. Go to **Vercel → project → Settings → Environment Variables**.
2. Add the four vars above with the exact keys `FACEVIVID_API_KEY`,
   `FACEVIVID_UPSTREAM_URL`, `FACESWAP_API_KEY`, `FACESWAP_UPSTREAM_URL`.
3. Check the boxes for **Production**, **Preview**, and **Development**
   (Development is what `vercel env pull` writes to `.env.development.local`).
4. Redeploy the `release` branch.
5. Sign in to nanopocket.ai as an admin user (a row in
   `public.profiles` with `role = 'admin'` for your Supabase `auth.users`
   id). Visit `/private-demos`. Click either preview card.
6. Confirm end-to-end: upload → detect (faceswap only) → generate → poll
   status → view result → download.

## Making a user an admin

Manually, via Supabase SQL editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<auth.users.id>';
```

## Frontend origin

The two demo apps under `public/private-demos/{facevivid,faceswap}/` are
the unmodified handoff from `site_handoff 2/` with **one** local edit:

- `app.js` `API_BASE` is set to `/api/private-demos/{facevivid|faceswap}`
  so every network call routes through our proxy.

Everything else — the compare-zoom slider, dropzones, mask brush,
per-face reference upload, occluder-preserve chips — is verbatim from
the handoff. To update the demo UI later, drop new files in from a new
handoff and repeat the one-line `API_BASE` edit.

## Asset optimization

The handoff shipped 84 MB of face-template PNGs. `scripts/convert-face-templates.mjs`
converts them to WebP at quality 85 (drops to ~2 MB total) and rewrites
`face_templates.local.json` to point at the .webp files. Run once per
new handoff:

```bash
node scripts/convert-face-templates.mjs
```

## Roll-out path

This is the preview surface. When the pattern is validated (image
uploads work through Vercel's request-body limit, streaming results
render fast, admin gate is unbreakable), the plan is to:

1. Duplicate the two demo pages under public-facing routes
   (`/demos/facevivid`, `/demos/faceswap`) with the middleware gate
   downgraded from **admin** to **signed-in-user**.
2. Wire the quota counter from `lib/demo-quota.ts` into the API proxies
   so each successful generation counts against the user's 10/day.
3. Retire the redirect flow (`/api/demos/open` + the raw Cloudflare
   tunnel buttons on `/face-swap` and the product pages).
