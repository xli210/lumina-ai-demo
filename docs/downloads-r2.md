# Product installer downloads

`/api/downloads/<filename>` serves the desktop installers. It checks the
caller is signed in, checks they hold a non-revoked license for that product,
then 302s to a short-lived presigned URL. No installer bytes pass through the
function.

## Why R2 and not Supabase Storage

Supabase Storage held these until September 2026. Two limits made it the wrong
home:

| | Supabase free | Supabase Pro | Cloudflare R2 |
| --- | --- | --- | --- |
| Max single file | **50 MB** | 50 GB | 5 TB |
| Egress | 5 GB/month | 250 GB/month | **free** |

The largest installer is 114 MB. On the free plan it simply cannot be stored,
and even on Pro the egress allowance is 2,200 downloads of that one file.
Distributing large binaries is the workload R2's zero-egress pricing exists
for; storing all 330 MB costs about half a cent a month.

### How this surfaced as an outage

The Supabase project was downgraded from Pro to free. The downgrade removed
the `product-downloads` bucket entirely — not just the over-limit objects —
and every download started returning the route's 502 branch,
`Download temporarily unavailable`.

That error only fires when `createSignedUrl` fails, and it fires *after* the
license lookup, which runs on the same service-role client. So reaching it
proved the key and the database were fine and the fault was in Storage
alone. `scripts/check-downloads-storage.mjs` automates that reasoning.

## Layout

Installers live in the existing `video-api` bucket under `downloads/`,
alongside the prefixes VSR-Pro and Face Studio already use:

```
video-api/
├── downloads/        installers (this document)
├── facestudio/       Face Studio input and output
├── gateway/          VSR-Pro input and output
└── weights/
```

One bucket keeps the credential count down; the R2 token in use is scoped to
object read/write on `video-api` and cannot create buckets or list the
account, which is the right ceiling for it.

If installers ever need their own credential, create a `product-downloads`
bucket with a token scoped to it and change `R2_DOWNLOADS_BUCKET` and
`R2_DOWNLOADS_PREFIX`. Nothing else in the code assumes the shared bucket.

## Environment

```
R2_DOWNLOADS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_DOWNLOADS_ACCESS_KEY_ID=...
R2_DOWNLOADS_SECRET_ACCESS_KEY=...
```

Unset any of them and the route falls back to Supabase Storage, so a
misconfiguration degrades rather than breaks. Optional overrides:
`R2_DOWNLOADS_BUCKET` (default `video-api`), `R2_DOWNLOADS_PREFIX` (default
`downloads`), `R2_DOWNLOADS_REGION` (default `auto`).

## Signing

`lib/r2-sign.ts` implements SigV4 query presigning with nothing but
`node:crypto`. `@aws-sdk/s3-request-presigner` would be a large dependency
for one presigned GET.

One trap is worth knowing, because it fails in a misleading way.
`URLSearchParams.toString()` serialises a space as `+`, but SigV4 requires
`%20`. The mismatch only appears once a parameter value contains a space —
here `response-content-disposition: attachment; filename="…"` — and R2
rejects it as `SignatureDoesNotMatch`, which reads like a bad key rather than
bad encoding. The canonical query is therefore built with
`.replace(/\+/g, "%20")`, and the same string is reused in the returned URL
so the two cannot drift.

## Operations

Upload or repair every installer:

```bash
export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... AWS_DEFAULT_REGION=auto
aws s3 sync downloads-private/ s3://video-api/downloads/ \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com \
  --exclude '*' --include '*.zip' --include '*.exe'
```

`downloads-private/` is the source of truth and is git-lfs tracked.
`next.config.mjs` excludes it from the Vercel bundle — 330 MB would otherwise
eat most of the 250 MB function limit.

### Adding a new installer

1. Put the file in `downloads-private/`.
2. Add it to `FILE_PRODUCT_MAP` in `app/api/downloads/[filename]/route.ts`,
   mapped to its `product_id` from `lib/products.ts`. The map is an
   allowlist, so an unlisted file 404s however it is reached.
3. Sync to R2.

Step 2 is easy to forget and the symptom is a 404 that looks like a missing
upload.
