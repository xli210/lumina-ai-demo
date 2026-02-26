import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Map allowed filenames to their product_id for license verification
const FILE_PRODUCT_MAP: Record<string, string> = {
  "LuminaAI-3.2.1.zip": "lumina-ai",
  "OCR_Demo0.0.02.zip": "ocr-demo",
  "FLUX_Klein-1.0.2.zip": "flux-klein",
  "LTX2_Video-1.0.1.zip": "ltx-video",
};

const ALLOWED_FILES = Object.keys(FILE_PRODUCT_MAP);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // 1. Check authentication
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

  // 2. Validate filename (prevents directory traversal)
  const { filename } = await params;
  if (!ALLOWED_FILES.includes(filename)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 3. Verify user owns a valid license for this product
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
      { error: "You need a valid license to download this file. Please claim a license first." },
      { status: 403 }
    );
  }

  // 4. Read and serve the file
  const filePath = join(process.cwd(), "downloads-private", filename);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
