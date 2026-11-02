import type { AppLocale } from "@/lib/i18n/locales";

/**
 * The words of the translated product pages, one file per language in messages/pages/. Kept out of messages/<locale>.json
 * so a page only loads what it shows. The English source the translators worked from is messages/pages/en.source.json;
 * the English pages themselves have their own copy.
 *
 * Deliberately absent: price lists, refund terms and legal text. These pages link to the English pricing and terms pages
 * instead, and each link says so.
 */

export type Faq = { q: string; a: string };
export type TitleBody = { title: string; body: string };

/** The shared shape of /<locale>/face-studio and /<locale>/image-edit (see ./tool-landing.tsx). */
export interface ToolPageCopy {
  title: string;
  description: string;
  kicker: string;
  h1: string;
  lead: string;
  cta: string;
  note: string;
  promptNote?: string;
  examplesHeading: string;
  beforeLabel: string;
  afterLabel: string;
  examples: Record<string, string>;
  featuresHeading?: string;
  features?: TitleBody[];
  toolsHeading?: string;
  tools?: TitleBody[];
  stepsHeading: string;
  steps: TitleBody[];
  faqHeading: string;
  faq: Faq[];
  pricingLink: string;
  english: string;
}

export interface VideoPageCopy {
  title: string;
  description: string;
  keywords: string[];
  kicker: string;
  h1: string;
  lead1: string;
  lead2: string;
  ctaOpen: string;
  ctaGuide: string;
  accountNote: string;
  newHeading: string;
  newBody: string;
  features: { tag: string; title: string; body: string }[];
  before: string;
  pairs: Record<string, string>;
  pairsNote: string;
  precisionHeading: string;
  precisionBody: string;
  beforeTwo: string;
  precision: Record<string, { title: string; look: string }>;
  clipsHeading: string;
  clipsBody: string;
  clipsAll: string;
  clips: Record<string, TitleBody>;
  watchAlone: string;
  stepsHeading: string;
  steps: TitleBody[];
  compareHeading: string;
  compareCols: string[];
  compareRows: { label: string; face: string; head: string }[];
  topupHeading: string;
  topupPoints: string[];
  topupPricing: string;
  ctaMake: string;
  faqHeading: string;
  faq: Faq[];
  english: string;
}

export interface PageCopy {
  video?: VideoPageCopy;
  faceStudio: ToolPageCopy;
  imageEdit: ToolPageCopy;
}

export async function pageCopy(locale: AppLocale): Promise<PageCopy> {
  return (await import(`../../messages/pages/${locale}.json`)).default as PageCopy;
}

/** Puts values into "{name}" placeholders, through strings, arrays and objects alike. Unknown placeholders are left as they are. */
export function fillCopy<T>(value: T, values: Record<string, string | number>): T {
  if (typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole)) as T;
  }
  if (Array.isArray(value)) return value.map((v) => fillCopy(v, values)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillCopy(v, values)])) as T;
  }
  return value;
}
