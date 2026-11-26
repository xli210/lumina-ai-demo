import { SIGNUP_GRANT_CREDITS, CREDITS_PER_USD } from "@/lib/credits";
import {
  CREDIT_PACKS,
  AUTO_RECHARGE_EXTRA_BONUS_PERCENT,
  AUTO_RECHARGE_MAX_USD_PER_DAY,
  AUTO_RECHARGE_MAX_USD_PER_MONTH,
  totalCredits,
} from "@/lib/credit-packs";
import {
  FACE_STUDIO_NAME,
  FACE_SWAP_CREDITS,
  HEAD_SWAP_CREDITS,
  SIGNUP_FREE_SWAPS,
} from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES, FACESTUDIO_MEMBER_FACE_SWAP_CREDITS, FACESTUDIO_PRICE_PER_FACE, FREE_TOPUP_CREDITS, memberFaceSwapPriceOn } from "@/lib/facestudio";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_MIN_CREDITS, FACESTUDIO_V_MODES, FACESTUDIO_V_PRICE_LINE } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_NAME, HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_MAX_VARIATIONS } from "@/lib/headswap-pro";
import { IMAGEEDIT_NAME, IMAGEEDIT_CREDIT_TIERS } from "@/lib/imageedit";
import { PRODUCTS } from "@/lib/products";
import { BLACK_FRIDAY_ENDS_AT, BLACK_FRIDAY_STARTS_AT, blackFridayOn } from "@/lib/black-friday";
import { packChargeCents, packPercentOff } from "@/lib/credit-packs";
import {
  FREE_TIER,
  FREE_VIDEO_FACE_SWAP_SECONDS,
  FREE_VIDEO_HEAD_SWAP_BEST_CREDITS,
  FREE_VIDEO_HEAD_SWAP_FAST_CREDITS,
  FREE_VIDEO_HEAD_SWAP_SECONDS,
  VIDEO_OUTPUT_SIZES,
} from "@/lib/free-tier";
import { DAILY_FREE_ATTEMPTS, DAILY_FREE_DEFAULT_CAP, DAILY_FREE_FACE_SWAPS, DAILY_FREE_SINCE, FREE_PHOTO_MAX_SIDE } from "@/lib/facestudio-daily-free-rules";

const BASE = "https://nanopocket.ai";

/** Product ids whose page under /apps has a different name. */
const APP_PAGE: Record<string, string> = {
  "nano-image-tryon": "nano-imagetryon",
  nnanoimageenh: "nano-imageenh-pro",
};

/** Platforms per app, where it is not Windows only. */
const PLATFORM: Record<string, string> = {
  nnanoimageenh: "Windows, macOS (Apple Silicon)",
  "nano-facestudio-pro": "Windows, macOS (Apple Silicon)",
};

/**
 * /facts.json: NanoPocket's products, prices and limits in one small machine-readable file, for AI
 * assistants and anyone quoting them. Every value comes from the constant the product itself uses,
 * so it cannot drift from the site; there is nothing here to edit by hand. Prose with the same facts
 * is in /llms-full.txt; live job figures are at /data/face-swap-stats.
 */
