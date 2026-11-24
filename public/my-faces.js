/*
 * My faces: reference photos a person chose to keep, shown as a row of thumbnails in Nano FaceStudio Online and Nano
 * HeadSwap Pro, so the next swap starts with one click. Server side: lib/saved-faces-server.ts, /api/saved-faces.
 *
 *   npMyFaces.panel(container, { source, onPick(file, n) })  the row; onPick gets the photo as a File, ready for the tool's
 *                                                            normal upload, and may return a sentence to show.
 *   npMyFaces.offerSave(slot, file, { source })              "Save to My faces" under a photo the person uploaded: asks first
 *                                                            (the photo is kept until they delete it), then saves.
 *   npMyFaces.clear(slot)                                    empties a slot.
 *
 * Nothing shows for a signed-out visitor, or when the server says My faces is not available. Every sentence is its own
 * text node, so public/i18n/tools.js can translate it.
 */
(function () {
  "use strict";
  if (window.npMyFaces) return;

  var API = "/api/saved-faces";
  var state = { loaded: false, available: false, faces: [], max: 20, maxSide: 2048, maxBytes: 8 * 1024 * 1024 };
  var panels = [];
  var loading = null;

  var CSS =
    ".npmf{margin-top:18px;padding:14px 16px 16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.1);border-radius:12px}" +
    ".npmf-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px}" +
    ".npmf-head h3{font-size:.95rem;font-weight:600;color:#fff;margin:0}" +
    ".npmf-hint{font-size:.78rem;color:rgba(255,255,255,.55)}" +
    ".npmf-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px}" +
    "@media (max-width:720px){.npmf-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}" +
    "@media (max-width:480px){.npmf-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}" +
    ".npmf-item{position:relative}" +
    ".npmf-cell{display:block;width:100%;aspect-ratio:1/1;padding:0;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.12);border-radius:8px;transition:border-color .15s,transform .15s}" +
    ".npmf-cell:hover{border-color:rgba(255,255,255,.45);transform:translateY(-1px)}" +
    ".npmf-cell img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".npmf-cell.loading{opacity:.55;cursor:wait}" +
    ".npmf-del{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:#1c1c22;color:#fff;font-size:14px;line-height:18px;cursor:pointer;padding:0;opacity:.85}" +
    ".npmf-del:hover{opacity:1;background:#5a1f24}" +
    ".npmf-empty,.npmf-msg{font-size:.8rem;color:rgba(255,255,255,.6);margin:6px 0 0;line-height:1.45}" +
    ".npmf-msg:empty{display:none}" +
    ".npmf-confirm{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px;font-size:.8rem;color:rgba(255,255,255,.8)}" +
    ".npmf-btn{font:inherit;font-size:.78rem;padding:5px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;cursor:pointer}" +
    ".npmf-btn:hover{border-color:rgba(255,255,255,.55)}" +
    ".npmf-btn.primary{background:#fff;color:#111;border-color:#fff}" +
    ".npmf-btn.danger{background:#b3261e;border-color:#b3261e}" +
    ".npmf-btn[disabled]{opacity:.6;cursor:default}" +
    ".npmf-save{margin-top:8px;font-size:.78rem;line-height:1.45;color:rgba(255,255,255,.75);text-align:left}" +
    ".npmf-save p{margin:0 0 6px}" +
    ".npmf-save .npmf-row{display:flex;gap:8px;flex-wrap:wrap}";

  function addStyle() {
    if (document.getElementById("npmf-style")) return;
    var s = document.createElement("style");
    s.id = "npmf-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(text, cls) {
    var b = el("button", "npmf-btn" + (cls ? " " + cls : ""), text);
    b.type = "button";
    return b;
  }

  async function detailOf(res, fallback) {
    try {
      var j = await res.json();
      if (j && typeof j.detail === "string") return j.detail;
    } catch (e) {}
    return fallback;
  }

  function load() {
    if (loading) return loading;
    loading = fetch(API, { credentials: "include", cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then(function (j) {
        state.available = true;
        state.faces = Array.isArray(j.faces) ? j.faces : [];
        if (j.max) state.max = j.max;
        if (j.max_side) state.maxSide = j.max_side;
        if (j.max_bytes) state.maxBytes = j.max_bytes;
      })
      .catch(function () {
        state.available = false;
      })
      .then(function () {
        state.loaded = true;
        loading = null;
        panels.forEach(render);
      });
    return loading;
  }

  // ---------- the row

  function render(p) {
    p.root.hidden = !state.available;
    if (!state.available) return;
    p.grid.innerHTML = "";
    p.empty.hidden = state.faces.length > 0;
    p.grid.hidden = state.faces.length === 0;
    state.faces.forEach(function (f) {
      var item = el("div", "npmf-item");
      var cell = el("button", "npmf-cell");
      cell.type = "button";
      cell.title = "Use this face";
      var img = el("img");
      img.alt = "Saved face";
      img.src = f.thumb;
      cell.appendChild(img);
      cell.addEventListener("click", function () {
        pick(p, f, cell);
      });
      var del = el("button", "npmf-del", "×");
      del.type = "button";
      del.title = "Delete this face";
      del.setAttribute("aria-label", "Delete this face");
      del.addEventListener("click", function () {
        askDelete(p, f);
      });
      item.appendChild(cell);
      item.appendChild(del);
      p.grid.appendChild(item);
    });
  }

  async function pick(p, f, cell) {
    if (cell.classList.contains("loading")) return;
    cell.classList.add("loading");
    p.msg.textContent = "";
    try {
      var res = await fetch(f.image, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error(await detailOf(res, "Couldn't load that face. Try again."));
      var blob = await res.blob();
      var file = new File([blob], "saved-face.jpg", { type: blob.type || "image/jpeg" });
      file.npSavedFace = f.id; // so the tool does not offer to save it again
      var said = p.opts.onPick(file);
      if (typeof said === "string") {
        p.msg.textContent = said;
        setTimeout(function () {
          if (p.msg.textContent === said) p.msg.textContent = "";
        }, 6000);
      }
    } catch (e) {
      p.msg.textContent = (e && e.message) || "Couldn't load that face. Try again.";
    } finally {
      cell.classList.remove("loading");
    }
  }

  function askDelete(p, f) {
    p.confirm.innerHTML = "";
    p.confirm.hidden = false;
    var yes = button("Delete", "danger");
    var no = button("Cancel");
    p.confirm.appendChild(el("span", null, "Delete this saved face? It is removed from storage for good."));
    p.confirm.appendChild(yes);
    p.confirm.appendChild(no);
    no.addEventListener("click", function () {
      p.confirm.hidden = true;
    });
    yes.addEventListener("click", async function () {
      yes.disabled = no.disabled = true;
      try {
        var res = await fetch(API + "/" + encodeURIComponent(f.id), { method: "DELETE", credentials: "include" });
        if (!res.ok) throw new Error(await detailOf(res, "Could not delete the face. Try again."));
        state.faces = state.faces.filter(function (x) {
          return x.id !== f.id;
        });
        p.confirm.hidden = true;
        panels.forEach(render);
      } catch (e) {
        p.confirm.hidden = true;
        p.msg.textContent = (e && e.message) || "Could not delete the face. Try again.";
      }
    });
  }

  function panel(container, opts) {
    addStyle();
    var root = el("div", "npmf");
    root.hidden = true;
    var head = el("div", "npmf-head");
    head.appendChild(el("h3", null, "My faces"));
    head.appendChild(el("span", "npmf-hint", "Faces you saved. Click one to use it again."));
    var grid = el("div", "npmf-grid");
    var empty = el("p", "npmf-empty", "No saved faces yet. After you add a reference photo, press Save to My faces under it to use it again next time.");
    var confirm = el("div", "npmf-confirm");
    confirm.hidden = true;
    var msg = el("p", "npmf-msg");
    root.appendChild(head);
    root.appendChild(grid);
    root.appendChild(empty);
    root.appendChild(confirm);
    root.appendChild(msg);
    container.appendChild(root);
    var p = { root: root, grid: grid, empty: empty, confirm: confirm, msg: msg, opts: opts || {} };
    panels.push(p);
    if (state.loaded) render(p);
    else load();
    return { refresh: load };
  }

  // ---------- saving

  function toJpeg(bitmap, maxSide, quality) {
    var scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    var w = Math.max(1, Math.round(bitmap.width * scale));
    var h = Math.max(1, Math.round(bitmap.height * scale));
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    return new Promise(function (resolve, reject) {
      c.toBlob(
        function (b) {
          if (b) resolve({ blob: b, width: w, height: h });
          else reject(new Error("Could not read that image."));
        },
        "image/jpeg",
        quality
      );
    });
  }

  async function save(file, source) {
    var bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    var photo, thumb;
    try {
      photo = await toJpeg(bitmap, state.maxSide, 0.92);
      thumb = await toJpeg(bitmap, 256, 0.85);
    } finally {
      if (bitmap.close) bitmap.close();
    }
    if (photo.blob.size > state.maxBytes) throw new Error("That photo is too large to save.");

    var start = await fetch(API, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: source, consent: true, width: photo.width, height: photo.height }),
    });
    if (!start.ok) throw new Error(await detailOf(start, "Could not save this face. Try again."));
    var t = await start.json();
    var puts = await Promise.all([
      fetch(t.upload_url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: photo.blob }),
      fetch(t.thumb_upload_url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: thumb.blob }),
    ]);
    if (!puts[0].ok || !puts[1].ok) throw new Error("Upload failed. Check your connection and retry.");
    var done = await fetch(API + "/" + encodeURIComponent(t.id) + "/confirm", { method: "POST", credentials: "include" });
    if (!done.ok) throw new Error(await detailOf(done, "Could not save this face. Try again."));
    var j = await done.json();
    state.faces = [j.face].concat(state.faces);
    panels.forEach(render);
    return j.face;
  }

  function clear(slot) {
    if (slot) slot.innerHTML = "";
  }

  /** "Save to My faces" under a photo the person uploaded. Asks before keeping anything. */
  function offerSave(slot, file, opts) {
    if (!slot) return;
    clear(slot);
    if (!file || file.npSavedFace) return;
    var source = (opts && opts.source) || "facestudio";
    function show() {
      if (!state.available) return;
      if (slot.npFile !== file) return; // another photo was chosen meanwhile
      addStyle();
      clear(slot);
      var box = el("div", "npmf-save");
      var offer = button("Save to My faces");
      box.appendChild(offer);
      slot.appendChild(box);
      offer.addEventListener("click", function (e) {
        e.stopPropagation();
        box.innerHTML = "";
        box.appendChild(el("p", null, "Keep this photo in My faces so you can use it again? It is stored privately, only you can see it, and you can delete it at any time."));
        var row = el("div", "npmf-row");
        var yes = button("Save", "primary");
        var no = button("Cancel");
        row.appendChild(yes);
        row.appendChild(no);
        box.appendChild(row);
        no.addEventListener("click", function (ev) {
          ev.stopPropagation();
          show();
        });
        yes.addEventListener("click", async function (ev) {
          ev.stopPropagation();
          yes.disabled = no.disabled = true;
          yes.textContent = "Saving…";
          try {
            await save(file, source);
            box.innerHTML = "";
            box.appendChild(el("p", null, "Saved to My faces."));
          } catch (err) {
            box.innerHTML = "";
            box.appendChild(el("p", null, (err && err.message) || "Could not save this face. Try again."));
            var again = button("Try again");
            again.addEventListener("click", function (ev2) {
              ev2.stopPropagation();
              show();
            });
            box.appendChild(again);
          }
        });
      });
    }
    slot.npFile = file;
    if (state.loaded) show();
    else load().then(show);
  }

  window.npMyFaces = { panel: panel, offerSave: offerSave, clear: clear, refresh: load };
})();
