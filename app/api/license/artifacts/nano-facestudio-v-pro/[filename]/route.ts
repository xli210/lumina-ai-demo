import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  presignR2Get,
  r2DownloadsConfig,
  r2DownloadsPrefix,
} from "@/lib/r2-sign";

// The archives the Nano FaceStudio V Pro desktop app downloads during setup.
// Only a PC with this product activated gets a link: the app sends its license
// key and machine id, the same pair /api/license/verify checks.
//
// A refusal is a 401 or 403, which setup takes as final and shows to the
// customer. Anything that is our fault (database, storage config) is a 503,
// which setup retries, so a hiccup here never tells a paying customer that
// their license is bad.
const PRODUCT_ID = "nano-facestudio-v-pro";

// Inside the downloads prefix. Archives are versioned by folder; a new release
// that uploads new archives changes this.
const ARTIFACTS_PATH = `${PRODUCT_ID}/artifacts/1006`;

const ARTIFACTS = new Set([
  "studio_runtime.zip",
  "studio_code.zip",
  "studio_models.zip",
  "studio_enhancers.zip",
  "studio_lipsync.zip",
]);

// Checked when a connection starts, so a slow download outlives it, and every
// retry of a range comes back here for a fresh link.
const SIGNED_URL_TTL_SECONDS = 300;

function reply(status: number, error: string) {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

const unavailable = () =>
  reply(503, "Download temporarily unavailable. Please try again.");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const credentials = /^Bearer ([^:\s]{1,128}):([^:\s]{1,128})$/.exec(
    request.headers.get("authorization") ?? ""
  );
  if (!credentials) {
    return reply(401, "An activated license is required.");
  }
  const licenseKey = credentials[1].toUpperCase();
  const machineId = credentials[2];

  const supabase = createAdminClient();

  // maybeSingle, unlike single, reports "no such row" as data: null and keeps
  // `error` for real failures, which are the 503 above.
  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("id, is_revoked, product_id, user_id, is_trial, trial_ends_at")
    .eq("license_key", licenseKey)
    .maybeSingle();
  if (licenseError) {
    console.error("[artifacts] license lookup failed:", licenseError.message);
    return unavailable();
  }
  if (!license) return reply(403, "Invalid license key.");
  if (license.is_revoked) return reply(403, "This license has been revoked.");
  if (
    license.is_trial &&
    license.trial_ends_at &&
    new Date() > new Date(license.trial_ends_at)
  ) {
    return reply(403, "This free trial has expired.");
  }

  // Same rules as activation: a banned owner is refused, and an admin's
  // license works for any product.
  let isAdmin = false;
  if (license.user_id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_banned, role")
      .eq("id", license.user_id)
      .maybeSingle();
    if (profileError) {
      console.error("[artifacts] profile lookup failed:", profileError.message);
      return unavailable();
    }
    if (profile?.is_banned) return reply(403, "Account has been suspended.");
    isAdmin = profile?.role === "admin";
  }
  if (!isAdmin && license.product_id !== PRODUCT_ID) {
    return reply(403, "This license is not valid for this application.");
  }

  const { data: activation, error: activationError } = await supabase
    .from("activations")
    .select("id")
    .eq("license_id", license.id)
    .eq("machine_id", machineId)
    .limit(1)
    .maybeSingle();
  if (activationError) {
    console.error(
      "[artifacts] activation lookup failed:",
      activationError.message
    );
    return unavailable();
  }
  if (!activation) return reply(403, "This computer is not activated.");

  // After the license check, so the names are not confirmed to anyone else.
  const { filename } = await params;
  if (!ARTIFACTS.has(filename)) return reply(404, "File not found.");

  const r2 = r2DownloadsConfig();
  if (!r2) {
    console.error("[artifacts] R2_DOWNLOADS_* is not configured");
    return unavailable();
  }

  // No bytes flow through this function: the app follows the link to R2.
  const signedUrl = presignR2Get(
    r2,
    `${r2DownloadsPrefix()}/${ARTIFACTS_PATH}/${filename}`,
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  );
  return NextResponse.redirect(signedUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
