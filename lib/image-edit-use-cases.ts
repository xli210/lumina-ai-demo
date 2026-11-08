/**
 * Audience pages for SpotEdit (/use-cases/<slug>).
 *
 * Why these exist: the main /image-edit page competes for head terms such as
 * "AI photo editor" and "remove objects from photos", which Photoroom, Canva
 * and Adobe own. What this product does that those mostly do not is change only
 * what you describe and leave the rest alone, which matters to people who must
 * be able to trust the rest of the picture. Each page below speaks to one such
 * group, in the words that group searches for, and shows only edits that were
 * really run.
 *
 * Rules, same as lib/image-edit-facts.ts:
 *  - Prices, limits and tool behaviour come from that module, never retyped.
 *  - `exampleIds` point into lib/image-edit-examples.ts. Do not describe a
 *    result that is not shown there.
 *  - `limits` are things we observed. Where something was not tried, the page
 *    says it was not tried instead of implying it works.
 */

import {
  IMAGE_EDIT_MAX_MP,
  IMAGE_EDIT_MAX_UPLOAD_MB,
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_TEXT,
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

const credits = (edits: number) => `${IMAGE_EDIT_PRICE_CREDITS * edits} credits`;

export const IMAGE_EDIT_USE_CASES: readonly UseCase[] = [
  {
    slug: "real-estate-photos",
    name: "Real estate photos",
    title: "AI Photo Editing for Real Estate Listings",
    description: `Remove parked cars and clutter from listing photos at full resolution. Only what you describe changes, and the editor reports how much did. From ${IMAGE_EDIT_PRICE_CREDITS} credits per edit, no subscription.`,
    eyebrow: "For agents and property photographers",
    h1: "Clean up listing photos without reshooting.",
    intro: [
      `A good frontage shot is often ruined by a neighbour's car, a bin or a sign in the frame, and reshooting means another visit. With ${IMAGE_EDIT_NAME} you describe what to take out, and the rest of the photo is left alone.`,
      `Your photo comes back at the size you shot it, up to ${IMAGE_EDIT_MAX_MP} MP, ready for a listing site or a print brochure.`,
    ],
    whoFor: "Remove cars and clutter from listing photos",
    why: [
      "It edits only the object you name. The editor reports the share of the image it changed (6.07% in the street example below), and everything outside that came back identical to the original.",
      `It is paid per edit, with no subscription: ${IMAGE_EDIT_PRICE_TEXT}. A listing of 25 photos up to 12 MP with one edit each is ${credits(25)}, and every retry is another edit.`,
      `Output is a lossless PNG at the size you upload, up to ${IMAGE_EDIT_MAX_MP} MP, which covers listing-site and print-brochure sizes.`,
    ],
    exampleIds: ["remove-cars"],
    toolIds: ["remove-objects", "replace-objects"],
    searchPhrases: [
      "remove cars from real estate photos",
      "remove objects from listing photos",
      "AI photo editor for real estate",
    ],
    limits: [
      "The area an object was hiding is generated, not recovered: a plausible fill, not the real wall or road. Do not use it to show something that is not there.",
      "It is not the tool for virtual twilight. When we asked it to turn a daytime street into a twilight shot, it added a patchy tint and a hazy glow around the rooftops, which is not good enough to publish.",
      "Edited listing photos fall under the rules of your MLS, portal and country, and some require disclosing the edit. Do not use any editor to hide defects or change what the property is. You are responsible for following the rules where you list.",
      "One photo at a time: there is no batch mode.",
    ],
    faq: [
      {
        q: "Can I remove a parked car from a real estate photo with AI?",
        a: `Yes. Describe the car, for example "the grey hatchback parked next to the white car". In the street example above only that car was removed and the editor reported 6.07% of the image changed. It takes ${IMAGE_EDIT_WARM_SECONDS} per edit.`,
      },
      {
        q: "Can it make a virtual twilight photo from a daytime exterior?",
        a: "Not well. In our test the sky and windows changed but the result looked patchy and hazy, so we do not recommend it for that.",
      },
      {
        q: "Does it change the house itself?",
        a: "Only if you ask it to. The editor reports how much of the photo it edited, and the pixels outside that area are identical to your original.",
      },
      {
        q: "What does it cost for a whole listing?",
        a: `${IMAGE_EDIT_PRICE_TEXT}, per finished edit, so 25 photos up to 12 MP with one edit each is ${credits(25)}. Each retry counts as an edit. A failed edit is not charged.`,
      },
    ],
    guideSlugs: ["remove-objects-from-photos-with-ai"],
  },
  {
    slug: "signs-menus-and-posters",
    name: "Signs, menus and posters",
    title: "Change Text in Images With AI: Signs and Posters",
    description: `Change the words on a sign, label or poster photo and keep the look of the lettering, in your browser. The rest of the image stays identical. From ${IMAGE_EDIT_PRICE_CREDITS} credits per edit.`,
    eyebrow: "For small businesses and marketers",
    h1: "Change the words in a photo and keep everything else.",
    intro: [
      "A storefront mock-up with the new name, a poster photo with a corrected date, a sign with a changed word: you name the text to change and the text to put in its place, and it is redrawn in the style of the original lettering and at the same perspective.",
      "Every pixel outside the changed area stays identical, and the editor reports how much of the image moved: 9.68% in the sign example below.",
    ],
    whoFor: "Rewrite text on signs, labels and posters",
    why: [
      "It keeps the look of the existing lettering instead of pasting a new font over it.",
      "It can also swap a whole object for another in the same place, so you can change an item in a photo without a reshoot.",
      `It is paid per edit with no subscription: ${IMAGE_EDIT_PRICE_TEXT}, and a failed edit is not charged.`,
    ],
    exampleIds: ["text-barber", "replace-fruit"],
    toolIds: ["change-text", "replace-objects"],
    searchPhrases: [
      "change text in image AI",
      "edit text on a photo of a sign",
      "replace text in picture online",
      "change object in photo AI",
    ],
    limits: [
      "We have tested short text in Latin letters on a large sign. We have not tested long paragraphs, small print or non-Latin scripts, so we do not claim they work.",
      "It is generative: two runs of the same instruction can differ, and a letter can come out wrong. Check the result, and try another version if it does.",
      "Translating text is not a feature. You tell it the exact new words.",
      "Do not use it to forge documents, identity papers, receipts or official signs, or to put words in someone else's mouth.",
    ],
    faq: [
      {
        q: "Can AI change the text on a sign in a photo?",
        a: 'Yes. Give the current text and the new text, for example change "Latin Barber Shop" to "Nano Barber Shop". In the example above the lettering looks like the original, and the editor reported 9.68% of the image changed.',
      },
      {
        q: "Does it keep the original font?",
        a: "It draws the new words in the style of the existing lettering rather than using a font from a list. It is not an exact font match, so compare the result with the original.",
      },
      {
        q: "Can I replace a product in a photo?",
        a: "Yes. Describe what to remove and what to put in its place. In the example the banana was replaced with grapes in the same place, and the rest of the bowl was not edited.",
      },
      {
        q: "Is there a limit on how much text it can change?",
        a: "We have only tested short text on a large sign. Longer text and small print are untested, so try it on one photo first. A failed edit is not charged.",
      },
    ],
    guideSlugs: ["change-text-in-photos-with-ai", "replace-objects-in-photos-with-ai"],
  },
  {
    slug: "travel-and-street-photos",
    name: "Travel and street photos",
    title: "Remove Cars and Clutter From Travel Photos With AI",
    description: `Take parked cars and other distractions out of travel and street photos, at full resolution, or add something that was not there. From ${IMAGE_EDIT_PRICE_CREDITS} credits per edit.`,
    eyebrow: "For photographers, travel bloggers and creators",
    h1: "Fix the one thing that spoils the shot.",
    intro: [
      "The view is perfect except for the car parked in the middle of it. Describe the car, and the road behind it is filled in to match the scene while the rest of your frame stays as shot.",
      "You can also add something to a scene, or turn a summer shot into a winter one. A season change rebuilds the whole photo, so it is not pixel-identical.",
    ],
    whoFor: "Remove cars and distractions from a shot",
    why: [
      "It changes only what you name and tells you how much of the image moved: 6.07% for the car in the example below, and 1.78% for a canoe added to a lake.",
      "A new season is one instruction, so one shot can serve for more than one post.",
      `Output is a lossless PNG at your upload size, up to ${IMAGE_EDIT_MAX_MP} MP, from ${IMAGE_EDIT_PRICE_CREDITS} credits per edit.`,
    ],
    exampleIds: ["remove-cars", "add-canoe", "season-winter"],
    toolIds: ["remove-objects", "add-objects", "change-season"],
    searchPhrases: [
      "remove cars from photo AI",
      "remove tourists from travel photos",
      "change season in photo AI",
      "remove distractions from photo online",
    ],
    limits: [
      "The area behind a removed object is generated, not recovered. It is a plausible fill, so it should not be presented as a record of what was there.",
      "A season change rebuilds the whole photo. The layout of the scene is kept, and the snow or leaves come from the model.",
      'A vague request can remove more than you meant. "Remove the parked cars" took out some cars and left others, until the wording named the exact car.',
      "It is not the tool for changing the light. A golden-hour request changed almost nothing in our test.",
      "Do not use it to misrepresent news, documentary or evidence photos.",
    ],
    faq: [
      {
        q: "How do I remove a car from a photo with AI?",
        a: 'Describe the car precisely, for example "the grey hatchback parked next to the white car". The road or ground behind it is filled in and the rest of the photo stays identical. The editor tells you how much changed.',
      },
      {
        q: "Can I change summer to winter in a photo?",
        a: 'Yes, for example "Change the season to winter with snow on the ground and trees." It rebuilds the whole photo while keeping the layout of the scene, and the snow is generated.',
      },
      {
        q: "Can I remove tourists or other people from a photo?",
        a: "Yes. The examples on the SpotEdit page include removing a photobomber and clearing guests from a wedding photo. Name who should go, and check the result.",
      },
      {
        q: "Will my photo be resized?",
        a: `No. Photos up to ${IMAGE_EDIT_MAX_MP} MP and ${IMAGE_EDIT_MAX_UPLOAD_MB} MB keep their size, and you download a lossless PNG.`,
      },
    ],
    guideSlugs: ["remove-objects-from-photos-with-ai"],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return IMAGE_EDIT_USE_CASES.find((u) => u.slug === slug);
}
