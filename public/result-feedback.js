/*
 * "How was this result?" under a finished result, on every tool: Good / Not good in one tap, then optional reasons and a
 * note. Each answer is stored against the job it rates (public.result_feedback, scripts/026), so it can be read per
 * product, mode and job. The tool says which job; the server reads the mode from the job's reservation.
 *
 *   window.npResultFeedback(host, {
 *     service: "facestudio" | "headswap-pro" | "imageedit" | "facestudio-v",
 *     job: "<the job id the tool polls>",
 *     kind: "photo" | "edit" | "video",      which reasons to offer
 *     watermark: true,                         the result carries the free mark: offer "The watermark"
 *     short: true,                             a video cut to the free length: offer "Too short"
 *     detail: { size: "1080p" },               anything else worth keeping with the answer (short strings or numbers)
 *     post: function (body) { return promise }  how to send it (default: POST /api/result-feedback on this site)
 *     onRate: function (rating) {}              told of the first tap ("good" | "bad")
 *   })
 *
 * The English words are translated where they appear: public/i18n/tools-<locale>.json on this site, and the studio's
 * own dictionaries on the video studio, which loads this file from nanopocket.ai. A send that fails keeps the
 * result as it was and only says so beside the buttons.
 */
(function () {
  "use strict";
  var KEY = "np_rated";

  var REASONS = {
    face: "Doesn't look like the person",
    unnatural: "Looks fake or unnatural",
    artifacts: "Glitches, blur or seams",
    flicker: "Flickers or jumps",
    wrong_area: "Didn't do what I asked",
    watermark: "The watermark",
    too_short: "Too short",
    too_slow: "Took too long",
    price: "Costs too many credits",
    just_trying: "Just trying it out",
    nothing: "Nothing, it's great",
  };

  function reasonsFor(o, rating) {
    var list;
    if (rating === "bad") {
      list = o.kind === "edit" ? ["wrong_area", "unnatural", "artifacts"] : ["face", "unnatural", "artifacts"];
      if (o.kind === "video") list.push("flicker");
    } else {
      list = ["nothing"];
    }
    if (o.watermark) list.push("watermark");
    if (o.short) list.push("too_short");
    list.push("too_slow", "price", "just_trying");
    return list;
  }

  function css() {
    if (document.getElementById("npfb-css")) return;
    var s = document.createElement("style");
    s.id = "npfb-css";
    s.textContent =
      ".npfb{margin:12px 0;padding:12px 14px;border:1px solid rgba(127,127,127,.35);border-radius:10px;font-size:14px;line-height:1.45}" +
      ".npfb-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}" +
      ".npfb-q{font-weight:600;margin-right:4px}" +
      ".npfb button{font:inherit;color:inherit;background:transparent;border:1px solid rgba(127,127,127,.5);border-radius:999px;padding:5px 12px;cursor:pointer}" +
      ".npfb button:hover{border-color:currentColor}" +
      ".npfb button[aria-pressed=true]{background:rgba(127,127,127,.25);border-color:currentColor}" +
      ".npfb button:disabled{opacity:.6;cursor:default}" +
      ".npfb-more{margin-top:10px}" +
      ".npfb-more p{margin:0 0 8px}" +
      ".npfb textarea{display:block;width:100%;box-sizing:border-box;margin:8px 0;min-height:56px;font:inherit;color:inherit;background:transparent;border:1px solid rgba(127,127,127,.5);border-radius:8px;padding:6px 8px;resize:vertical}" +
      ".npfb-msg{font-size:13px;opacity:.8}";
    document.head.appendChild(s);
  }

  function rated() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function remember(id) {
    try {
      var m = rated();
      m[id] = Date.now();
      var keys = Object.keys(m);
      if (keys.length > 200) keys.sort(function (a, b) { return m[a] - m[b]; }).slice(0, keys.length - 200).forEach(function (k) { delete m[k]; });
      localStorage.setItem(KEY, JSON.stringify(m));
    } catch (e) { /* asked again next time */ }
  }

  function defaultPost(body) {
    return fetch("/api/result-feedback", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r; });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  window.npResultFeedback = function (host, o) {
    if (!host || !o || !o.service || !o.job) return;
    css();
    var id = o.service + ":" + o.job;
    host.textContent = "";
    host.hidden = false;
    var box = el("div", "npfb");
    host.appendChild(box);

    if (rated()[id]) {
      box.appendChild(el("span", "npfb-msg", "Thanks for rating this result."));
      return;
    }

    var post = o.post || defaultPost;
    var state = { rating: null, reasons: [] };
    function body() {
      return { service: o.service, job: o.job, rating: state.rating, reasons: state.reasons, note: note ? note.value : "", detail: o.detail || {} };
    }

    var row = el("div", "npfb-row");
    row.appendChild(el("span", "npfb-q", "How was this result?"));
    var good = el("button", null, "👍 Good");
    var bad = el("button", null, "👎 Not good");
    good.type = bad.type = "button";
    var msg = el("span", "npfb-msg");
    row.appendChild(good);
    row.appendChild(bad);
    row.appendChild(msg);
    box.appendChild(row);
    var more = el("div", "npfb-more");
    more.hidden = true;
    box.appendChild(more);
    var note = null;

    function rate(r) {
      var first = state.rating === null;
      state.rating = r;
      state.reasons = [];
      good.setAttribute("aria-pressed", r === "good");
      bad.setAttribute("aria-pressed", r === "bad");
      msg.textContent = "";
      post(body()).catch(function () { msg.textContent = "Could not send. Try again."; });
      if (first && typeof o.onRate === "function") { try { o.onRate(r); } catch (e) { /* the rating is sent anyway */ } }
      if (window.gtag) window.gtag("event", "result_rating", { service: o.service, rating: r });
      showMore();
    }

    function showMore() {
      more.textContent = "";
      more.hidden = false;
      more.appendChild(el("p", null, state.rating === "bad" ? "What went wrong? Pick any." : "Anything we could do better? Pick any."));
      var chips = el("div", "npfb-row");
      reasonsFor(o, state.rating).forEach(function (code) {
        var b = el("button", null, REASONS[code]);
        b.type = "button";
        b.setAttribute("aria-pressed", "false");
        b.onclick = function () {
          var i = state.reasons.indexOf(code);
          if (i >= 0) state.reasons.splice(i, 1); else state.reasons.push(code);
          b.setAttribute("aria-pressed", i < 0);
        };
        chips.appendChild(b);
      });
      more.appendChild(chips);
      note = el("textarea");
      note.maxLength = 1000;
      note.placeholder = "Anything else? (optional)";
      more.appendChild(note);
      var send = el("button", null, "Send");
      send.type = "button";
      var sent = el("span", "npfb-msg");
      var foot = el("div", "npfb-row");
      foot.appendChild(send);
      foot.appendChild(sent);
      more.appendChild(foot);
      send.onclick = function () {
        send.disabled = true;
        sent.textContent = "";
        post(body()).then(function () {
          remember(id);
          box.textContent = "";
          box.appendChild(el("span", "npfb-msg", "Thanks! We read every answer."));
        }).catch(function () {
          send.disabled = false;
          sent.textContent = "Could not send. Try again.";
        });
      };
    }

    good.onclick = function () { rate("good"); };
    bad.onclick = function () { rate("bad"); };
  };
})();
