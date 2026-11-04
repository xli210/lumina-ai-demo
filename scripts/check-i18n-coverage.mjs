#!/usr/bin/env node
/**
 * check-i18n-coverage.mjs
 *
 * Finds English that was added without a translation. Tool screens fail safe to English, so without this a new string
 * just shows up in English in seven languages and nobody hears about it.
 *
 *   1. Every key under Ui in messages/en.json exists in every language.
 *   2. Every key of the product pages in messages/pages/en.source.json exists in messages/pages/<locale>.json.
 *   3. Every string in the tools list of en.source.json exists in public/i18n/tools-<locale>.json.
 *   4. English found in the tool screens and in the pages that follow the visitor's language is either in that tools
 *      list or in scripts/i18n-left-in-english.txt, which holds what stays English on purpose (prices, refund wording,
 *      prompts) and what was already there when this check was added.
 *
 * Step 4 reads source text by pattern, so it misses some strings and catches some that are not shown. When it flags a new
 * string: translate it (add it to the tools list and each public/i18n/tools-<locale>.json, or use t() on a page), or, if it
 * should stay English, add it to scripts/i18n-left-in-english.txt.
 *
 * Exit codes: 0 nothing new, 1 something is missing. `--write-baseline` rewrites the text file with what step 4 finds now.
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const LOCALES = ["zh-CN", "ja", "ko", "es", "pt-BR", "de", "fr"];
// Pages whose translation in these languages is written outside messages/pages: docs/i18n.md.
const WRITTEN_ELSEWHERE = { video: ["zh-CN"], headswap: ["zh-CN", "ja"] };
const BASELINE = path.join(ROOT, "scripts", "i18n-left-in-english.txt");

const TOOL_SOURCES = ["public/face-studio/index.html", "public/face-studio/app.js", "public/headswap-pro/index.html", "public/image-edit/index.html", "public/image-edit/app.js"];
const PAGE_SOURCES = ["app/credits", "app/my-images", "app/facestudio-v/videos", "app/auth", "app/download", "app/checkout"];

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf-8");
const readJson = (p) => JSON.parse(read(p));

/** "a.b.c" for each leaf. Arrays count as leaves: their length may differ between languages. */
function leafKeys(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => leafKeys(v, prefix ? `${prefix}.${k}` : k));
}

function missingKeys(source, target) {
  const have = new Set(leafKeys(target));
  return leafKeys(source).filter((k) => !have.has(k));
}

function normalize(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&middot;/g, "·")
    .replace(/\$\{[^}]*\}/g, "{n}")
    .replace(/\s+/g, " ")
    .trim();
}

/** At least two words, starting like a sentence or label, and no sign of being code. */
function looksLikeEnglish(text) {
  if (text.length < 8 || !/^[A-Z,][a-z',]*\s/.test(text.replace(/^, /, ", "))) return false;
  if (!/[a-z]{2,} [a-zA-Z]{2,}/.test(text)) return false;
  return !/[{}=;<>()[\]]{1}.*[{}=;<>()[\]]/.test(text.replace(/\{\w+\}/g, "")) && !/https?:|\/api\/|\.(js|css|png)\b/.test(text);
}

function pieces(text) {
  // A string holding HTML is several pieces on screen.
  return text.split(/<[^>]*>/).map(normalize).filter(looksLikeEnglish);
}

function stringsInScript(code) {
  const out = [];
  const stripped = code.replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/ .*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of stripped.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
    out.push(...pieces((m[1] ?? m[2] ?? m[3]).replace(/\\(.)/g, "$1")));
  }
  return out;
}

function stringsInHtml(html) {
  const out = [];
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  for (const s of scripts) out.push(...stringsInScript(s));
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const m of body.matchAll(/>([^<>]+)</g)) out.push(...pieces(m[1]));
  for (const m of body.matchAll(/\b(?:title|placeholder|aria-label|alt)="([^"]+)"/g)) out.push(...pieces(m[1]));
  return out;
}

function stringsInTsx(code) {
  const out = [];
  const stripped = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  // Words between JSX tags. Quoted strings in code are mostly class names and identifiers, so those are left alone.
  for (const m of stripped.matchAll(/>\s*([A-Z][^<>{}]*?)\s*(?:<|\{)/g)) out.push(...pieces(m[1]));
  return out;
}

function filesUnder(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [rel];
  return fs.readdirSync(full).flatMap((f) => filesUnder(path.join(rel, f).replace(/\\/g, "/")));
}

function foundEnglish() {
  const found = new Set();
  for (const f of TOOL_SOURCES.flatMap(filesUnder)) {
    const list = f.endsWith(".html") ? stringsInHtml(read(f)) : stringsInScript(read(f));
    list.forEach((s) => found.add(s));
  }
  for (const f of PAGE_SOURCES.flatMap(filesUnder).filter((x) => x.endsWith(".tsx"))) {
    stringsInTsx(read(f)).forEach((s) => found.add(s));
  }
  return found;
}

function dictionaryKeys(tools) {
  // {w} and {n} in a key stand for a number or a value filled in by the script; compare with the name taken out.
  return new Set(tools.map((k) => normalize(k).replace(/\{\w+\}/g, "{n}")));
}

const uiEn = readJson("messages/en.json").Ui;
const source = readJson("messages/pages/en.source.json");
const { tools } = source;
// Home and Ui in that file are notes for translators: those words live in messages/<locale>.json, checked above.
const { video, faceStudio, imageEdit, headswap, pro, pricing, faceswap, facialedit, imagetryon } = source;
const pageSource = { video, faceStudio, imageEdit, headswap, pro, pricing, faceswap, facialedit, imagetryon };

const english = foundEnglish();
const translated = dictionaryKeys(tools);
const unknownNow = [...english].filter((s) => !translated.has(s.replace(/\{\w+\}/g, "{n}"))).sort();

if (process.argv.includes("--write-baseline")) {
  const head = "# English in the tool screens and cookie-language pages that is not translated, on purpose or from before scripts/check-i18n-coverage.mjs.\n";
  fs.writeFileSync(BASELINE, head + unknownNow.join("\n") + "\n");
  console.log(`[check-i18n-coverage] wrote ${unknownNow.length} lines to ${path.relative(ROOT, BASELINE)}`);
  process.exit(0);
}

const problems = [];
for (const locale of LOCALES) {
  const ui = readJson(`messages/${locale}.json`).Ui ?? {};
  for (const k of missingKeys(uiEn, ui)) problems.push(`${locale}: messages Ui.${k}`);
  const pages = readJson(`messages/pages/${locale}.json`);
  for (const [section, copy] of Object.entries(pageSource)) {
    if (WRITTEN_ELSEWHERE[section]?.includes(locale)) continue;
    for (const k of missingKeys(copy, pages[section] ?? {})) problems.push(`${locale}: messages/pages ${section}.${k}`);
  }
  const dict = readJson(`public/i18n/tools-${locale}.json`);
  for (const k of tools) if (!dict[k]) problems.push(`${locale}: tools "${k}"`);
}

const known = new Set(fs.existsSync(BASELINE) ? fs.readFileSync(BASELINE, "utf-8").split(/\r?\n/).filter((l) => l && !l.startsWith("#")) : []);
for (const s of unknownNow) if (!known.has(s)) problems.push(`new English, not in the tools list: "${s}"`);

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n[check-i18n-coverage] FAIL: ${problems.length}. See the comment at the top of this script for what to do.`);
  process.exit(1);
}
console.log(`[check-i18n-coverage] OK: ${LOCALES.length} languages, ${tools.length} tool strings, ${english.size} English strings read from source.`);
