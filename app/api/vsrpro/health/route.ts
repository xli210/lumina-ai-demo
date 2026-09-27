import { adminGate } from "@/lib/private-demo-proxy";
import { getHealth } from "@/lib/vsrpro-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/vsrpro/health
 * -> upstream GET /healthz
 *
 * The upstream check needs no auth, but this route stays admin-gated so the
 * proxy surface has one consistent access rule.
 */
export async function GET() {
  const gate = await adminGate();
  if (!gate.ok) return gate.response!;
  return getHealth();
}
