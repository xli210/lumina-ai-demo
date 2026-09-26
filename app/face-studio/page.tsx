import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ensureSignupGrant } from "@/lib/credits-server";

/**
 * /face-studio
 *
 * Gate in front of the console in public/face-studio/index.html. The console
 * is plain HTML and JS, so it cannot check a session itself; middleware
 * protects the whole /face-studio prefix and this page is the belt to that
 * braces, the same arrangement the private demos use.
 *
 * Renders nothing itself — it exists to establish the session, make sure the
 * account has a credit row (so a first-time visitor sees their welcome
 * credits rather than a zero), and then hand over to the static app.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Face Studio — multi-face swap and head swap | NanoPocket.ai",
  description:
    "Swap one or many faces in a photo, or replace a whole head, on our GPUs. Pay per render with credits; no subscription.",
};

export default async function FaceStudioGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/face-studio");
  }

  // Provisions the welcome grant on a first visit, so the console's balance
  // pill is correct on first paint instead of showing 0 until a render is
  // attempted.
  try {
    await ensureSignupGrant(user.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Not fatal: the console reads the balance itself, and every API route
    // provisions the grant too.
    console.error("[face-studio] could not provision credits:", message);
  }

  redirect("/face-studio/index.html");
}
