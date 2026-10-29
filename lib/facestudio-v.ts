/**
 * Video FaceSwap Online: NanoPocket's queued video face swap, officially
 * released as version 1.1.0 (it ran as a three-day preview and a one-week trial
 * first). One source for the name, the wording and the on/off switch, so the
 * homepage card, the What's new bar, the landing page, llms.txt and the
 * middleware gate cannot disagree.
 *
 * Each video is paid for in NanoPocket credits (the studio prices it, our server
 * holds and settles it: app/api/facestudio-v/*):
 *  - the studio runs on a GPU behind a tunnel and people queue for it;
 *  - the page at /facestudio-v (public/facestudio-v/index.html) is static results
 *    only, public and indexable: it is what brings people in;
 *  - the door to the studio (/facestudio-v/launch) is shut by middleware only
 *    before FACESTUDIO_V_STARTS_AT, or if the studio is not reachable.
 *
 * To close the studio again, add an end time and make facestudioVIsOpen() check
 * it. The studio's own address (it carries an access key) is never in this repo:
 * it is read from the FACESTUDIO_V_STUDIO_URL environment variable on the server,
 * in app/facestudio-v/launch/page.tsx.
 *
 * Safe to import from middleware, server and client code: plain data only.
 */

export const FACESTUDIO_V_NAME = "Video FaceSwap Online";
/** 1.1.0, the official release: hard footage (profile turns, hands and arms in front of the face) and the watermark policy. */
export const FACESTUDIO_V_VERSION = "1.1.0";
export const FACESTUDIO_V_URL = "https://nanopocket.ai/facestudio-v";
/** The public page: the demo, with its fourteen cases. No sign-in. */
export const FACESTUDIO_V_PAGE = "/facestudio-v";
/** The sign-in-gated front door to the studio. */
export const FACESTUDIO_V_LAUNCH = "/facestudio-v/launch";
/** "Learn more": the public page (static results, no backend, no sign-in). */
export const FACESTUDIO_V_DEMO = FACESTUDIO_V_PAGE;

/** The credit service name: holds for this product are recorded under it. */
export const FACESTUDIO_V_SERVICE = "facestudio-v";

/** The modes the studio page can send with a reservation, and what each is called to people. */
export const FACESTUDIO_V_MODES: Record<string, string> = {
  fast: "Fast",
  quality: "Best quality",
  head: "Whole head",
  enhance_fast: "Fast enhance",
  enhance_best: "Best-quality enhance",
};

/** The studio opened to the public on this day, UTC (preview 2026-10-10 to 13, one-week trial 2026-10-13 to 20). */
export const FACESTUDIO_V_STARTS_AT = "2026-10-13T05:00:00Z";
/** The official release (version 1.1.0) went live on this day, UTC. */
export const FACESTUDIO_V_RELEASED_AT = "2026-10-20T06:00:00Z";

/** Open from the first day, with no end date. */
export function facestudioVIsOpen(now: number = Date.now()): boolean {
  return now >= Date.parse(FACESTUDIO_V_STARTS_AT);
}

/** The label used everywhere. */
export const FACESTUDIO_V_TAG = "Official release";

/** What it costs, in one sentence. The studio prices each video; the price is shown before you start. */
export const FACESTUDIO_V_PRICE_LINE =
  "Paid in credits: the price of each video is shown before you start, and a video that fails is refunded. New accounts start with free credits. Videos from an account that has never topped up carry a moving NanoPocket watermark; one top-up removes it.";

export const FACESTUDIO_V_TAGLINE =
  "Replace one person's face, or their whole head, in a video. Everyone else and the original sound stay as filmed.";

export const FACESTUDIO_V_POINTS = [
  "Face swap or whole-head swap on video",
  "Pick which person changes in a multi-person clip",
  "The original sound is kept, and detail is restored after the swap",
  "Paid in credits: the price is shown before you start, and a failed video is refunded",
  "Top up credits once to remove the watermark",
];

export const FACESTUDIO_V_FAQ: readonly { q: string; a: string }[] = [
  {
    q: "What is Video FaceSwap Online?",
    a: `${FACESTUDIO_V_NAME} is a video face swap from NanoPocket. You give it a video and a photo of the face you want; it replaces one person in every frame and leaves everyone and everything else as it was filmed. Version ${FACESTUDIO_V_VERSION} is the official release: it is available to registered NanoPocket users and paid for in credits.`,
  },
  {
    q: "How do I get in?",
    a: "You need a free NanoPocket account: sign in, then open the studio from the card on the NanoPocket homepage or from the page at nanopocket.ai/facestudio-v. The page itself, with its examples, needs no sign-in. Requests are queued, so a clip may wait for its turn on the GPU.",
  },
  {
    q: "How much does it cost?",
    a: "Each video is paid for in NanoPocket credits. The studio works out the price from the mode, the output size, the length of the clip and how many people are swapped, and shows it before you start. For example, a 10-second 1080p clip in Fast mode is about 20 credits; Best quality and Whole head cost more, and 4K costs twice what 1080p does. If a video fails, or you cancel it while it is still waiting, the credits are returned; once it has started being made it can no longer be cancelled, and a Whole head video cannot be cancelled once you press Create. New accounts start with free credits.",
  },
  {
    q: "How long can my clip be?",
    a: "Up to 60 seconds in Fast and Best quality, and up to 12 seconds in Whole head. Our GPU capacity is limited, so an account that has never topped up credits makes videos of up to 5 seconds in Fast and Best quality, and a 2-second Whole head clip for 80 credits, and its videos wait behind those of accounts that have. Topping up credits once gives the full lengths and a place at the front of the line. Limits count a clip by its frames, at 30 frames per second at most: a 60 fps clip counts as twice as long as it plays. A longer video is not refused: the studio uses the first part of it, or the part you choose, exactly as you uploaded it (nothing is re-encoded), and tells you which part before you pay.",
  },
  {
    q: "Why is there a watermark on my video, and how do I remove it?",
    a: "Since October 18, 2026, a video made on an account that has never topped up credits carries a slowly moving, semi-transparent NanoPocket mark. Topping up credits once removes it from the videos you make afterwards. Free sign-up credits and trials do not count as a top-up, and a video that was already made keeps the mark it was made with.",
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
