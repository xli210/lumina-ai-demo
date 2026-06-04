#!/usr/bin/env node
/**
 * check-i18n-dnt.mjs
 *
 * Verifies that every Do-Not-Translate term in lib/i18n/glossary.ts appears
 * verbatim in every translated message catalogue. Prevents human translators
 * (or agents) from accidentally localising brand names, model names, URLs,
 * passwords, and other strings that must round-trip exactly.
 *
 * Exit codes:
 *   0 — every DNT term that occurs in en.json also occurs in every other locale
 *   1 — at least one DNT term is missing from a non-English catalogue
 *
 * Usage:
 *   node scripts/check-i18n-dnt.mjs
 *
 * Wire this into CI / pre-commit. It runs in <100ms with no extra deps.
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function readGlossary() {
  const file = path.join(ROOT, "lib", "i18n", "glossary.ts");
  const src = fs.readFileSync(file, "utf-8");
  // Pull every double-quoted string literal between the opening `[` and
  // closing `]` of I18N_DNT_TERMS. The parser is line-oriented and tolerant
  // of comments — it only cares about strings inside double quotes.
  const start = src.indexOf("I18N_DNT_TERMS");
  if (start === -1) throw new Error("could not find I18N_DNT_TERMS");
  const arrayStart = src.indexOf("[", start);
  const arrayEnd = src.indexOf("]", arrayStart);
  const slice = src.slice(arrayStart, arrayEnd);
  const matches = slice.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g) ?? [];
  return matches.map((s) => JSON.parse(s));
}

function readCatalogue(locale) {
  const file = path.join(ROOT, "messages", `${locale}.json`);
  if (!fs.existsSync(file)) return null;
  const json = JSON.parse(fs.readFileSync(file, "utf-8"));
  return JSON.stringify(json);
}

function listLocales() {
  const dir = path.join(ROOT, "messages");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

function main() {
  const dntTerms = readGlossary();
  const locales = listLocales();
  const en = readCatalogue("en");
  if (!en) {
    console.error("[check-i18n-dnt] missing messages/en.json");
    process.exit(1);
  }

  /**
   * Only verify terms that actually occur in the English catalogue.
   * The glossary is forward-looking and may list terms that don't appear
   * on any translated page yet — those don't need to be checked.
   */
  const requiredTerms = dntTerms.filter((term) => en.includes(term));

  let failed = 0;
  for (const locale of locales) {
    if (locale === "en") continue;
    const catalogue = readCatalogue(locale);
    if (!catalogue) continue;
    const missing = requiredTerms.filter((term) => !catalogue.includes(term));
    if (missing.length > 0) {
      failed += missing.length;
      console.error(
        `[check-i18n-dnt] messages/${locale}.json is missing ${missing.length} DNT term(s):`,
      );
      for (const m of missing) console.error(`    - ${m}`);
    } else {
      console.log(
        `[check-i18n-dnt] messages/${locale}.json OK (${requiredTerms.length} terms verified)`,
      );
    }
  }

  if (failed > 0) {
    console.error(`\n[check-i18n-dnt] FAIL — ${failed} missing term(s)`);
    process.exit(1);
  }
  console.log(
    `\n[check-i18n-dnt] PASS — ${requiredTerms.length} DNT terms preserved across ${locales.length - 1} translated locale(s)`,
  );
}

main();
