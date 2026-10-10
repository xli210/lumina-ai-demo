import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  FACESTUDIO_V_LAUNCH,
  FACESTUDIO_V_NAME,
  facestudioVIsOpen,
} from "@/lib/facestudio-v";

/**
 * /facestudio-v/launch
 *
 * The signed-in front door to the live studio of the limited Nano
 * FaceStudio-V Online preview.
 *
 * The studio itself runs elsewhere, behind a tunnel, and opens with a private
 * link that carries an access key. That link is never in this repository (it is
 * public): it lives in the FACESTUDIO_V_STUDIO_URL environment variable on the
 * server, and only a signed-in visitor, inside the preview window, is ever sent
 * to it. Middleware already requires a session for /facestudio-v/ and closes the
 * path outside the window; both are checked again here because this is the one
 * place that hands out the key.
 *
 * Be aware of what this does not do: the key is the same for everyone, and the
 * studio keeps a visitor signed in with its own cookie for two weeks. Anyone
 * who copies the link can share it, and a browser that has been in keeps
 * access after the window closes. Rotating the key on the studio ends both.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "/facestudio-v" },
};

export default async function FaceStudioVLaunch() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(FACESTUDIO_V_LAUNCH)}`);
  }

  if (!facestudioVIsOpen()) {
    redirect("/facestudio-v");
  }

  const studio = process.env.FACESTUDIO_V_STUDIO_URL?.trim();
  let target: URL | null = null;
  try {
    target = studio ? new URL(studio) : null;
  } catch {
    target = null;
  }

  // Only ever send people to an https address we were configured with.
  if (target && target.protocol === "https:") {
    redirect(target.toString());
  }

  console.error("[facestudio-v] FACESTUDIO_V_STUDIO_URL is missing or not an https address");
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="mb-3 text-2xl font-bold text-foreground">{FACESTUDIO_V_NAME} is being set up</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          The studio is not reachable right now. Please try again in a few minutes. You can still look at
          the results on the demo page.
        </p>
        <Link href="/facestudio-v/demo/index.html" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          See the demo page
        </Link>
      </div>
    </main>
  );
}
