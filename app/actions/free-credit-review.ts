"use server";

import { revalidatePath } from "next/cache";

import { decideReview, requestReview, type ReviewRequestResult } from "@/lib/free-credit-review";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user asks us to look at a refused free-credit claim again. */
export async function requestFreeCreditReview(note: string): Promise<ReviewRequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "failed" };
  const result = await requestReview(user.id, user.email ?? null, String(note ?? "").trim().slice(0, 1000));
  if ("ok" in result) revalidatePath("/credits");
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

/** /admin/messages: approve (grant the welcome credits once) or decline a review request. */
export async function decideFreeCreditReview(formData: FormData): Promise<void> {
  const adminId = await requireAdminId();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await decideReview(id, formData.get("decision") === "approve", adminId);
  revalidatePath("/admin/messages");
}
