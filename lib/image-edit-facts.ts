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
  IMAGEEDIT_MAX_SIDE,
  IMAGEEDIT_MAX_VARIATIONS,
  IMAGEEDIT_NAME,
} from "@/lib/imageedit";

export const IMAGE_EDIT_NAME = IMAGEEDIT_NAME;
export const IMAGE_EDIT_URL = "https://nanopocket.ai/image-edit";
export const IMAGE_EDIT_LAUNCHED = "2026-10-01";

export const IMAGE_EDIT_PRICE_CREDITS = IMAGEEDIT_CREDITS_PER_EDIT;
export const IMAGE_EDIT_PRICE_USD = IMAGEEDIT_CREDITS_PER_EDIT / CREDITS_PER_USD;
export const IMAGE_EDIT_PRICE_USD_TEXT = `$${IMAGE_EDIT_PRICE_USD.toFixed(2)}`;
export const IMAGE_EDIT_WELCOME_CREDITS = SIGNUP_GRANT_CREDITS;
export const IMAGE_EDIT_MAX_SIDE = IMAGEEDIT_MAX_SIDE;
export const IMAGE_EDIT_MAX_VARIATIONS = IMAGEEDIT_MAX_VARIATIONS;

/** Measured on 2026-10-01 on an H100: 26-32 s billed, 30-50 s wall. */
export const IMAGE_EDIT_WARM_SECONDS = "30 to 50 seconds";
/** A GPU is started on demand; the first edit after ~60 s idle waits for it. */
export const IMAGE_EDIT_COLD_START = "one to two minutes longer";

export const IMAGE_EDIT_MAX_UPLOAD_MB = 40;

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
    text: `Sign in to NanoPocket, then drop in a photo (up to ${IMAGE_EDIT_MAX_UPLOAD_MB} MB), paste one, or pick a sample. Photos are scaled down to ${IMAGE_EDIT_MAX_SIDE} px on the long side in the browser before upload.`,
  },
  {
    name: "Choose a tool and describe the change",
    text: "Pick Remove, Replace, Add, Text, Magic Edit, Light & Style, Season or Restore and say what you want in plain words. For the object tools, you can paint over the area to limit where the change may land.",
  },
  {
    name: "Generate",
    text: `Press Generate. It usually takes ${IMAGE_EDIT_WARM_SECONDS}; the first edit after a quiet period takes ${IMAGE_EDIT_COLD_START} while a GPU starts. Ask for up to ${IMAGE_EDIT_MAX_VARIATIONS} variations at once if you want to choose.`,
  },
  {
    name: "Compare, refine and download",
    text: "Switch between Result, Compare, Before and Changes to see exactly what moved. Chain another edit from any version, undo, or download the full-resolution PNG.",
  },
];

export interface ImageEditFact {
  label: string;
  value: string;
}

/** The short, quotable table near the top of the page. */
export const IMAGE_EDIT_KEY_FACTS: readonly ImageEditFact[] = [
  { label: "What it is", value: "A browser photo editor you drive with text instructions" },
  { label: "Price", value: `${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit; each variation is one edit` },
  { label: "Free credits", value: `New accounts start with ${IMAGE_EDIT_WELCOME_CREDITS} credits, one grant per person` },
  { label: "Failed or cancelled edits", value: "Refunded in full, automatically" },
  { label: "Subscription", value: "None. Credits never expire" },
  { label: "Speed", value: `${IMAGE_EDIT_WARM_SECONDS}; first edit after idle ${IMAGE_EDIT_COLD_START}` },
  { label: "Output", value: `Lossless PNG at the size you upload, up to ${IMAGE_EDIT_MAX_SIDE} px on the long side` },
  { label: "Outside the edit", value: "For Remove, Replace, Add, Text and Magic Edit, every pixel outside the edited area is kept identical, and the editor confirms it" },
  { label: "Needs", value: "A free NanoPocket account and a modern browser. Nothing to install" },
];

/** Said plainly, because assistants quote limits as readily as strengths. */
export const IMAGE_EDIT_LIMITS: readonly string[] = [
  "It is generative, so two runs of the same instruction can differ. Ask for variations and pick one.",
  "Light & Style, Season and Restore change the whole photo by design. They keep your detail where they can and let you choose how much of the original to keep, but they are not pixel-identical.",
  `It is not instant: ${IMAGE_EDIT_WARM_SECONDS} per edit, and a cold GPU adds ${IMAGE_EDIT_COLD_START}.`,
  `Photos larger than ${IMAGE_EDIT_MAX_SIDE} px on the long side are scaled down before editing. Uploads are limited to ${IMAGE_EDIT_MAX_UPLOAD_MB} MB.`,
  "It edits still photos only. There is no video editing, no batch mode and no public API.",
  "It does not swap faces. For that, use Nano FaceStudio Online.",
  "When an edit changes nothing, or far more than you asked, the editor says so rather than presenting it as a success.",
];

export interface ImageEditFaq {
  q: string;
  a: string;
}

export const IMAGE_EDIT_FAQ: readonly ImageEditFaq[] = [
  {
    q: `What is ${IMAGE_EDIT_NAME}?`,
    a: `${IMAGE_EDIT_NAME} is a browser-based AI photo editor from NanoPocket. You upload a photo, pick a tool (Remove, Replace, Add, Text, Magic Edit, Light & Style, Season or Restore), describe the change in plain words, and get the edited photo back at full resolution. It launched on ${IMAGE_EDIT_LAUNCHED} and runs on NanoPocket-hosted GPUs, so there is nothing to install.`,
  },
  {
    q: `How much does ${IMAGE_EDIT_NAME} cost?`,
    a: `${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit, paid with prepaid credits that never expire. Each variation counts as a separate edit. New accounts start with ${IMAGE_EDIT_WELCOME_CREDITS} free credits, one grant per person. An edit that fails or that you cancel is refunded in full. There is no subscription.`,
  },
  {
    q: "Does it change parts of the photo I did not ask to edit?",
    a: "Not for the object tools. With Remove, Replace, Add, Text and Magic Edit, every pixel outside the edited area is kept identical to your photo, and the editor shows how much of the image changed and confirms the rest is untouched. Light & Style, Season and Restore change the whole photo by design.",
  },
  {
    q: "How do I remove an object from a photo with AI?",
    a: "Open the Remove tool, name what to remove (for example \"the bicycle leaning on the wall\"), optionally paint over it to limit where the change can land, and press Generate. The background behind the object is filled in to match the scene, and the rest of the photo is left as it was.",
  },
  {
    q: "Can it change the text on a sign or label in a photo?",
    a: "Yes. The Text tool takes the current text and the new text and rewrites it, keeping the original lettering style and perspective.",
  },
  {
    q: "Can it restore or colourise an old photograph?",
    a: "Yes. The Restore tool removes scratches and stains, repairs faded contrast and can colourise a black-and-white print with natural colours. It changes the whole image, so compare the result with your original before replacing it.",
  },
  {
    q: "How long does an edit take?",
    a: `Usually ${IMAGE_EDIT_WARM_SECONDS}. The first edit after a quiet period takes ${IMAGE_EDIT_COLD_START}, because a GPU is started on demand. Several variations of one edit run one after another.`,
  },
  {
    q: "What resolution do I get back?",
    a: `The edited photo at the resolution you uploaded, as a lossless PNG, up to ${IMAGE_EDIT_MAX_SIDE} px on the long side. Larger photos are scaled down to that in the browser before editing. There is no watermark.`,
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
