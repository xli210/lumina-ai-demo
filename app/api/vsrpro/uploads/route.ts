import { NextRequest, NextResponse } from "next/server";
import { adminGate } from "@/lib/private-demo-proxy";
import { requestUploadTicket } from "@/lib/vsrpro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// The gateway runs on Render and scales to zero, so the first call after an
// idle period pays a cold start before it answers.
export const maxDuration = 60;

/**
 * POST /api/vsrpro/uploads
 * body: { filename, content_type? }
 * -> upstream POST /v1/uploads -> { upload_url, input_key, max_bytes, expires_in }
 *
 * The returned `upload_url` is a presigned capability: anyone holding it can
 * write to that object until it expires, without an API key. It goes straight
 * to the browser that asked for it and is never logged.
 */
export async function POST(req: NextRequest) {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { detail: "Request body must be JSON." },
      { status: 400 }
    );
  }

  return requestUploadTicket(body);
}
