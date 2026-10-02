import type { BlogPost } from "@/lib/blog-posts";
import {
  IMAGE_EDIT_COLD_START,
  IMAGE_EDIT_MAX_SIDE,
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_USD_TEXT,
  IMAGE_EDIT_WARM_SECONDS,
} from "@/lib/image-edit-facts";

/**
 * Four how-to guides for Nano ImageEdit 2.0 Online, one per search the tools
 * answer. Each one is built on a real edit made with the product on
 * 2026-10-02 (the figures quoted are the editor's own report for that run),
 * says what went wrong where something did, and links to /image-edit.
 *
 * Prices, timings and limits come from lib/image-edit-facts.ts so a guide
 * cannot disagree with the product page. Lead images are before/after pairs
 * of those same edits.
 */

const DATE = "2026-10-02";
const IMG = "/images/image-edit";

const cta = {
  title: `Try it on your own photo`,
  body: `${IMAGE_EDIT_NAME} costs ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per edit, and an edit that fails is refunded. New accounts get free credits.`,
  href: "/image-edit",
  label: "Open Nano ImageEdit 2.0 Online",
};

const common = `Prices and times on this page are those of ${IMAGE_EDIT_NAME} on the day it was written: ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit, usually ${IMAGE_EDIT_WARM_SECONDS}, with the first edit after a quiet period taking ${IMAGE_EDIT_COLD_START}.`;

