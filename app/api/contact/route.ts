import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimKeysFromRequest } from "@/lib/free-claim";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KINDS = new Set(["feature", "improvement", "bug", "question", "business", "other"]);
const MAX_PER_HOUR = 5;
const MAX_PER_DAY = 15;

const clean = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * POST /api/contact
 * Body: { kind, message, email?, other_contact?, name?, page?, website? }
 *
 * Anyone can write to us, signed in or not; at least one way to reply is required.
 * `website` is a honeypot: a person never sees it, a form-filling bot does.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // A bot filled the hidden field: pretend it worked and store nothing.
  if (clean(body.website, 200)) return NextResponse.json({ status: "ok" });

  const kind = clean(body.kind, 20);
  const message = clean(body.message, 4000);
  const email = clean(body.email, 254).toLowerCase();
  const otherContact = clean(body.other_contact, 200);
  const name = clean(body.name, 100);
  const page = clean(body.page, 300);

  if (!KINDS.has(kind)) return NextResponse.json({ error: "Choose what this is about." }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: "Please write a few words about your idea or problem." }, { status: 400 });
  if (!email && !otherContact) {
    return NextResponse.json({ error: "Leave an email or another way to reach you, so we can reply." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { ipHash } = await claimKeysFromRequest();

  if (ipHash) {
    const since = (ms: number) => new Date(Date.now() - ms).toISOString();
    const count = async (ms: number) => {
      const { count: n } = await admin
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since(ms));
      return n ?? 0;
    };
    const [hour, day] = await Promise.all([count(3_600_000), count(86_400_000)]);
    if (hour >= MAX_PER_HOUR || day >= MAX_PER_DAY) {
      return NextResponse.json({ error: "You have sent several messages already. Please try again later." }, { status: 429 });
    }
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  const { error } = await admin.from("contact_messages").insert({
    kind,
    message,
    name: name || null,
    email: email || null,
    other_contact: otherContact || null,
    page: page || null,
    user_id: userId,
    ip_hash: ipHash,
  });
  if (error) {
    console.error("[contact] insert failed:", error.code, error.message);
    return NextResponse.json({ error: "We could not save your message. Please email tech@nanopocket.ai instead." }, { status: 500 });
  }
  return NextResponse.json({ status: "ok" });
}
