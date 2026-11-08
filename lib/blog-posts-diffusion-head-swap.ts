import type { BlogPost } from "@/lib/blog-posts";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { HEAD_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_MAX_VARIATIONS, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { FACESTUDIO_V_MEASURED, FACESTUDIO_V_NAME } from "@/lib/facestudio-v";

/**
 * Why NanoPocket's head swap (photo and video) is built on diffusion rather than a GAN face swapper.
 * Written 2026-11-06, when head swap had become the most-used online tool.
 *
 * Every product fact comes from a page or constant that already states it:
 *  - the GAN baseline (inswapper_128, 128 x 128, inner face) and Face Studio's diffusion identity stack:
 *    /docs/face-swap-pipeline;
 *  - HeadSwap Pro (whole head, pick one person, rebuilt in the pose, variations, full size, about 40 s,
 *    price): app/headswap-pro/copy.ts and lib/headswap-pro.ts;
 *  - the video studio (diffusion face enhancement on every result, Headswap Best and Fast, 12 s, the 74-clip
 *    figures, which were measured on the 1.1.0 release): public/facestudio-v/index.html and lib/facestudio-v.ts.
 *
 * Deliberately not said, because nothing in the repo supports it: which diffusion model HeadSwap Pro or the
 * video head swap runs on, that our earlier head swap was a GAN, a measured comparison against any named
 * GAN tool, or usage and sales numbers. The comparison is about what each kind of model can and cannot do.
 */

const DATE = "2026-11-06";

export const DIFFUSION_HEAD_SWAP_POSTS: BlogPost[] = [
  {
    slug: "diffusion-head-swap-vs-gan-face-swap",
    title: "Diffusion Head Swap vs GAN Face Swap: Why We Rebuilt Head Swap for Photos and Video",
    description:
      "Most face swap tools still run a 128-pixel GAN that only replaces the inner face. Here is what a diffusion model changes for whole-head swaps in photos and video, what it costs, and where it still fails.",
    date: DATE,
    keywords: [
      "diffusion head swap",
      "diffusion face swap vs gan",
      "ai head swap",
      "head swap video",
      "inswapper_128 alternative",
      "whole head swap with hair",
      "face swap hair and head shape",
    ],
    image: {
      src: "/videos/hero-headswap-2-5-poster.jpg?v=2",
      alt: "Three stage performers in a video head swap test render, made on stock footage",
      width: 1920,
      height: 1080,
    },
    cta: {
      title: "Try a head swap",
      body: `New accounts start with ${SIGNUP_GRANT_CREDITS} free credits. The price is shown before every job, and a swap that fails costs nothing.`,
      href: "/headswap-pro",
      label: `Open ${HEADSWAP_PRO_NAME}`,
    },
    content: `## The short answer

A **face swap** changes the inner face and keeps everything else: hair, head shape, ears, the outline of the jaw. A **head swap** changes all of it. That second job is where the kind of model matters most. The GAN face swappers most tools use cannot do it at all. A diffusion model can, because it redraws the whole head instead of pasting a small face patch.

That is why NanoPocket's head swap, in [${HEADSWAP_PRO_NAME}](/headswap-pro) for photos and in [${FACESTUDIO_V_NAME}](/facestudio-v) for video, is built on diffusion. This post explains the difference, what it buys you, and what it costs.

## The GAN baseline

Most cloud face swap services and most open-source face swap tools use one model: InsightFace's **inswapper_128**. It is a generative adversarial network (GAN) trained at a fixed **128 × 128 pixels**. Roop, the default FaceFusion pipeline, SimSwap and a long tail of free face swap sites ship it.

It is fast and cheap, and for a front-facing face in good light it is often good enough. Its limits follow from how it works:

- **Inner face only**: hair, head shape and ears stay as they were, so it cannot make anyone look like a different person from the forehead up.
- **128 pixels**: the face is swapped at that size and scaled back up, so on a large photo it needs a separate restoration step, and that step is where the smooth, waxy look comes from.
- **Hard angles**: a face turned to the side, tilted back or partly covered gives it little to work with, and the swap smears or gives up.

## What diffusion changes

A diffusion model starts from noise and redraws an image step by step, guided by what it is asked to keep and what it is asked to change. For a swap, it is conditioned on the person in the reference photo and redraws the region being replaced in the scene's own light and pose.

For head swap, the two compare like this:

| | GAN face swap (inswapper_128) | Diffusion head swap (NanoPocket) |
|---|---|---|
| What changes | The inner face | Face, hair and head shape |
| Resolution | Swapped at 128 × 128, then scaled up | The result keeps your photo's resolution |
| Head turned, tilted or seen from below | Often smears or fails | The new head is rebuilt in the pose of the head it replaces |
| Group photos | Depends on the tool | You click the one person to change; everyone else stays as they are |
| Speed and cost | Fractions of a second, very cheap | About 40 seconds for a portrait; more GPU time per image |

The price of that is real: diffusion runs many steps per image on a large GPU, so it is slower and costs more to run than a GAN. We think it is worth it for head swap, and we say so on the price: each job's cost is shown before it starts.

## In photos: ${HEADSWAP_PRO_NAME}

- **The whole head**: face, hair and head shape all come from the new head, not just the face.
- **One person in a crowd**: people are found automatically; click the one to recast.
- **Any angle**: the new head is rebuilt in the pose of the head it replaces, turned to the side, tilted back, even seen from below.
- **Several takes**: up to ${HEADSWAP_PRO_MAX_VARIATIONS} variations in one go, so you can pick the best.
- **Full size**: drop in a big image, get a big image back. Photos up to 25 MB.
- **Price**: ${HEADSWAP_PRO_CREDITS_PER_IMAGE} credits per image, and a swap that fails costs nothing.

[Nano FaceStudio Online](/face-studio) also offers a head swap mode (${HEAD_SWAP_CREDITS} credits per face), on a diffusion identity stack whose components and failure modes are documented in our [face swap pipeline reference](/docs/face-swap-pipeline).

## In video: ${FACESTUDIO_V_NAME}

Video is harder than a photo: the head has to stay the same person in every frame, follow the movement and never flicker. The video studio offers two kinds of swap:

- **Face swap**: the identity changes, and the video keeps the original hair, head shape and expression. Best for dialogue, interviews and long clips, up to 60 seconds.
- **Head swap**: the face, hair and head shape change, and the video keeps the body, clothes, background and everyone else. It comes in **Headswap Best** and **Headswap Fast**. Fast is about 40% faster and uses about 35% fewer credits than Best; its quality may be slightly lower. Head swap clips are up to 12 seconds. The two are compared on the [video head swap page](/video-head-swap).

Every result also goes through a diffusion face enhancement that rebuilds skin texture, eyes, teeth and hair edges, then it is delivered at 1080p or 4K with the original sound.

What we measured on 74 public clips with ${FACESTUDIO_V_MEASURED} (a first look on talking-head footage, not a benchmark):

- **99.6%**: the average share of the chosen person's frames that were swapped; frames turned too far stay as filmed and are counted in the report.
- **No blank frames**: frame count, rate and size always matched the input.
- Mean similarity to the reference rose to **0.65**, from **0.08** before the swap.

These figures were measured before Headswap Fast existed. The method and its limits are on the [video studio page](/facestudio-v).

## Where it still fails

Diffusion is not magic, and we would rather you know the limits before you pay:

- **The reference photo**: a poor one gives a poor result. Use a sharp, front-facing photo with the whole face visible.
- **Small or hidden faces**: a face that is tiny in the frame, or covered by hands, microphones or props, may not be usable.
- **Heavy backlight or lens flare**: it can lose the face for a moment; in video those frames stay as filmed.
- **Two equally prominent people**: the video studio shows you the candidates and asks you to choose instead of guessing.
- **Time**: a photo head swap takes about 40 seconds and a few seconds of video head swap take minutes. A plain face swap in video takes seconds.

For the footage that breaks most swaps, see [why face swaps break on hands, profile turns and low light](/blog/why-face-swaps-break-on-hands-profile-turns-and-low-light).

## Which one should you use?

- You want a different person but the same hairstyle, or the clip is long: **face swap**.
- You want a new look, the hair matters, or the head is turned: **head swap**.

## Before you swap anyone's head

Use a face only if you have the right to. NanoPocket asks you to confirm it before a video starts, and the examples on our pages are AI-generated test renders made on stock footage.`,
  },
];
