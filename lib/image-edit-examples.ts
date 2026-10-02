/**
 * The before/after examples on /image-edit, and the social card.
 *
 * Every pair is a real edit made with Nano ImageEdit 2.0 Online on
 * 2026-10-02, not retouched afterwards. `prompt` is the instruction that was
 * run (without the editor's standing "keep everything else the same" suffix)
 * and `editedPct` is the figure the editor itself reported for the region
 * tools. Photos are Wikimedia Commons images from the editor's sample set, so
 * each carries its licence and, for CC BY-SA, the edit is shared alike.
 *
 * Files are in public/images/image-edit/, outside the auth-gated
 * `/image-edit/` prefix, so crawlers and link previews can fetch them.
 */

export interface ImageEditExample {
  id: string;
  /** Anchor of the tool on the page. */
  toolId: string;
  toolName: string;
  prompt: string;
  before: string;
  after: string;
  width: number;
  height: number;
  /** Region tools only: share of the image the editor reported as changed. */
  editedPct?: number;
  alt: string;
  credit: { title: string; url: string; license: string };
}

const DIR = "/images/image-edit";

export const IMAGE_EDIT_EXAMPLES: readonly ImageEditExample[] = [
  {
    id: "text-barber",
    toolId: "change-text",
    toolName: "Text",
    prompt:
      'Change the text "Latin Barber Shop" to "Nano Barber Shop", keep the same 3D letter style.',
    before: `${DIR}/text-barber-before.jpg`,
    after: `${DIR}/text-barber-after.jpg`,
    width: 1600,
    height: 1089,
    editedPct: 10.17,
    alt: 'A blue barber shop storefront before and after changing the sign from "Latin Barber Shop" to "Nano Barber Shop" with AI, lettering style kept',
    credit: {
      title: "Barber Storefront with Flag - panoramio.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Barber_Storefront_with_Flag_-_panoramio.jpg",
      license: "CC BY-SA 3.0",
    },
  },
  {
    id: "replace-fruit",
    toolId: "replace-objects",
    toolName: "Replace",
    prompt:
      "Replace the banana, including its stem with a bunch of purple grapes, in the same place.",
    before: `${DIR}/replace-fruit-before.jpg`,
    after: `${DIR}/replace-fruit-after.jpg`,
    width: 1600,
    height: 1142,
    editedPct: 17.07,
    alt: "A bowl of fruit before and after replacing the banana with a bunch of purple grapes using an AI photo editor, the apple and citrus fruit unchanged",
    credit: {
      title: "Fruit Bowl (4880797613).jpg",
      url: "https://commons.wikimedia.org/wiki/File:Fruit_Bowl_(4880797613).jpg",
      license: "CC BY 2.0",
    },
  },
  {
    id: "remove-cars",
    toolId: "remove-objects",
    toolName: "Remove",
    prompt: "Remove the grey hatchback parked next to the white car.",
    before: `${DIR}/remove-cars-before.jpg`,
    after: `${DIR}/remove-cars-after.jpg`,
    width: 1600,
    height: 980,
    editedPct: 4.84,
    alt: "A street with parked cars before and after removing the grey hatchback with AI, the road and grass filled in and the other cars untouched",
    credit: {
      title: "Parked Panek car, Batuty street, Warsaw.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Parked_Panek_car,_Batuty_street,_Warsaw.jpg",
      license: "CC BY-SA 4.0",
    },
  },
  {
    id: "restore-sepia",
    toolId: "restore-photos",
    toolName: "Restore",
    prompt:
      "Colorize this old photograph with natural, realistic colors and fix the faded contrast.",
    before: `${DIR}/restore-sepia-before.jpg`,
    after: `${DIR}/restore-sepia-after.jpg`,
    width: 1600,
    height: 1154,
    alt: "A sepia 1910 night street photograph of a newsboy at his stand with three adults nearby, before and after AI colourisation and contrast repair",
    credit: {
      title: "Jerald Schaitberger … Columbus Circle, October 8, 1910 (LOC cph.3a01149)",
      url: "https://commons.wikimedia.org/wiki/File:Jerald_Schaitberger_of_416_W._57th_St._N.Y._who_helps_an_older_boy_sell_papers_until_10_P.M._on_Columbus_Circle._7_yrs._old._9-30_P.M.,_October_8,_1910._LOC_cph.3a01149.jpg",
      license: "Public domain",
    },
  },
  {
    id: "season-lake",
    toolId: "change-season",
    toolName: "Season",
    prompt:
      "Change the season to autumn: the trees have orange, red and yellow leaves, with fallen leaves on the ground.",
    before: `${DIR}/season-lake-before.jpg`,
    after: `${DIR}/season-lake-after.jpg`,
    width: 1600,
    height: 646,
    alt: "A Scottish loch with a wooded hill reflected in the water, before and after changing the season from summer green to autumn colours with AI",
    credit: {
      title: "Glencoe Lochan reflections 3 20211022.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Glencoe_Lochan_reflections_3_20211022.jpg",
      license: "CC BY-SA 3.0",
    },
  },
];

export const IMAGE_EDIT_OG = {
  src: `${DIR}/og-image-edit.jpg`,
  width: 1200,
  height: 630,
  alt: "Nano ImageEdit 2.0 Online: a barber shop sign changed from Latin Barber Shop to Nano Barber Shop, before and after",
};
