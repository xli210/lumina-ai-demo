# Video FaceSwap Online: the one-week trial (paid in credits)

A limited, queued trial of a video face swap, open to registered users from
2026-10-13 05:00 UTC to 2026-10-20 06:00 UTC (`lib/facestudio-v.ts`). It follows the
free three-day preview of 2026-10-10 to 2026-10-13. Not a launched product: the page
says "official release coming soon".

Nothing here has been posted anywhere on your behalf.

## How billing works (since 2026-10-13)

Each video costs credits. The studio prices it (`swap_pipelines/credits.py`, 100 credits =
US$1, from the mode, output size, length and number of people) and reports, per job,
whether to keep the charge or return it. It knows no balances. Our server holds the
balance:

```
studio page (tunnel origin)                     nanopocket.ai
  /api/quote            -> price + signed quote
  show price + balance  <------------- GET  /api/facestudio-v/me
  user confirms
  reserve               -------------> POST /api/facestudio-v/hold   {credits}      (credit_hold)
  /api/run + quote      -> job id
  attach                -------------> POST /api/facestudio-v/job    {hold_id, job} (price must fit)
  poll the job ...
  finished / failed     -------------> POST /api/facestudio-v/settle {job}
                                        server asks the studio for billing.status:
                                        settled -> credit_capture, refunded -> credit_release
```

- **Who is calling.** The studio page cannot use our cookies, so `/facestudio-v/launch`
  appends a signed token to the studio URL as a fragment (`#t=...`, never sent to a
  server). It names one user and lives 3 hours (`lib/facestudio-v-token.ts`). The key is
  derived from `SUPABASE_SERVICE_ROLE_KEY`; nothing new to configure.
- **The page never decides.** `settle` reads the job's billing status from the studio
  itself, server to server, and acts on that. A job priced above its reservation is
  cancelled and the reservation returned.
- **Failed, cancelled or abandoned = free.** A reservation is released, never charged.
  Reservations left by a closed tab are settled the next time that user opens the studio
  (and expire after 60 minutes regardless).
- **Open videos per account:** 2. The studio also allows one task per IP.
- The decisions are pure functions with tests:
  `node --experimental-strip-types scripts/check-facestudio-v-billing.mjs` and
  `scripts/check-facestudio-v-token.mjs`.

**What this does not stop.** The studio cannot tell whether the page really reserved
credits, and a visitor who copies the studio's access key from the address bar could call
the studio directly and skip billing. Making that impossible needs the studio to require our
token on `/api/run` (a shared secret on both sides). For a one-week trial this was judged
acceptable; say so before widening it.

### What you must set up

1. **The studio** (`swap_pipelines`): start it with `STUDIO_BILLING=1`, a
   `STUDIO_BILLING_SECRET` of your own, and (optional) `STUDIO_PARENT_ORIGIN=https://nanopocket.ai`.
   `/api/health` then reports `billing.enabled: true`.
2. **Vercel:** set `FACESTUDIO_V_STUDIO_URL` to the studio's current link, including `?key=...`
   (a quick tunnel gets a new address on every restart; update it each time).
3. Until both are true, `/facestudio-v/launch` shows "is being set up" instead of sending
   anyone in: it only redirects when the studio answers `/api/health` with billing on.

## What is deployed

| Piece | Where | Who can see it |
|---|---|---|
| The page: the owner's demo, 14 cases as video (`Matrix/demo_export/site`, unchanged apart from the name, absolute media paths, search/share tags and the studio button) | `/facestudio-v` (static file `public/facestudio-v/index.html`, served by a rewrite in `next.config.mjs`; media in `public/facestudio-v/media/`) | **Everyone, indexable.** This is the page that brings people in |
| Sign-in door to the live studio | `/facestudio-v/launch` (`app/facestudio-v/launch/page.tsx`) | Signed-in users, inside the window |
| Homepage card (leftmost column), What's new item | `app/components/announcement-section.tsx`, `whats-new-bar.tsx` | Everyone |

Only `/facestudio-v/launch` needs a session (`lib/supabase/middleware.ts`) and is
closed outside the window (`middleware.ts`). The page and its videos are public.
After the window the page stays up and its "Try Video FaceSwap Online" buttons hide
themselves.

