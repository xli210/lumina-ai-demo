import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { provisionCredits } from "@/lib/facestudio-gate";

/**
 * /image-edit/launch
 *
 * The auth gate in front of the console in public/image-edit/index.html.
 *
 * Same split as /face-studio/launch: the /image-edit landing page stays public
 * and indexable while the editor requires a session. Middleware protects the
 * `/image-edit/` prefix, which covers this route, the static console and its
 * sample photos, but not the bare `/image-edit` landing page.
 *
 * Renders nothing — it establishes the session, makes sure the account has its
 * welcome credits and any free top-up that is due, then hands over to the static
 * app. Kept out of the index for the same reason a redirect should never be a
 * search result.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/image-edit" },
};

export default async function ImageEditLaunch() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/image-edit/launch");
  }

  // Provisions the welcome grant and today's allowance, so the console's
  // balance pill is correct on first paint rather than showing 0 until a
  // render is attempted.
  try {
    await provisionCredits(user.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Not fatal: the console reads its balance itself, and every API route
    // provisions the grant too.
    console.error("[image-edit] could not provision credits:", message);
  }

  redirect("/image-edit/index.html");
}
