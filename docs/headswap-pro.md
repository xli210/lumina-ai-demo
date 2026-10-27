# Nano HeadSwap Pro: how it is wired and how to release it

Source: the worker maintainers' hand-off (`headswap_pro_web_handoff.zip`, 2026-10-25). Model id `headswap-pro`
(the older one is `headswap-std`). Public name: **Nano HeadSwap Pro** (one constant, `HEADSWAP_PRO_NAME` in
`lib/headswap-pro.ts`); poster line "Starring you."

## Parts

```
browser  /headswap-pro/index.html  (public/, the hand-off page with the credit flow added)
   │  1. POST /api/headswap/hold   reserve credits, get a signed ticket          ┐
   │  2. POST <gateway>/api/swap   with X-HS-Ticket (the gateway refuses without) │ this site (Next.js)
   │  3. POST /api/headswap/job    tie the reservation to the gateway's job       │
   │  4. POST /api/headswap/settle charge what was delivered, or give it all back ┘
   ▼
headswap-gateway/app.py  (Render, one instance)  ──►  RunPod GPU (already live)  ──►  Cloudflare R2
```

- The page talks to the gateway directly for photo upload and swap (uploads are up to 25 MB, over Vercel's request
  limit), so the gateway is what enforces payment: with `HS_TICKET_REQUIRED=1` a swap needs a ticket that only this
  site can sign, and only after credits are reserved. A ticket pays for one swap and at most the images reserved.
