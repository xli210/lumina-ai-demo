# Reddit and community posts: drafts for the owner to post (written 2026-11-01)

Nothing here has been posted. Each item needs your own Reddit account and your decision to publish. This is the unpaid side of the Reddit plan; the paid test is in `reddit-ads-plan.md`.

**Why Reddit:** AI assistants and Google both quote Reddit threads, and on 2026-11-01 nothing outside our own pages names NanoPocket (no directory listing, no review, no roundup). A useful answer in a thread that already ranks is the cheapest way to change that.

## Rules that decide whether these work

1. **Say who you are.** Every post and comment starts or ends with "I work on NanoPocket" (or "I built"). An undisclosed plug gets removed and the account flagged.
2. **Read each subreddit's rules the day you post.** Rules change and I cannot read Reddit from here. Look for: a self-promotion limit (often about 10% of your activity), a required flair, a ban on links in the post body, a weekly self-promo thread.
3. **Comments first, posts later.** Reply helpfully in 5 to 10 existing threads over a week before posting anything of your own. A brand-new account that opens with a link is removed.
4. **One question per comment, an answer first, the link last.** The link is the extra, not the reply.
5. **Never write** "unlimited", "no watermark" (for swaps), "free forever", or that the online tools need no card after the free credits. Say what is true: 100 free credits on sign-up, results carry a watermark until you add credits once, no subscription.
6. **Do not ask for upvotes or comments from friends**, and do not post the same text in several subreddits on the same day.
7. **Faces:** only show footage you have the right to use, and do not post anyone's real photo. Do not call the older Mixkit demo footage licensed (see `seo-backlinks.md`).

## A. Comment templates (the highest-value item)

Find threads by searching Reddit for the phrases below, sorted by new or by top for the year, and answer ones that are still open or recent (a reply under a 2-year-old thread still gets crawled, but a live one also gets read).

**Search for:** "face swap 8gb vram", "face swap rtx 3070", "local face swap", "offline face swap", "face swap no watermark free", "free face swap video", "facefusion alternative", "roop alternative".

### A1. "What face swap runs locally on my GPU?" / "Can my card run it?"

> I work on NanoPocket, so take this with that in mind. For a local swap on Windows you have two routes. The open-source ones (FaceFusion, Roop, Rope) are free and flexible, but you set up Python yourself. We make a free desktop app, Nano FaceSwap, that installs like a normal Windows program and needs an NVIDIA card with at least 6 GB of memory; the 8 GB cards like the 3070 are fine. I wrote up the minimums for each card here, no signup needed: https://nanopocket.ai/blog/can-my-gpu-run-face-swap-rtx-3070-8gb-vram

### A2. "Free face swap with no watermark?"

> Disclosure: I work on NanoPocket. Honestly, free, unlimited and watermark-free on a hosted site doesn't really exist, because the servers cost money. What works is running it on your own PC (FaceFusion and Roop are free; we also have a free Windows app), or paying a small one-off amount online. I put the options and what's free side by side here: https://nanopocket.ai/blog/free-ai-face-swap-no-watermark-what-is-free

### A3. "Face swap on a video where the head turns / a hand covers the face"

> I work on NanoPocket. Those are exactly the shots where most swaps slip, and we tested them: profile turns, hands in front of the face, side views in low light. The before and after clips are on the page, and it says plainly that this is a first look at 74 clips, not a benchmark: https://nanopocket.ai/video-face-swap-test-results. It's paid in credits for video, with the price shown before you start. Happy to answer questions about why they fail.

## B. Posts of your own (only after a week of comments)

### B1. r/StableDiffusion or a face-swap thread (check the sub's tool-showcase rule first)

**Title:** What breaks face swaps in video: profile turns, hands and low light (74 test clips)

**Body:**

> I work on NanoPocket and we published a first look at where video face swaps fail: a head turning 90 degrees, a hand over the face, an arm sweeping across it, side views in low light. 74 clips, before and after with the reference photo, including the ones that still go wrong. It's not a benchmark and it's one pipeline, but if you're building or tuning your own, the failure cases may save you time.
>
> The page: https://nanopocket.ai/video-face-swap-test-results
>
> Happy to discuss what we'd do differently. If you run something local, I'd like to hear how it handles the same footage.

### B2. r/SideProject

**Title:** I make local AI face swap apps and a browser version. What I learned about getting the first buyers

**Body (fill in with your own numbers; these are the true points from the data, share only what you are comfortable with):**

> I build NanoPocket: free local desktop apps for Windows (NVIDIA GPU) and online tools in the browser, paid in credits. A few things surprised me in the first weeks:
>
> - Almost every buyer paid within hours of signing up, and about half of them never used the free credits first. Nobody bought after having been around for days.
> - Most of what they spent went on video, not photos.
> - Free sign-up credits brought plenty of accounts, but also people opening many accounts to collect them. Limiting by browser as well as by network helped, and so did refusing throwaway email addresses.
>
> Site: https://nanopocket.ai. I'd like feedback on the pricing page and on the first minute of the experience.

### B3. r/pcmasterrace or a hardware subreddit (only if a thread asks)

Do not post here unprompted: a GPU thread asking "what can my card do with AI" is the right moment to use comment A1.

## C. What to expect

- One reply that gets a few hundred views and a click or two is a normal result. The point is a stable, honest mention that stays up.
- Watch GA4 (Traffic acquisition, session source `reddit`) from the first comment. Any single thread that sends 50 or more visits is worth answering again.
- If a moderator removes something, do not argue or repost; thank them, and read the rule.
