/**
 * Nano FaceStudio-V Online: the limited three-day queued video face swap
 * preview. One source for the name, the window and the wording, so the
 * homepage card, the What's new bar, the landing page, llms.txt and the
 * middleware gate cannot disagree.
 *
 * The preview is a time-boxed experiment, not a launched product:
 *  - the studio runs on a GPU behind a tunnel and people queue for it;
 *  - the demo page (public/facestudio-v/demo/) is static results only;
 *  - after FACESTUDIO_V_ENDS_AT everything under /facestudio-v/ is closed by
 *    middleware, and the landing page says the preview has ended.
 *
 * To end it early, set ENDS_AT to a time in the past and deploy. The studio's
 * own address (it carries an access key) is never in this repo: it is read from
 * the FACESTUDIO_V_STUDIO_URL environment variable on the server, in
 * app/facestudio-v/launch/page.tsx.
 *
 * Safe to import from middleware, server and client code: plain data only.
 */

export const FACESTUDIO_V_NAME = "Nano FaceStudio-V Online";
export const FACESTUDIO_V_URL = "https://nanopocket.ai/facestudio-v";
/** The sign-in-gated front door to the studio. */
export const FACESTUDIO_V_LAUNCH = "/facestudio-v/launch";
/** The sign-in-gated demo page ("Learn more"): static results, no backend. */
export const FACESTUDIO_V_DEMO = "/facestudio-v/demo/index.html";

/** First day the preview is open, UTC. */
export const FACESTUDIO_V_STARTS_AT = "2026-10-10T04:00:00Z";
/** Three days (72 h) after the start. After this the preview is closed. */
export const FACESTUDIO_V_ENDS_AT = "2026-10-13T04:00:00Z";

/** The first announcement date and the last day, for pages and structured data. */
export const FACESTUDIO_V_ENDS_LABEL = "October 13, 2026 (04:00 UTC)";

export function facestudioVIsOpen(now: number = Date.now()): boolean {
  return now >= Date.parse(FACESTUDIO_V_STARTS_AT) && now < Date.parse(FACESTUDIO_V_ENDS_AT);
}

export function facestudioVHasEnded(now: number = Date.now()): boolean {
  return now >= Date.parse(FACESTUDIO_V_ENDS_AT);
}

/** "Limited 3-day queued preview": the label used everywhere. */
export const FACESTUDIO_V_TAG = "Limited 3-day queued preview";

export const FACESTUDIO_V_TAGLINE =
  "Replace one person's face, or their whole head, in a video. Everyone else and the original sound stay as filmed.";

export const FACESTUDIO_V_POINTS = [
  "Face swap or whole-head swap on video",
  "Pick which person changes in a multi-person clip",
  "The original sound is kept, and detail is restored after the swap",
  "Free for registered users during the preview",
];

export const FACESTUDIO_V_COMING_SOON = "Official release coming soon";

export const FACESTUDIO_V_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is Nano FaceStudio-V Online?",
    a: `${FACESTUDIO_V_NAME} is a video face swap from NanoPocket. You give it a video and a photo of the face you want; it replaces one person in every frame and leaves everyone and everything else as it was filmed. It is available as a limited ${FACESTUDIO_V_TAG.toLowerCase()} for registered NanoPocket users; an official release is coming.`,
  },
  {
    q: "How long is the preview open, and how do I get in?",
    a: `The preview is open for three days and closes on ${FACESTUDIO_V_ENDS_LABEL}. You need a free NanoPocket account: sign in, then open the studio from the card on the NanoPocket homepage or from this page. Requests are queued, so a clip may wait for its turn on the GPU.`,
  },
  {
    q: "Is it free?",
    a: "During the preview it is free for registered users. Pricing for the official release has not been announced.",
  },
  {
    q: "Can I swap any face I like?",
    a: "Only a face you have the right to use. The studio asks you to confirm that before it starts, and the examples on the demo page use stock-footage models and are labelled as AI-generated test renders. Do not publish swaps of real people without their permission.",
  },
  {
    q: "What happens to my uploads?",
    a: "The studio states that uploads and results are deleted after 24 hours. Read the NanoPocket privacy policy for how NanoPocket handles account data.",
  },
  {
    q: "What does it not do?",
    a: "It will not start without confirming you have the right to use the reference face, and when two people are equally prominent it asks you to choose instead of guessing. Frames where a head turns beyond the usable angle stay as filmed. The published figures are a first look measured on public talking-head clips, not a benchmark: no crowds, sports, masks or night footage beyond the clips shown.",
  },
];
