import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HELD_DOWNLOADS } from "@/lib/download-holds";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  presignR2Get,
  r2DownloadsConfig,
  r2DownloadsPrefix,
} from "@/lib/r2-sign";

// Fallback Supabase Storage bucket. Installers now live in Cloudflare R2;
// this path stays so a misconfigured R2 does not take downloads offline,
// and because the six installers under 50 MB are still there.
//
// Why the move: Supabase Storage caps a single file at 50 MB on the free
// plan, which silently excluded the three largest installers (89-114 MB)
// when this project was downgraded from Pro, and its egress allowance is
// 5 GB a month — 44 downloads of the 114 MB installer. R2 charges nothing
// for egress, which is the whole reason it exists.
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
  "NanoFaceStudioPro-1.0.0-windows.exe": "nano-facestudio-pro",
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

  // A download that is switched off while it is re-checked (lib/download-holds.ts).
  if (Object.prototype.hasOwnProperty.call(HELD_DOWNLOADS, filename)) {
    return NextResponse.json(
      { error: HELD_DOWNLOADS[filename] },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
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

  // Preferred path: a presigned R2 URL. Signing is pure computation, so it
  // cannot fail on a network hiccup the way a Storage API call can.
  const r2 = r2DownloadsConfig();
  if (r2) {
    const signedUrl = presignR2Get(
      r2,
      `${r2DownloadsPrefix()}/${filename}`,
      { expiresIn: SIGNED_URL_TTL_SECONDS, downloadAs: filename }
    );
    return NextResponse.redirect(signedUrl, { status: 302 });
  }

  // Fallback: Supabase Storage. The `download` option forces
  // Content-Disposition: attachment so browsers save the file instead of
  // previewing it in-tab.
  const { data: signed, error: signedError } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(filename, SIGNED_URL_TTL_SECONDS, { download: filename });

  if (signedError || !signed?.signedUrl) {
    console.error(
      `[downloads] Failed to sign URL for ${filename}:`,
      signedError,
      "(R2 is not configured; set R2_DOWNLOADS_* to use it instead)"
    );
    return NextResponse.json(
      { error: "Download temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  // 302 redirect keeps the response small (no bytes flow through the
  // Lambda) and lets the storage CDN handle the actual transfer.
  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
