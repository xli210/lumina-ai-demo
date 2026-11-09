import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureSignupGrant, type CreditHoldRecord } from "@/lib/credits-server";
import { FACE_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { FACESTUDIO_SERVICE } from "@/lib/facestudio";
import { FACESTUDIO_V_MIN_CREDITS, FACESTUDIO_V_SERVICE } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_SERVICE } from "@/lib/headswap-pro";
import { IMAGEEDIT_CREDITS_PER_EDIT, IMAGEEDIT_SERVICE } from "@/lib/imageedit";
import { imageLink, MY_IMAGES_HOURS } from "@/lib/my-images-server";
import { START_TOOLS, type StartToolId } from "@/lib/start-tools";

/**
 * What /start, the home page's strip and the "next tool" row on result screens show: the balance, each tool's price,
 * which tools this person has used, and their last finished pictures and videos.
 *
 * On 11/4, 81% of the people who had stopped using the tools still held 25 credits or more, and 96% had only ever used
 * one tool: what was missing was somewhere to see what else those credits could do.
 */

const SERVICE: Record<StartToolId, string> = {
  video: FACESTUDIO_V_SERVICE,
  head: HEADSWAP_PRO_SERVICE,
  face: FACESTUDIO_SERVICE,
  edit: IMAGEEDIT_SERVICE,
};

const PRICE: Record<StartToolId, number> = {
  video: FACESTUDIO_V_MIN_CREDITS,
  head: HEADSWAP_PRO_CREDITS_PER_IMAGE,
  face: FACE_SWAP_CREDITS,
  edit: IMAGEEDIT_CREDITS_PER_EDIT,
};

export interface StartRecent {
  tool: StartToolId;
  createdAt: string;
  href: string;
}

export interface StartSummary {
  available: number;
  tools: { id: StartToolId; href: string; price: number; from: boolean }[];
  tried: StartToolId[];
  recent: StartRecent[];
}

const RECENT_MAX = 3;

export async function startSummary(userId: string): Promise<StartSummary> {
  const account = await ensureSignupGrant(userId);
  const { data, error } = await createAdminClient()
    .from("credit_holds")
    .select("id, service, job_ref, created_at")
    .eq("user_id", userId)
    .eq("status", "captured")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Failed to read past jobs: ${error.message}`);
  const rows = (data ?? []) as Pick<CreditHoldRecord, "id" | "service" | "job_ref" | "created_at">[];

  const toolOf = (service: string) => START_TOOLS.find((t) => SERVICE[t.id] === service)?.id;
  const since = Date.now() - MY_IMAGES_HOURS * 3600 * 1000;
  const recent: StartRecent[] = [];
  for (const r of rows) {
    if (recent.length >= RECENT_MAX || new Date(r.created_at).getTime() < since || !r.job_ref) continue;
    const tool = toolOf(r.service);
    if (tool === "video") recent.push({ tool, createdAt: r.created_at, href: "/facestudio-v/videos" });
    if (tool === "head" || tool === "face" || tool === "edit") {
      const product = tool === "head" ? "headswap-pro" : tool === "edit" ? "spotedit" : "facestudio";
      recent.push({
        tool,
        createdAt: r.created_at,
        href: imageLink({ job: r.job_ref, hold: r.id, product, createdAt: r.created_at, credits: 0, status: "captured" }),
      });
    }
  }

  return {
    available: account.available,
    tools: START_TOOLS.map((t) => ({ id: t.id, href: t.href, price: PRICE[t.id], from: t.from })),
    tried: START_TOOLS.filter((t) => rows.some((r) => r.service === SERVICE[t.id])).map((t) => t.id),
    recent,
  };
}
