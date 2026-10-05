/**
 * Audience pages for Nano ImageEdit 2.0 Online (/use-cases/<slug>).
 *
 * Why these exist: the main /image-edit page competes for head terms such as
 * "AI photo editor" and "remove objects from photos", which Photoroom, Canva
 * and Adobe own. What this product does that those mostly do not is change only
 * what you describe and say so, which matters to people who must be able to
 * trust the rest of the picture. Each page below speaks to one such group, in
 * the words that group searches for, and shows only edits that were really run.
 *
 * Rules, same as lib/image-edit-facts.ts:
 *  - Prices, limits and tool behaviour come from that module, never retyped.
 *  - `exampleIds` point into lib/image-edit-examples.ts. Do not describe a
 *    result that is not shown there.
 *  - `limits` are things we observed. Where something was not tried, the page
 *    says it was not tried instead of implying it works.
 */

import {
  IMAGE_EDIT_MAX_SIDE,
  IMAGE_EDIT_MAX_UPLOAD_MB,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_USD,
  IMAGE_EDIT_PRICE_USD_TEXT,
  IMAGE_EDIT_WARM_SECONDS,
} from "@/lib/image-edit-facts";

export interface UseCase {
  slug: string;
  /** Short label for links and the hub. */
  name: string;
  /** <title>, kept short enough to survive the site's " | NanoPocket" suffix. */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string[];
  /** Who it is for, one line, for the hub card. */
  whoFor: string;
  /** Why this tool suits them, each a full sentence. */
  why: string[];
  exampleIds: string[];
  toolIds: string[];
  /** What a person in this group types into a search box. */
  searchPhrases: string[];
  limits: string[];
  faq: { q: string; a: string }[];
  guideSlugs: string[];
}

const usd = (edits: number) => `$${(IMAGE_EDIT_PRICE_USD * edits).toFixed(2)}`;

