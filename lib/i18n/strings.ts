import type { AppLocale } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

/**
 * Whole-string translations for pages whose English lives in the component (/download, /checkout). The key is the English,
 * so a string without a translation shows in English. The words are in messages/pages/<locale>.json under "strings"; a server
 * page reads them with pageStrings and hands them to its client components.
 */
export type Strings = Record<string, string>;

export function tr(strings: Strings, text: string, values?: Record<string, string | number>): string {
  const out = strings[text] ?? text;
  if (!values) return out;
  return out.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}

export async function pageStrings(locale: AppLocale): Promise<Strings> {
  if (locale === DEFAULT_LOCALE) return {};
  const file = (await import(`../../messages/pages/${locale}.json`)).default as { strings?: Strings };
  return file.strings ?? {};
}
