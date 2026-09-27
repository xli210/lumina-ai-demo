import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { provisionCredits } from "@/lib/facestudio-gate";

/**
 * /face-studio/launch
 *
 * The auth gate in front of the console in public/face-studio/index.html.
 *
 * Split out from /face-studio so the landing page can stay public and
 * indexable while the tool itself still requires a session. Middleware
 * protects the `/face-studio/` prefix, which covers this route and the static
 * console assets but not the bare `/face-studio` landing page.
 *
 * Renders nothing — it establishes the session, makes sure the account has its
 * welcome credits and today's free allowance, then hands over to the static
 * app. Kept out of the index for the same reason a redirect should never be a
 * search result.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/face-studio" },
};

export default async function FaceStudioLaunch() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/face-studio/launch");
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
    console.error("[face-studio] could not provision credits:", message);
  }

  redirect("/face-studio/index.html");
}
