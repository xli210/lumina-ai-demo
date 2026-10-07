/**
 * The pictures on /face-studio: real renders and real screenshots of the
 * Nano FaceStudio Online console, cut from the original feature tour
 * (public/images/faceswap-pro, kept as the source) into separate panels in
 * public/images/face-studio so each before/after pair can sit in a slider.
 *
 * The page, its JSON-LD and the image sitemap all read from here, so a
 * caption cannot say one thing on the page and another to a crawler.
 *
 * Captions describe what the picture shows and never name anyone in it.
 * The group example has five faces given a reference in one render (measured
 * from the before/after pair: five tiles change, the rest do not), which is
 * inside the six-face limit of the online console. Keep it that way: do not
 * caption a picture with a number the online product cannot do.
 */

const DIR = "/images/face-studio";

export interface ShowImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface ShowPair {
  before: ShowImage;
  after: ShowImage;
}

const img = (name: string, width: number, height: number, alt: string): ShowImage => ({
  src: `${DIR}/${name}.jpg`,
  width,
  height,
  alt,
});

export const SHOWCASE = {
  hero: {
    before: img("keep-before", 997, 663, "Original portrait of a smiling woman in a knitted beanie with a nose ring"),
    after: img(
      "keep-after",
      997,
      663,
      "The same portrait after a face swap with Keep occluders on: new face, nose ring, beanie and hair unchanged",
    ),
  } satisfies ShowPair,

  group: {
    before: img("group-before", 988, 991, "A grid of eight beauty portraits holding brushes, flowers and props, before the swap"),
    after: img(
      "group-after",
      988,
      991,
      "The same grid after one render that gave five of the faces a new reference; the props and the other faces are unchanged",
    ),
  } satisfies ShowPair,
  groupUi: img(
    "ui-faces",
    1600,
    492,
    "Nano FaceStudio Online face picker: six detected faces, each with its own reference photo slot",
  ),

  keep: {
    original: img("keep-before", 997, 663, "Original portrait with a nose ring"),
    lost: img("nokeep-after", 1004, 668, "A plain face swap of the same portrait: the nose ring has been painted over"),
    kept: img("keep-after", 997, 663, "The same swap with Keep occluders on: the nose ring is preserved"),
  },
  keepUi: img(
    "ui-keep",
    434,
    922,
    "Keep occluders panel: toggles for hair, upper clothing and apparel, with each region shown in colour on the face",
  ),

  modes: {
    target: img("mode-target", 636, 952, "Original photo of a woman sitting against a white wall"),
    face: img("mode-face", 635, 952, "Face swap result: new face, original hair and head shape kept"),
    head: img("mode-head", 636, 952, "Head swap result: the whole head replaced, including hair and earrings"),
  },
  modesUi: img("ui-mode", 1600, 295, "Choose swap mode: Face Swap or Head Swap"),

  pen: {
    before: img("pen-before", 999, 662, "Original close-up of a lip brush touching the lips"),
    after: img("pen-lost", 999, 662, "Swap result where the tip of the lip brush has been lost"),
  } satisfies ShowPair,
  penUi: img(
    "ui-pen",
    1600,
    670,
    "Brush tool over the missing brush tip, with the Bring back masked region button",
  ),
  penRestored: img(
    "pen-restored",
    1600,
    667,
    "After Bring back masked region: the lip brush tip is restored from the original photo",
  ),

  resolution: {
    reference: img("res-reference", 629, 828, "Reference photo used for the swap"),
    before: img("res-target", 629, 828, "Original close-up portrait with freckles, hand on cheek"),
    after: img("res-result", 629, 828, "Swap result at the source resolution, skin texture and the hand on the cheek intact"),
  },

  library: img(
    "ui-library",
    1433,
    524,
    "Virtual face library: twelve AI-generated reference identities to use instead of a real person's photo",
  ),
} as const;

/** Every picture once, for the image sitemap and the JSON-LD screenshot list. */
export const SHOWCASE_IMAGES: readonly { image: ShowImage; title: string }[] = [
  { image: SHOWCASE.hero.after, title: "Face swap that keeps a nose ring and beanie" },
  { image: SHOWCASE.group.after, title: "Several faces swapped in one render" },
  { image: SHOWCASE.groupUi, title: "Per-face reference picker" },
  { image: SHOWCASE.keep.lost, title: "Plain face swap losing a nose ring" },
  { image: SHOWCASE.keepUi, title: "Keep occluders panel" },
  { image: SHOWCASE.modes.face, title: "Face swap mode" },
  { image: SHOWCASE.modes.head, title: "Head swap mode" },
  { image: SHOWCASE.penUi, title: "Brush back a region from the original" },
  { image: SHOWCASE.penRestored, title: "Lost detail restored with the brush" },
  { image: SHOWCASE.resolution.after, title: "Full-resolution face swap result" },
  { image: SHOWCASE.library, title: "Virtual face library" },
];

export const FACE_STUDIO_OG = {
  src: `${DIR}/og-face-studio.jpg`,
  width: 1200,
  height: 630,
  alt: "Nano FaceStudio Online: a portrait before and after a face swap that keeps the nose ring and beanie",
};
