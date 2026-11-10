import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreditHoldRecord } from "@/lib/credits-server";
import { FACESTUDIO_SERVICE } from "@/lib/facestudio";
import { HEADSWAP_PRO_SERVICE } from "@/lib/headswap-pro";
import { IMAGEEDIT_SERVICE } from "@/lib/imageedit";
import { settleOpenEdits, signFile, storedResultKey } from "@/lib/imageedit-server";

/**
 * "My images": the signed-in person's recent Nano FaceStudio Online, Nano HeadSwap Pro and SpotEdit renders.
 *
 * Neither page remembered a render once its tab was closed: the job id lived in a variable, so a person who left while the GPU was starting
 * (or was made to wait behind a long line) could not find the picture, and a HeadSwap Pro swap that finished meanwhile was still charged.
 * Every render is a credit reservation that carries its job id, so the reservations are the list, as they are for "My videos". Each row opens
 * its product with ?job=, which shows the picture when it is ready (public/face-studio/app.js, public/headswap-pro/index.html, public/image-edit/index.html).
 * A made SpotEdit edit is also shown in the row itself, with its original and a download link.
 *
 * The pictures themselves are kept by the gateways for a day; that is the length of this list.
 */

export const MY_IMAGES_HOURS = 24;

export interface MyImage {
  job: string;
  hold: string;
  product: "facestudio" | "headswap-pro" | "spotedit";
  createdAt: string;
  credits: number;
  /** open: being made; captured: made and charged; released or expired: not charged. */
  status: CreditHoldRecord["status"];
  /**
   * A SpotEdit result, shown in the list itself as "My videos" does: opening the editor to see it depended on the editor's state, which
   * also tracks an edit still being made.
   */
  edit?: SpotEditResult;
}

export interface SpotEditResult {
  preview: string;
  download: string;
  /** The photo as it was before the edit; absent for edits started before it was recorded. */
  before?: string;
  width?: number;
  height?: number;
}

const PRODUCT_OF: Record<string, MyImage["product"]> = {
  [FACESTUDIO_SERVICE]: "facestudio",
  [HEADSWAP_PRO_SERVICE]: "headswap-pro",
  [IMAGEEDIT_SERVICE]: "spotedit",
};

export async function imagesOf(userId: string, limit = 40): Promise<MyImage[]> {
  // So the list says what was charged, and SpotEdit edits nobody is watching any more are not left "being made".
  await settleOpenEdits(userId).catch((err: unknown) => {
    console.error("[my-images] settling SpotEdit edits failed:", err instanceof Error ? err.message : err);
  });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at, estimate")
    .in("service", Object.keys(PRODUCT_OF))
    .eq("user_id", userId)
    .not("job_ref", "is", null)
    .gt("created_at", new Date(Date.now() - MY_IMAGES_HOURS * 3600 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list images: ${error.message}`);
  const holds = (data ?? []) as CreditHoldRecord[];
  const edits = await Promise.all(holds.map((h) => (PRODUCT_OF[h.service] === "spotedit" ? spotEditResult(h) : null)));
  return holds.map((h, n) => ({
    job: h.job_ref as string,
    hold: h.id,
    product: PRODUCT_OF[h.service],
    createdAt: h.created_at,
    credits: h.amount,
    status: h.status,
    ...(edits[n] ? { edit: edits[n] } : {}),
  }));
}

/** The finished edit in storage, whatever its reservation says; null while it is being made or when there is no file. */
async function spotEditResult(hold: CreditHoldRecord): Promise<SpotEditResult | null> {
  if (hold.status === "open") return null;
  try {
    const key = await storedResultKey(hold);
    if (!key) return null;
    const src = hold.estimate?.src_key;
    const num = (v: unknown) => (typeof v === "number" ? v : undefined);
    return {
      preview: signFile(key.replace(/\.png$/, ".jpg")),
      download: signFile(key, "spotedit.png"),
      before: typeof src === "string" ? signFile(src) : undefined,
      width: num(hold.estimate?.width),
      height: num(hold.estimate?.height),
    };
  } catch (err: unknown) {
    console.error("[my-images] SpotEdit result lookup failed:", err instanceof Error ? err.message : err);
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
