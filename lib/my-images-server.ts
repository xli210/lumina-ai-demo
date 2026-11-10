import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreditHoldRecord } from "@/lib/credits-server";
import { FACESTUDIO_SERVICE, isFaceStudioJobId } from "@/lib/facestudio";
import { resultObjectKey } from "@/lib/facestudio-result";
import { HEADSWAP_PRO_SERVICE, isGatewayJobId } from "@/lib/headswap-pro";
import { IMAGEEDIT_SERVICE } from "@/lib/imageedit";
import { settleOpenEdits, storedResultKey } from "@/lib/imageedit-server";
import { presignR2Get, r2DownloadsConfig } from "@/lib/r2-sign";

/**
 * "My images": the signed-in person's recent Nano FaceStudio Online, Nano HeadSwap Pro and SpotEdit renders.
 *
 * Neither page remembered a render once its tab was closed: the job id lived in a variable, so a person who left while the GPU was starting
 * (or was made to wait behind a long line) could not find the picture, and a HeadSwap Pro swap that finished meanwhile was still charged.
 * Every render is a credit reservation that carries its job id, so the reservations are the list, as they are for "My videos".
 *
 * A made picture is shown in its row, with its original when one was recorded and a download link, read straight from storage as
 * "My videos" does. Opening the product's page to see it depended on that page's state, which also follows a render still being made, and
 * on the gateway still knowing the job: HeadSwap Pro's forgets it when RunPod does, about half an hour after it ends. A row still being
 * made opens its product with ?job= (public/face-studio/app.js, public/headswap-pro/index.html, public/image-edit/index.html).
 *
 * The pictures themselves are kept for a day; that is the length of this list.
 */

export const MY_IMAGES_HOURS = 24;

/** How long the links on the page work: the page is read once, the pictures may be looked at a while later. */
const LINK_TTL_SECONDS = 60 * 60;

export interface MyImage {
  job: string;
  hold: string;
  product: "facestudio" | "headswap-pro" | "spotedit";
  createdAt: string;
  credits: number;
  /** open: being made; captured: made and charged; released or expired: not charged. */
  status: CreditHoldRecord["status"];
  /** The finished picture(s), when they are in storage. */
  result?: ImageResult;
}

export interface ImageResult {
  /** One per picture made: HeadSwap Pro makes up to four variations. */
  images: { preview: string; download: string }[];
  /** The photo as it was before; absent when it was not recorded. */
  before?: string;
  width?: number;
  height?: number;
  /** SpotEdit: the result as the editor names it to keep editing; absent when it carries the mark. */
  resultKey?: string;
  watermarked?: boolean;
}

const PRODUCT_OF: Record<string, MyImage["product"]> = {
  [FACESTUDIO_SERVICE]: "facestudio",
  [HEADSWAP_PRO_SERVICE]: "headswap-pro",
  [IMAGEEDIT_SERVICE]: "spotedit",
};

