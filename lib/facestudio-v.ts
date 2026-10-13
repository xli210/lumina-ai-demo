/**
 * Video FaceSwap Online: the limited one-week queued video face swap
 * trial. One source for the name, the window and the wording, so the
 * homepage card, the What's new bar, the landing page, llms.txt and the
 * middleware gate cannot disagree.
 *
 * The trial is a time-boxed experiment, not a launched product. Each video is
 * paid for in NanoPocket credits (the studio prices it, our server holds and
 * settles it: app/api/facestudio-v/*):
 *  - the studio runs on a GPU behind a tunnel and people queue for it;
 *  - the page at /facestudio-v (public/facestudio-v/index.html) is static results
 *    only, public and indexable: it is what brings people in;
 *  - after FACESTUDIO_V_ENDS_AT the door to the studio (/facestudio-v/launch) is
 *    shut by middleware and the page's buttons step aside; the page stays up.
 *
 * To end it early, set ENDS_AT to a time in the past and deploy. The studio's
 * own address (it carries an access key) is never in this repo: it is read from
 * the FACESTUDIO_V_STUDIO_URL environment variable on the server, in
 * app/facestudio-v/launch/page.tsx.
 *
 * Safe to import from middleware, server and client code: plain data only.
 */

export const FACESTUDIO_V_NAME = "Video FaceSwap Online";
export const FACESTUDIO_V_URL = "https://nanopocket.ai/facestudio-v";
/** The public page: the demo, with its fourteen cases. No sign-in. */
export const FACESTUDIO_V_PAGE = "/facestudio-v";
/** The sign-in-gated front door to the studio. */
export const FACESTUDIO_V_LAUNCH = "/facestudio-v/launch";
/** "Learn more": the public page (static results, no backend, no sign-in). */
export const FACESTUDIO_V_DEMO = FACESTUDIO_V_PAGE;

/** The credit service name: holds for this product are recorded under it. */
export const FACESTUDIO_V_SERVICE = "facestudio-v";

/** First day of the one-week trial, UTC (the three-day preview ran 2026-10-10 to 2026-10-13). */
export const FACESTUDIO_V_STARTS_AT = "2026-10-13T05:00:00Z";
/** One week (7 days) after the start. After this the trial is closed. */
export const FACESTUDIO_V_ENDS_AT = "2026-10-20T06:00:00Z";

/** The first announcement date and the last day, for pages and structured data. */
export const FACESTUDIO_V_ENDS_LABEL = "October 20, 2026 (06:00 UTC)";

export function facestudioVIsOpen(now: number = Date.now()): boolean {
  return now >= Date.parse(FACESTUDIO_V_STARTS_AT) && now < Date.parse(FACESTUDIO_V_ENDS_AT);
}

export function facestudioVHasEnded(now: number = Date.now()): boolean {
  return now >= Date.parse(FACESTUDIO_V_ENDS_AT);
}

/** "Limited 1-week queued trial": the label used everywhere. */
export const FACESTUDIO_V_TAG = "Limited 1-week queued trial";

/** What it costs, in one sentence. The studio prices each video; the price is shown before you start. */
export const FACESTUDIO_V_PRICE_LINE =
  "Paid in credits: the price of each video is shown before you start, and a video that fails is refunded. New accounts start with free credits.";

export const FACESTUDIO_V_TAGLINE =
  "Replace one person's face, or their whole head, in a video. Everyone else and the original sound stay as filmed.";

export const FACESTUDIO_V_POINTS = [
  "Face swap or whole-head swap on video",
  "Pick which person changes in a multi-person clip",
  "The original sound is kept, and detail is restored after the swap",
  "Paid in credits: the price is shown before you start, and a failed video is refunded",
];

export const FACESTUDIO_V_COMING_SOON = "Official release coming soon";

export const FACESTUDIO_V_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is Video FaceSwap Online?",
    a: `${FACESTUDIO_V_NAME} is a video face swap from NanoPocket. You give it a video and a photo of the face you want; it replaces one person in every frame and leaves everyone and everything else as it was filmed. It is available as a ${FACESTUDIO_V_TAG.toLowerCase()} for registered NanoPocket users, paid for in credits; an official release is coming.`,
  },
  {
    q: "How long is the trial open, and how do I get in?",
    a: `The trial is open for one week and closes on ${FACESTUDIO_V_ENDS_LABEL}. You need a free NanoPocket account: sign in, then open the studio from the card on the NanoPocket homepage or from the page at nanopocket.ai/facestudio-v. The page itself, with its examples, needs no sign-in. Requests are queued, so a clip may wait for its turn on the GPU.`,
  },
  {
    q: "How much does it cost?",
    a: "Each video is paid for in NanoPocket credits (100 credits = US$1). The studio works out the price from the mode, the output size, the length of the clip and how many people are swapped, and shows it before you start. For example, a 10-second 1080p clip in Fast mode is about 20 credits; Best quality and Whole head cost more. If a video fails, is cancelled, or you leave the line, the credits are returned. New accounts start with free credits. Pricing for the official release has not been announced.",
  },
  {
    q: "Can I swap any face I like?",
    a: "Only a face you have the right to use. The studio asks you to confirm that before it starts, and the examples on the page use stock-footage models and are labelled as AI-generated test renders. Do not publish swaps of real people without their permission.",
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
