import { updateSession } from '@/lib/supabase/middleware'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/locales'
import { NextResponse, type NextRequest } from 'next/server'
import { facestudioVIsOpen } from '@/lib/facestudio-v'
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_MAX_AGE_S,
  isDeviceId,
  newDeviceId,
} from '@/lib/device-cookie'

const LOCALE_HEADER = 'x-app-locale'

function detectLocaleFromPath(pathname: string): string {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first && (LOCALES as readonly string[]).includes(first)) return first
  return DEFAULT_LOCALE
}

// IndexNow protocol verification.
//
// IndexNow requires the key to be reachable at https://<host>/<key>.txt with
// the key as the file body. Setting INDEXNOW_KEY in the deploy environment
// activates verification at that path. Leaving it unset is a no-op (404).
function indexNowResponse(pathname: string): NextResponse | null {
  const key = process.env.INDEXNOW_KEY
  if (!key) return null
  // Restrict to short hex-shaped paths like /<key>.txt so we don't intercept
  // arbitrary .txt routes (llms.txt, security.txt, etc.).
  if (pathname !== `/${key}.txt`) return null
  return new NextResponse(key, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

// Paths whose HTML is identical for every visitor (the signed-in state is read
// in the browser, see app/components/navbar-auth.tsx). The CDN may keep these
// for a few minutes, so a crawler hitting the same page a thousand times costs
// one render, not a thousand. Anything not listed stays uncached. A new
// deployment purges the CDN, so stale copies never outlive a release.
const CACHEABLE_EXACT = new Set([
  '/', '/about', '/blog', '/face-swap', '/image-edit', '/compare', '/trust',
  '/security', '/privacy', '/terms', '/best-face-swap-app-2026', '/docs',
  '/release-notes', '/apps', '/status',
])
const CACHEABLE_PREFIXES = [
  '/blog/', '/compare/', '/apps/', '/release-notes/', '/docs/', '/face-swap/',
  '/zh-CN', '/ja', '/ko',
]
// Paths that issue the device cookie. It only matters when someone is about to
// sign up or spend credits; handing one to every anonymous page view (crawlers
// never keep it) would also stop the CDN from caching those pages.
const DEVICE_COOKIE_PREFIXES = [
  '/auth', '/face-studio/', '/image-edit/', '/credits', '/account', '/checkout',
  '/download', '/api/facestudio', '/api/imageedit', '/api/credits',
]

function isCacheablePublicPage(request: NextRequest): boolean {
  if (request.method !== 'GET') return false
  const p = request.nextUrl.pathname
  if (p.startsWith('/api/') || p.startsWith('/_next/')) return false
  if (p.includes('internal-preview')) return false
  return CACHEABLE_EXACT.has(p) || CACHEABLE_PREFIXES.some((x) => p.startsWith(x))
}

export async function middleware(request: NextRequest) {
  const indexNow = indexNowResponse(request.nextUrl.pathname)
  if (indexNow) return indexNow

  // The Nano FaceStudio-V preview runs for three days. Outside that window
  // nothing under /facestudio-v/ is served, whoever is signed in: send people to
  // the public landing page, which says whether it has not opened yet or has
  // ended. (A browser that already holds the studio's own cookie keeps its
  // access there until that cookie expires: see app/facestudio-v/launch.)
  if (request.nextUrl.pathname.startsWith('/facestudio-v/') && !facestudioVIsOpen()) {
    return NextResponse.redirect(new URL('/facestudio-v', request.url))
  }

  // Resolve the locale from the URL prefix and forward it to RSCs as a
  // custom request header. We deliberately don't use next-intl's middleware
  // because we need to chain Supabase session-cookie management ourselves,
  // and a single custom header is the simplest reliable way to get the
  // locale to the root layout (for <html lang>) and to next-intl's request
  // config (for getTranslations / getLocale).
  const locale = detectLocaleFromPath(request.nextUrl.pathname)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, locale)

  const response = await updateSession(request, requestHeaders)
  // Also expose on the response for any client-side fetcher that needs it.
  response.headers.set(LOCALE_HEADER, locale)

  // Give a browser that has no device id one. It is how a second account on
  // the same browser is told apart from a new person (lib/free-claim.ts).
  // httpOnly: page scripts never need it. Pages are navigations, not
  // prefetches of someone else's session, so this runs once per browser.
  const wantsDeviceCookie = DEVICE_COOKIE_PREFIXES.some((x) =>
    request.nextUrl.pathname.startsWith(x),
  )
  if (wantsDeviceCookie && !isDeviceId(request.cookies.get(DEVICE_COOKIE)?.value)) {
    response.cookies.set(DEVICE_COOKIE, newDeviceId(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEVICE_COOKIE_MAX_AGE_S,
    })
  }

  if (isCacheablePublicPage(request) && !response.headers.has('set-cookie')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
    )
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api/webhooks (Stripe webhooks need to bypass auth)
     * - api/license (desktop app API calls)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/license|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
