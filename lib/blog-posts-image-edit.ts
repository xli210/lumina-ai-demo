import type { BlogPost } from "@/lib/blog-posts";
import {
  IMAGE_EDIT_COLD_START,
  IMAGE_EDIT_MAX_MP,
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_TEXT,
  IMAGE_EDIT_WARM_SECONDS,
} from "@/lib/image-edit-facts";

/**
 * Three how-to guides for SpotEdit, one per search it answers. Each one is
 * built on a real edit made with the product on 2026-11-08 (the figures quoted
 * are the editor's own report for that run) and links to /image-edit.
 *
 * Prices, timings and limits come from lib/image-edit-facts.ts so a guide
 * cannot disagree with the product page. Lead images are before/after pairs
 * of those same edits.
 */

const DATE = "2026-11-08";
const IMG = "/images/image-edit";

const cta = {
  title: `Try it on your own photo`,
  body: `${IMAGE_EDIT_NAME} costs from ${IMAGE_EDIT_PRICE_CREDITS} credits per edit, and an edit that fails is not charged. New accounts get free credits.`,
  href: "/image-edit",
  label: `Open ${IMAGE_EDIT_NAME}`,
};

const common = `Prices and times on this page are those of ${IMAGE_EDIT_NAME} on the day it was written: ${IMAGE_EDIT_PRICE_TEXT}. An edit usually takes ${IMAGE_EDIT_WARM_SECONDS}, and the first one after a quiet period takes ${IMAGE_EDIT_COLD_START}.`;

