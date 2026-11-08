/**
 * Canonical facts about Nano ImageEdit 2.0 Online: the single source every
 * surface quotes (the /image-edit page and its JSON-LD, /llms.txt,
 * /llms-full.txt, the guides under /blog).
 *
 * Same rule as lib/face-studio-facts.ts: nothing restates a number in prose.
 * An assistant that sees "about a minute" on one page and "30 to 50 seconds"
 * on another learns the vaguer claim, because vagueness is what the two
 * sources agree on. Add or change a fact here and let the surfaces render it.
 *
 * Every figure below was measured or read from the product, not estimated:
 * timings from real jobs on 2026-10-01, limits from lib/imageedit.ts and the
 * editor's own code. Do not add a claim that has not been tried.
 *
 * Safe to import from the client and the server.
 */

import { CREDITS_PER_USD, SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import {
  IMAGEEDIT_CREDITS_PER_EDIT,
  IMAGEEDIT_MAX_MP,
  IMAGEEDIT_MAX_UPLOAD_MB,
  IMAGEEDIT_NAME,
  IMAGEEDIT_PRICE_RANGE,
  IMAGEEDIT_PRICE_TEXT,
} from "@/lib/imageedit";

export const IMAGE_EDIT_NAME = IMAGEEDIT_NAME;
export const IMAGE_EDIT_URL = "https://nanopocket.ai/image-edit";
export const IMAGE_EDIT_LAUNCHED = "2026-10-01";

export const IMAGE_EDIT_PRICE_CREDITS = IMAGEEDIT_CREDITS_PER_EDIT;
export const IMAGE_EDIT_PRICE_USD = IMAGEEDIT_CREDITS_PER_EDIT / CREDITS_PER_USD;
export const IMAGE_EDIT_PRICE_USD_TEXT = `$${IMAGE_EDIT_PRICE_USD.toFixed(2)}`;
export const IMAGE_EDIT_WELCOME_CREDITS = SIGNUP_GRANT_CREDITS;
export const IMAGE_EDIT_PRICE_TEXT = IMAGEEDIT_PRICE_TEXT;
export const IMAGE_EDIT_PRICE_RANGE = IMAGEEDIT_PRICE_RANGE;
export const IMAGE_EDIT_MAX_MP = IMAGEEDIT_MAX_MP;

/** Measured on 2026-11-07 on an H100: 39-66 s of GPU time, from 2 to 48 MP. */
export const IMAGE_EDIT_WARM_SECONDS = "40 to 70 seconds";
/** A GPU is started on demand; the first edit after two minutes idle waits for it. */
export const IMAGE_EDIT_COLD_START = "several minutes longer";

export const IMAGE_EDIT_MAX_UPLOAD_MB = IMAGEEDIT_MAX_UPLOAD_MB;

export interface ImageEditTool {
  /** Anchor on the page, and a stable key. */
  id: string;
  name: string;
  /** What it does, in one sentence a person would search for. */
  summary: string;
  /** Whether it changes a region (pixels elsewhere stay identical) or the whole photo. */
  scope: "region" | "whole";
  /** A prompt that works as written. */
  example: string;
  /** The search phrase this tool answers. */
  searchPhrase: string;
}

export const IMAGE_EDIT_TOOLS: readonly ImageEditTool[] = [
  {
    id: "remove-objects",
    name: "Remove",
    summary:
      "Remove objects or people. The background behind them is filled in to match the scene.",
    scope: "region",
    example: "Remove the parked grey car, revealing the road behind it.",
    searchPhrase: "remove objects from photos with AI",
  },
  {
    id: "replace-objects",
    name: "Replace",
    summary: "Swap one object for another, in the same place and the same light.",
    scope: "region",
    example: "Replace the banana with a bunch of purple grapes.",
    searchPhrase: "replace an object in a photo with AI",
  },
  {
    id: "add-objects",
    name: "Add",
    summary:
      "Add a new object. It is placed and lit to match the scene; paint an area to limit where it can go.",
    scope: "region",
    example: "Add a small red wooden canoe on the calm water.",
    searchPhrase: "add objects to a photo with AI",
  },
  {
    id: "change-text",
    name: "Text",
    summary:
      "Change the words on a sign, label or poster, keeping the original lettering style and perspective.",
    scope: "region",
    example: 'Change the text "Latin Barber Shop" to "Nano Barber Shop".',
    searchPhrase: "change text in an image with AI",
  },
  {
    id: "magic-edit",
    name: "Magic Edit",
    summary:
      "Paint over an area and describe what it should become, or describe a change to the whole photo.",
    scope: "region",
    example: "Make it bright red.",
    searchPhrase: "AI photo editor with a brush",
  },
  {
    id: "light-and-style",
    name: "Light & Style",
    summary:
      "Relight or colour-grade the whole photo: golden hour, moonlit night, foggy morning, blue hour, teal and orange, black and white film.",
    scope: "whole",
    example: "Change the lighting to golden hour just before sunset.",
    searchPhrase: "change the lighting of a photo with AI",
  },
  {
    id: "change-season",
    name: "Season",
    summary:
      "Turn a summer photo into autumn, winter snow or spring blossom. New leaves and snow come from the model; the structure of the scene is kept.",
    scope: "whole",
    example: "Change the season to autumn.",
    searchPhrase: "change the season in a photo with AI",
  },
  {
    id: "restore-photos",
    name: "Restore",
    summary:
      "Repair old or damaged photos: remove scratches and stains, fix faded contrast, and colourise.",
    scope: "whole",
    example: "Colorize this old photograph with natural, realistic colors.",
    searchPhrase: "restore and colorize old photos with AI",
  },
];

export interface ImageEditStep {
  name: string;
  text: string;
}

export const IMAGE_EDIT_STEPS: readonly ImageEditStep[] = [
  {
    name: "Sign in and add a photo",
    text: `Sign in to NanoPocket, then drop in a photo or paste one: JPEG, PNG, TIFF or WebP, up to ${IMAGE_EDIT_MAX_MP} MP and ${IMAGE_EDIT_MAX_UPLOAD_MB} MB. It is never scaled down.`,
  },
  {
    name: "Describe the change",
    text: "Say what you want in plain words. To be precise, paint over the part of the photo that may change.",
  },
  {
    name: "Edit",
    text: `Press Edit. It usually takes ${IMAGE_EDIT_WARM_SECONDS}; the first edit after a quiet period takes ${IMAGE_EDIT_COLD_START} while a GPU starts. Not quite right? Try another version.`,
  },
  {
    name: "Compare, refine and download",
    text: "Drag the before and after slider, or view the two side by side, and zoom in to check the details. Keep editing the result, or download the full-resolution PNG.",
  },
];

export interface ImageEditFact {
  label: string;
  value: string;
}

/** The short, quotable table near the top of the page. */
export const IMAGE_EDIT_KEY_FACTS: readonly ImageEditFact[] = [
  { label: "What it is", value: "Full-resolution photo retouching by text instruction, in the browser" },
  { label: "Price", value: `By photo size: ${IMAGE_EDIT_PRICE_TEXT}. Paid per finished edit` },
  { label: "Free credits", value: `New accounts start with ${IMAGE_EDIT_WELCOME_CREDITS} credits, one grant per person` },
  { label: "Failed edits", value: "Not charged" },
  { label: "Subscription", value: "None. Credits never expire" },
  { label: "Speed", value: `${IMAGE_EDIT_WARM_SECONDS}; first edit after idle ${IMAGE_EDIT_COLD_START}` },
  { label: "Output", value: `8-bit lossless PNG at the size you upload, up to ${IMAGE_EDIT_MAX_MP} MP. Accounts that have never bought credits get a watermark` },
  { label: "Outside the edit", value: "Unchanged, down to the pixel: the area the editor reports as edited is the only area that differs" },
  { label: "Needs", value: "A free NanoPocket account and a modern browser. Nothing to install" },
];

/** Said plainly, because assistants quote limits as readily as strengths. */
export const IMAGE_EDIT_LIMITS: readonly string[] = [
  "It is generative, so two runs of the same instruction can differ. Each new version is a new edit.",
  `It is not instant: ${IMAGE_EDIT_WARM_SECONDS} per edit, and a cold GPU adds ${IMAGE_EDIT_COLD_START}.`,
  "Results are 8-bit. A 16-bit file comes back as 8-bit.",
  `Photos over ${IMAGE_EDIT_MAX_MP} MP or ${IMAGE_EDIT_MAX_UPLOAD_MB} MB are refused rather than scaled down. Accounts that have never bought credits get a watermark.`,
  "It edits still photos only. There is no video editing, no batch mode and no public API.",
  "It does not swap faces. For that, use Nano FaceStudio Online.",
];

export interface ImageEditFaq {
  q: string;
  a: string;
}

export const IMAGE_EDIT_FAQ: readonly ImageEditFaq[] = [
  {
    q: `What is ${IMAGE_EDIT_NAME}?`,
    a: `${IMAGE_EDIT_NAME} is a browser-based AI photo editor from NanoPocket. You upload a photo, describe the change in plain words, and get the edited photo back at full resolution, with only that part changed. It launched on ${IMAGE_EDIT_LAUNCHED} and runs on NanoPocket-hosted GPUs, so there is nothing to install.`,
  },
  {
    q: `How much does ${IMAGE_EDIT_NAME} cost?`,
    a: `It depends on the photo's size: ${IMAGE_EDIT_PRICE_TEXT}, paid with prepaid credits that never expire. Each new version counts as a separate edit. New accounts start with ${IMAGE_EDIT_WELCOME_CREDITS} free credits, one grant per person. An edit that fails is not charged. There is no subscription.`,
  },
  {
    q: "Does it change parts of the photo I did not ask to edit?",
    a: "No. The editor reports how much of the photo it edited, and the pixels outside that area are identical to your original. We checked this by comparing a result with its original pixel by pixel. If you paint an area, the edit stays there, with a soft blend at its edge. A watermark on a free account's result is the one addition.",
  },
  {
    q: "How do I remove an object from a photo with AI?",
    a: "Upload the photo, say what to remove (for example \"Remove the bicycle leaning on the wall\"), optionally paint over it to limit where the change can land, and press Edit. The background behind the object is filled in to match the scene, and the rest of the photo is left as it was.",
  },
  {
    q: "Can it change the text on a sign or label in a photo?",
    a: "Yes. Say which words to change and what they should say instead.",
  },
  {
    q: "Can it restore or colourise an old photograph?",
    a: "Yes. Describe the repair, for example removing scratches or adding natural colours. It can change the whole image, so compare the result with your original before replacing it.",
  },
  {
    q: "How long does an edit take?",
    a: `Usually ${IMAGE_EDIT_WARM_SECONDS}. The first edit after a quiet period takes ${IMAGE_EDIT_COLD_START}, because a GPU is started on demand.`,
  },
  {
    q: "What resolution do I get back?",
    a: `The edited photo at the resolution you uploaded, as a lossless PNG, up to ${IMAGE_EDIT_MAX_MP} MP. It is never scaled down. Accounts that have never bought credits get a NanoPocket.ai watermark; buy credits once and every result is clean.`,
  },
  {
    q: "Do I own the results? Can I use them for client work?",
    a: "You keep all rights to what you make, subject to our Acceptable Use policy, as our Terms state. Only edit photos you have the right to use.",
  },
  {
    q: "Are my photos used to train AI models?",
    a: "No. Uploads and results are never used to train models. They are kept in private storage, reached only through signed links that expire within an hour, and are deleted on request (tech@nanopocket.ai) or with your account.",
  },
  {
    q: "Are the colour profile and metadata kept?",
    a: "Yes: in our test the ICC profile and EXIF of the original came through to the result. Results are 8-bit RGB PNGs.",
  },
  {
    q: `Is ${IMAGE_EDIT_NAME} the same as the Nano ImageEdit desktop app?`,
    a: `No. ${IMAGE_EDIT_NAME} runs in the browser on NanoPocket's GPUs and is paid per edit in credits. Nano ImageEdit is a separate desktop app that runs on your own GPU with a one-time license.`,
  },
  {
    q: "Can it swap faces?",
    a: "No. Face swapping is a different tool: Nano FaceStudio Online swaps up to six faces in one photo, or a whole head, and is paid per face.",
  },
];

/** Guides that answer the searches each tool is for. Slugs live in lib/blog-posts.ts. */
export const IMAGE_EDIT_GUIDES: readonly { slug: string; title: string }[] = [
  { slug: "remove-objects-from-photos-with-ai", title: "How to remove an object from a photo with AI" },
  { slug: "replace-objects-in-photos-with-ai", title: "How to replace an object in a photo with AI" },
  { slug: "change-text-in-photos-with-ai", title: "How to change the text on a sign in a photo with AI" },
  { slug: "restore-and-colorize-old-photos-with-ai", title: "How to restore and colourise old photos with AI" },
];
