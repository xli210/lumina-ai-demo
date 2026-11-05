import "server-only";

import { grantCredits } from "@/lib/credits-server";
import {
  SOCIAL_REWARD_CREDITS,
  SOCIAL_REWARD_MAX_TRIES,
  parseSocialPostUrl,
  type SocialRejectReason,
  type SocialSubmitError,
} from "@/lib/social-reward";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SocialRewardState {
  status: "none" | "pending" | "approved" | "rejected";
  url: string | null;
  rejectReason: SocialRejectReason | null;
  triesLeft: number;
  /** Has spent credits on a tool: the reward is for people who used the product. */
  eligible: boolean;
}

/** What the account page shows. Null when scripts/021 has not been applied, so the card stays hidden. */
export async function getSocialRewardState(userId: string): Promise<SocialRewardState | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("social_post_rewards")
    .select("status, url, reject_reason")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(SOCIAL_REWARD_MAX_TRIES + 1);
  if (error) {
    console.error("[social-reward] read failed:", error.message);
    return null;
  }
  const rows = data ?? [];
  const { data: account } = await supabase
    .from("credit_accounts")
    .select("lifetime_spent")
    .eq("user_id", userId)
    .maybeSingle();

  const latest = rows[0];
  return {
    status: (latest?.status as SocialRewardState["status"]) ?? "none",
    url: latest?.url ?? null,
    rejectReason: (latest?.reject_reason as SocialRejectReason | null) ?? null,
    triesLeft: Math.max(0, SOCIAL_REWARD_MAX_TRIES - rows.filter((r) => r.status === "rejected").length),
    eligible: Number(account?.lifetime_spent ?? 0) > 0,
  };
}

export async function submitSocialPostForUser(
  userId: string,
  rawUrl: string,
): Promise<{ error?: SocialSubmitError }> {
  const parsed = parseSocialPostUrl(rawUrl);
  if ("error" in parsed) return { error: parsed.error };

  const state = await getSocialRewardState(userId);
  if (!state) return { error: "failed" };
  if (state.status === "pending" || state.status === "approved" || state.triesLeft === 0) return { error: "done" };
  if (!state.eligible) return { error: "not_eligible" };

  const { error } = await createAdminClient().from("social_post_rewards").insert({
    user_id: userId,
    url: parsed.url,
    normalized_url: parsed.normalized,
    platform: parsed.platform,
  });
  if (!error) return {};
  if (error.code === "23505") return { error: error.message.includes("one_per_post") ? "used" : "done" };
  console.error("[social-reward] submit failed:", error.message);
  return { error: "failed" };
}

/**
 * The credits come first, keyed on the account, and the row is marked after. If marking fails the admin
 * approves again and the grant is a no-op, so a post can never pay twice or be left paid but pending.
 */
export async function approveSocialPost(postId: string, adminId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: post, error } = await supabase
    .from("social_post_rewards")
    .select("user_id, url, status")
    .eq("id", postId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!post || post.status !== "pending") return;

  await grantCredits({
    userId: String(post.user_id),
    amount: SOCIAL_REWARD_CREDITS,
    kind: "promo",
    idempotencyKey: `social_post:${post.user_id}`,
    reference: { reason: "social_post", post_id: postId, url: post.url, approved_by: adminId },
  });

  const { error: updateError } = await supabase
    .from("social_post_rewards")
    .update({
      status: "approved",
      credits: SOCIAL_REWARD_CREDITS,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("status", "pending");
  if (updateError) throw new Error(updateError.message);
}

export async function rejectSocialPost(postId: string, adminId: string, reason: SocialRejectReason): Promise<void> {
  const { error } = await createAdminClient()
    .from("social_post_rewards")
    .update({
      status: "rejected",
      reject_reason: reason,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}
