/*
 * The "out of credits" card shared by the photo tools (Face Studio, HeadSwap Pro, Image Edit).
 *
 * A bare "you need 20 credits, buy credits" line says nothing about what a purchase gets. This card
 * says it in the tool's own units, read from the real numbers: what the $5 pack makes here, what the
 * first top-up changes for an account that has never bought (the rules the tools enforce), and the
 * Black Friday pack price while the sale runs (from /api/credits/packs, so it disappears by itself
 * when the sale ends). Nothing here decides a price: the servers do.
 *
 *   npOutOfCredits(container, {
 *     href,            // the top-up link the server suggested (falls back to the $5 pack)
 *     unitCredits,     // what one unit costs this account here, e.g. 20
 *     unitLabel,       // plural noun for the unit, e.g. "head swap photos"
 *     perks,           // optional extra first-top-up lines for this tool
 *   });
 */
(function () {
  "use strict";

  var STYLE =
    ".np-ooc{margin-top:10px;padding:12px 14px;border:1px solid rgba(99,102,241,.45);border-radius:12px;" +
    "background:rgba(99,102,241,.08);font-size:13px;line-height:1.5;color:inherit;text-align:left}" +
    ".np-ooc b{font-weight:600}.np-ooc ul{margin:6px 0 0;padding-left:18px}.np-ooc li{margin:2px 0}" +
    ".np-ooc .np-ooc-bf{margin-top:6px;color:#d97706;font-weight:600}" +
    ".np-ooc a.np-ooc-btn{display:inline-block;margin-top:10px;padding:7px 16px;border-radius:999px;" +
    "background:#4f46e5;color:#fff !important;text-decoration:none;font-weight:600}";

  function addStyle() {
    if (document.getElementById("np-ooc-style")) return;
    var s = document.createElement("style");
    s.id = "np-ooc-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  // A tool may redraw its hint often; the two reads are kept for a minute.
  var cache = {};
  function getJson(url) {
    var hit = cache[url];
    if (hit && Date.now() - hit.at < 60000) return hit.p;
    var p = fetch(url, { cache: "no-store", credentials: "include" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
    cache[url] = { at: Date.now(), p: p };
    return p;
  }

  /** "Dec 24": the last day of a sale that ends at `iso` (Pacific time, like the rest of the site). */
  function lastDay(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return "";
    return new Date(t - 1).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
  }

  function usd(cents) {
    return "$" + (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2));
  }

  window.npOutOfCredits = function (container, opts) {
    if (!container) return;
    opts = opts || {};
    addStyle();
    var old = container.querySelector(".np-ooc");
    if (old) old.remove();
    var box = el("div", "np-ooc");
    container.appendChild(box);

    Promise.all([getJson("/api/credits/balance"), getJson("/api/credits/packs")]).then(function (res) {
      var balance = res[0], catalog = res[1];
      var packs = (catalog && catalog.packs) || [];
      var starter = packs.filter(function (p) { return p.id === "starter"; })[0];
      var neverPaid = balance && balance.lifetime_purchased === 0;

      if (starter && opts.unitCredits > 0 && opts.unitLabel) {
        var n = Math.floor(starter.total_credits / opts.unitCredits);
        // Separate nodes, so public/i18n/tools.js can translate the words and leave the price in English.
        var line = el("div");
        line.appendChild(el("b", null, usd(starter.charge_in_cents) + " = " + starter.total_credits.toLocaleString("en-US") + " credits"));
        line.appendChild(document.createTextNode(" "));
        line.appendChild(el("span", null, "About " + n.toLocaleString("en-US") + " " + opts.unitLabel + "."));
        line.appendChild(document.createTextNode(" "));
        line.appendChild(el("span", null, "Credits never expire, no subscription."));
        box.appendChild(line);
      }

      if (neverPaid) {
        box.appendChild(el("div", null, "Your first top-up, with any pack, also:"));
        var ul = el("ul");
        var perks = ["Removes the watermark from your photos and videos"].concat(opts.perks || [], [
          "Unlocks videos up to 60 seconds (12 s for head swap) and the front of the video line",
        ]);
        perks.forEach(function (p) { ul.appendChild(el("li", null, p)); });
        box.appendChild(ul);
      }

      if (catalog && catalog.sale_ends_at) {
        var best = packs.filter(function (p) { return p.percent_off > 0; })[0];
        if (best) {
          box.appendChild(el("div", "np-ooc-bf",
            "Black Friday: " + best.name + " " + usd(best.charge_in_cents) + " instead of " + usd(best.price_in_cents) +
            " for " + best.total_credits.toLocaleString("en-US") + " credits (" + best.percent_off + "% off), until " + lastDay(catalog.sale_ends_at) + "."));
        }
      }

      var a = el("a", "np-ooc-btn", "Buy credits");
      a.href = typeof opts.href === "string" && opts.href.charAt(0) === "/" ? opts.href : "/credits?pack=starter";
      a.target = "_blank";
      a.rel = "noopener";
      box.appendChild(a);
      box.appendChild(document.createTextNode(" "));
      box.appendChild(el("span", null, "Then come back to this tab and try again."));
    });
  };
})();
