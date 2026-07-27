import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * /private-demos/facevivid
 *
 * Admin-gated wrapper that redirects to the handoff HTML in
 * public/private-demos/facevivid/index.html. The reason we don't just
 * link at the .html directly from the index page is that Next.js
 * middleware also gates the .html, but a server-component wrapper is
 * an extra belt so a URL rewrite/pattern change never accidentally
 * unshadows the raw file.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NanoFace Vivid preview \u2014 admin only",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export default async function FaceVividPreviewGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/private-demos/facevivid");
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
  // Static handoff HTML lives under /public/private-demos/facevivid/.
  redirect("/private-demos/facevivid/index.html");
}
