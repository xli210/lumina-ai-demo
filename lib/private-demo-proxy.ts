import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Shared plumbing for the /api/private-demos/{facevivid,faceswap}/**
 * proxy routes.
 *
 * Design goals:
 *   1. Never expose the upstream X-API-Key to the browser. All calls run
 *      through the Next.js server which adds the header itself.
 *   2. Admin-only. This is a test surface \u2014 the frontend HTML lives at
 *      /private-demos/... and only admin accounts should be allowed to
 *      hit it (see middleware.ts + adminGate below).
 *   3. Streaming pass-through. Result images can be several MB; buffering
 *      them into memory just to return them wastes latency and RAM.
 *   4. Cheap. These routes are thin proxies so we can iterate on the
 *      demo UX without touching backend contracts.
 */

export type PrivateDemoId = "facevivid" | "faceswap";

interface UpstreamConfig {
  baseUrl: string;
  apiKey: string;
}

const DEFAULT_UPSTREAMS: Record<PrivateDemoId, string> = {
  facevivid: "https://sagem-julie-personnel-msg.trycloudflare.com",
  faceswap: "https://paying-colorado-ment-cingular.trycloudflare.com",
};

function upstreamFor(demo: PrivateDemoId): UpstreamConfig {
  const envVars = {
    facevivid: {
      base: process.env.FACEVIVID_UPSTREAM_URL || DEFAULT_UPSTREAMS.facevivid,
      key: process.env.FACEVIVID_API_KEY || "",
    },
    faceswap: {
      base: process.env.FACESWAP_UPSTREAM_URL || DEFAULT_UPSTREAMS.faceswap,
      key: process.env.FACESWAP_API_KEY || "",
    },
  };
  const cfg = envVars[demo];
  return { baseUrl: cfg.base.replace(/\/+$/, ""), apiKey: cfg.key };
}

interface AdminGateResult {
  ok: boolean;
  response?: NextResponse;
  userId?: string;
}

/**
 * Reject the request unless the caller is a signed-in user with role
 * 'admin' in the profiles table. Returns a JSON error `response` field
 * that the caller should just return unchanged when ok=false.
 */
export async function adminGate(): Promise<AdminGateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sign in required" },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }
  return { ok: true, userId: user.id };
}

/** Headers we DON'T want to forward from the incoming request to the
 *  upstream (they either belong to our Next.js/Vercel edge, or would
 *  conflict with the ones we're setting ourselves). */
const HOP_BY_HOP_REQUEST = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "cookie",
  "authorization",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
  "x-vercel-id",
  "x-vercel-ip-city",
  "x-vercel-ip-country",
  "x-vercel-ip-country-region",
  "x-vercel-ip-latitude",
  "x-vercel-ip-longitude",
  "x-vercel-ip-timezone",
  "x-vercel-deployment-url",
  "x-vercel-forwarded-for",
]);

/** Response headers we strip on the way back (either meaningless
 *  cross-origin, security-scoped to the upstream, or would break Vercel). */
const HOP_BY_HOP_RESPONSE = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-authenticate",
  "content-encoding",
  "content-length", // recomputed by Vercel when we stream
]);

interface ForwardOptions {
  demo: PrivateDemoId;
  /** Path portion appended to upstream base URL, must start with '/' */
  upstreamPath: string;
  /** GET / POST / etc. */
  method: string;
  /** The original incoming request \u2014 provides body + headers */
  req: NextRequest;
}

/**
 * Forward the incoming request to the upstream demo API, injecting
 * X-API-Key. Streams the response body back so we don't buffer image
 * data through memory. Assumes admin gate has already been enforced.
 */
export async function forwardToUpstream(
  opts: ForwardOptions
): Promise<NextResponse> {
  const { demo, upstreamPath, method, req } = opts;
  const { baseUrl, apiKey } = upstreamFor(demo);

  if (!apiKey) {
    console.error(`[private-demos] Missing API key for ${demo}`);
    return NextResponse.json(
      { error: "Upstream not configured. See docs/private-demos.md." },
      { status: 503 }
    );
  }

  const target = `${baseUrl}${upstreamPath}`;

  const upstreamHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_REQUEST.has(key.toLowerCase())) {
      upstreamHeaders.set(key, value);
    }
  });
  upstreamHeaders.set("X-API-Key", apiKey);
  // Announce ourselves so upstream logs can distinguish nanopocket-proxied
  // traffic from any other tunnel client.
  upstreamHeaders.set(
    "X-Forwarded-By",
    "nanopocket-private-demo-proxy/1.0"
  );

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers: upstreamHeaders,
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = req.body ?? undefined;
    // Required by Node 18+ when streaming a request body via fetch.
    // See https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#duplex
    init.duplex = "half";
  }

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(target, init);
  } catch (e) {
    console.error(`[private-demos] Upstream fetch failed for ${target}:`, e);
    return NextResponse.json(
      { error: "Upstream unavailable. Try again shortly." },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  upstreamResp.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_RESPONSE.has(key.toLowerCase())) {
      outHeaders.set(key, value);
    }
  });
  // Belt-and-suspenders \u2014 the results are user-specific test output; do
  // not let any intermediary cache them.
  outHeaders.set("cache-control", "private, no-store");

  return new NextResponse(upstreamResp.body, {
    status: upstreamResp.status,
    statusText: upstreamResp.statusText,
    headers: outHeaders,
  });
}