export const IMAGE_EDIT_USE_CASES: readonly UseCase[] = [
  {
    slug: "real-estate-photos",
    name: "Real estate photos",
    title: "AI Photo Editing for Real Estate Listings",
    description: `Remove parked cars and clutter from listing photos, or turn a daylight exterior into a twilight shot. Only what you describe changes, and the editor reports how much did. ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per edit, no subscription.`,
    eyebrow: "For agents and property photographers",
    h1: "Clean up listing photos without reshooting.",
    intro: [
      "A good frontage shot is often ruined by a neighbour's car, a bin or a sign in the frame, and reshooting means another visit. With Nano ImageEdit 2.0 Online you describe what to take out, and the rest of the photo is left alone.",
      "The same editor can relight a daylight exterior as a twilight photo, the look that sells a house in a thumbnail. That one is different in kind: it restyles the whole picture rather than a region, and the page says so below.",
    ],
    whoFor: "Remove cars and clutter, make a twilight exterior",
    why: [
      "Remove edits only the object you name. Every pixel outside the edited area is kept identical, and the editor confirms it and reports the share of the image that changed (4.15% in the street example below).",
      `It is paid per edit, with no subscription: ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}). A listing of 25 photos with one edit each is ${usd(25)}, plus ${IMAGE_EDIT_PRICE_USD_TEXT} for every retry or variation.`,
      `Output is a lossless PNG at the size you upload, up to ${IMAGE_EDIT_MAX_SIDE} px on the long side, which covers listing-site and print-brochure sizes.`,
    ],
    exampleIds: ["houses-remove-car", "houses-dusk"],
    toolIds: ["remove-objects", "light-and-style", "change-season"],
    searchPhrases: [
      "remove cars from real estate photos",
      "virtual twilight real estate photo AI",
      "remove objects from listing photos",
      "AI photo editor for real estate",
    ],
    limits: [
      "The area an object was hiding is generated, not recovered. In the street example the wall and kerb behind the car are newly drawn: a plausible fill, not the real wall. Do not use Remove to show something that is not there.",
      "The twilight edit restyles the whole photo and adds light to windows and lamps. It is not pixel-identical, and a window that was not lit in real life will be shown lit.",
      "Small items on a cluttered surface can be missed. We tried to remove a small sign stand and a stack of brochures from a window sill by description alone, three times, and the editor reported no change each time. Painting over the item to limit where the edit lands is the tool built for this, but we have not published an example of it.",
      "Edited listing photos fall under the rules of your MLS, portal and country, and some require disclosing the edit. Do not use any editor to hide defects or change what the property is. You are responsible for following the rules where you list.",
      "One photo at a time: there is no batch mode.",
    ],
    faq: [
      {
        q: "Can I remove a parked car from a real estate photo with AI?",
        a: `Yes. Choose Remove, describe the car, for example "the silver sedan parked at the curb in front of the red house", and generate. In the street example above the car was removed, the editor reported 4.15% of the image changed, and the rest was identical. It takes ${IMAGE_EDIT_WARM_SECONDS} per edit.`,
      },
      {
        q: "Can it make a virtual twilight photo from a daytime exterior?",
        a: "Yes, with the Light & Style tool: describe a deep blue sky, a warm band at the horizon and light in the windows. It changes the whole photo rather than a region, and it adds lit windows even where none were lit. Check your listing rules on disclosing virtual twilight before you publish.",
      },
      {
        q: "Does it change the house itself?",
        a: "Object edits (Remove, Replace, Add, Text, Magic Edit) keep every pixel outside the edited area identical and tell you how much changed. Light & Style, Season and Restore change the whole photo by design, so compare the result with the original.",
      },
      {
        q: "What does it cost for a whole listing?",
        a: `${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit, so 25 photos with one edit each is ${usd(25)}. Retries and variations count as edits. A failed or cancelled edit is refunded automatically.`,
      },
    ],
    guideSlugs: ["remove-objects-from-photos-with-ai"],
  },
  {
    slug: "old-family-photos",
    name: "Old family photos",
    title: "Restore and Colorize Old Family Photos With AI",
    description: `Repair faded, scratched or black-and-white family photos and add natural colour, in your browser. Honest about what changes: Restore works on the whole photo. ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per photo, no subscription.`,
    eyebrow: "For family historians and genealogists",
    h1: "Bring an old family photo back, and check it before you share it.",
    intro: [
      "Scan the print, upload the scan, and describe what you want: colourise it, fix the faded contrast, or repair scratches and stains. The result is a full-resolution PNG you can compare with the original in the editor.",
      "Restoring is different from the object tools. It works on the whole photograph, so it is not pixel-identical to your scan. That is why the editor lets you switch between Result, Compare and Before, and why this page tells you to look closely at faces.",
    ],
    whoFor: "Colorize and repair faded or damaged prints",
    why: [
      "You describe the result in plain words and see it in under a minute, instead of learning a retouching package for one photo.",
      `It is paid per photo with no subscription: ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}), and credits never expire, which suits a project you come back to a few photos at a time.`,
      "Compare and Before views let you flip between your scan and the result, so you decide whether it still looks like the person.",
    ],
    exampleIds: ["restore-sepia"],
    toolIds: ["restore-photos"],
    searchPhrases: [
      "restore old photos online AI",
      "colorize old family photos",
      "repair damaged old photograph",
      "colorize black and white photo free",
    ],
    limits: [
      "Restore changes the whole photo and is not pixel-identical. Colours are the model's plausible guesses (clothing, skin, sky), not the real colours, so treat a colourised photo as an illustration.",
      "Check faces against the original before you share or print. A generative model can alter a likeness. We have not measured how well identity is preserved, so we do not claim it is.",
      "We have shown one example, a 1910 street photograph with faded contrast. We have not published tests on torn, creased or heavily damaged prints.",
      `Photos larger than ${IMAGE_EDIT_MAX_SIDE} px on the long side are scaled down before editing, and uploads are limited to ${IMAGE_EDIT_MAX_UPLOAD_MB} MB. Scan at a sensible size rather than the maximum.`,
      "One photo at a time: there is no batch mode.",
    ],
    faq: [
      {
        q: "How do I colorize an old black-and-white photo with AI?",
        a: `Scan it, open Nano ImageEdit 2.0 Online, choose Restore, and use an instruction such as "Colorize this old photograph with natural, realistic colors and fix the faded contrast." It takes ${IMAGE_EDIT_WARM_SECONDS}. The colours are the model's guess, so compare with the original.`,
      },
      {
        q: "Will it change the faces in my photo?",
        a: "It can. Restore works on the whole photo, so faces are regenerated along with everything else, even though the instruction asks it to keep people the same. Use the Compare view, look at the faces closely, and ask for variations if one is off.",
      },
      {
        q: "Can it fix scratches and stains?",
        a: "Yes, that is part of the Restore tool, together with faded contrast and colourising. We have only published an example of faded contrast and colourising, not of heavy damage.",
      },
      {
        q: "How much does it cost?",
        a: `${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit, with prepaid credits that never expire. Each variation counts as an edit. A failed or cancelled edit is refunded.`,
      },
    ],
    guideSlugs: ["restore-and-colorize-old-photos-with-ai"],
  },
  {
    slug: "signs-menus-and-posters",
    name: "Signs, menus and posters",
    title: "Change Text in Images With AI: Signs and Posters",
    description: `Change the words on a sign, label, menu or poster photo and keep the original lettering style, in your browser. The rest of the image stays identical. ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per edit.`,
    eyebrow: "For small businesses and marketers",
    h1: "Change the words in a photo and keep everything else.",
    intro: [
      "A storefront mock-up with the new name, a poster photo with a corrected date, a menu board with a changed item: you name the text to change and the text to put in its place, and the Text tool redraws it in the original lettering style and perspective.",
      "Because it is a region edit, every pixel outside the changed area stays identical, and the editor reports how much of the image moved: 10.17% in the sign example below.",
    ],
    whoFor: "Rewrite text on signs, labels, menus and posters",
    why: [
      "It keeps the look of the existing lettering instead of pasting a new font over it.",
      "Replace swaps a whole object for another in the same place and light, so you can change the dish on a menu photo or the item on a shelf without a reshoot.",
      `It is paid per edit with no subscription: ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}), and a failed edit is refunded.`,
    ],
    exampleIds: ["text-barber", "replace-fruit"],
    toolIds: ["change-text", "replace-objects", "magic-edit"],
    searchPhrases: [
      "change text in image AI",
      "edit text on a photo of a sign",
      "replace text in picture online",
      "change object in photo AI",
    ],
    limits: [
      "We have tested short text in Latin letters on a large sign. We have not tested long paragraphs, small print or non-Latin scripts, so we do not claim they work.",
      "It is generative: two runs of the same instruction can differ, and a letter can come out wrong. Check the result, and ask for variations if it does.",
      "Translating text is not a feature. You tell it the exact new words.",
      "Do not use it to forge documents, identity papers, receipts or official signs, or to put words in someone else's mouth.",
      "In the fruit example the first run left part of the old banana behind, so the instruction was reworded to include the stem. Be specific about what to replace.",
    ],
    faq: [
      {
        q: "Can AI change the text on a sign in a photo?",
        a: 'Yes. Choose the Text tool, give the current text and the new text, for example change "Latin Barber Shop" to "Nano Barber Shop", and generate. In the example above the lettering style was kept, the editor reported 10.17% of the image changed, and everything else was identical.',
      },
      {
        q: "Does it keep the original font?",
        a: "It matches the existing lettering style and perspective rather than using a font from a list. It is not an exact font match, so compare the result with the original.",
      },
      {
        q: "Can I replace a product or a dish in a photo?",
        a: "Yes, with the Replace tool. Describe what to remove and what to put in its place. In the example the banana was replaced with grapes in the same place and light, and the rest of the bowl was untouched.",
      },
      {
        q: "Is there a limit on how much text it can change?",
        a: "We have only tested short text on a large sign. Longer text and small print are untested, so try it on one photo first. A failed edit is refunded.",
      },
    ],
    guideSlugs: ["change-text-in-photos-with-ai", "replace-objects-in-photos-with-ai"],
  },
  {
    slug: "travel-and-street-photos",
    name: "Travel and street photos",
    title: "Remove Cars and Clutter From Travel Photos With AI",
    description: `Take parked cars and other distractions out of travel and street photos, or change the season or the light. Object edits keep the rest of the shot identical. ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per edit.`,
    eyebrow: "For photographers, travel bloggers and creators",
    h1: "Fix the one thing that spoils the shot.",
    intro: [
      "The view is perfect except for the car parked in the middle of it. Describe the car, and the road behind it is filled in to match the scene while the rest of your frame stays as shot.",
      "For a different mood you can change the season or the light of the whole photo. Those two work on the entire picture, not a region, so they are not pixel-identical.",
    ],
    whoFor: "Remove cars and distractions, change the season",
    why: [
      "Remove changes only what you name and tells you how much of the image moved: 4.84% and 4.15% in the two street examples below.",
      "Season and Light & Style restyle a whole photo in one instruction, so one shot can serve for more than one post.",
      `Output is a lossless PNG at your upload size, up to ${IMAGE_EDIT_MAX_SIDE} px on the long side, at ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per edit.`,
    ],
    exampleIds: ["remove-cars", "houses-remove-car", "season-lake"],
    toolIds: ["remove-objects", "change-season", "light-and-style"],
    searchPhrases: [
      "remove cars from photo AI",
      "remove tourists from travel photos",
      "change season in photo AI",
      "remove distractions from photo online",
    ],
    limits: [
      "We have shown cars being removed. The tool is described for objects and people, but we have not published an example of removing people, so try it on one photo before you rely on it.",
      "The area behind a removed object is generated, not recovered. It is a plausible fill, so it should not be presented as a record of what was there.",
      "Season changes the whole photo. The structure of the scene is kept, and the new leaves or snow come from the model, so it is not pixel-identical.",
      "In the street examples the first prompt sometimes removed more than intended, such as two cars instead of one, until the wording named the exact car. Describe the object precisely.",
      "Do not use it to misrepresent news, documentary or evidence photos.",
    ],
    faq: [
      {
        q: "How do I remove a car from a photo with AI?",
        a: 'Choose Remove, describe the car precisely (for example "the grey hatchback parked next to the white car"), and generate. The road or ground behind it is filled in and the rest of the photo is kept identical. The editor tells you how much changed.',
      },
      {
        q: "Can I change summer to autumn in a photo?",
        a: 'Yes, with the Season tool, for example "Change the season to autumn: the trees have orange, red and yellow leaves." It changes the whole photo while keeping the structure of the scene. The leaf colours are generated.',
      },
      {
        q: "Can I remove tourists or other people from a photo?",
        a: "The Remove tool is described for objects and people, but we have not published an example of removing people, so test it on one photo first. A failed or cancelled edit is refunded.",
      },
      {
        q: "Will my photo be resized?",
        a: `Photos larger than ${IMAGE_EDIT_MAX_SIDE} px on the long side are scaled down before editing. Smaller photos keep their size, and you download a lossless PNG.`,
      },
    ],
    guideSlugs: ["remove-objects-from-photos-with-ai"],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return IMAGE_EDIT_USE_CASES.find((u) => u.slug === slug);
}
