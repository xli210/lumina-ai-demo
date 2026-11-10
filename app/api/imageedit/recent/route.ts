import { privateJson } from "@/lib/facestudio-gate";
import { currentUserId, signInRequired } from "@/lib/imageedit-server";
import { imagesOf } from "@/lib/my-images-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/imageedit/recent -> { edits: [{ job, created_at, status, credits, result? }] }
 *
 * The account's SpotEdit edits of the last day, newest first, as "My images" lists them: the editor shows
 * them under the form, so an edit made earlier can be looked at again or downloaded without leaving it.
 * `result` (signed links, an hour) is there once the edit is in storage.
 */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return signInRequired();
  try {
    const edits = await imagesOf(userId, 24, ["spotedit"]);
    return privateJson(
      { edits: edits.map((e) => ({ job: e.job, created_at: e.createdAt, status: e.status, credits: e.credits, result: e.result })) },
      200
    );
  } catch (err: unknown) {
    console.error("[imageedit] recent edits failed:", err instanceof Error ? err.message : err);
    return privateJson({ detail: "Could not load your recent edits." }, 500);
  }
}
