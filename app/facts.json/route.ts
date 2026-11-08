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
import { FACESTUDIO_MAX_FACES, FREE_TOPUP_CREDITS } from "@/lib/facestudio";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_MIN_CREDITS, FACESTUDIO_V_MODES, FACESTUDIO_V_PRICE_LINE } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_NAME, HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_MAX_VARIATIONS } from "@/lib/headswap-pro";
import { IMAGEEDIT_NAME, IMAGEEDIT_CREDITS_PER_EDIT, IMAGEEDIT_MAX_VARIATIONS } from "@/lib/imageedit";
import { PRODUCTS } from "@/lib/products";

const BASE = "https://nanopocket.ai";

/** Product ids whose page under /apps has a different name. */
const APP_PAGE: Record<string, string> = {
  "nano-image-tryon": "nano-imagetryon",
  nnanoimageenh: "nano-imageenh-pro",
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
    credits: {
      credits_per_usd: CREDITS_PER_USD,
      expire: false,
      subscription: false,
      free_on_sign_up: SIGNUP_GRANT_CREDITS,
      free_on_sign_up_equals_photo_face_swaps: SIGNUP_FREE_SWAPS,
      free_top_up_after_first_purchase_to: FREE_TOPUP_CREDITS,
      failed_job_charged: false,
      watermark: "Results from an account that has never bought credits carry a NanoPocket watermark; one purchase removes it.",
      packs: CREDIT_PACKS.map((p) => ({
        name: p.name,
        price_usd: usd(p.priceInCents),
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
    online_tools: [
      {
        name: FACESTUDIO_V_NAME,
        url: `${BASE}/facestudio-v`,
        does: "Replaces one person's face or whole head in a video; everyone else and the sound stay as filmed.",
        price: FACESTUDIO_V_PRICE_LINE,
        price_credits_from: FACESTUDIO_V_MIN_CREDITS,
        modes: Object.values(FACESTUDIO_V_MODES),
        head_swap: {
          page: `${BASE}/video-head-swap`,
          model_type: "diffusion",
          modes: ["Headswap Best", "Headswap Fast"],
          replaces: "face, hair and head shape",
          keeps: "body, clothes, background, other people and the original sound",
          max_clip_seconds: 12,
          max_clip_seconds_account_never_topped_up: 2,
        },
      },
      {
        name: HEADSWAP_PRO_NAME,
        url: `${BASE}/headswap-pro`,
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
        price_credits_per_edit: IMAGEEDIT_CREDITS_PER_EDIT,
        max_variations_per_edit: IMAGEEDIT_MAX_VARIATIONS,
      },
    ],
    desktop_apps: PRODUCTS.map((p) => ({
      name: p.name,
      url: `${BASE}/apps/${APP_PAGE[p.id] ?? p.id}`,
      platform: "Windows",
      price_usd: usd(p.priceInCents),
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
