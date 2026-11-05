import type { BlogPost } from "@/lib/blog-posts";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { CREDIT_PACKS } from "@/lib/credit-packs";
import { SIGNUP_FREE_SWAPS } from "@/lib/face-studio-facts";
import { FACESTUDIO_PRO_REGULAR_PRICE_CENTS } from "@/lib/products";

/**
 * Three guides that each answer one question people (and AI assistants) are asked about face swap:
 * which tools run on your own PC, whether a given graphics card is enough, and what is free without a
 * watermark. Written 2026-11-01.
 *
 * Every figure comes from a page that already states it, so a guide cannot disagree with the product:
 * the VRAM minimums are the table on /trust (#sysreqs), the "tested" series and the speed test cards
 * are on /apps/nano-faceswap, the credit numbers are the billing constants.
 *
 * Deliberately not said, because nothing in the repo supports it: that any desktop app's output is free
 * of a watermark, that a named competitor is slower, worse or unsafe, or that a specific card such as the
 * RTX 3070 has been benchmarked (the tested series is RTX 30/40/50; the speed numbers are from an RTX
 * 4060 and an RTX 4070). Competitors are described only by what they are: open-source projects you set
 * up yourself.
 */

const DATE = "2026-11-01";
const MEDIA = "/facestudio-v/media/xc";

const proPrice = `$${(FACESTUDIO_PRO_REGULAR_PRICE_CENTS / 100).toFixed(2)}`;
const starter = CREDIT_PACKS.find((p) => p.id === "starter");
const starterPrice = starter ? `$${starter.priceInCents / 100}` : "$5";

