/**
 * The before/after examples on /image-edit, and the social card.
 *
 * Every pair is a real edit made with Nano ImageEdit 2.0 Online between
 * 2026-10-02 and 2026-10-05, not retouched afterwards. `prompt` is the instruction that was
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
    id: "houses-remove-car",
    toolId: "remove-objects",
    toolName: "Remove",
    prompt: "Remove the silver sedan parked at the curb in front of the red house.",
    before: `${DIR}/houses-remove-car-before.jpg`,
    after: `${DIR}/houses-remove-car-after.jpg`,
    width: 1600,
    height: 900,
    editedPct: 4.15,
    alt: "A row of brightly painted houses on a street before and after removing the silver sedan parked at the curb with AI, the red wall and kerb filled in and the other cars untouched",
    credit: {
      title: "Cape Town (ZA), Wale Street -- 2024 -- 3544.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Wale_Street_--_2024_--_3544.jpg",
      license: "CC BY-SA 4.0",
    },
  },
  {
    id: "houses-dusk",
    toolId: "light-and-style",
    toolName: "Light & Style",
    prompt:
      "Turn this into a twilight real estate photo: the sky glows deep blue with a warm orange band near the horizon, and warm yellow light shines from the windows and the wall lamps. Keep the buildings, their colours and the layout the same.",
    before: `${DIR}/houses-dusk-before.jpg`,
    after: `${DIR}/houses-dusk-after.jpg`,
    width: 1600,
    height: 900,
    alt: "A row of brightly painted houses photographed in daylight, then relit as a twilight photo with a deep blue sky and warm light glowing in the windows, using AI",
    credit: {
      title: "Cape Town (ZA), Wale Street -- 2024 -- 3544.jpg",
      url: "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Wale_Street_--_2024_--_3544.jpg",
      license: "CC BY-SA 4.0",
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

/** The SpotEdit cases shown on /image-edit: real edits, with the request that was run and the original's size. */
export interface SpotEditExample {
  id: string;
  title: string;
  prompt: string;
  before: string;
  after: string;
  width: number;
  height: number;
  /** The original photo; the files here are resized for the page. */
  size: string;
}

const SPOTEDIT_DIR = "/images/spotedit";
const spot = (id: string, title: string, prompt: string, width: number, height: number, size: string): SpotEditExample => ({
  id, title, prompt, width, height, size, before: `${SPOTEDIT_DIR}/${id}_before.jpg`, after: `${SPOTEDIT_DIR}/${id}_after.jpg`,
});

export const SPOTEDIT_HERO = spot("wedding", "Clear the view at a wedding", "Remove the blurry guests in the foreground on the left and right edges, so the bride and groom are clearly visible.", 1500, 1000, "6720 × 4480 · 30 MP");

export const SPOTEDIT_EXAMPLES: readonly SpotEditExample[] = [
  spot("group", "Remove someone from a group photo", "Remove the man on the right side of the photo, fill in the background naturally.", 1500, 1000, "3936 × 2624 · 10 MP"),
  spot("photobomber", "Remove a photobomber", "Remove the man in the orange jacket taking a photo in the foreground.", 1000, 1500, "4000 × 6000 · 24 MP"),
  spot("suit", "Casual photo to headshot", "Change his white T-shirt to a navy blue suit jacket with a white dress shirt.", 1000, 1500, "3569 × 5354 · 19 MP"),
  spot("jacket", "Try a new look", "Change the denim jacket to a black leather jacket, keep the white hoodie.", 1000, 1500, "3456 × 5184 · 18 MP"),
  spot("braces", "Remove braces", "Remove the braces from her teeth, natural clean white teeth.", 1034, 1500, "3456 × 5184 · 18 MP · close-up"),
];

/** A live edit compared with its input, pixel by pixel. Figures as measured on 2026-11-08, no watermark. */
export const SPOTEDIT_PROOF = {
  before: `${SPOTEDIT_DIR}/proof_before.jpg`,
  after: `${SPOTEDIT_DIR}/proof_after.jpg`,
  diff: `${SPOTEDIT_DIR}/proof_diff.png`,
  width: 1000,
  height: 1500,
  prompt: "Remove the man on the right",
  reportedEditedPct: 25.61,
  identicalPct: 74.39,
};

export const IMAGE_EDIT_OG = {
  src: `${DIR}/og-image-edit.jpg`,
  width: 1200,
  height: 630,
  alt: "Nano ImageEdit 2.0 Online: a barber shop sign changed from Latin Barber Shop to Nano Barber Shop, before and after",
};
