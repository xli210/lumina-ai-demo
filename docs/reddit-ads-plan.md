# Reddit ads: a two-week test (written 2026-10-30)

**Goal.** Find out whether Reddit can bring sign-ups and video buyers at a sensible cost, for about $280 over 14 days. Buyers spend 74% of their credits on video, so every ad sells Video FaceSwap Online.

**What you do:** create the account at ads.reddit.com, add a card, and copy the settings below. Everything else is ready.

---

## 1. Account

- Go to ads.reddit.com and sign up with the business email. Business name: NanoPocket. Website: https://nanopocket.ai
- **Do not install the Reddit Pixel or the Conversions API.** The privacy policy (/privacy, section 5) promises "no advertising pixels". Results are measured in GA4 through the UTM tags on each link instead.

## 2. Campaign

| Setting | Value |
|---|---|
| Objective | **Traffic** (clicks). Conversion objectives need the pixel, which we don't use. |
| Campaign name | `NP-video-test-2026-11` |
| Campaign budget | Off (set budgets per ad group) |
| Schedule | 14 days, starting on a Tuesday |

## 3. Ad groups (two, so the targeting can be compared)

### Ad group A: communities

| Setting | Value |
|---|---|
| Name | `A-communities` |
| Budget | $10/day |
| Bid | Cost per click, manual bid **$0.80**. Raise to $1.20 if it has spent under $5/day after 3 days. |
| Locations | US, UK, Canada, Australia, Ireland, New Zealand, Germany, Netherlands, Sweden, France, Spain, Italy |
| Language | English |
| Devices | All. Apple Pay and Google Pay now work on phones. |
| Placements | Feed and conversation |
| Communities | r/VideoEditing, r/aivideo, r/editors, r/NewTubers, r/TikTokCreators, r/youtubers, r/premiere, r/AfterEffects, r/StableDiffusion, r/comfyui, r/aiArt, r/ArtificialInteligence, r/singularity, r/Filmmakers |
| Expansion | Off for the first week |

### Ad group B: interests and keywords

| Setting | Value |
|---|---|
| Name | `B-interests` |
| Budget | $10/day |
| Bid | Same as A |
| Locations, language, devices | Same as A |
| Interests | Technology & Computing, Film & TV, Photography, Art & Design |
| Keywords | face swap, faceswap, ai video, video editing, deepfacelab alternative, facefusion, roop, ai video editor, reface app |

Exclude these from both groups, to keep the ads away from places that would get them reported: politics, news, and NSFW communities.

## 4. The ads (three per group, same three in each)

Video files are in `promo-out/reddit/`, 4:5, silent, with on-screen labels:
- `reddit_ad_4x5_hard_cases.mp4` (30 s: profile turn, hand over the face, arm across the face)
- `reddit_ad_4x5_profile_turn.mp4` (12 s)

Thumbnail: let Reddit pick a frame, or upload `public/facestudio-v/media/xc/profile_turn_poster.jpg`.

### Ad 1: hard cases (video `reddit_ad_4x5_hard_cases.mp4`)

**Headline:**
> Most AI face swaps fall apart when the head turns or a hand covers the face. We built one that doesn't. Original on top, swap below. Runs in your browser, free to start.

- CTA button: **Learn More**
- Destination: `https://nanopocket.ai/facestudio-v?utm_source=reddit&utm_medium=paid&utm_campaign=video_test&utm_content=hard_cases`
- Display URL: `nanopocket.ai`

### Ad 2: one person in the clip (video `reddit_ad_4x5_profile_turn.mp4`)

**Headline:**
> Swap one person's face, or their whole head, in a video. Everyone else and the original sound stay as filmed. New accounts get 100 free credits to try a short clip.

- CTA: **Sign Up**
- Destination: `https://nanopocket.ai/facestudio-v?utm_source=reddit&utm_medium=paid&utm_campaign=video_test&utm_content=one_person`

### Ad 3: price, with no subscription (video `reddit_ad_4x5_hard_cases.mp4`)

**Headline:**
> Video face swap without a subscription: pay per video in credits, see the price before you start, and get refunded if it fails. A 10-second 1080p clip is about 20 credits.

- CTA: **Learn More**
- Destination: `https://nanopocket.ai/facestudio-v?utm_source=reddit&utm_medium=paid&utm_campaign=video_test&utm_content=pricing`

### Words to avoid (ad review)

These phrases tend to get ads rejected or reported:
- "deepfake", "undetectable", "anyone's face", "celebrity"
- Anything sexual
- "unlimited" or "no watermark": free accounts get a watermark, so these would be false

Keep "face swap", "AI video editing" and "head swap".

## 5. Comments

Leave comments on for ads; Reddit users ask questions, and an answered question builds trust. Reply from the advertiser account within a day. Ready answers:

- **Is it free?** "Free to start: new accounts get 100 credits, enough for a short clip. After that you pay per video in credits; the price shows before you start. No subscription."
- **Watermark?** "Videos from an account that has never topped up have a moving watermark and are capped at 5 s. One top-up removes the watermark and allows up to 60 s."
- **Privacy?** "Uploads and results are deleted after 24 hours and never used for training. There's also a free desktop app (Nano FaceSwap) if you want to stay offline."
- **Could this be misused?** "You have to confirm you have the right to use the face before it starts. The examples use stock footage. Don't swap real people without their permission."
- **How is it different from FaceFusion or Roop?** "Those are local GAN swappers you install. This runs in the browser, uses a diffusion restore pass, and was tuned on profile turns, hands and low light. If you prefer local, our desktop app is free."

## 6. Measuring (GA4, no pixel)

In GA4, open Reports → Acquisition → Traffic acquisition and filter Session source = `reddit`, medium = `paid`. Add "Session manual ad content" as a second dimension to compare the ads.

| Check | When | Keep going if | Stop or change if |
|---|---|---|---|
| CTR in Reddit Ads | Day 3 | ≥ 0.5% | < 0.3%: swap the weakest ad for a new hook |
| CPC | Day 3 | ≤ $1.20 | Higher: narrow the communities |
| Sign-ups from reddit / paid (GA4 key event) | Day 7 | ≥ 1 per $15 spent | 0 after $100: pause group B |
| Purchases from reddit / paid | Day 14 | Any | None: stop the test and spend on what works |

Spending $280 for 15 or more sign-ups and a couple of video purchases would be worth scaling. Fewer than 5 sign-ups means Reddit is not the channel for now.

## 7. If an ad is rejected

Reddit sometimes restricts synthetic-media products. If an ad is rejected:
1. Read the reason.
2. Remove the words it names.
3. Resubmit with ad 2's wording, which only describes what the tool does.

If the whole account is restricted, stop. Do not open a second account; that is ban evasion.