## The studio address (needs you)

The live studio runs on your machine behind a Cloudflare quick tunnel and opens
with a private link ending `?key=…`. That link is **not in this repository**
(it is public). Set it as an environment variable in Vercel (all three
environments, Production at least) and redeploy:

```
FACESTUDIO_V_STUDIO_URL = <the full https link you were given, including ?key=…>
```

Until it is set, `/facestudio-v/launch` shows "is being set up" instead of the
studio.

Things to know about how that link behaves (checked 2026-10-10):

1. Opening it sets a `studio_auth` cookie on the studio's domain, valid for **two
   weeks**. A browser that has been in keeps access after our 72 h window closes.
2. The key is the same for everyone. A registered user who copies the link from
   the address bar can share it with people who are not registered.
3. A `trycloudflare.com` quick tunnel gets a new address whenever it restarts,
   and Cloudflare gives no uptime promise for it. For anything longer than this
   preview, use a named tunnel on your own domain.

To end all access when the preview closes: **rotate the key on the studio**, and
update `FACESTUDIO_V_STUDIO_URL` (or remove it).

## Licence and consent: read before leaving it up

The demo footage is Mixkit free stock video, and every "after" face is another
stock model's. The Mixkit Stock Video Free License allows commercial use,
modification and distribution, "with some important limits" set out in the User
Terms. Those terms forbid use that breaches the Envato Acceptable Use Policy,
which includes violating the rights of others, "including ... privacy rights
(including any unauthorized impersonation of another person)". Face-swapping an
identifiable model is a grey area under that wording; the demo's own README
flags it and asks you to read the licence or ask Mixkit. A model release for
stock footage normally does not cover use in a face-swap advertisement.

What the pages already do about it: label every example as an AI-generated test
render, say the faces are other stock models used only for testing, and carry the
"do not publish swaps of real people without their permission" line. They cannot
make the use licensed. If you want certainty, ask Mixkit, or replace the clips
with footage you own or have releases for (`public/facestudio-v/media/`,
and the `DATA = {…}` line in `public/facestudio-v/index.html`).

## SEO / GEO

- `/facestudio-v` (the static page): title, description, canonical, OG/Twitter card
  (`public/images/facestudio-v/og-facestudio-v.jpg`), Event (start/end, free offer),
  WebPage and BreadcrumbList JSON-LD. No FAQPage markup: the page has no visible FAQ.
- In `sitemap.xml` (daily, 0.95), `sitemap-images.xml` (6 images), `llms.txt`,
  `llms-full.txt`, the homepage offer catalogue, the footer, and links from
  `/face-studio` and `/image-edit`.
- `scripts/check-geo.mjs` checks the page's title, description, canonical and JSON-LD.
- `/facestudio-v/index.html` is the same file; its canonical points at `/facestudio-v`.

## Launch kit (drafts only: check each community's rules, post from your own account)

Do not post the same text everywhere. Use UTM links
(`?utm_source=…&utm_medium=social&utm_campaign=facestudio-v`).

**Show HN**

> Show HN: A video face swap that changes one person and leaves the rest as filmed (3-day preview)
>
> I'm running a three-day, queued preview of a video face swap. You give it a clip and a reference photo; it replaces one person's face (or whole head) in every frame, keeps the original sound, and in a multi-person clip you choose who changes. The page shows frames from real renders on stock footage and says plainly what it will not do (no guessing between two equally prominent people; frames where a head turns too far stay as filmed).
>
> It needs a free account, requests are queued, and the preview closes on Oct 13 (04:00 UTC). The official release comes later.
>
> https://nanopocket.ai/facestudio-v?utm_source=hn&utm_medium=social&utm_campaign=facestudio-v

**Product Hunt:** "Coming soon" page first; tagline "Swap one face in a video. Leave the rest as filmed."
First comment: what it does, the 72 h window and the queue, the limits, and a question ("which clip would you try?").

**r/videography or r/VideoEditing** (check that tool posts are allowed):
ask for feedback on where it fails (fast motion, occlusion, side profiles), not for upvotes.

On "chart rankings": none of this can promise a placement. What helps is a
specific, honest post, a real reason to try it before Oct 13, and answering
every comment within the hour while the preview runs.
