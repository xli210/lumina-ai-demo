import type { BlogPost } from "@/lib/blog-posts";
import { SPOTEDIT_EXAMPLES, SPOTEDIT_HERO, SPOTEDIT_PROOF } from "@/lib/image-edit-examples";
import {
  IMAGE_EDIT_COLD_START,
  IMAGE_EDIT_MAX_MP,
  IMAGE_EDIT_MAX_UPLOAD_MB,
  IMAGE_EDIT_NAME,
  IMAGE_EDIT_PRICE_CREDITS,
  IMAGE_EDIT_PRICE_TEXT,
  IMAGE_EDIT_WARM_SECONDS,
  IMAGE_EDIT_WELCOME_CREDITS,
} from "@/lib/image-edit-facts";
import { creditsForPhoto } from "@/lib/imageedit";

/**
 * SpotEdit against Photoshop, for retouchers. The question it answers is the one a professional asks
 * an assistant: can AI take over retouching without touching the rest of the file?
 *
 * Manual Photoshop and Generative Fill also leave pixels outside a selection alone, so that alone is
 * not the difference from Photoshop: it is the difference from editors that re-render the whole image.
 * Against Photoshop the post argues the work saved, and hands over a test anyone can run. It does not
 * say the edited area is generated at native resolution, which nothing in the repo documents.
 *
 * SpotEdit's figures come from lib/image-edit-facts.ts and lib/image-edit-examples.ts. Adobe's were read
 * on 2026-11-08: the price and monthly credits from Adobe's plans page; the resolution from a reply by
 * Adobe staff (July 2025) and PhotoshopCAFE (February 2026), so the text says "reported".
 */

const creditsFor = (s: string) => {
  const [, w, h] = s.match(/(\d+) × (\d+)/) ?? [];
  return creditsForPhoto(Number(w), Number(h));
};

const caseRows = [SPOTEDIT_HERO, ...SPOTEDIT_EXAMPLES]
  .map((e) => `| ${e.title} | ${e.prompt} | ${e.size} | ${creditsFor(e.size)} credits |`)
  .join("\n");

