import "server-only";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { CreditHoldRecord } from "@/lib/credits-server";
import { bearerToken, corsHeaders, verifyStudioToken } from "@/lib/facestudio-v-server";
import { FACESTUDIO_V_SERVICE } from "@/lib/facestudio-v";

/** JSON with the CORS headers the studio page needs and no caching. */
export function reply(request: Request, body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

export function preflight(request: Request): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

/** The user the studio page's token names, or a 401 to return. */
export function authenticate(request: Request): { userId: string } | { response: NextResponse } {
  const userId = verifyStudioToken(bearerToken(request));
  if (!userId) {
    return {
      response: reply(
        request,
        { error: "Your sign-in for the studio has expired. Open the studio again from nanopocket.ai." },
        401
      ),
    };
  }
  return { userId };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const j = await request.json();
    return j && typeof j === "object" && !Array.isArray(j) ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** One of this user's reservations for the trial, by id. */
export async function holdOf(userId: string, holdId: string): Promise<CreditHoldRecord | null> {
  if (!/^[0-9a-f-]{36}$/i.test(holdId)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("credit_holds")
    .select("id, user_id, amount, status, service, job_ref, created_at")
    .eq("id", holdId)
    .eq("user_id", userId)
    .eq("service", FACESTUDIO_V_SERVICE)
    .maybeSingle();
  if (error) throw new Error(`Failed to read hold: ${error.message}`);
  return (data as CreditHoldRecord | null) ?? null;
}
