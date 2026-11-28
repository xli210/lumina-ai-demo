import type { BlogPost } from "@/lib/blog-posts";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_NAME, FACE_SWAP_CREDITS, HEAD_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES } from "@/lib/facestudio";
import { DAILY_FREE_FACE_SWAPS, FREE_PHOTO_MAX_SIDE } from "@/lib/facestudio-daily-free-rules";
import { FACESTUDIO_V_MAX_SECONDS, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import {
  FREE_VIDEO_HEAD_SWAP_BEST_CREDITS,
  FREE_VIDEO_HEAD_SWAP_FAST_CREDITS,
  FREE_VIDEO_HEAD_SWAP_SECONDS,
  PHOTO_FACE_SWAP_MAX_SIZE,
} from "@/lib/free-tier";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_MAX_VARIATIONS, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";

/**
 * Three how-to guides for head swap, written 2026-11-28 when /head-swap had become ChatGPT's second landing page
 * for new sign-ups. Each answers one question people ask an assistant: how to swap a head in a photo, how to do
 * it in a video, and whether a head swap or a face swap is the right tool.
 *
 * Every product fact comes from a page or constant that already states it, so a guide cannot disagree with
 * the product:
 *  - HeadSwap Pro (find people, click one, rebuilt in the pose, up to 4 variations, full size, about 40 s for a
 *    portrait, JPG/PNG/WebP up to 25 MB, upload kept 3 h, result downloadable 24 h, watermark until the first
 *    purchase): app/headswap-pro/copy.ts and lib/headswap-pro.ts;
 *  - video head swap (Best and Fast credits for 5 s and 10 s, times per 100 frames, 12 s / 3 s, 30 fps counting,
 *    queue, no cancel after Create, refund on failure, moving watermark until a top-up): app/video-head-swap/page.tsx
 *    and FACESTUDIO_V_FAQ; the 5 s and 10 s prices are copied from there, so change them together;
 *  - Face Studio's head mode, faces per photo and the free photo output: lib/facestudio.ts, lib/face-studio-facts.ts,
 *    lib/facestudio-daily-free-rules.ts;
 *  - every head swap model is a diffusion model: owner, 2026-11-08.
 *
 * Deliberately not said: which diffusion model runs, success rates, any comparison with a named rival.
 */

const DATE = "2026-11-28";
const PRO_FREE = Math.floor(SIGNUP_GRANT_CREDITS / HEADSWAP_PRO_CREDITS_PER_IMAGE);
const HEAD_MAX = FACESTUDIO_V_MAX_SECONDS.head;
const FACE_VIDEO_MAX = FACESTUDIO_V_MAX_SECONDS.full;
const FACE_VIDEO_FREE = FACESTUDIO_V_MAX_SECONDS.free;

const VIDEO_IMAGE = {
  src: "/facestudio-v/media/cmp/hd2_best.jpg",
  alt: "A video head swap made with Headswap Best: an AI-generated test render on stock footage",
  width: 832,
  height: 704,
};

export const HEAD_SWAP_GUIDE_POSTS: BlogPost[] = [
  {
    slug: "how-to-head-swap-a-photo-online",
    title: "How to Swap a Whole Head, Hair Included, in a Photo Online",
    description:
      "A step-by-step guide to an AI head swap in a photo: what to upload, how to pick one person in a group shot, what makes it look natural, and what it costs in credits.",
    date: DATE,
    keywords: [
      "head swap photo",
      "how to head swap",
      "swap head in photo online",
      "head swap with hair",
      "ai head swap online",
      "head swap group photo",
      "replace head in picture",
    ],
    cta: {
      title: "Try a photo head swap",
      body: `New accounts get ${SIGNUP_GRANT_CREDITS} free credits, enough for ${PRO_FREE} head swaps. The price is shown before every swap, and a swap that fails costs nothing.`,
      href: "/headswap-pro",
      label: `Open ${HEADSWAP_PRO_NAME}`,
    },
    content: `## The short answer

Upload the photo you want to change and a clear, front-facing photo of the new head to [${HEADSWAP_PRO_NAME}](/headswap-pro), click the person to change, and press Swap. The new head arrives with its face, its hair and its head shape, redrawn in the pose and light of the original. The body, the clothes, the background and everyone else stay exactly as they were. A portrait takes about 40 seconds, and the result keeps your photo's resolution.

That is the difference from a face swap, which changes only the inner face and keeps the original hair. If you are not sure which one you need, see [head swap vs face swap](/blog/head-swap-vs-face-swap-which-to-use).

## What you need

- **The scene photo:** any portrait or group photo in which the person you want to change shows their face.
- **The new head:** a sharp, front-facing photo with the whole head and hair visible. Its face and its hairstyle come along.
- Both as JPG, PNG or WebP, up to 25 MB each.
- A free NanoPocket account (email, no card).

## Step by step

1. Open [${HEADSWAP_PRO_NAME}](/headswap-pro) and upload the scene photo. People are found automatically.
2. In a group photo, click the person you want to recast. Only that head changes.
3. Upload the new head.
4. Choose 1 to ${HEADSWAP_PRO_MAX_VARIATIONS} variations and press Swap. Each variation is ${HEADSWAP_PRO_CREDITS_PER_IMAGE} credits, and the button shows the total before you press it.
5. Drag the slider to compare before and after, and download the take you like.

Your uploaded photo is kept for up to 3 hours, so you can try several heads on it. A finished image can be downloaded for 24 hours.

## How to get a natural result

- **Match the angle if you can.** The new head is rebuilt in the pose of the head it replaces, turned to the side, tilted back or even seen from below, but a reference with a similar angle and lighting blends best.
- **Keep the head in view.** The head you replace should be large enough to see clearly and not covered by hands, a phone or props.
- **Use a clean reference.** The face should be fully visible in the photo of the new head.
- **Ask for variations.** Several takes of the same swap differ in small ways. Asking for ${HEADSWAP_PRO_MAX_VARIATIONS} at once and picking the best is often quicker than trying again one by one.

## Several people in one photo

${HEADSWAP_PRO_NAME} changes one person per swap. To change several people in one render, [${FACE_STUDIO_NAME}](/face-studio) takes up to ${FACESTUDIO_MAX_FACES} faces in one photo, each with its own reference, and has a whole-head mode at ${HEAD_SWAP_CREDITS} credits per head. Its output keeps the source resolution up to ${PHOTO_FACE_SWAP_MAX_SIZE} once an account has bought credits; before that, its photos come out at up to ${FREE_PHOTO_MAX_SIDE} px on the longer side with a small corner mark.

## What it costs

- ${HEADSWAP_PRO_NAME}: ${HEADSWAP_PRO_CREDITS_PER_IMAGE} credits per image. The ${SIGNUP_GRANT_CREDITS} free sign-up credits cover ${PRO_FREE} head swaps.
- A swap that fails costs nothing.
- Results from an account that has never bought credits carry a small NanoPocket.ai watermark. Buy credits once and later results are clean, whatever your balance.

## Why it can change the hair

Every NanoPocket head swap is a diffusion model. A typical face swapper pastes a new inner face and keeps the original hair and outline; a diffusion model redraws the whole head, so the hair, the hairline and the head shape can change too. The details are in [Diffusion Head Swap vs GAN Face Swap](/blog/diffusion-head-swap-vs-gan-face-swap).

## Use faces you have the right to use

Swap your own face, or a face you have permission to use. Do not publish a swap of a real person without their consent.

More on every head swap tool, for photos and video, is on [/head-swap](/head-swap).`,
  },
  {
    slug: "how-to-do-a-video-head-swap",
    title: "How to Do a Video Head Swap: Clip Length, Headswap Best vs Fast, and Credits",
    description:
      "How to replace a whole head, hair included, in a video clip: preparing the clip, choosing Headswap Best or Fast, how long a clip can be, what it costs in credits, and what to do if it fails.",
    date: DATE,
    keywords: [
      "video head swap",
      "how to head swap a video",
      "head swap video online",
      "replace head in video",
      "ai video head swap",
      "head swap video free",
      "headswap best vs fast",
    ],
    image: VIDEO_IMAGE,
    cta: {
      title: "Try a video head swap",
      body: `New accounts get ${SIGNUP_GRANT_CREDITS} free credits, enough for a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second head swap. The price is shown before you start, and a video that fails gives its credits back.`,
      href: "/video-head-swap",
      label: "Compare Headswap Best and Fast",
    },
    content: `## The short answer

Open [${FACESTUDIO_V_NAME}](/facestudio-v), choose **Headswap Best** or **Headswap Fast**, upload a short clip and a clear, front-facing photo of the new head, check the price and press Create. The person's whole head, face, hair and head shape, is replaced from the photo. The body, clothes, background, everyone else in the shot and the original sound stay as filmed.

A clip can be up to ${HEAD_MAX} seconds on an account that has topped up credits, and ${FREE_VIDEO_HEAD_SWAP_SECONDS} seconds on one that has not. Output is 1080p or 4K.

## Prepare the clip

- **Trim it first.** Only the part you need counts. A clip is counted by its frames, at 30 frames per second at most, so a 60 fps clip counts as twice as long as it plays.
- **Keep the head in view.** The person whose head you replace should be large in the frame and not hidden behind hands, a microphone or props for long.
- **Watch the light.** In heavy backlight or lens flare, a video head swap can lose the head for a moment.
- **Pick the reference.** A sharp, front-facing photo with the whole head and hair visible works best.

## Headswap Best or Headswap Fast

Both are diffusion models that redraw the whole head. Credits below are for 1080p, one person, 30 fps; 4K costs twice as many credits as 1080p, and the exact price of your clip is shown before you start.

| | Headswap Best | Headswap Fast |
| --- | --- | --- |
| 5-second clip | 149 credits | 102 credits |
| 10-second clip | 218 credits | 143 credits |
| ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second clip, account that has never topped up | ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} credits | ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} credits |
| Time per 100 frames | about 81 to 95 s | about 42 to 60 s |

Headswap Best is for the highest quality. Headswap Fast is about 40% faster and uses about 35% fewer credits, and its quality may be slightly lower, which makes it a sensible first try on a new clip. Times were measured on our GPUs with the models already loaded and do not include any wait in the queue. Side-by-side renders of both are on [/video-head-swap](/video-head-swap).

## Step by step

1. Sign in to a free NanoPocket account and open [${FACESTUDIO_V_NAME}](/facestudio-v).
2. Choose Headswap Best or Headswap Fast.
3. Upload the clip, then the photo of the new head. If several people are in the shot, choose the one to change.
4. Check the price and confirm that you have the right to use the face.
5. Press Create. A head swap cannot be cancelled once it starts; requests are queued, so your clip may wait for its turn.

## If it fails, or looks wrong

- **A failed video costs nothing:** its credits are returned.
- **The head flickers or disappears for a moment:** look for backlight, flare or something crossing the face in those frames, and trim around them if you can.
- **The new head does not look like the photo:** try a sharper, more front-facing reference with the hair fully visible.

## Free videos and the watermark

New accounts get ${SIGNUP_GRANT_CREDITS} free credits, enough for a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second head swap. Videos from an account that has never topped up carry a slowly moving NanoPocket watermark and wait behind those that have. One top-up removes the mark from later videos and unlocks the full ${HEAD_MAX} seconds.

## Longer than ${HEAD_MAX} seconds?

A video **face** swap runs up to ${FACE_VIDEO_MAX} seconds. It keeps the original hair and head shape and changes only the face, which is often enough when the two people have similar hair. See [how to swap a face in a video](/blog/how-to-swap-a-face-in-a-video).

## Use faces you have the right to use

The studio asks you to confirm this before every video. Do not publish a swap of a real person without their permission.`,
  },
  {
    slug: "head-swap-vs-face-swap-which-to-use",
    title: "Head Swap vs Face Swap: Which One Should You Use?",
    description:
      "A face swap changes the face and keeps the hair; a head swap changes the face, hair and head shape. How to choose between them for photos and video, with the limits and credits of each.",
    date: DATE,
    keywords: [
      "head swap vs face swap",
      "difference between head swap and face swap",
      "face swap or head swap",
      "head swap with hair",
      "face swap keeps hair",
      "whole head swap",
    ],
    cta: {
      title: "Try both",
      body: `New accounts get ${SIGNUP_GRANT_CREDITS} free credits, and every signed-in account gets ${DAILY_FREE_FACE_SWAPS} free photo face swap a day. Every tool shows its price before it starts.`,
      href: "/head-swap",
      label: "See every head swap tool",
    },
    content: `## The short answer

- A **face swap** replaces the face and keeps everything around it: the original hair, hairline, ears and head shape.
- A **head swap** replaces all of it: the face, the hair and the head shape come from the new photo.

Choose a head swap when the hair or the outline of the head matters, or when the two people look very different. Choose a face swap when the hair can stay, when you want the quickest and cheapest result, or when the video is longer than ${HEAD_MAX} seconds.

## Side by side

| | Face swap | Head swap |
| --- | --- | --- |
| What changes | The face | Face, hair and head shape |
| Photo tool | [${FACE_STUDIO_NAME}](/face-studio) | [${HEADSWAP_PRO_NAME}](/headswap-pro), or ${FACE_STUDIO_NAME}'s head mode |
| Photo credits | ${FACE_SWAP_CREDITS} per face | ${HEADSWAP_PRO_CREDITS_PER_IMAGE} per image (${HEADSWAP_PRO_NAME}), ${HEAD_SWAP_CREDITS} per head (head mode) |
| Free photo allowance | ${DAILY_FREE_FACE_SWAPS} free photo face swap a day, plus the sign-up credits | The sign-up credits: ${PRO_FREE} head swaps |
| Video tool | ${FACESTUDIO_V_NAME}: Fast or Best quality | ${FACESTUDIO_V_NAME}: Headswap Fast or Headswap Best |
| Longest video | ${FACE_VIDEO_MAX} seconds (${FACE_VIDEO_FREE} before a first top-up) | ${HEAD_MAX} seconds (${FREE_VIDEO_HEAD_SWAP_SECONDS} before a first top-up) |

## When a face swap is the better choice

- **The hair should stay.** Costume photos, a character look, a team photo where everyone keeps their own haircut.
- **The faces are already similar** in shape and hairline, so only the features need to change.
- **The video is long.** A video face swap runs up to ${FACE_VIDEO_MAX} seconds.
- **You want the lowest cost.** A photo face swap is ${FACE_SWAP_CREDITS} credits, and one a day is free.

## When a head swap is the better choice

- **The hair is part of the look:** a different hairstyle, colour or length.
- **The head shapes differ a lot.** A face swap can look like a mask when a new face sits inside the wrong outline; a head swap redraws the outline too.
- **You want the whole person to look like the photo,** not just the inner face.
- **One person in a group photo.** ${HEADSWAP_PRO_NAME} finds everyone in the picture and changes only the person you click.

## Why a head swap can change the hair

Most face swappers are GANs that paste a new inner face onto the original head. Every NanoPocket head swap, for photos and for video, is a diffusion model that redraws the whole head in the pose and light of the original. That is what lets it change the hair and head shape. [Diffusion Head Swap vs GAN Face Swap](/blog/diffusion-head-swap-vs-gan-face-swap) explains the difference in more detail.

## Step-by-step guides

- [How to swap a whole head in a photo](/blog/how-to-head-swap-a-photo-online)
- [How to do a video head swap](/blog/how-to-do-a-video-head-swap)
- [How to swap a face in a video](/blog/how-to-swap-a-face-in-a-video)

Whichever you choose, use a face only if you have the right to use it.`,
  },
];
