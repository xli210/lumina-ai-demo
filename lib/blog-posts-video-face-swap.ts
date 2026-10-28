import type { BlogPost } from "@/lib/blog-posts";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";

/**
 * Four guides for the searches people (and AI assistants) answer about video
 * face swapping. Every figure comes from the public page /facestudio-v and from
 * lib/facestudio-v.ts, so a guide cannot disagree with the product:
 *  - the three steps, the face swap / head swap table and the "best result" list
 *    are the page's own text;
 *  - the 74-clip figures are the page's, which calls them a first look, not a
 *    benchmark, and so do these guides;
 *  - the five hard-footage cases are the real before/after clips on the page.
 * Nothing here ranks a named competitor or claims a result nobody measured.
 * One thing is deliberately left out: how long uploads are kept, because the
 * studio and the page word it differently. Guides point at the privacy policy.
 */

const DATE = "2026-10-20";
const MEDIA = "/facestudio-v/media/xc";

const cta = {
  title: `Try ${FACESTUDIO_V_NAME} ${FACESTUDIO_V_VERSION}`,
  body: "Upload a clip, choose who changes, and see the price before you start. A video that fails is refunded, and new accounts start with free credits.",
  href: "/facestudio-v",
  label: `Open ${FACESTUDIO_V_NAME}`,
};

const COST = `Each video is paid for in credits. The studio works out the price from the mode, the output size, the length of the clip and how many people are swapped, and shows it before you start. A 10-second 1080p clip in Fast mode is about 20 credits, roughly US$0.20.`;

const WATERMARK = `Videos made on an account that has never topped up credits carry a slowly moving NanoPocket mark. Topping up once removes it from the videos you make afterwards; free sign-up credits do not count.`;