export async function imagesOf(userId: string, limit = 40, products: MyImage["product"][] = ["facestudio", "headswap-pro", "spotedit"]): Promise<MyImage[]> {
  // So the list says what was charged, and SpotEdit edits nobody is watching any more are not left "being made".
  await settleOpenEdits(userId).catch((err: unknown) => {
    console.error("[my-images] settling SpotEdit edits failed:", err instanceof Error ? err.message : err);
  });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at, estimate")
    .in("service", Object.keys(PRODUCT_OF).filter((s) => products.includes(PRODUCT_OF[s])))
    .eq("user_id", userId)
    .not("job_ref", "is", null)
    .gt("created_at", new Date(Date.now() - MY_IMAGES_HOURS * 3600 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list images: ${error.message}`);
  const holds = (data ?? []) as CreditHoldRecord[];
  const results = await Promise.all(
    holds.map((h) =>
      resultOf(h).catch((err: unknown) => {
        console.error("[my-images] result lookup failed:", err instanceof Error ? err.message : err);
        return null;
      })
    )
  );
  return holds.map((h, n) => ({
    job: h.job_ref as string,
    hold: h.id,
    product: PRODUCT_OF[h.service],
    createdAt: h.created_at,
    credits: h.amount,
    status: h.status,
    ...(results[n] ? { result: results[n] } : {}),
  }));
}

function sign(key: string, downloadAs?: string): string {
  const config = r2DownloadsConfig();
  if (!config) throw new Error("image storage is not configured");
  return presignR2Get(config, key, { expiresIn: LINK_TTL_SECONDS, downloadAs });
}

/** Whether an object is in storage: one byte of it, so a 20 MB picture is not read to find out. */
async function exists(key: string): Promise<boolean> {
  try {
    const r = await fetch(sign(key), { headers: { Range: "bytes=0-0" }, cache: "no-store", signal: AbortSignal.timeout(4_000) });
    await r.body?.cancel();
    return r.ok;
  } catch (err: unknown) {
    console.error("[my-images] storage check failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

const num = (v: unknown) => (typeof v === "number" ? v : undefined);
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

/**
 * A render's pictures in storage, or null. FaceStudio and HeadSwap Pro only once charged: a free account's picture carries the mark,
 * and the charge is what says the gateway saw it there. SpotEdit's edit decides the same from the file it reads (lib/imageedit-server).
 */
async function resultOf(hold: CreditHoldRecord): Promise<ImageResult | null> {
  const job = hold.job_ref as string;
  switch (PRODUCT_OF[hold.service]) {
    case "spotedit": {
      if (hold.status === "open") return null;
      const key = await storedResultKey(hold);
      if (!key) return null;
      const src = str(hold.estimate?.src_key);
      // As readEdit decides it: the worker was told to mark the edit unless the hold says no mark was needed.
      const watermarked = hold.estimate?.watermark !== false;
      return {
        images: [{ preview: sign(key.replace(/\.png$/, ".jpg")), download: sign(key, "spotedit.png") }],
        before: src ? sign(src) : undefined,
        width: num(hold.estimate?.width),
        height: num(hold.estimate?.height),
        resultKey: watermarked ? undefined : key,
        watermarked,
      };
    }
    case "facestudio": {
      if (hold.status !== "captured" || !isFaceStudioJobId(job)) return null;
      const key = resultObjectKey(process.env.FACESTUDIO_OUTPUT_PREFIX || "facestudio/output", job);
      if (!(await exists(key))) return null;
      const target = str(hold.estimate?.target_key);
      return {
        images: [{ preview: sign(key), download: sign(key, "nanopocket-face-studio.png") }],
        before: target && (await exists(target)) ? sign(target) : undefined,
      };
    }
    case "headswap-pro": {
      if (hold.status !== "captured" || !isGatewayJobId(job)) return null;
      // The worker files a swap as headswap/output/<job>/before.png and v1.png ... vN.png.
      const dir = `headswap/output/${job}`;
      const n = Math.min(4, Math.max(1, num(hold.estimate?.variations) ?? 1));
      const keys = Array.from({ length: n }, (_, i) => `${dir}/v${i + 1}.png`);
      const [hasBefore, ...have] = await Promise.all([exists(`${dir}/before.png`), ...keys.map(exists)]);
      const images = keys
        .filter((_, i) => have[i])
        .map((k, i) => ({ preview: sign(k), download: sign(k, `nanopocket-head-swap-${i + 1}.png`) }));
      if (!images.length) return null;
      return { images, before: hasBefore ? sign(`${dir}/before.png`) : undefined };
    }
    default:
      return null;
  }
}

/** Where a row opens: the product's own page, which finds the picture by its job. */
export function imageLink(i: MyImage): string {
  const job = encodeURIComponent(i.job);
  if (i.product === "spotedit") return `/image-edit/index.html?job=${job}`;
  return i.product === "headswap-pro"
    ? `/headswap-pro/index.html?job=${job}&hold=${encodeURIComponent(i.hold)}`
    : `/face-studio/index.html?job=${job}`;
}
