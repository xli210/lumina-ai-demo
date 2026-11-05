"use server";

import { revalidatePath } from "next/cache";

import { SOCIAL_REJECT_REASONS, type SocialRejectReason, type SocialSubmitError } from "@/lib/social-reward";
import { approveSocialPost, rejectSocialPost, submitSocialPostForUser } from "@/lib/social-reward-server";
import { createClient } from "@/lib/supabase/server";

export async function submitSocialPost(url: string): Promise<{ error?: SocialSubmitError }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "failed" };

  const result = await submitSocialPostForUser(user.id, String(url ?? ""));
  if (!result.error) revalidatePath("/account");
  return result;
}

async function requireAdminId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not an admin");
  return user.id;
}

export async function reviewSocialPost(formData: FormData): Promise<void> {
  const adminId = await requireAdminId();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  if (!id) return;

  if (formData.get("decision") === "approve") {
    await approveSocialPost(id, adminId);
  } else if (SOCIAL_REJECT_REASONS.includes(reason as SocialRejectReason)) {
    await rejectSocialPost(id, adminId, reason as SocialRejectReason);
  }
  revalidatePath("/admin/social-rewards");
}
