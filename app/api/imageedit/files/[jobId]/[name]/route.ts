import { NextRequest, NextResponse } from "next/server";

import { privateJson } from "@/lib/facestudio-gate";
import {
  isResultFileName,
  outPrefixFor,
  requireEditOwner,
  signFile,
} from "@/lib/imageedit-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ jobId: string; name: string }>;
}

/**
 * GET /api/imageedit/files/{jobId}/{name}[?download=1] -> 302 to a presigned R2 GET
 *
 * Result images are shown with plain <img> tags, which follow a cross-origin
 * redirect without needing CORS, so the bytes go straight from R2 to the
 * browser. `download=1` signs the URL with a Content-Disposition so the
 * Download button saves the PNG instead of opening it.
 */
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { jobId, name } = await ctx.params;
  const gate = await requireEditOwner(jobId);
  if (!gate.ok) return gate.response;

  if (!isResultFileName(name)) {
    return privateJson({ detail: "Unknown file." }, 404);
  }

  const key = `${outPrefixFor(gate.userId, gate.hold.id)}/${name}`;
  const download = req.nextUrl.searchParams.get("download") === "1";
  const url = signFile(key, download ? `nano-imageedit-${name}` : undefined);

  return NextResponse.redirect(url, {
    status: 302,
    // Shorter than the URL's own lifetime, so a cached redirect never points
    // at an expired signature.
    headers: { "cache-control": "private, max-age=600" },
  });
}
