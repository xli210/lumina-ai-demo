import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase Storage bucket that holds the installers. See
// scripts/upload-downloads-to-supabase.mjs and docs/downloads-setup.md
// for one-time bucket creation + upload.
const BUCKET = "product-downloads";

// Signed-URL lifetime. Long enough for a slow home connection to start the
// download (browsers only need the redirect to happen once — the download
// itself continues over the resumable Storage URL), short enough that a
// leaked URL is useless within minutes.
const SIGNED_URL_TTL_SECONDS = 300;

// Map allowed filenames to their product_id for license verification.
// The filename doubles as the object key inside the Storage bucket.
const FILE_PRODUCT_MAP: Record<string, string> = {
  "NanoImageEdit-1.0.5-release.zip": "nano-imageedit",
  "NanoVideoGen-1.0.3-release.zip": "nano-videogen",
  "NanoVideoGen-1.1.2-release.zip": "nano-videogen",
  "NanoVideoEnhance-1.0.5-release.zip": "nano-videoenhance",
  "NanoFacialEdit-1.0.2-release.zip": "nano-facialedit",
  "NanoFaceSwap-1.0.4-release.zip": "nano-faceswap",
  "NanoImageEnh-3.0.0-windows.zip": "nnanoimageenh",
  "NanoImageEnh-3.0.0-macos.zip": "nnanoimageenh",
  "NanoImageTryon-1.0.0-release.zip": "nano-image-tryon",
  "NanoFaceStudioPro-1.0.8-windows.exe": "nano-facestudio-pro",
};

const ALLOWED_FILES = Object.keys(FILE_PRODUCT_MAP);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to download files." },
      { status: 401 }
    );
  }

  const { filename } = await params;
  if (!ALLOWED_FILES.includes(filename)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const productId = FILE_PRODUCT_MAP[filename];
  const admin = createAdminClient();

  const { data: license } = await admin
    .from("licenses")
    .select("id, is_revoked")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("is_revoked", false)
    .limit(1)
    .single();

  if (!license) {
    return NextResponse.json(
      {
        error:
          "You need a valid license to download this file. Please claim a license first.",
      },
      { status: 403 }
    );
  }

  // Generate a short-lived signed URL from Supabase Storage. The
  // `download` option forces Content-Disposition: attachment so browsers
  // save the file instead of previewing it in-tab.
  const { data: signed, error: signedError } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(filename, SIGNED_URL_TTL_SECONDS, { download: filename });

  if (signedError || !signed?.signedUrl) {
    console.error(
      `[downloads] Failed to sign URL for ${filename}:`,
      signedError
    );
    return NextResponse.json(
      { error: "Download temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  // 302 redirect keeps the response small (no bytes flow through the
  // Lambda) and lets Supabase's CDN handle the actual transfer.
  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