export const VIDEO_FACE_SWAP_GUIDE_POSTS: BlogPost[] = [
  {
    slug: "how-to-swap-a-face-in-a-video",
    title: "How to Swap a Face in a Video: A Step-by-Step Guide (2026)",
    description:
      "Swap one person's face in a video with a reference photo, in your browser. The three steps, face swap versus head swap, what it costs, and how to get a clean result.",
    date: DATE,
    keywords: [
      "how to swap a face in a video",
      "video face swap online",
      "face swap video tutorial",
      "swap face in video no experience",
      "replace face in video",
      "Video FaceSwap Online",
    ],
    image: {
      src: `${MEDIA}/profile_turn_poster.jpg`,
      alt: "A man turning his head to profile in a video, before and after a face swap",
      width: 1280,
      height: 676,
    },
    cta,
    content: `## The short answer

Open [${FACESTUDIO_V_NAME}](/facestudio-v), upload the video, add a clear photo of the face you want, click the person to replace, and start. Only that person changes: everyone else, the background and the original sound stay as filmed. You do not draw masks or edit frame by frame.

## What you need

- **A video** with a person in it, up to 1080p. The original sound is kept.
- **A reference photo**: a sharp, front-facing picture of the face you want in the video, with the whole face visible. The sharper and more frontal it is, the closer the match.
- **A free NanoPocket account.** New accounts start with free credits.
- **The right to use that face.** The studio asks you to confirm it before it starts.

## The three steps

1. **Upload the video.** The video is analysed and every face in it is found and followed.
2. **Add the reference face.** You confirm you have the right to use it.
3. **Choose who, then get the result.** Click the person to replace. Only that person changes, and detail is restored and upscaled to the size you pick. If several people are equally prominent in the clip, it shows you the candidates and waits for your choice; it never guesses.

## Face swap or head swap?

| | Face swap | Head swap |
|---|---|---|
| Replaces | The face | The whole head: face, hair and head shape |
| Keeps | Hair, head shape, expression | Body, clothes, background, everyone else |
| Speed | Seconds for the swap, then restore and upscale | Minutes for a few seconds of video |
| Best for | Dialogue, interviews and longer clips | Short clips, up to 12 seconds, and new looks |

If you are unsure, start with face swap: it is faster and cheaper, and it keeps the person's own expression.

## What it costs

${COST}

If a video fails, is cancelled, or you leave the line, the credits are returned. Requests are queued on a GPU, so a clip may wait for its turn.

${WATERMARK}

## How to get a clean result

- Use a reference photo that is sharp and front-facing, not a screenshot of a screenshot.
- Make sure the face in the video is large enough to see clearly.
- Even light helps. In heavy lens flare or strong backlight the face can be lost for a moment, and those frames stay as filmed.
- Hands, microphones and props over the face are the hardest case. [Version ${FACESTUDIO_V_VERSION} added five examples of exactly that](/blog/why-face-swaps-break-on-hands-profile-turns-and-low-light), but a clear view of the face still gives the best result.

## What it will and will not do

- It will not start without your confirmation that you may use the reference face.
- When two people are equally prominent it asks you to choose.
- Frames where a head turns beyond the usable angle stay as filmed, and are counted in the report you get.
- In the published test of 74 public clips, about 1 in 20 had no usable face and was reported that way rather than producing a bad result. Those figures are a first look, not a benchmark: no crowds, sports, masks or night footage beyond the clips shown.

## Before you publish anything

Only swap a face you have permission to use, and do not publish swaps of real people without their consent. The examples on the page use stock-footage models and are labelled as test renders.

## Frequently asked questions

**Can I swap a face in a video for free?** New accounts start with free credits, which may cover a first short video. After that each video is paid in credits, and videos from an account that has never topped up carry a moving watermark. If you want no watermark and no payment at all, the free desktop apps run on your own PC; see [local versus online face swap](/blog/local-vs-online-face-swap-privacy-cost-quality).

**Does the original sound stay?** Yes. The audio is put back untouched.

**What if there are several people in the clip?** You choose who changes. The others are left alone.

**Which resolution do I get?** The result is delivered at the size you pick, up to 1080p or 4K.

## Related

- [Best video face swap tools in 2026: how to choose](/blog/best-video-face-swap-tools-2026-how-to-choose)
- [Why face swaps break on hands, profile turns and low light](/blog/why-face-swaps-break-on-hands-profile-turns-and-low-light)
- [Local versus online face swap](/blog/local-vs-online-face-swap-privacy-cost-quality)`,
  },
  {
    slug: "best-video-face-swap-tools-2026-how-to-choose",
    title: "Best Video Face Swap Tools in 2026: How to Choose",
    description:
      "A checklist for choosing a video face swap tool: control over who changes, hard footage, sound, watermark, pricing model and privacy, and which kind of tool fits which job.",
    date: DATE,
    keywords: [
      "best video face swap tools 2026",
      "best video face swap",
      "video face swap comparison",
      "how to choose a face swap tool",
      "face swap video no watermark",
      "local vs online video face swap",
    ],
    image: {
      src: `${MEDIA}/hand_glasses_poster.jpg`,
      alt: "A close-up of a face with a hand in front of it and glasses on, from a video face swap test",
      width: 1280,
      height: 676,
    },
    cta,
    content: `## The short answer

There is no single best video face swap tool, because the right one depends on four things: whether you need to choose *who* changes, how hard your footage is, whether the video may leave your computer, and how you want to pay. This guide gives you a checklist for each, then maps the kinds of tool to the jobs they suit. For a ranked list across desktop, web and mobile apps, see our [best face swap app ranking](/best-face-swap-app-2026).

## The checklist

### 1. Can you choose who changes?

Most tools swap whichever face they find. If your clip has more than one person, that is a problem. Look for a tool that lets you click a person, and that asks you when two people are equally prominent instead of guessing. Ask what happens to everyone else: they should stay exactly as filmed.

### 2. How hard is your footage?

Test with the shot you actually care about, not the demo clip. The hard cases are a head turning to profile, a hand or microphone in front of the face, low light, and a shaky handheld camera. A tool that is clean on a front-facing talking head can flicker or smear on any of these. See [why face swaps break on hands, profile turns and low light](/blog/why-face-swaps-break-on-hands-profile-turns-and-low-light) for what each failure looks like and what to check.

### 3. Does the sound stay, and at what size is the result?

You should get the original audio back untouched, at the resolution you need. Check the maximum input and output size before you start, not after you have paid.

### 4. Is there a watermark?

Many free tiers add a mark that cannot be cropped out. Read what exactly removes it: a subscription, a one-off purchase, or a top-up. On ${FACESTUDIO_V_NAME}, ${WATERMARK.charAt(0).toLowerCase()}${WATERMARK.slice(1)}

### 5. How are you charged?

| Model | Good when | Watch for |
|---|---|---|
| Subscription | You swap faces every week | Paying while you do not use it, auto-renewal |
| Per-minute or per-video credits | You swap occasionally | The price should be shown before you start, and failed videos refunded |
| One-time licence for a local app | You want to own it | Needs your own GPU |
| Free and open source | You enjoy tuning | Setup time, drivers, no support |

### 6. Where does your video go?

Cloud tools upload your video to someone else's GPU. That is fine for a birthday clip and a problem for anything under NDA or anything involving other people's faces. Local apps keep the video on your computer. Read the privacy policy for how long an online tool keeps your upload.

### 7. Does it ask for permission?

A responsible tool asks you to confirm you may use the reference face, and does not publish your results for you. If it never asks, that tells you something.

## Which kind of tool for which job

- **A short clip, occasionally, no setup:** an online tool that charges per video, such as [${FACESTUDIO_V_NAME}](/facestudio-v), where the price is shown first.
- **Footage under NDA, or you swap all the time:** a local desktop app. NanoPocket's [Nano FaceSwap](/apps/nano-faceswap) is free, runs on your own NVIDIA GPU on Windows, and does not upload your source media.
- **You like to tinker and have time:** open-source tools such as FaceFusion and DeepFaceLab run on your own computer for free, in exchange for setting up Python, drivers and settings yourself.
- **Mobile, for fun, with templates:** phone apps are the easiest to start with, and usually give you the least control over who changes and over output quality.

## A fair test you can run in ten minutes

1. Pick one clip with two people and one hard frame (a hand over the face, or a turn to profile).
2. Use the same sharp, front-facing reference photo in every tool.
3. Check: did only the chosen person change? Did the sound survive? Does the face flicker on the hard frame? Is there a watermark, and what removes it?
4. Compare the price you were shown *before* you started with what you were charged.

## What we can and cannot say

We can show you our own results on hard footage: the five before/after clips on the [${FACESTUDIO_V_NAME} page](/facestudio-v) are real renders. We have not run a head-to-head test against other tools, so we do not claim to beat any of them. The figures we publish (74 public clips, an average similarity to the reference of 0.65 against 0.08 before the swap) are a first look, not a benchmark.

## Related

- [How to swap a face in a video, step by step](/blog/how-to-swap-a-face-in-a-video)
- [Local versus online face swap: privacy, cost and quality](/blog/local-vs-online-face-swap-privacy-cost-quality)`,
  },
  {
    slug: "why-face-swaps-break-on-hands-profile-turns-and-low-light",
    title: "Why Face Swaps Break on Hands, Profile Turns and Low Light",
    description:
      "The five shots that break most video face swaps — a full profile turn, a hand over the face, an arm sweeping past, low light, a laughing head tilt — what goes wrong in each, and real before/after clips.",
    date: DATE,
    keywords: [
      "face swap hand over face",
      "face swap profile view",
      "video face swap flicker",
      "face swap occlusion",
      "face swap low light",
      "face swap glasses",
      "Video FaceSwap Online 1.1.0",
    ],
    image: {
      src: `${MEDIA}/arm_across_poster.jpg`,
      alt: "An arm sweeping across a face while the head turns, from a video face swap test",
      width: 1280,
      height: 720,
    },
    cta: {
      ...cta,
      title: "See all five clips, before and after",
      body: `Drag through the real renders on the ${FACESTUDIO_V_NAME} ${FACESTUDIO_V_VERSION} page, then try your own hard shot.`,
    },
    content: `## The short answer

A video face swap usually looks fine on a front-facing talking head and falls apart on five kinds of shot: a head turned to profile, a hand or object in front of the face, an arm sweeping past, a dim side view, and a head that tilts while the camera shakes. These are the shots [${FACESTUDIO_V_NAME} ${FACESTUDIO_V_VERSION}](/facestudio-v) was built to hold up on. This guide explains what goes wrong in each and shows the real clips.

## 1. A full turn to profile

**What goes wrong:** at large head angles the face is mostly hidden, face detection loses it, and the new face either pops off the head or smears across the cheek.

**What the example shows:** the head turns ninety degrees and back, with glasses and a beard, and the new face holds at every angle with no flicker as it turns. Where a head turns beyond the usable angle, the product leaves those frames as filmed and counts them in the report, rather than smearing.

![A full turn to profile](${MEDIA}/profile_turn_poster.jpg)

## 2. Looking away, then back at the camera

**What goes wrong:** low light and a side view together give the swap very little to hold on to, and the face can slide when the person turns to the lens.

**What the example shows:** a side view in low light, then a turn to the lens. The face stays put on the head all the way.

## 3. A hand over the face, glasses on

**What goes wrong:** the swap paints over whatever is in front of the face, including the hand and the glasses frame.

**What the example shows:** the hand stays in front of the face, untouched. Only the part of the face you can see changes, and the face is back in one piece the moment the hand leaves.

## 4. An arm sweeping across the face

**What goes wrong:** something moving in front of the face while the head turns and the camera shakes is the hardest case: the face and the occluder both move, and per-frame guesses disagree.

**What the example shows:** the arm passes over the face and the face does not move; the occluder stays in front while the head turns and the handheld camera shakes.

## 5. Laughing, hands in the hair

**What goes wrong:** every laugh tilts the head and changes the expression, and hands touching the hair and face add small occlusions on top.

**What the example shows:** hands touch the face and the hair, the head tilts with every laugh, and the swap follows.

## Why these shots are hard

- **The face detector is the weak link.** If it loses the face for a frame, the swap has nothing to attach to.
- **Each frame is easy to get slightly wrong.** If every frame is estimated on its own, small differences show up as flicker when played back.
- **Occluders have to be left alone.** Something in front of the face must stay in front, which means the swap has to know where the face is not.

## How to give any tool the best chance

- Use a sharp, front-facing reference photo with the whole face visible.
- Keep the face large enough in the frame to see clearly.
- Light the face evenly. In heavy lens flare or strong backlight the face can be lost for a moment, and those frames stay as filmed.
- For a very short clip with a new look, try head swap, which follows the head even when the face detector loses it.
- If a tool says there is no usable face, believe it. A message is better than a bad result.

## What this does not prove

These are five clips we chose because they are hard, rendered in Fast mode. They show that the hard cases can work; they are not a benchmark, and results depend on your footage. In our published test of 74 public clips, about 1 in 20 had no usable face and was reported that way.

## Related

- [How to swap a face in a video, step by step](/blog/how-to-swap-a-face-in-a-video)
- [Best video face swap tools in 2026: how to choose](/blog/best-video-face-swap-tools-2026-how-to-choose)

Footage and reference photos for the five clips are from Pexels (free to use). The faces swapped belong to stock-photo models; only swap a face you have permission to use.`,
  },
  {
    slug: "local-vs-online-face-swap-privacy-cost-quality",
    title: "Local vs Online Face Swap: Privacy, Cost and Quality",
    description:
      "Should you swap faces on your own PC or in the browser? How privacy, cost, hardware and convenience compare, and when each one is the right choice.",
    date: DATE,
    keywords: [
      "local face swap",
      "offline face swap",
      "private face swap",
      "face swap no subscription",
      "face swap on my own GPU",
      "online vs local face swap",
    ],
    image: {
      src: `${MEDIA}/profile_back_poster.jpg`,
      alt: "A side view of a face in low light, from a face swap test",
      width: 1280,
      height: 676,
    },
    cta: {
      title: "Both are available",
      body: "The free desktop apps run on your own NVIDIA GPU on Windows. The online studio needs nothing installed and is paid in credits, with the price shown before each video.",
      href: "/download",
      label: "See the desktop apps",
    },
    content: `## The short answer

Choose **local** when the photos or videos must stay on your computer, when you swap often, or when you do not want to keep paying. Choose **online** when you have no suitable graphics card, you only need a clip now and then, or you want the newest, heaviest model without installing anything. NanoPocket offers both, so this is a comparison of the two ways of working, with the trade-offs stated plainly.

## Side by side

| | Local (desktop app) | Online (in the browser) |
|---|---|---|
| Where it runs | Your own NVIDIA GPU, on Windows | NanoPocket's GPUs |
| Your files | Stay on your computer; no cloud upload of source media | Uploaded and processed on a server |
| Cost | Nano FaceSwap, Nano FacialEdit and Nano ImageTryon are free; Nano FaceStudio Pro is a one-time licence | Paid in credits per photo or video, price shown first; new accounts start with free credits |
| Subscription | None | None |
| Setup | Download, install, activate a licence | Nothing to install |
| Hardware | Needs an NVIDIA graphics card | Any device with a browser |
| Waiting | Your own GPU, no queue | Requests are queued on shared GPUs |

## Privacy

With a local app the photo or video is read from your disk and written back to your disk. Nothing about the content needs to travel, which matters for footage under NDA, for pictures of other people, and for anything you simply would rather not upload.

With an online tool your file is uploaded, processed on someone else's machine, and then deleted after a period. Read the [privacy policy](/privacy) and the tool's own statement for how long. That is an acceptable trade for a throwaway clip. It is the wrong trade for sensitive material.

## Cost

A subscription charges you whether or not you swap anything this month. Credits charge per result: on our online video studio a 10-second 1080p clip in Fast mode is about 20 credits, shown before you start, and refunded if it fails. A local app has no per-result cost at all once it is installed, but you need the hardware: a suitable NVIDIA graphics card is the real price of going local.

## Quality and convenience

The online studio is where we run our heaviest pipeline, including head swap and diffusion face enhancement at 1080p or 4K, and it can handle hard footage such as [hands over the face and profile turns](/blog/why-face-swaps-break-on-hands-profile-turns-and-low-light). The desktop apps are lighter and tuned to run on a single consumer GPU. We do not claim one always beats the other; they are built for different situations.

## Which should you choose?

- **You have an NVIDIA PC and care about privacy:** start with the free local apps: [Nano FaceSwap](/apps/nano-faceswap) for face swap, [Nano FacialEdit](/apps/nano-facialedit) for portrait editing, and [Nano ImageTryon](/apps/nano-imagetryon) for virtual try-on.
- **You want the most capable studio and run it rarely:** use [${FACESTUDIO_V_NAME}](/facestudio-v) and pay per video.
- **You are on a phone or a Mac:** the online tools work in any browser; the desktop apps currently need Windows and an NVIDIA GPU.
- **You want both:** many people prototype online and keep the final, private work local.

## One limit worth knowing

The online photo editor that keeps every pixel outside an edit identical, [Nano ImageEdit 2.0 Online](/image-edit), is a browser product. The desktop Nano ImageEdit is a different app, a local GAN and diffusion models image generator, and does not have that mode.

## Related

- [How to swap a face in a video, step by step](/blog/how-to-swap-a-face-in-a-video)
- [Best video face swap tools in 2026: how to choose](/blog/best-video-face-swap-tools-2026-how-to-choose)
- [Local AI versus cloud AI](/blog/local-ai-vs-cloud-ai)`,
  },
];