const steps = (example: string) => `1. Sign in, open the [editor](/image-edit/launch) and add your photo.
2. Write the change in plain words, for example ${example}.
3. Optional: choose **Brush an area** and paint over the part that may change. The edit stays there, with a soft blend at its edge.
4. Press **Edit**. When it finishes, drag the before and after slider, or view the two side by side, and zoom in to check the details.
5. Press **Download full resolution** for the PNG, or **Keep editing this** to make another change to the result.`;

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
      "SpotEdit",
    ],
    image: {
      src: `${IMG}/guide-remove-objects.jpg`,
      alt: "A street with parked cars before and after removing the grey hatchback with an AI photo editor",
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

Open a photo in [${IMAGE_EDIT_NAME}](/image-edit), say what should go, and press Edit. The background behind it is filled in to match the scene, and the rest of the photo stays identical to your original.

## What you need

- A photo (JPEG, PNG, TIFF or WebP, up to ${IMAGE_EDIT_MAX_MP} MP). It is never scaled down.
- A free NanoPocket account. New accounts start with free credits.
- About a minute. ${common}

## Steps

${steps('"Remove the grey hatchback parked next to the white car"')}

## Be specific, because the model takes you literally

Our test photo has several parked cars. When we asked to "Remove the parked cars", it took out the grey car beside the white one, and the cars in the distance too, but left the gold and white cars in the foreground. When we named one, "the grey hatchback parked next to the white car", only that car went, and the cars behind it stayed.

- **Vague:** "the car", "the person", "the thing on the left".
- **Specific:** "the grey hatchback parked next to the white car", "the man in the striped shirt on the right".

The editor reported that 6.07% of the image changed. Everything else came back identical to the original.

## What to expect

- **Speed:** ${IMAGE_EDIT_WARM_SECONDS} per edit. ${IMAGE_EDIT_COLD_START} for the first one after a quiet period, because a GPU is started on demand.
- **Cost:** ${IMAGE_EDIT_PRICE_TEXT}. If the edit fails, you are not charged.
- **Output:** a lossless PNG at the size you uploaded. Accounts that have never bought credits get a watermark.
- **The fill is generated.** What was hidden behind the object is a plausible invention, not a recovery of what was really there.

## When to try another version

Two runs can differ. If an edge looks soft or the pattern behind the object repeats, press **Try another version**. Each one is a separate edit and is charged separately.

## Related guides

- [How to replace an object in a photo with AI](/blog/replace-objects-in-photos-with-ai)
- [How to change the text on a sign in a photo with AI](/blog/change-text-in-photos-with-ai)
- [AI retouching vs Photoshop: keeping every other pixel](/blog/ai-retouching-vs-photoshop)

The street photo is "Parked Panek car, Batuty street, Warsaw.jpg" from Wikimedia Commons, licensed CC BY-SA 4.0; the edited version is shared under the same licence.`,
  },
  {
    slug: "replace-objects-in-photos-with-ai",
    title: "How to Replace an Object in a Photo With AI",
    description:
      "Swap one object for another in a photo by describing both, with the rest of the photo left alone. A guide with a real before and after.",
    date: DATE,
    keywords: [
      "replace object in photo AI",
      "swap object in picture online",
      "AI object replacement",
      "change an object in a photo",
      "SpotEdit",
    ],
    image: {
      src: `${IMG}/guide-replace-objects.jpg`,
      alt: "A bowl of fruit before and after replacing the banana with a bunch of purple grapes using an AI photo editor",
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

In [${IMAGE_EDIT_NAME}](/image-edit), say what to replace and what to put there. It swaps one for the other in the same place and leaves the rest of the photo identical.

## Steps

${steps('"Replace the banana with a bunch of purple grapes"')}

${common}

## A real example

We replaced the banana in a fruit bowl with a bunch of purple grapes, using exactly the instruction above. The grapes sit where the banana was, with no leftover stem. The editor reported that 16.53% of the image changed. The apple, the citrus fruit and the rest of the bowl were not edited.

## Tips for better swaps

- **Say what the new object looks like,** not just what it is: "a bunch of purple grapes" rather than "grapes".
- **Name the parts that are easy to miss,** such as a stem, a handle or a cable, if a piece of the old object is left behind.
- **Use the brush** when the object is small or there are several lookalikes. Painting over the right one removes the guesswork.
- **Try another version** if the first result is close but not right. Each is a separate edit.

## What it costs

${IMAGE_EDIT_PRICE_TEXT}, per finished edit. A failed edit is not charged.

## Related guides

- [How to remove an object from a photo with AI](/blog/remove-objects-from-photos-with-ai)
- [How to change the text on a sign in a photo with AI](/blog/change-text-in-photos-with-ai)

The fruit photo is "Fruit Bowl (4880797613).jpg" from Wikimedia Commons, licensed CC BY 2.0.`,
  },
  {
    slug: "change-text-in-photos-with-ai",
    title: "How to Change the Text on a Sign in a Photo With AI",
    description:
      "Rewrite the words on a shop sign, label or poster in a photo and keep the look of the lettering. A guide with a real before and after.",
    date: DATE,
    keywords: [
      "change text in image AI",
      "edit text in a photo",
      "replace text on sign in photo",
      "AI text editor for images",
      "SpotEdit",
    ],
    image: {
      src: `${IMG}/guide-change-text.jpg`,
      alt: 'A blue barber shop sign before and after changing "Latin Barber Shop" to "Nano Barber Shop" with an AI photo editor',
      width: 1200,
      height: 630,
    },
    cta,
    content: `## The short answer

In [${IMAGE_EDIT_NAME}](/image-edit), write which words to change and what they should say. It redraws the lettering in the style of the original and leaves the rest of the photo identical.

## Steps

${steps(`'Change the text "Latin Barber Shop" to "Nano Barber Shop"'`)}

${common}

## A real example

The photo is a blue barber shop front whose sign reads "Latin Barber Shop". We changed it to "Nano Barber Shop", using the instruction above.

The sign came back reading "Nano Barber Shop" in white shadowed lettering on the same blue panel, at the same perspective. The editor reported that 9.68% of the image changed. The door, the posters, the flag-coloured panels and the bicycles were not edited.

One thing to look at: the original sign mixes two letter styles, a light script for "Latin" and "Shop" and a heavier one for "Barber". The result draws the new words a little differently from the originals. It is close to the original lettering, not an exact font match.

## Tips

- **Quote the current text exactly** as it appears, including capitals. It tells the editor where to look.
- **Keep the new text about the same length** as the old. A much longer phrase has to fit in the space the old one occupied.
- **Use the brush** if the same words appear more than once and you only want one changed.
- **Check small print** at 100% zoom. We have tested large lettering, not fine print.

## Cost and limits

${IMAGE_EDIT_PRICE_TEXT}, per finished edit; not charged if it fails. It edits text in still photos. It is not a tool for forging documents, and you should only edit images you have the right to change.

## Related guides

- [How to remove an object from a photo with AI](/blog/remove-objects-from-photos-with-ai)
- [How to replace an object in a photo with AI](/blog/replace-objects-in-photos-with-ai)

The storefront is "Barber Storefront with Flag - panoramio.jpg" from Wikimedia Commons, licensed CC BY-SA 3.0; the edited version is shared under the same licence.`,
  },
];
