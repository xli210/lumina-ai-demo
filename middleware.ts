import { updateSession } from '@/lib/supabase/middleware'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/locales'
import { type NextRequest } from 'next/server'

const LOCALE_HEADER = 'x-app-locale'

function detectLocaleFromPath(pathname: string): string {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first && (LOCALES as readonly string[]).includes(first)) return first
  return DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
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
