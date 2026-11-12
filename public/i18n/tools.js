/*
 * Translates the static tool pages (/face-studio, /image-edit, /headswap-pro index.html) in the browser.
 *
 * Those pages and their scripts write their text in English, in hundreds of places. Instead of threading a translation
 * call through each one, this swaps any text node or attribute whose whole text is in the dictionary
 * (public/i18n/tools-<locale>.json), now and whenever the page changes. Anything not listed simply stays in English, which
 * is intended: prices, refund and legal wording are left out of the dictionaries on purpose.
 *
 * It never touches what a person typed (values of inputs and textareas) and never what is sent to the models.
 *
 * The language is the one chosen on the site (cookie np_locale, set by app/components/locale-switcher.tsx), else the
 * browser's. Same order as negotiateLocale in lib/i18n/locales.ts; change them together.
 */
(function () {
  "use strict";
  var LOCALES = ["en", "zh-CN", "ja", "ko", "es", "pt-BR", "de", "fr"];

  function supported(tag) {
    if (!tag) return null;
    var t = String(tag).trim().toLowerCase();
    for (var i = 0; i < LOCALES.length; i++) if (LOCALES[i].toLowerCase() === t) return LOCALES[i];
    var base = t.split("-")[0];
    if (base === "zh") return "zh-CN";
    if (base === "pt") return "pt-BR";
    return LOCALES.indexOf(base) >= 0 ? base : null;
  }

  function pickLocale() {
    var m = document.cookie.match(/(?:^|;\s*)np_locale=([^;]+)/);
    var chosen = m && supported(decodeURIComponent(m[1]));
    if (chosen) return chosen;
    var langs = navigator.languages || [navigator.language];
    for (var i = 0; i < langs.length; i++) {
      var s = supported(langs[i]);
      if (s) return s;
    }
    return "en";
  }

  var locale = pickLocale();
  if (locale === "en") return;

  var root = document.documentElement;
  // Held back only until the dictionary arrives, and never for long, so a slow network still gets a usable English page.
  root.style.visibility = "hidden";
  function reveal() {
    root.style.visibility = "";
  }
  var revealTimer = setTimeout(reveal, 1200);

  var exact = Object.create(null);
  var patterns = [];
  var ATTRS = ["title", "placeholder", "aria-label", "alt"];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1 };

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function load(dict) {
    Object.keys(dict).forEach(function (key) {
      var value = dict[key];
      if (!value || value === key) return;
      if (key.indexOf("{") < 0) {
        exact[key] = value;
        return;
      }
      var names = [];
      var src = key.split(/(\{\w+\})/).map(function (part) {
        var m = part.match(/^\{(\w+)\}$/);
        if (!m) return escapeRe(part);
        names.push(m[1]);
        return "([\\d][\\d.,]*)";
      });
      patterns.push({ re: new RegExp("^" + src.join("") + "$"), names: names, out: value });
    });
  }

  function lookup(text) {
    var core = text.replace(/\s+/g, " ").trim();
    if (!core) return null;
    // /face-studio writes this one hint as _text_.
    var plain = core.replace(/^_(.*)_$/, "$1");
    var hit = exact[core] || exact[plain];
    if (!hit && /\d/.test(core)) {
      for (var i = 0; i < patterns.length; i++) {
        var m = core.match(patterns[i].re);
        if (m) {
          hit = patterns[i].names.reduce(function (out, name, j) {
            return out.split("{" + name + "}").join(m[j + 1]);
          }, patterns[i].out);
          break;
        }
      }
    }
    if (!hit) return null;
    // Keep the spaces around the piece, which separate it from the link or bold word next to it.
    return text.match(/^\s*/)[0] + hit + text.match(/\s*$/)[0];
  }

  function translateText(node) {
    var parent = node.parentNode;
    if (!parent || SKIP[parent.nodeName]) return;
    var out = lookup(node.nodeValue);
    if (out !== null && out !== node.nodeValue) node.nodeValue = out;
  }

  function translateAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (!v) continue;
      var out = lookup(v);
      if (out !== null && out !== v) el.setAttribute(ATTRS[i], out);
    }
  }

  function walk(node) {
    if (node.nodeType === 3) return translateText(node);
    if (node.nodeType !== 1 || SKIP[node.nodeName]) return;
    translateAttrs(node);
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function start() {
    root.lang = locale;
    walk(root);
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        if (r.type === "characterData") translateText(r.target);
        else if (r.type === "attributes") translateAttrs(r.target);
        else r.addedNodes.forEach(walk);
      });
    }).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    clearTimeout(revealTimer);
    reveal();
  }

  fetch("/i18n/tools-" + locale + ".json?v=5")
    .then(function (r) {
      return r.ok ? r.json() : {};
    })
    .then(function (dict) {
      load(dict);
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
      else start();
    })
    .catch(reveal);
})();