function buildFacts() {
  const usd = (cents: number) => Number((cents / 100).toFixed(2));
  return {
    name: "NanoPocket",
    url: BASE,
    generated_at: new Date().toISOString(),
    about:
      "AI face swap, head swap, video face swap and photo editing: online tools paid in prepaid credits, and Windows desktop apps.",
    sources: {
      llms_txt: `${BASE}/llms.txt`,
      llms_full_txt: `${BASE}/llms-full.txt`,
      live_job_statistics: `${BASE}/data/face-swap-stats`,
      pricing: `${BASE}/pricing`,
      terms: `${BASE}/terms`,
    },
    black_friday: {
      runs: `${new Date(BLACK_FRIDAY_STARTS_AT).toISOString()} to ${new Date(BLACK_FRIDAY_ENDS_AT).toISOString()}`,
      on_now: blackFridayOn(),
      page: `${BASE}/black-friday`,
      ...(memberFaceSwapPriceOn(true)
        ? {
            photo_face_swap_credits_per_face_after_buying_credits: FACESTUDIO_MEMBER_FACE_SWAP_CREDITS,
            photo_face_swap_credits_per_face_otherwise: FACESTUDIO_PRICE_PER_FACE.face_swap,
          }
        : {}),
    },
    credits: {
      credits_per_usd: CREDITS_PER_USD,
      expire: false,
      subscription: false,
      free_on_sign_up: SIGNUP_GRANT_CREDITS,
      free_on_sign_up_equals_photo_face_swaps: SIGNUP_FREE_SWAPS,
      free_top_up_after_first_purchase_to: FREE_TOPUP_CREDITS,
      failed_job_charged: false,
      watermark: `Nano FaceStudio Online photos from an account that has never bought credits have no watermark: up to ${FREE_PHOTO_MAX_SIDE} px on the longer side, a small nanopocket.ai mark in one corner, and AI-generated metadata. Nano HeadSwap Pro, SpotEdit and video results from such an account carry a NanoPocket watermark. One purchase gives full resolution and removes both.`,
      daily_free_photo_face_swap: {
        since: DAILY_FREE_SINCE,
        tool: "Nano FaceStudio Online",
        url: `${BASE}/face-studio`,
        per_account_per_day: DAILY_FREE_FACE_SWAPS,
        faces_per_free_swap: 1,
        credits_needed: 0,
        watermark: "None",
        output: `Up to ${FREE_PHOTO_MAX_SIDE} px on the longer side, with a small nanopocket.ai mark in one corner (full resolution, up to 4080x4080, once the account has bought credits)`,
        day_resets: "Midnight Pacific time (America/Los_Angeles)",
        carries_over: false,
        site_wide_per_day: DAILY_FREE_DEFAULT_CAP,
        tries_per_day_including_failed_renders: DAILY_FREE_ATTEMPTS,
        sign_up: "Required (email, no card); one account per person, the same rule as the sign-up credits",
      },
      packs: CREDIT_PACKS.map((p) => ({
        name: p.name,
        price_usd: usd(p.priceInCents),
        ...(packPercentOff(p) > 0 ? { sale_price_usd: usd(packChargeCents(p)), sale_percent_off: packPercentOff(p) } : {}),
        credits: totalCredits(p),
        bonus_credits: p.bonusCredits,
      })),
      auto_top_up: {
        default: "off",
        extra_bonus_percent: AUTO_RECHARGE_EXTRA_BONUS_PERCENT,
        max_usd_per_24_hours: AUTO_RECHARGE_MAX_USD_PER_DAY,
        max_usd_per_30_days: AUTO_RECHARGE_MAX_USD_PER_MONTH,
      },
    },
    free_tier: {
      summary: FREE_TIER.en.answer,
      what_the_sign_up_credits_buy: FREE_TIER.en.rows,
      shared_balance: FREE_TIER.en.shared,
      limits: FREE_TIER.en.limits,
      page: `${BASE}/face-swap#free`,
      compared_with_other_free_sites: `${BASE}/best-free-face-swap`,
      not_included_on_free: "Online, an email sign-up is required. The sign-up credits are given once; the daily free is one Nano FaceStudio Online face swap (one face) a day. Free photos there are up to 1536 px with a small corner mark, and free video and HeadSwap Pro results carry a watermark until the first top-up. The free Windows apps below have no usage limit, and Nano FaceSwap has no watermark.",
      free_desktop_app: {
        name: "Nano FaceSwap",
        url: `${BASE}/apps/nano-faceswap`,
        price_usd: 0,
        usage_limit: "None: no daily cap, no clip-length cap, photos and videos",
        watermark: "None",
        sign_up: "A free account to claim the free licence key; it then runs offline on the PC",
        needs: "Windows 10/11 and an NVIDIA GPU with 6 GB or more; no Mac, phone or browser version",
        output_resolution: "Keeps the input resolution, up to 4K",
      },
      other_free_desktop_apps: [
        { name: "Nano FacialEdit", url: `${BASE}/apps/nano-facialedit`, price_usd: 0, usage_limit: "None", does: "Portrait editing: expression, smile, eyes, skin retouch, and a portrait face swap" },
        { name: "Nano ImageTryon", url: `${BASE}/apps/nano-imagetryon`, price_usd: 0, usage_limit: "None", does: "Virtual try-on: a garment from any photo onto a person, keeping body shape, pose and lighting" },
      ],
    },
    online_tools: [
      {
        name: FACESTUDIO_V_NAME,
        url: `${BASE}/facestudio-v`,
        does: "Replaces one person's face or whole head in a video; everyone else and the sound stay as filmed.",
        price: FACESTUDIO_V_PRICE_LINE,
        price_credits_from: FACESTUDIO_V_MIN_CREDITS,
        modes: Object.values(FACESTUDIO_V_MODES),
        output_sizes: [...VIDEO_OUTPUT_SIZES],
        output_sizes_note: "Every account, including one that has never topped up, can choose 1080p or 4K; 4K costs twice the credits of 1080p.",
        max_clip_seconds_account_never_topped_up: FREE_VIDEO_FACE_SWAP_SECONDS,
        head_swap: {
          page: `${BASE}/video-head-swap`,
          model_type: "diffusion",
          modes: ["Headswap Best", "Headswap Fast"],
          replaces: "face, hair and head shape",
          keeps: "body, clothes, background, other people and the original sound",
          max_clip_seconds: 12,
          max_clip_seconds_account_never_topped_up: FREE_VIDEO_HEAD_SWAP_SECONDS,
          credits_for_free_clip_at_1080p: { headswap_fast: FREE_VIDEO_HEAD_SWAP_FAST_CREDITS, headswap_best: FREE_VIDEO_HEAD_SWAP_BEST_CREDITS },
        },
      },
      {
        name: HEADSWAP_PRO_NAME,
        url: `${BASE}/headswap-pro`,
        head_swap_guide: `${BASE}/head-swap`,
        does: "Swaps a whole head (face, hair and head shape) in a photo, rebuilt in the pose of the head it replaces.",
        model_type: "diffusion",
        price_credits_per_image: HEADSWAP_PRO_CREDITS_PER_IMAGE,
        max_variations_per_job: HEADSWAP_PRO_MAX_VARIATIONS,
      },
      {
        name: FACE_STUDIO_NAME,
        url: `${BASE}/face-studio`,
        does: "Face swap or head swap in a photo, up to several faces in one render.",
        price_credits_per_face_swap: FACE_SWAP_CREDITS,
        price_credits_per_head_swap: HEAD_SWAP_CREDITS,
        max_faces_per_photo: FACESTUDIO_MAX_FACES,
      },
      {
        name: IMAGEEDIT_NAME,
        url: `${BASE}/image-edit`,
        does: "Edits a photo from a written instruction.",
        price_credits_per_edit_by_photo_size: IMAGEEDIT_CREDIT_TIERS.map(([up_to_mp, credits]) => ({ up_to_mp, credits })),
      },
    ],
    desktop_apps: PRODUCTS.map((p) => ({
      name: p.name,
      url: `${BASE}/apps/${APP_PAGE[p.id] ?? p.id}`,
      platform: PLATFORM[p.id] ?? "Windows",
      price_usd: usd(p.priceInCents),
      ...(p.originalPriceInCents && p.originalPriceInCents > p.priceInCents
        ? p.promoKind === "launch"
          ? { launch_price_until: p.promoValidUntil, price_usd_after_launch: usd(p.originalPriceInCents) }
          : { sale_price_until: p.promoValidUntil, regular_price_usd: usd(p.originalPriceInCents) }
        : {}),
      payment: p.priceInCents === 0 ? "free" : "one-time licence, no subscription",
      free_trial_days: p.trialDays ?? 0,
    })),
  };
}

export function GET() {
  return new Response(JSON.stringify(buildFacts(), null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
      "access-control-allow-origin": "*",
    },
  });
}
