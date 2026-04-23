import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_DEMOS = new Set([
  "image-faceswap-pro",
  "video-faceswap-pro",
]);

const MAX_COMMENT_LEN = 500;

/**
 * POST /api/feedback
 * Body: { demo_id: string, vote: "like" | "dislike", comment?: string }
 * Submits a one-time vote for the current user on a given demo.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to submit feedback." },
      { status: 401 }
    );
  }

  let body: { demo_id?: unknown; vote?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const demoId = typeof body.demo_id === "string" ? body.demo_id : "";
  const vote = typeof body.vote === "string" ? body.vote : "";
  const rawComment = typeof body.comment === "string" ? body.comment.trim() : "";

  if (!ALLOWED_DEMOS.has(demoId)) {
    return NextResponse.json({ error: "Unknown demo_id." }, { status: 400 });
  }
  if (vote !== "like" && vote !== "dislike") {
    return NextResponse.json(
      { error: "Vote must be 'like' or 'dislike'." },
      { status: 400 }
    );
  }
  if (rawComment.length > MAX_COMMENT_LEN) {
    return NextResponse.json(
      { error: `Comment too long (max ${MAX_COMMENT_LEN} chars).` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();
  if (profile?.is_banned) {
    return NextResponse.json(
      { error: "Your account has been suspended." },
      { status: 403 }
    );
  }

  const { error } = await admin.from("demo_feedback").insert({
    user_id: user.id,
    demo_id: demoId,
    vote,
    comment: rawComment || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already submitted feedback for this demo." },
        { status: 409 }
      );
    }
    console.error("Failed to insert demo_feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok", demo_id: demoId, vote });
}

/**
 * GET /api/feedback
 * Returns the current user's votes as a map: { [demo_id]: "like" | "dislike" }
 * Returns an empty map if the user is not logged in.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ votes: {} });
  }

  const { data, error } = await supabase
    .from("demo_feedback")
    .select("demo_id, vote")
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to read demo_feedback:", error);
    return NextResponse.json({ votes: {} });
  }

  const votes: Record<string, "like" | "dislike"> = {};
  for (const row of data ?? []) {
    if (row.vote === "like" || row.vote === "dislike") {
      votes[row.demo_id] = row.vote;
    }
  }
  return NextResponse.json({ votes });
}
