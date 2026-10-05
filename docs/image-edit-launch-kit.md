# Nano ImageEdit 2.0 Online: audiences and launch kit

Written 2026-10-05. Drafts only: nothing here has been posted anywhere. Posting is your call, from your own accounts.

## What the product is actually good at

Every other online photo editor competes on "remove an object" or "AI photo editor". Those head terms belong to Photoroom, Canva, Adobe and similar, and a three-week-old domain will not rank for them soon.

What this product does that most of them do not: **for Remove, Replace, Add, Text and Magic Edit, every pixel outside the edited area stays identical, and the editor says so and reports how much changed** (4.15% for the street example, 10.17% for the sign). That matters to people who have to be able to trust the rest of the picture. So the targeting below is by *who needs that*, not by *what the tool is*.

The face-swap audience (entertainment, memes, curiosity) is a different crowd. Do not expect them to convert on ImageEdit; reach them with a small cross-link (below), not with the same message.

## Audiences, ranked

These rankings are judgement, not measured demand. Search volume and competition were not looked up. Check them in Search Console after two to three weeks, and let the real queries re-rank this list.

| # | Audience | Why they fit | Page | Risk |
|---|---|---|---|---|
| 1 | Real estate agents and property photographers | Clear, recurring, paid job (clean a listing photo); care about keeping the property true; searches like "remove cars from real estate photos" are specific | `/use-cases/real-estate-photos` | Listing-photo rules differ by MLS and country. The page says so. No batch mode is a real gap for 25-photo listings |
| 2 | Family historians, genealogists | Huge, patient audience; "colorize old photos" is searched constantly | `/use-cases/old-family-photos` | Competitors are free and entrenched (MyHeritage, etc.). Whole-photo edit, so identity preservation is the honest concern |
| 3 | Small businesses, marketers | Sign, poster and menu edits | `/use-cases/signs-menus-and-posters` | Only short Latin text has been tested |
| 4 | Photographers, travel bloggers, creators | Remove the one parked car; change the season | `/use-cases/travel-and-street-photos` | Most price-sensitive; many do this free in other tools |

Start with 1 and 2. Both have a clear job and a reason this tool is a fit. 3 and 4 are secondary.

## What was tried and failed (kept honest on the pages)

Removing a small sign stand and a stack of brochures from a cafe window sill by description alone: three runs, the editor reported no change each time. The real-estate page says so. Do not post that example as a success.

## Messaging rules

- Lead with the guarantee, not the AI: "It changes only what you describe, and tells you how much changed."
- Use real numbers from the pages. Do not round 4.15% to "about 5%".
- Always name the limits when asked. The pages already do.
- Say who built it. People on community forums discount posts that hide it.

## Draft posts

Check each community's self-promotion rules first. Several ban or restrict them. Do not post the same text in several places. If a rule bars links, offer the link only when someone asks.

### Show HN

> Show HN: A photo editor that only changes what you describe, and tells you how much it changed
>
> I built an in-browser editor where you describe an edit ("remove the silver sedan parked at the curb") and the model changes only that region. For object edits it keeps every other pixel identical and reports the share of the image that changed, 4.15% in this street example. Whole-photo tools (season, relight, restore) are labelled as such because they are not pixel-identical.
>
> It is generative, so runs differ and it can fail: in one test I could not get it to remove a small sign stand from a window sill by description alone (three tries, it reported no change). The page lists limits like that. 50 credits ($0.50) per edit, no subscription, free credits on signup.
>
> Real before/after examples with the exact prompts: https://nanopocket.ai/image-edit?utm_source=hn&utm_medium=social&utm_campaign=launch
>
> Happy to answer questions about how the "identical outside the edit" check works.

### r/realestatephotography (verify the sub's rules first)

> Title: Tool I built for removing cars/bins from listing photos while leaving the rest untouched. Looking for honest feedback
>
> I'm the developer. It's a browser editor: you describe the object, it fills in what was behind it, and the rest of the frame stays pixel-identical (it tells you how much changed, 4% in my street example). It also does a virtual twilight look, but that one restyles the whole photo and lights windows that weren't lit, so check your MLS rules on disclosure.
>
> It is one photo at a time (no batch) and generative, so I'd like to know where it breaks on real listing shots. Examples with prompts: https://nanopocket.ai/use-cases/real-estate-photos?utm_source=reddit&utm_medium=social&utm_campaign=real-estate

### r/genealogy or r/estoration (verify the sub's rules first; some forbid tool promotion)

> Title: Honest question about AI colorizing: how much do you trust the faces?
>
> I built a restore/colorize tool and want to ask this community what matters. The colours are the model's guess, and the face can drift because the whole photo is regenerated, so the page tells people to compare against the scan before sharing. Is that the right warning? What would you need to see before using something like this on family photos?
>
> Example on a 1910 print with the result next to the original: https://nanopocket.ai/use-cases/old-family-photos?utm_source=reddit&utm_medium=social&utm_campaign=genealogy

(That one asks a question first on purpose. A bare promo post to a genealogy forum will be removed.)

### Product Hunt

Tagline: "Edit a photo by describing it. Only that part changes."
First comment: the guarantee, the 4.15% example, the failed sign-stand test, the price, and the question "what would you edit first?"

## Cross-link for existing face-swap users

The Face Studio result screen is the best place to reach people who already use the site and are engaged. A single line under the result, "Need to fix something else in the photo? Edit it by describing the change", linking to `/image-edit`. Not built yet; say if you want it.

## Measure it

All links above carry `utm_source`, `utm_medium`, `utm_campaign`. In Google Analytics, compare views of `/use-cases/*` and `/image-edit`, then views of `/image-edit/launch`, then edits made (spend rows in the credit ledger whose reference mentions imageedit). Without that funnel there is no way to tell exposure problems from conversion problems.

## Still to do on your side

- Search Console and Bing Webmaster: submit the sitemap and request indexing for `/image-edit`, `/use-cases` and the four `/use-cases/<slug>` pages.
- `INDEXNOW_KEY` in Vercel, then `npm run indexnow -- --from-sitemap`.
- Pick one or two of the drafts above, edit them so they sound like you, check the rules, post from your own account.
