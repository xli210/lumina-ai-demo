import "server-only";

import { SIGNUP_GRANT_CREDITS, signupGrantKey } from "@/lib/credits";
import { grantCredits } from "@/lib/credits-server";
import { getFreeClaimOutcome, isAllowedOutcome } from "@/lib/free-claim";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * A person refused the free sign-up credits can ask us to look again.
 *
 * The request is a contact message (kind 'other') whose text starts with REVIEW_TAG, so it shows
 * up in /admin/messages with no new table. One request per account. Nothing is granted
 * automatically: an admin reads the account (outcome, email, mail provider) and either approves,
 * which grants the normal welcome credits under the same idempotency key as the automatic grant
 * (so it can never be paid twice) and marks the claim granted, or declines.
 */
export const REVIEW_TAG = "[Free credits review]";

export interface ReviewState {
  requestedAt: string | null;
  status: "new" | "read" | "done" | null;
}

export async function getReviewRequest(userId: string): Promise<ReviewState> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("contact_messages")
    .select("created_at, status")
    .eq("user_id", userId)
    .like("message", `${REVIEW_TAG}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = data as { created_at: string; status: ReviewState["status"] } | null;
  return { requestedAt: row?.created_at ?? null, status: row?.status ?? null };
}

export type ReviewRequestResult = { ok: true } | { error: "not_refused" | "already" | "failed" };

export async function requestReview(userId: string, email: string | null, note: string): Promise<ReviewRequestResult> {
  const outcome = await getFreeClaimOutcome(userId).catch(() => null);
  if (!outcome || isAllowedOutcome(outcome)) return { error: "not_refused" };
  if ((await getReviewRequest(userId)).requestedAt) return { error: "already" };

  const admin = createAdminClient();
  const { data: claim } = await admin
    .from("free_credit_claims")
    .select("email_domain, mail_provider, created_at")
    .eq("user_id", userId)
    .maybeSingle();
  const c = claim as { email_domain?: string | null; mail_provider?: string | null; created_at?: string } | null;

  const lines = [
    `${REVIEW_TAG} account ${userId}`,
    `Refused as: ${outcome}`,
    `Email domain: ${c?.email_domain ?? "?"} · mail provider: ${c?.mail_provider ?? "?"}`,
    note ? `Their note: ${note}` : "No note.",
  ];
  const { error } = await admin.from("contact_messages").insert({
    kind: "other",
    message: lines.join("\n").slice(0, 4000),
    email: email,
    other_contact: email ? null : `account ${userId}`,
    page: "/credits",
    user_id: userId,
  });
  if (error) {
    console.error("[free-credit-review] insert failed:", error.code, error.message);
    return { error: "failed" };
  }
  return { ok: true };
}

/** Admin decision on a review request. Approve grants the welcome credits once. */
export async function decideReview(messageId: string, approve: boolean, adminId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("contact_messages")
    .select("id, user_id, message")
    .eq("id", messageId)
    .maybeSingle();
  const msg = data as { id: string; user_id: string | null; message: string } | null;
  if (!msg?.user_id || !msg.message.startsWith(REVIEW_TAG)) throw new Error("Not a free-credit review request");

  if (approve) {
    await grantCredits({
      userId: msg.user_id,
      amount: SIGNUP_GRANT_CREDITS,
      kind: "signup_grant",
      idempotencyKey: signupGrantKey(msg.user_id),
      reference: { reason: "welcome_grant", review: messageId, approved_by: adminId },
    });
    const { error } = await admin.from("free_credit_claims").update({ outcome: "granted" }).eq("user_id", msg.user_id);
    if (error) console.error("[free-credit-review] could not mark claim granted:", error.message);
  }
  await admin
    .from("contact_messages")
    .update({
      status: "done",
      message: `${msg.message}\n— ${approve ? "APPROVED" : "DECLINED"} ${new Date().toISOString().slice(0, 16)}Z`,
    })
    .eq("id", messageId);
}
