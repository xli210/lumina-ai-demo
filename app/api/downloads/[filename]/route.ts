import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Allowed filenames to prevent directory traversal
const ALLOWED_FILES = [
  "LuminaAI-3.2.1.zip",
  "OCR_Demo0.0.01.zip",
];

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

  // 2. Validate filename
  const { filename } = await params;
  if (!ALLOWED_FILES.includes(filename)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 3. Read and serve the file
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