export const SPOTEDIT_PRO_POSTS: BlogPost[] = [
  {
    slug: "ai-retouching-vs-photoshop",
    title: "AI Retouching vs Photoshop: Keep Every Other Pixel",
    description:
      "Can AI replace Photoshop for retouching? What SpotEdit takes over, how to prove the background stayed pixel-identical, and what Photoshop still does better.",
    date: "2026-11-08",
    keywords: [
      "AI retouching vs Photoshop",
      "Photoshop alternative for retouching",
      "Generative Fill alternative",
      "edit part of a photo without changing the rest",
      "pixel-identical AI photo editing",
      "SpotEdit",
    ],
    image: {
      src: "/images/spotedit/pixel-check.jpg",
      alt: "A photo before and after removing the man in the foreground with SpotEdit, beside a map of the changed pixels: his outline and a few specks nearby",
      width: 1200,
      height: 630,
    },
    cta: {
      title: "Run the check on one of your own files",
      body: `${IMAGE_EDIT_NAME} costs from ${IMAGE_EDIT_PRICE_CREDITS} credits per edit, and an edit that fails is not charged. New accounts start with ${IMAGE_EDIT_WELCOME_CREDITS} free credits.`,
      href: "/image-edit",
      label: `Open ${IMAGE_EDIT_NAME}`,
    },
    content: `## The short answer

AI can now take over one part of a retoucher's day: the isolated, local fix. Removing a guest, changing a jacket, cleaning up a detail. [${IMAGE_EDIT_NAME}](/image-edit) does that from one sentence, returns the photo at its original size up to ${IMAGE_EDIT_MAX_MP} MP, and leaves every pixel outside the edit identical to the file you uploaded.

It does not replace Photoshop as a whole. Layered composites, colour grading, 16-bit work and batch actions still belong there. The practical change is the order of work: do the spot fixes by description, then bring the file into Photoshop only if it still needs something Photoshop is uniquely good at.

## Why does "the background did not change" matter?

Because a delivered photo has already been approved. Skin, grain, sharpening and the grade are the photographer's work, and a client notices when they drift.

Many AI editors take the whole image, generate a new one and return that. Even where the picture looks the same, the pixels are new. Researchers have documented the effect: [a study of Stable Diffusion inpainting](https://arxiv.org/abs/2306.04632) found distortion even in regions that were not being edited, worst on fine structure such as text, and [a NeurIPS 2026 paper](https://neurips.cc/virtual/2026/poster/151149) documents quality degrading over repeated edits.

${IMAGE_EDIT_NAME} is built the other way round. The editor reports the area it edited, and everything outside that area comes back as it was. Since each edit leaves the rest alone, a second or third edit adds no drift outside the areas you changed.

## How do the options compare?

| | Manual Photoshop | Photoshop Generative Fill | Whole-image AI editors | ${IMAGE_EDIT_NAME} |
|---|---|---|---|---|
| What you do | Select, mask, clone, heal, blend | Make a selection, write a prompt | Write a prompt | Write a prompt; painting an area is optional |
| Pixels outside the edit | Unchanged | Unchanged outside the selection | Usually regenerated | Identical to the upload |
| Size of the result | Your document | Your document; each generation is reported at 1K to 2K | Depends on the tool, often limited | Your photo's size, up to ${IMAGE_EDIT_MAX_MP} MP |
| Layers and bit depth | Full layers, up to 32-bit | Generative layer in your document | Flattened image | Flattened 8-bit PNG |
| Time for a spot fix | Depends on the fix and your skill | Seconds to generate, plus the selection | Seconds to minutes | ${IMAGE_EDIT_WARM_SECONDS} |
| Cost | Photoshop subscription | Subscription plus generative credits | Varies | ${IMAGE_EDIT_PRICE_TEXT} |

Generative Fill deserves a fair reading, because it is the real competitor here. It also leaves everything outside your selection alone. Its limit shows on large areas: an [Adobe staff reply in July 2025](https://community.adobe.com/questions-712/what-is-the-max-resolution-for-generative-fill-in-photoshop-in-2025-1181021) put it at 1024 × 1024 per generation, and [PhotoshopCAFE reported in February 2026](https://photoshopcafe.com/?p=66244) that a newer model reaches 2048 × 2048, with larger selections stretched to fit. Adobe offers Enhance Detail and Generative Upscale to compensate. Adobe's single-app plan was listed at [US$22.99 a month, billed annually, with 25 generative credits a month](https://www.adobe.com/products/photoshop/plans.html) when this was written. Check Adobe's pages for current figures.

## What work does it take off your hands?

A manual removal is a chain of small jobs: select the subject, feather the mask, rebuild what was behind it, match the grain, check the edge. With ${IMAGE_EDIT_NAME} that chain becomes one sentence and a check at 100%. These are real edits, each from a single request, each returned at its original size:

| Job | The request | Original | Price |
|---|---|---|---|
${caseRows}

See them with a before and after slider on the [${IMAGE_EDIT_NAME} page](/image-edit#examples).

Where this pays off most:

- **Wedding and event photographers:** a guest in the foreground or a stranger at the edge of a frame you otherwise love.
- **Portrait and headshot retouchers:** clothing changes and small details on files that have already been graded.
- **Real estate and travel:** cars, bins and clutter. See the [real estate guide](/use-cases/real-estate-photos).
- **Anyone who is asked for one more small fix** on a file that has already been signed off.

## How can you prove no other pixel changed?

Do not take our word for it. In [our published check](/image-edit#proof), the request "${SPOTEDIT_PROOF.prompt}" was reported as editing ${SPOTEDIT_PROOF.reportedEditedPct}% of the photo, and ${SPOTEDIT_PROOF.identicalPct}% of the pixels came back identical. The map at the top of this page shows where those pixels are: the outline of the man who was removed, plus a few specks close by.

To test your own file in Photoshop:

1. Start from an 8-bit RGB PNG or TIFF, on an account that has bought credits. A JPEG can show differences of one level, because programs decode JPEGs slightly differently. A free account's result carries a watermark, which is a real change.
2. Edit it in ${IMAGE_EDIT_NAME} and download the full-resolution PNG.
3. Open the original and place the result on a layer above it, exactly aligned.
4. Set the top layer's blend mode to **Difference**. Identical pixels turn pure black.
5. Add a **Threshold** adjustment at level 1 above both. Differences too faint to see turn white.

If you prefer the command line, ImageMagick's compare with the AE metric counts the pixels that differ between two files.

The white should sit around your edit, sometimes with a few specks nearby, and the rest of the frame should be solid black.

## How do you get a clean edit?

- **Name one thing precisely.** The model takes you literally: "the man in the orange jacket", not "the person".
- **Paint the area when it matters.** The edit then stays inside it, with a soft blend at its edge. Paint a little past the object and include its shadow.
- **Check at 100%.** Zoom in on the edit before you deliver it. The fill behind a removed object is a plausible invention, not a recovery of what was there.
- **Try another version if needed.** The model is generative, so two runs can differ. Each version is a new edit and is charged as one.

## What should you still do in Photoshop?

Be clear about these before you change a workflow:

- **Bit depth:** results are 8-bit. A 16-bit file comes back as 8-bit, so do any heavy grading first or keep it on a master.
- **Layers:** you get a flattened PNG, with no mask or layer to adjust afterwards.
- **Global colour and light:** in our tests, colourising and relighting requests did very little. A whole-scene request such as changing the season rebuilds the entire photo, so the pixel check applies to local edits.
- **Volume:** there is no batch mode and no public API, and an account can run two edits at a time.
- **Speed:** ${IMAGE_EDIT_WARM_SECONDS} per edit. The first edit after a quiet period takes ${IMAGE_EDIT_COLD_START}, while a GPU starts.
- **Offline work:** the edit runs on our GPUs, so the photo is uploaded.

A sensible way to combine them: grade your master in Photoshop or Lightroom, export an 8-bit file for the spot fixes, then place the result back in your document as a layer and mask it wherever you want.

## Can you use it on client work?

You keep all rights to what you make, subject to our Acceptable Use policy, as [our Terms](/terms) state. Only edit photos you have the right to use.

Uploads and results are never used to train models. They are kept in private storage, reached through signed links that expire within an hour, and deleted on request or with your account. In our test the original's ICC profile and EXIF came through to the result.

## What does it cost?

There is no subscription, and credits never expire. You pay per finished edit, by the size of the photo: ${IMAGE_EDIT_PRICE_TEXT}. A failed edit is not charged. It accepts JPEG, PNG, TIFF and WebP, up to ${IMAGE_EDIT_MAX_MP} MP and ${IMAGE_EDIT_MAX_UPLOAD_MB} MB, and a file is refused rather than scaled down if it is larger. Accounts that have never bought credits get a watermark, and buying credits once removes it from later edits. Packs are on the [credits page](/credits).

## Related guides

- [How to remove an object from a photo with AI](/blog/remove-objects-from-photos-with-ai)
- [How to replace an object in a photo with AI](/blog/replace-objects-in-photos-with-ai)
- [How to change the text on a sign in a photo with AI](/blog/change-text-in-photos-with-ai)

Figures for ${IMAGE_EDIT_NAME} are from November 2026. The sample photos are from Unsplash, shown resized. Photoshop, Generative Fill and Adobe are trademarks of Adobe; NanoPocket is not affiliated with Adobe.`,
  },
];