- Photo upload needs a valid sign-in token too (detection runs on a GPU).
- Images do not pass through Render: the page asks the gateway for a presigned R2 link (`POST /api/upload-url`), PUTs the file
  to R2 itself, and sends only the key. The gateway only accepts keys it issued (a register), checks the object arrived and is
  within 25 MB, and refuses file bytes while `HS_TICKET_REQUIRED=1`. This needs the same R2 CORS rule as Face Studio (PUT from
  https://nanopocket.ai, header content-type), see docs/face-studio.md. Same arrangement as Face Studio, so Render's bandwidth
  and memory are not used for images.
- Watermark: the same rule as Face Studio. `paid` = has ever bought credits (`hasEverPurchased`). It is signed into the
  ticket, so editing the page cannot remove it. `HS_WATERMARK_MODE=never` is the emergency switch (gateway env).
- Settlement never trusts the page: `/api/headswap/settle` asks the gateway for the job and charges
  `20 credits x billable_images`, capped at what was reserved. A failed job, or one owed a watermark that came back without
  it, is released. A swap whose tab was closed is settled the next time the account reserves credits.
- Price: `HEADSWAP_PRO_CREDITS_PER_IMAGE = 20` ($0.20). GPU cost measured by the maintainers is $0.011 to $0.04 an image.
  It is the same as one head swap in Face Studio; change the constant to reprice.

## Secrets (come from the GPU maintainer, never committed)

| Where | Variable | Notes |
|---|---|---|
| Render (gateway) | `RUNPOD_API_KEY`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | |
| Render (gateway) | `HS_ENTITLEMENT_SECRET` | **same value as on Vercel** |
| Render (gateway) | `HS_ADMIN_KEY` | for `/api/admin/logs` |
| Render (gateway) | `HS_TICKET_REQUIRED=1`, `HS_WATERMARK_MODE=credits`, `HS_CORS_ORIGINS=https://nanopocket.ai` | already in `render.yaml` |
| Vercel | `HS_ENTITLEMENT_SECRET` | same as the gateway |
| Vercel | `HEADSWAP_GATEWAY_URL` | `https://<the Render service>.onrender.com` |
| Vercel | `HEADSWAP_PRO=1` | the last switch; unset = the page says "Opening soon" and nothing can start |

## Release order

1. Create the Render web service from `headswap-gateway/` (Blueprint: `render.yaml`; plan with one always-on instance, never
   more than one: photos and jobs live in memory). Fill the secrets. Render does not redeploy on push; deploy by hand.
2. Open `<gateway>/api/health`: expect `"status": "ready"`, `"entitlement_secret_set": true`, `"ticket_required": true`.
3. Set `HS_ENTITLEMENT_SECRET` and `HEADSWAP_GATEWAY_URL` on Vercel, redeploy, then set `HEADSWAP_PRO=1` and redeploy.
4. Walk the acceptance list below with a free account and a paying account.
5. After it works: add `/headswap-pro` to `app/sitemap.ts`, `app/llms.txt/route.ts` and the apps/nav links, and record the name in memory.

## Acceptance list

- [ ] Not signed in: the page asks to sign in; uploading a photo is refused (401); pressing Swap cannot start anything.
- [ ] Free account: notice "free version", the result carries the NanoPocket.ai watermark, the balance drops by 20 per image.
- [ ] Account that has bought credits: no notice, clean result.
- [ ] Delete or edit the `X-HS-Entitlement` / `X-HS-Ticket` headers in dev tools: no swap, or still watermarked.
- [ ] Two variations cost 40, four cost 80; a failed job costs nothing; reloading during a swap does not charge twice.
- [ ] Close the tab mid-swap, wait for it to finish, press Swap again: the first one was charged, then the new one starts.
- [ ] Not enough credits: 402 with a "Buy credits" message, and the button does not start anything.
- [ ] Group photo: pick another person; a photo with no face: "No face found".
- [ ] Phone layout.
- [ ] `/admin/reliability` lists "Nano HeadSwap Pro" with its renders and failures.

## Tests

`headswap-gateway/test_ticket.py` (27 checks on the ticket rules and the direct-upload flow, no network; needs fastapi, httpx, boto3, requests,
python-multipart). The website side has no automated test yet: the token and ticket format is the one the gateway test builds.

## Launch page (`/headswap-pro`) and its media

Laid out like a product keynote; the weight budget is the constraint because the launch film is long (53 s, 300 MB at 1080p60).

- The film is **not** hosted here. It is a picture and a play button (`FilmFacade`); YouTube (`youtube-nocookie.com`, id in `page.tsx`)
  is contacted only when someone presses play.
- The loop under the headline, `public/headswap-pro/teaser.mp4`, is seconds 33.0 to 42.8 of the film (the oil portrait and the studio before/after: the stretch with no film posters,
  which start at about 43.5 s), 1280x720, silent, clear. It starts only after the page has loaded, never with Save-Data or 2G, never with reduced motion, and pauses off screen.
  The poster (`teaser-poster.webp`) is what loads first.
- Compare images are lazy WebP in `public/headswap-pro/compare/` (668 KB for both examples). No animation library, no web font.
- Regenerate the clips and images with the ffmpeg and PIL commands in the session that built them (source: `headswap_pro_launch_1080p60.mp4`,
  `headswap-pro-compare.zip`); keep the teaser under 9 s and 500 KB.

### Not shown on purpose: film posters

The worker team's comparison pack and the launch film use real film posters (*Us*, *Klara and the Sun*, *Star Wars: The Last Jedi*, *Drive*), with the
actors' likenesses in the originals. Their own checklist says that is a legal risk on a public marketing page. So the page uses only the two examples
without posters (a mirror selfie and an editorial studio shot), and the teaser stops before the first poster appears (the film has none before 0:10).
The YouTube film itself does contain them. If legal clears the posters, the other two examples (`ex1`, `ex4`) can be added to `EXAMPLES` in
`app/headswap-pro/page.tsx`; their images are in the original zip, not in this repository.

### Film posters on the home page (decided by the owner)

The first slide of the home page carousel plays `public/headswap-pro/hero-posters.mp4`: 10 s cut from the launch film (the *Us* poster swap, then the *Star Wars: The Last Jedi*
multi-face poster swap), silent, 30 fps. Two files: `hero-posters.mp4` (1920 wide, crf 25, 3.3 MB, for screens 900 px and wider) and `hero-posters-sm.mp4` (1280 wide, crf 27, for phones); the poster is 1920 wide. The owner asked for the film-poster swap in the home hero. It contains real film posters, so the legal note above applies
to it. To go back to a poster-free hero, point the slide in `app/components/hero-section.tsx` at `compare/ex2_v2.webp` (an image slide) or at `teaser.mp4`.
