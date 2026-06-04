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

function readCatalogueJson(locale) {
  const file = path.join(ROOT, "messages", `${locale}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function main() {
  const dntTerms = readGlossary();
  const locales = listLocales();
  const en = readCatalogueJson("en");
  if (!en) {
    console.error("[check-i18n-dnt] missing messages/en.json");
    process.exit(1);
  }

  /**
   * Per-namespace verification. For each top-level key (namespace) in
   * messages/en.json, we only check it against locales that ALSO have
   * that namespace. This lets us land translations one namespace at a
   * time without forcing every locale to be in lockstep.
   */
  let failed = 0;
  let totalVerified = 0;

  for (const locale of locales) {
    if (locale === "en") continue;
    const target = readCatalogueJson(locale);
    if (!target) continue;

    const namespaceReports = [];
    let localeFailed = 0;

    for (const namespace of Object.keys(en)) {
      if (!(namespace in target)) continue;
      const enNs = JSON.stringify(en[namespace]);
      const targetNs = JSON.stringify(target[namespace]);

      const requiredInNs = dntTerms.filter((term) => enNs.includes(term));
      const missing = requiredInNs.filter((term) => !targetNs.includes(term));

      if (missing.length > 0) {
        localeFailed += missing.length;
        namespaceReports.push({ namespace, requiredInNs, missing });
      } else if (requiredInNs.length > 0) {
        namespaceReports.push({ namespace, requiredInNs, missing: [] });
      }

      totalVerified += requiredInNs.length;
    }

    if (localeFailed > 0) {
      failed += localeFailed;
      console.error(
        `[check-i18n-dnt] messages/${locale}.json — ${localeFailed} missing term(s):`,
      );
      for (const r of namespaceReports) {
        if (r.missing.length === 0) continue;
        console.error(
          `    [${r.namespace}] missing ${r.missing.length}/${r.requiredInNs.length}:`,
        );
        for (const m of r.missing) console.error(`        - ${m}`);
      }
    } else {
      const summary = namespaceReports
        .map((r) => `${r.namespace}:${r.requiredInNs.length}`)
        .join(", ");
      console.log(
        `[check-i18n-dnt] messages/${locale}.json OK (${summary || "no DNT terms in shared namespaces"})`,
      );
    }
  }

  if (failed > 0) {
    console.error(`\n[check-i18n-dnt] FAIL — ${failed} missing term(s)`);
    process.exit(1);
  }
  console.log(
    `\n[check-i18n-dnt] PASS — ${totalVerified} term-occurrences verified across ${locales.length - 1} translated locale(s)`,
  );
}

main();