export const IMAGE_EDIT_GUIDE_POSTS: BlogPost[] = [
  {
    slug: "remove-objects-from-photos-with-ai",
    title: "How to Remove an Object From a Photo With AI",
    description:
      "Remove a car, a person or any object from a photo by describing it, and have the background filled in. A step-by-step guide with a real before and after.",
    date: DATE,
    keywords: [
      "remove objects from photos AI",
      "remove object from photo online",
      "AI object remover",
      "erase object from picture",
      "Nano ImageEdit",
    ],
    image: {
      src: `${IMG}/guide-remove-objects.jpg`,
      alt: "A street with parked cars before and after removing the grey hatchback with an AI photo editor",
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

Open a photo in [${IMAGE_EDIT_NAME}](/image-edit), choose the Remove tool, name the object you want gone, and press Generate. The background behind it is filled in to match the scene, and for object edits the rest of the photo is kept identical to your original.

## What you need

- A photo (JPEG, PNG or WebP, up to 40 MB). Anything larger than ${IMAGE_EDIT_MAX_SIDE} px on the long side is scaled down in your browser before editing.
- A free NanoPocket account. New accounts start with free credits.
- About a minute. ${common}

## Steps

1. Sign in and open the [editor](/image-edit/launch), then drop in your photo.
2. Pick **Remove** in the tool rail.
3. In "What to remove", say what it is in plain words, for example "the grey hatchback parked next to the white car".
4. Optional: switch on the brush and paint over the object. This limits where the change is allowed to land.
5. Press **Generate**. When it finishes, use the Compare view to drag between before and after, and the Changes view to see exactly which pixels moved.

## Be specific, because the model takes you literally

In our test photo there are four parked cars. Our first instruction was "the parked car". It removed the grey hatchback and also the red car beside it, because both qualified. Naming the grey hatchback and where it stands removed only that car.

- **Vague:** "the car", "the person", "the thing on the left".
- **Specific:** "the grey hatchback parked next to the white car", "the man in the striped shirt on the right".

The second version removed one car. The editor reported that 4.84% of the image changed and that every other pixel was identical to the original, which you can verify in the Changes view.

## What to expect

- **Speed:** ${IMAGE_EDIT_WARM_SECONDS} per edit. ${IMAGE_EDIT_COLD_START} for the first one after a quiet period, because a GPU is started on demand.
- **Cost:** ${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}). If the edit fails or you cancel it, the credits are returned.
- **Output:** a lossless PNG at the size you uploaded, with no watermark.

## When to ask for variations

The fill is generated, so two runs can differ. If an edge looks soft or the pattern behind the object repeats, ask for up to four variations in one go and keep the best one. Each variation is a separate edit and is charged separately.

## Related guides

- [How to replace an object in a photo with AI](/blog/replace-objects-in-photos-with-ai)
- [How to change the text on a sign in a photo with AI](/blog/change-text-in-photos-with-ai)
- [How to restore and colourise old photos with AI](/blog/restore-and-colorize-old-photos-with-ai)

The street photo is "Parked Panek car, Batuty street, Warsaw.jpg" from Wikimedia Commons, licensed CC BY-SA 4.0; the edited version is shared under the same licence.`,
  },
  {
    slug: "replace-objects-in-photos-with-ai",
    title: "How to Replace an Object in a Photo With AI",
    description:
      "Swap one object for another in a photo by describing both. A guide with a real before and after, and the one wording fix that removed a leftover stem.",
    date: DATE,
    keywords: [
      "replace object in photo AI",
      "swap object in picture online",
      "AI object replacement",
      "change an object in a photo",
      "Nano ImageEdit",
    ],
    image: {
      src: `${IMG}/guide-replace-objects.jpg`,
      alt: "A bowl of fruit before and after replacing the banana with a bunch of purple grapes using an AI photo editor",
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

Use the Replace tool in [${IMAGE_EDIT_NAME}](/image-edit): say what to replace and what to put there, and it swaps one for the other in the same place, matching the scene's light. The rest of the photo is kept identical.

## Steps

1. Open the [editor](/image-edit/launch) and add your photo.
2. Pick **Replace**.
3. Fill in "Replace this" (for example "the banana") and "With this" (for example "a bunch of purple grapes").
4. Optional: add detail in "Extra details", such as "keep the bowl the same", or paint over the object to limit the area.
5. Press **Generate**, then compare before and after.

${common}

## A real example, and the fix that mattered

We replaced the banana in a fruit bowl with a bunch of purple grapes. The first result was good except for one thing: a small fragment of the banana's stem was left at the edge of the bowl. The model had replaced the fruit and not the stem.

We ran it again with one change to the wording: "the banana, **including its stem**". The second result had no leftover. The editor reported that 17.07% of the image changed and that all the rest, the apple, the citrus fruit and the bowl, was identical to the original.

The lesson applies to any replacement: if an object has a part that is easy to miss, such as a stem, a handle, a shadow or a cable, name it.

## Tips for better swaps

- **Say what the new object looks like,** not just what it is: "a bunch of purple grapes" rather than "grapes".
- **Say what to keep:** "keep the bowl the same" in Extra details.
- **Use the brush** when the object is small or there are several lookalikes. Painting over the right one removes the guesswork.
- **Ask for variations** if the first result is close but not right. Each is a separate edit.

## What it costs

${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit. A failed or cancelled edit is refunded in full.

## Related guides

- [How to remove an object from a photo with AI](/blog/remove-objects-from-photos-with-ai)
- [How to change the text on a sign in a photo with AI](/blog/change-text-in-photos-with-ai)

The fruit photo is "Fruit Bowl (4880797613).jpg" from Wikimedia Commons, licensed CC BY 2.0.`,
  },
  {
    slug: "change-text-in-photos-with-ai",
    title: "How to Change the Text on a Sign in a Photo With AI",
    description:
      "Rewrite the words on a shop sign, label or poster in a photo and keep the original lettering style and perspective. A guide with a real before and after.",
    date: DATE,
    keywords: [
      "change text in image AI",
      "edit text in a photo",
      "replace text on sign in photo",
      "AI text editor for images",
      "Nano ImageEdit",
    ],
    image: {
      src: `${IMG}/guide-change-text.jpg`,
      alt: 'A blue barber shop sign before and after changing "Latin Barber Shop" to "Nano Barber Shop" with an AI photo editor',
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

In [${IMAGE_EDIT_NAME}](/image-edit), choose the Text tool, type the text that is in the photo now and the text you want instead, and press Generate. It rewrites the lettering, keeping the original font style, colours and perspective, and leaves the rest of the photo identical.

## Steps

1. Open the [editor](/image-edit/launch) and add a photo with the text in it.
2. Pick **Text**.
3. In "Current text", type the words as they appear, for example "Latin Barber Shop".
4. In "New text", type what it should say, for example "Nano Barber Shop".
5. Optional: add a note in "Extra details", such as "keep the same 3D letter style".
6. Press **Generate** and compare.

${common}

## A real example

The photo is a blue barber shop front whose sign reads "Latin Barber Shop". We changed it to "Nano Barber Shop" and asked it to keep the same 3D letter style.

The sign came back reading "Nano Barber Shop" in the same white lettering with the same drop shadow, on the same blue panel, at the same perspective. The editor reported that 10.17% of the image changed and that the rest was identical. The door, the posters, the flag-coloured panels and the bicycle by the door were untouched.

One thing to look at: the original sign mixes two letter styles, a script for "Latin" and "Shop" and a heavier shadowed script for "Barber". The result re-draws all three words in one consistent style so they match the new text. If you need the original mix, say so in Extra details and compare the variations.

## Tips

- **Type the current text exactly** as it appears, including capitals. It tells the editor where to look.
- **Keep the new text about the same length** as the old. A much longer phrase has to be squeezed into the space the old one occupied.
- **Use the brush** if the same words appear more than once and you only want one changed.
- **Check small print** at 100% zoom. Fine text on packaging is the hardest case, so compare it with the original before using it.

## Cost and limits

${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit; refunded if it fails. It edits text in still photos. It is not a tool for forging documents, and you should only edit images you have the right to change.

## Related guides

- [How to remove an object from a photo with AI](/blog/remove-objects-from-photos-with-ai)
- [How to replace an object in a photo with AI](/blog/replace-objects-in-photos-with-ai)

The storefront is "Barber Storefront with Flag - panoramio.jpg" from Wikimedia Commons, licensed CC BY-SA 3.0; the edited version is shared under the same licence.`,
  },
  {
    slug: "restore-and-colorize-old-photos-with-ai",
    title: "How to Restore and Colourise Old Photos With AI",
    description:
      "Repair scratches and faded contrast and add natural colour to an old black-and-white photograph, with a real before and after and an honest note on what colourising can't know.",
    date: DATE,
    keywords: [
      "restore old photos AI",
      "colorize old photos online",
      "colourise black and white photos",
      "repair damaged photo AI",
      "Nano ImageEdit",
    ],
    image: {
      src: `${IMG}/guide-restore-photos.jpg`,
      alt: "A sepia 1910 street photograph before and after AI colourisation and contrast repair",
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

Use the Restore tool in [${IMAGE_EDIT_NAME}](/image-edit). It has two presets: **Restore damage**, which removes spots, scratches and stains and improves contrast, and **Colorize**, which adds natural colour and fixes the faded contrast. Both change the whole photo, so compare the result with your original.

## Steps

1. Scan or photograph the print as flat and evenly lit as you can, then open the [editor](/image-edit/launch) and add it.
2. Pick **Restore**.
3. Choose **Restore damage** for a damaged print, **Colorize** to add colour, or write your own instruction.
4. Press **Generate**.
5. Use the **Tone / Hybrid / Raw** buttons under the result to change how much of your original detail is kept. Switching needs no new edit and costs nothing.

${common}

## A real example

We colourised a public-domain photograph from 1910: a young newsboy at his stand, with a man, a woman and a second man standing nearby, taken at night. The instruction was "Colorize this old photograph with natural, realistic colors and fix the faded contrast."

The sepia tone became a range of colours: a tan hat, a grey striped suit, a blue-grey coat on the woman in the background, and warm wood on the newspaper stand. The composition, the people and the headline on the paper were unchanged. Because Restore changes the whole photo, it is not pixel-identical to the original the way an object edit is, and the editor does not claim it is. Use the **Changes** view, which shows a heat map of where new structure appeared, to see what was added.

## What colourising cannot know

A black-and-white photograph does not record colour. The model chooses colours that are plausible for the scene, such as skin, wood, fabric and sky, and some of those choices will be wrong for the real day. Treat a colourised photograph as an interpretation. If a particular colour matters, such as a uniform or a flag, check it against another source before relying on it.

## Tips for restoring damaged prints

- **Scan at a good resolution.** The editor works on up to ${IMAGE_EDIT_MAX_SIDE} px on the long side, so a larger scan is scaled down first.
- **Do restore first, then colourise,** as two edits, if the print is badly damaged. You can chain an edit from any earlier version.
- **Keep the original file.** Download the result as a PNG and keep your scan alongside it.

## Cost

${IMAGE_EDIT_PRICE_CREDITS} credits (${IMAGE_EDIT_PRICE_USD_TEXT}) per finished edit; refunded if it fails or you cancel.

## Related guides

- [How to remove an object from a photo with AI](/blog/remove-objects-from-photos-with-ai)
- [How to replace an object in a photo with AI](/blog/replace-objects-in-photos-with-ai)

The photograph is "Jerald Schaitberger of 416 W. 57th St. N.Y. who helps an older boy sell papers until 10 P.M. on Columbus Circle" (Library of Congress, cph.3a01149), in the public domain.`,
  },
];
