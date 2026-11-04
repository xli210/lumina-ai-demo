/*
 * The row under a finished result: what else the credits left can do. Fills a page's own host element with the tools
 * this balance covers, with prices from /api/credits/start, so they stay what billing charges. public/i18n/tools.js
 * translates the words as they are added; a read that fails leaves the row out and the result as it was.
 *
 *   window.npNextTools(hostElement, "face", ["video"])   host, this tool, tools another note on the page already offers
 */
(function () {
  "use strict";
  var LABEL = {
    video: function (n) { return `Face or head swap in a video · from ${n} credits`; },
    head: function (n) { return `Whole head swap in a photo · ${n} credits`; },
    face: function (n) { return `Face swap in a photo · from ${n} credits`; },
    edit: function (n) { return `Edit a photo by describing it · ${n} credits`; },
  };

  function link(host, href, text, to, from) {
    var a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.style.textDecoration = "underline";
    a.textContent = text;
    a.addEventListener("click", function () {
      if (window.gtag) window.gtag("event", "next_tool_click", { from: from, to: to });
    });
    host.appendChild(a);
  }

  window.npNextTools = function (host, current, skip) {
    if (!host) return;
    fetch("/api/credits/start", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) {
        if (!s) return;
        var tools = s.tools.filter(function (t) {
          return t.id !== current && (skip || []).indexOf(t.id) < 0 && t.price <= s.available;
        });
        host.textContent = "";
        host.hidden = !tools.length;
        if (!tools.length) return;
        host.style.cssText = "display:flex;flex-wrap:wrap;gap:6px 14px;margin:12px 0;font-size:13px;line-height:1.5";
        var lead = document.createElement("span");
        lead.textContent = `Also with your ${s.available} credits:`;
        host.appendChild(lead);
        tools.forEach(function (t) { link(host, t.href, LABEL[t.id](t.price), t.id, current); });
        link(host, "/start", "See all tools", "all", current);
      })
      .catch(function () { /* the result is what matters */ });
  };
})();
