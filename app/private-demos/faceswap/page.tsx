import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * /private-demos/faceswap
 *
 * Admin-gated wrapper that redirects to the handoff HTML in
 * public/private-demos/faceswap/index.html. Same reasoning as the
 * FaceVivid gate \u2014 belt-and-suspenders on top of middleware.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Face Studio face-swap preview \u2014 admin only",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export default async function FaceSwapPreviewGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/private-demos/faceswap");
  }
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    redirect("/account");
  }
  redirect("/private-demos/faceswap/index.html");
}
