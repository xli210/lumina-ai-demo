import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from "@/lib/i18n/locales";

/**
 * next-intl request config. We resolve the locale via the `x-app-locale`
 * header set by middleware (see middleware.ts) rather than via next-intl's
 * own middleware, because we need to chain Supabase session management.
 *
 * Pages under `app/[locale]/...` should still call `setRequestLocale(locale)`
 * at the top so that `requestLocale` resolves correctly during streaming.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const fromSetRequestLocale = await requestLocale;
  let locale: AppLocale = DEFAULT_LOCALE;

  if (isAppLocale(fromSetRequestLocale)) {
    locale = fromSetRequestLocale;
  } else {
    const h = await headers();
    const fromHeader = h.get("x-app-locale");
    if (isAppLocale(fromHeader)) locale = fromHeader;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
