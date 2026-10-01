import { NextRequest } from "next/server";

import { privateJson, requireSpendableBalance } from "@/lib/facestudio-gate";
import {
  isFaceStudioConfigured,
  requestUploadTicket,
} from "@/lib/facestudio-server";
import { isAllowedUploadType } from "@/lib/facestudio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// The gateway scales to zero on Render, so the first call after an idle
// period pays a cold start before it answers.
export const maxDuration = 60;

/**
 * POST /api/facestudio/uploads
 * body: { filename, content_type }
 * -> { upload_url, input_key, max_bytes, expires_in }
 *
 * The browser PUTs the photo to `upload_url` itself. That is not just an
 * optimisation: photos run to 40 MB and a Vercel function body caps out at
 * 4.5 MB, so routing the bytes through here could not work at all.
 *
 * `upload_url` is a presigned capability — whoever holds it can write that
 * one object until it expires, with no key. It goes straight to the browser
 * that asked for it and is never logged.
 */
export async function POST(req: NextRequest) {
  const gate = await requireSpendableBalance();
  if (!gate.ok) return gate.response;

  if (!isFaceStudioConfigured()) {
    return privateJson(
      {
        detail:
          "Nano FaceStudio Online is not configured on this deployment. Set " +
          "FACESTUDIO_GATEWAY_TOKEN. See docs/face-studio.md.",
      },
      503
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return privateJson({ detail: "Request body must be JSON." }, 400);
  }

  const input = new Map(Object.entries((body ?? {}) as object));
  const filename = input.get("filename");
  const contentType = input.get("content_type");

  if (typeof filename !== "string" || filename.length < 1 || filename.length > 200) {
    return privateJson(
      { detail: "filename is required and must be 1-200 characters." },
      400
    );
  }
  if (!isAllowedUploadType(contentType)) {
    return privateJson(
      { detail: "Unsupported image type. Upload a JPEG, PNG or WebP." },
      400
    );
  }

  try {
    const result = await requestUploadTicket({ filename, contentType });
    return privateJson(result.body, result.status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] upload ticket failed:", message);
    return privateJson(
      { detail: "Nano FaceStudio Online gateway unreachable. Try again shortly." },
      502
    );
  }
}
