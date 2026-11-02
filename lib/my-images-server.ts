import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreditHoldRecord } from "@/lib/credits-server";
import { FACESTUDIO_SERVICE } from "@/lib/facestudio";
import { HEADSWAP_PRO_SERVICE } from "@/lib/headswap-pro";

/**
 * "My images": the signed-in person's recent Nano FaceStudio Online and Nano HeadSwap Pro renders.
 *
 * Neither page remembered a render once its tab was closed: the job id lived in a variable, so a person who left while the GPU was starting
 * (or was made to wait behind a long line) could not find the picture, and a HeadSwap Pro swap that finished meanwhile was still charged.
 * Every render is a credit reservation that carries its job id, so the reservations are the list, as they are for "My videos". Each row opens
 * its product with ?job=, which shows the picture when it is ready (public/face-studio/app.js, public/headswap-pro/index.html).
 *
 * The pictures themselves are kept by the gateways for a day; that is the length of this list.
 */

export const MY_IMAGES_HOURS = 24;

export interface MyImage {
  job: string;
  hold: string;
  product: "facestudio" | "headswap-pro";
  createdAt: string;
  credits: number;
  /** open: being made; captured: made and charged; released or expired: not charged. */
  status: CreditHoldRecord["status"];
}

export async function imagesOf(userId: string, limit = 40): Promise<MyImage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at")
    .in("service", [FACESTUDIO_SERVICE, HEADSWAP_PRO_SERVICE])
    .eq("user_id", userId)
    .not("job_ref", "is", null)
    .gt("created_at", new Date(Date.now() - MY_IMAGES_HOURS * 3600 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list images: ${error.message}`);
  return ((data ?? []) as CreditHoldRecord[]).map((h) => ({
    job: h.job_ref as string,
    hold: h.id,
    product: h.service === HEADSWAP_PRO_SERVICE ? "headswap-pro" : "facestudio",
    createdAt: h.created_at,
    credits: h.amount,
    status: h.status,
  }));
}

/** Where a row opens: the product's own page, which finds the picture by its job. */
export function imageLink(i: MyImage): string {
  const job = encodeURIComponent(i.job);
  return i.product === "headswap-pro"
    ? `/headswap-pro/index.html?job=${job}&hold=${encodeURIComponent(i.hold)}`
    : `/face-studio/index.html?job=${job}`;
}
