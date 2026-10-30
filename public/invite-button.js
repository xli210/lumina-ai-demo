// "Invite a friend" buttons in the static studios (public/face-studio, public/headswap-pro).
// Any element with data-invite gets the signed-in user's invite link from /api/referral and
// opens the phone's share sheet, or copies the link where there is none. See lib/referral.ts.
(function () {
  var cached = null;
  function getLink() {
    if (cached) return Promise.resolve(cached);
    return fetch("/api/referral", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { cached = j; return j; });
  }
  function flash(el, text) {
    var label = el.querySelector("[data-invite-label]") || el;
    var old = label.textContent;
    label.textContent = text;
    setTimeout(function () { label.textContent = old; }, 2500);
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-invite]");
    if (!el) return;
    e.preventDefault();
    getLink().then(function (j) {
      if (!j || !j.link) { location.href = "/account#invite"; return; }
      var text = "I made this with NanoPocket AI face swap. Sign up free with my link:";
      if (navigator.share) {
        navigator.share({ title: "NanoPocket", text: text, url: j.link }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text + " " + j.link).then(
          function () { flash(el, "Link copied"); },
          function () { location.href = "/account#invite"; }
        );
      } else {
        location.href = "/account#invite";
      }
    }).catch(function () { location.href = "/account#invite"; });
  });
})();
