import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Auth/authorization policy for the middleware.
//   protectedPaths -> require any signed-in user (redirect anon -> /auth/login)
//   adminPathPrefixes -> also require role='admin' in public.profiles
//                        (redirect user -> /account; JSON 403 on /api/ routes)
const PROTECTED_PATH_PREFIXES = [
  '/protected',
  '/account',
  '/download',
  '/admin',
  '/private-demos',
  '/api/private-demos',
]

const ADMIN_PATH_PREFIXES = [
  '/admin',
  '/private-demos',
  '/api/private-demos',
]

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p))
}

interface CookieBridge {
  getAll(): { name: string; value: string }[]
  setAll(cookies: { name: string; value: string; options?: CookieOptions }[]): void
}

/**
 * Build the cookie bridge Supabase's server client needs, while
 * simultaneously rebuilding the NextResponse whenever a cookie is set so
 * refreshed session tokens flow back to the browser. `rebuildResponse`
 * is a closure the caller uses to swap in a new response object.
 */
function buildCookieBridge(
  request: NextRequest,
  rebuildResponse: () => NextResponse,
  applyCookiesToResponse: (
    cookies: { name: string; value: string; options?: CookieOptions }[],
  ) => void,
): CookieBridge {
  return {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value),
      )
      rebuildResponse()
      applyCookiesToResponse(cookiesToSet)
    },
  }
}

async function isAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return profile?.role === 'admin'
}

/** Anonymous visitor to a protected path -> bounce to /auth/login?next=... */
function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  url.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

/** Non-admin authenticated user on an admin path. API -> JSON 403,
 *  otherwise redirect to /account so the user lands somewhere useful. */
function rejectNonAdmin(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 },
    )
  }
  const url = request.nextUrl.clone()
  url.pathname = '/account'
  return NextResponse.redirect(url)
}

/**
 * Enforce protected + admin path policies on the resolved user.
 * Returns a redirect/JSON response to short-circuit the request, or
 * null to allow the request to continue.
 */
async function enforceAccessPolicy(
  request: NextRequest,
  user: User | null,
  supabase: SupabaseClient,
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  if (startsWithAny(pathname, PROTECTED_PATH_PREFIXES) && !user) {
    return redirectToLogin(request)
  }

  if (user && startsWithAny(pathname, ADMIN_PATH_PREFIXES)) {
    if (!(await isAdmin(supabase, user.id))) {
      return rejectNonAdmin(request)
    }
  }

  return null
}

export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
) {
  // Caller (middleware) can pass a mutated Headers object so custom request
  // headers (e.g. x-app-locale) flow through to React Server Components.
  // Falls back to the original request when no override is supplied.
  const buildNext = () =>
    requestHeaders
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.next({ request })

  let supabaseResponse = buildNext()

  // Skip Supabase session management if env vars are not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse
  }

  const cookieBridge = buildCookieBridge(
    request,
    () => {
      supabaseResponse = buildNext()
      return supabaseResponse
    },
    (cookies) =>
      cookies.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options),
      ),
  )

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: cookieBridge },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const gate = await enforceAccessPolicy(request, user, supabase)
  if (gate) return gate

  return supabaseResponse
}
