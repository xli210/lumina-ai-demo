import { NextRequest } from "next/server";

import { privateJson, requireSpendableBalance } from "@/lib/facestudio-gate";
import { detectFaces, isFaceStudioConfigured } from "@/lib/facestudio-server";
import { isStorageKey } from "@/lib/facestudio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Detection waits on the GPU: 2-6 s warm, up to ~25 s from cold. The gateway
// bounds its own wait below this so a stuck worker produces our error message
// rather than a platform 504 with no body.
export const maxDuration = 60;

/**
 * POST /api/facestudio/detect
 * body: { input_key }   (from /api/facestudio/uploads)
 * -> { detection_id, count, max_faces, faces: [...] }
 *
 * Free to the user — nobody should pay to find out their photo is unusable —
 * but gated on having a spendable balance, because it does occupy a GPU. The
 * returned `detection_id` is the storage key the render will re-read, so no
 * photo is uploaded twice.
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

  const inputKey = new Map(Object.entries((body ?? {}) as object)).get(
    "input_key"
  );
  if (!isStorageKey(inputKey)) {
    return privateJson(
      { detail: "input_key is missing or malformed. Upload the photo again." },
      400
    );
  }

  try {
    const result = await detectFaces(inputKey);
    return privateJson(result.body, result.status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[facestudio] detect failed:", message);
    return privateJson(
      { detail: "Face detection timed out. Please try again." },
      504
    );
  }
}