export const FACE_SWAP_ANSWER_POSTS: BlogPost[] = [
  {
    slug: "face-swap-software-that-runs-offline-on-your-pc",
    title: "Face Swap Software That Runs Offline on Your Own PC (Windows, 2026)",
    description:
      "Which face swap tools run on your own computer instead of a website? The open-source options, the free NanoPocket desktop app, what each needs, and when the browser is the better choice.",
    date: DATE,
    keywords: [
      "face swap software for pc",
      "offline face swap",
      "local face swap windows",
      "face swap that runs on my computer",
      "free face swap software no upload",
      "face swap without cloud",
    ],
    image: {
      src: `${MEDIA}/profile_back_poster.jpg`,
      alt: "A side view of a face in low light, from a face swap test",
      width: 1280,
      height: 676,
    },
    cta: {
      title: "Run it on your own GPU",
      body: "Nano FaceSwap is free, installs like any Windows program and keeps your photos and videos on your computer.",
      href: "/apps/nano-faceswap",
      label: "See Nano FaceSwap",
    },
    content: `## The short answer

Yes, several face swap tools run on your own PC with no upload. They fall into two groups: **open-source projects** you set up yourself, and **installable apps** that behave like any other Windows program. All of them need a graphics card that is strong enough, and for the best-known ones that means an NVIDIA card.

## What "runs locally" means

The swap itself is computed on your graphics card, so your photos and videos never leave your computer. Some apps still make one network call to check a licence key. NanoPocket's desktop apps work that way: activating the licence is the only network handshake, and the swap itself runs offline.

## The options

| | Open-source projects (FaceFusion, Roop, Rope, DeepFaceLab) | Nano FaceSwap | Nano FaceStudio Pro |
|---|---|---|---|
| Cost | Free | Free licence key | One-time ${proPrice} licence |
| Setup | You install and configure it yourself, usually with Python | One Windows installer | One Windows installer |
| Media | Photos and video, depending on the project | Photos and video | Photos (image only) |
| Faces per image | Varies | Single and multi-face | Up to 16 |
| Minimum GPU memory | Varies by project and settings | 6 GB | 8 GB |

- **Open-source projects** are a good fit if you are comfortable with a command line, want to change the code or the models, and do not mind keeping an environment working. You are on your own for support.
- **[Nano FaceSwap](/apps/nano-faceswap)** is the quick way to a local swap on Windows: a free licence key, no per-clip fees, and no Python to maintain.
- **[Nano FaceStudio Pro](/apps/nano-facestudio-pro)** is the larger toolkit for photos: face swap, mask edit, expression editing, Face Vivid, upscale, light adjust and crop in one app. Its licence also covers macOS on Apple Silicon, which is still to follow.

## What it needs

- **Windows 10 or 11** and an **NVIDIA graphics card**. Nano FaceSwap lists a 6 GB minimum, with GTX 1660 and RTX 30, 40 and 50 series cards tested. Nano FaceStudio Pro lists 8 GB.
- Integrated graphics (Intel UHD, AMD Radeon Graphics) are not supported by the NanoPocket desktop apps.
- Apple Silicon is not supported by Nano FaceSwap. Nano FaceStudio Pro ships for it later.

Not sure your card is enough? [Can my GPU run AI face swap?](/blog/can-my-gpu-run-face-swap-rtx-3070-8gb-vram) lists every minimum.

## When the browser is the better choice

Choose online when you have no suitable graphics card, when you only need a clip now and then, or when the job is a **video head swap**: that runs on [NanoPocket's online tools](/facestudio-v), not on a desktop app. Online tools are paid in credits, with the price shown before each job; new accounts start with ${SIGNUP_GRANT_CREDITS} free credits. [Local vs online face swap](/blog/local-vs-online-face-swap-privacy-cost-quality) compares privacy, cost and quality in detail.

## Before you swap anyone's face

Use a face only if you have the right to. NanoPocket asks you to confirm it on the online tools, and the same applies to any local tool you use.`,
  },
  {
    slug: "can-my-gpu-run-face-swap-rtx-3070-8gb-vram",
    title: "Can My GPU Run AI Face Swap? RTX 3070, 8 GB VRAM and Other Cards",
    description:
      "How much graphics memory face swap needs. The minimum for each NanoPocket desktop app, why an 8 GB card such as the RTX 3070 is enough for face swap, how to check your own card, and what to do if it is not.",
    date: DATE,
    keywords: [
      "can my gpu run face swap",
      "face swap rtx 3070",
      "face swap 8gb vram",
      "face swap gpu requirements",
      "minimum vram face swap",
      "face swap gtx 1660",
    ],
    image: {
      src: `${MEDIA}/profile_turn_poster.jpg`,
      alt: "A man turning his head to profile in a video, before and after a face swap",
      width: 1280,
      height: 676,
    },
    cta: {
      title: "Check before you install",
      body: "The full requirements for every NanoPocket desktop app are on one page, dated and checkable.",
      href: "/trust#sysreqs",
      label: "See system requirements",
    },
    content: `## The short answer

**Yes: an 8 GB card such as the RTX 3070 is enough for face swap.** The NanoPocket desktop face swap apps ask for 6 GB (Nano FaceSwap) or 8 GB (Nano FaceStudio Pro) of graphics memory, and the RTX 30 series is in the range they are tested on. A 3070 has 8 GB, so it meets both. What the apps need is the **memory on the card (VRAM)**, not a particular model name.

We have not published a benchmark for the RTX 3070 itself. The published speed measurements are from an RTX 4060 (8 GB) and an RTX 4070 (12 GB), both on Windows 11. If you run into trouble on a card that meets the minimum, tell us on the [contact page](/contact): we treat that as a bug and will help you debug it.

## Minimums for each NanoPocket desktop app

| App | Graphics memory | Notes |
|---|---|---|
| [Nano FaceSwap](/apps/nano-faceswap) | 6 GB minimum | GTX 1660 and RTX 30 / 40 / 50 series tested |
| [Nano FaceStudio Pro](/apps/nano-facestudio-pro) | 8 GB minimum | RTX 30 / 40 / 50 series tested; macOS on Apple Silicon to follow |
| Nano FacialEdit | 8 GB minimum | |
| Nano ImageTryon | 8 GB minimum | |
| Nano ImageEdit | 12 GB recommended | 8 GB through the streaming path |
| Nano VideoGen | 12 GB minimum | Not a face swap app |

The authoritative table, with the operating system for each, is on the [Trust page](/trust#sysreqs).

## How to check your own card

1. Press **Ctrl + Shift + Esc** to open Task Manager.
2. Open **Performance**, then **GPU**.
3. Read **Dedicated GPU memory**. That is the number to compare with the table above.

You can also run \`nvidia-smi\` in a terminal, which prints the card name and its total memory. A laptop with an RTX 3070 or a similar chip counts the same way: what matters is the dedicated memory it reports.

## What is not supported

- **AMD and Intel graphics**, including integrated graphics (Intel UHD, AMD Radeon Graphics): the desktop apps need an NVIDIA card.
- **Macs**: Nano FaceSwap does not run on them, and Nano FaceStudio Pro for Apple Silicon is still to follow.

## If your card is not enough

You do not need new hardware to swap a face. The [online tools](/face-studio) run on NanoPocket's own GPUs, in any modern browser: new accounts start with ${SIGNUP_GRANT_CREDITS} free credits, which pay for ${SIGNUP_FREE_SWAPS} photo face swaps. Video is paid in credits too, with the price shown before each clip. See [face swap software that runs on your PC](/blog/face-swap-software-that-runs-offline-on-your-pc) for what each route involves.`,
  },
  {
    slug: "free-ai-face-swap-no-watermark-what-is-free",
    title: "Free AI Face Swap Without a Watermark: What Is Actually Free in 2026",
    description:
      "Most free online face swappers add a watermark or cap you after a few tries. The honest options: software that runs on your own PC, and what NanoPocket's free credits do and do not include.",
    date: DATE,
    keywords: [
      "free face swap no watermark",
      "free ai face swap",
      "face swap without watermark",
      "face swap free no sign up",
      "unlimited free face swap",
      "free face swap software",
    ],
    image: {
      src: `${MEDIA}/profile_turn_poster.jpg`,
      alt: "A man turning his head to profile in a video, before and after a face swap",
      width: 1280,
      height: 676,
    },
    cta: {
      title: "Try it free",
      body: `New accounts start with ${SIGNUP_GRANT_CREDITS} free credits (${SIGNUP_FREE_SWAPS} photo face swaps). Results carry a watermark until you add credits once.`,
      href: "/face-studio",
      label: "Open Nano FaceStudio Online",
    },
    content: `## The short answer

A face swap that is **free, unlimited and watermark-free on someone else's servers** does not really exist: the servers cost money, so a hosted tool either marks the result, caps your use, or charges. The ways to get a swap with no hosted watermark are to **run software on your own PC**, or to pay a small one-off amount online. Here is what each option involves.

## Option 1: run it on your own computer

Software that runs on your own graphics card has no server to bill you for, so there is no per-clip fee and nothing is uploaded.

- **Open-source projects** such as FaceFusion, Roop and Rope are free. You install and configure them yourself, usually with Python.
- **[Nano FaceSwap](/apps/nano-faceswap)** is NanoPocket's free desktop app for Windows: a free licence key, no per-minute or per-frame fees, and the photos and videos stay on your disk. It needs an NVIDIA card with at least 6 GB of memory. See [which face swap software runs on your PC](/blog/face-swap-software-that-runs-offline-on-your-pc) and [whether your GPU is enough](/blog/can-my-gpu-run-face-swap-rtx-3070-8gb-vram).

## Option 2: free credits online

NanoPocket's online tools need nothing installed. Every new account starts with **${SIGNUP_GRANT_CREDITS} free credits**, enough for ${SIGNUP_FREE_SWAPS} photo face swaps, with no card and no subscription.

What that does and does not include:

- **Results carry a watermark** until the account has bought credits once. The free credits are for trying the tool, not for finished work.
- **Adding credits once removes it.** The smallest pack is ${starterPrice}. Credits never expire and there is no subscription.
- **Video** is paid in credits as well, with the price shown before each clip. A video that fails is refunded.
- **Photo edits** in [Nano ImageEdit Online](/image-edit) are not watermarked.
- **No credit card is needed** to start.

## Which one should you pick?

| You | Best choice |
|---|---|
| Have an NVIDIA card (6 GB or more) and swap often | Run it locally: free, private, no per-clip cost |
| Have no suitable card, or want a quick one-off | Online: ${starterPrice} once removes the watermark |
| Just want to see how it looks | The free credits, knowing the result is marked |
| Need a video head swap | Online, in [Video FaceSwap 2.5 Online](/facestudio-v) |

## A warning about "free" claims

Be careful with any tool that promises unlimited free swaps with no watermark and no limits: either the result is degraded, your photos are the product, or it is a trial that ends. Read what it says about uploads and about how long files are kept, and use only faces you have the right to use. NanoPocket's [privacy policy](/privacy) states what we keep and for how long.`,
  },
];
