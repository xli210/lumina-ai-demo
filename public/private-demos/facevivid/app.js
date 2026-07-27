/* NanoFace Vivid — frontend logic ──────────────────────────────────────── */
(function () {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  //  ⇩⇩⇩  REPOINT #0 — set this to YOUR backend's base URL.  ⇩⇩⇩
  //
  //  Leave it "" only if THIS page is served by the same server that
  //  exposes the /api/* routes. To call your own backend, set e.g.:
  //        const API_BASE = "https://api.yourdomain.com";
  //   or   const API_BASE = "/facevivid";        // a path on your site
  //
  //  Your backend must expose these routes (it forwards them to the model
  //  API, adding the secret X-API-Key, and logs 1 credit on each success):
  //     POST {API_BASE}/api/run            (multipart: image, detail_strength)
  //     GET  {API_BASE}/api/status/{jobId}
  //     GET  {API_BASE}/api/result/{jobId}  (returns image/png)
  //     POST {API_BASE}/api/feedback        (optional)
  //     POST {API_BASE}/api/visit           (optional analytics)
  //  Demos are fully static (demos.local.json) — no backend needed.
  // ══════════════════════════════════════════════════════════════════════
  //
  //  Nanopocket integration:
  //    All calls route through same-origin Next.js proxy routes under
  //    /api/private-demos/facevivid/*. Those routes inject the secret
  //    X-API-Key (never exposed to the browser) and forward to the
  //    NanoFace Vivid upstream tunnel. Admin auth is enforced upstream
  //    of every call by middleware + per-route session check.
  const API_BASE = "/api/private-demos/facevivid";

  // ── element handles ─────────────────────────────────────────
  const dz             = document.getElementById("dropzone");
  const dzEmpty        = document.getElementById("dropzoneEmpty");
  const dzPreview      = document.getElementById("dropzonePreview");
  const fileInput      = document.getElementById("fileInput");
  const strength       = document.getElementById("strength");
  const strengthValue  = document.getElementById("strengthValue");
  const runBtn         = document.getElementById("runBtn");
  const errorLine      = document.getElementById("errorLine");
  const progress       = document.getElementById("progress");
  const progressFill   = document.getElementById("progressFill");
  const progressDesc   = document.getElementById("progressDesc");
  const progressTime   = document.getElementById("progressTime");
  const viewerEmpty    = document.getElementById("viewerEmpty");
  const viewerResult   = document.getElementById("viewerResult");
  const viewerStage    = document.getElementById("viewerStage");
  const vtZoomIn       = document.getElementById("vtZoomIn");
  const vtZoomOut      = document.getElementById("vtZoomOut");
  const vtReset        = document.getElementById("vtReset");
  const vtScale        = document.getElementById("vtScale");
  const viewerFooter   = document.getElementById("viewerFooter");
  const downloadBtn    = document.getElementById("downloadBtn");
  const fbUp           = document.getElementById("fbUp");
  const fbDown         = document.getElementById("fbDown");
  const examplesGrid   = document.getElementById("examplesGrid");

  let currentFile = null;
  let currentJob  = null;
  let currentBeforeUrl = null;
  let currentAfterUrl  = null;

  // ── analytics (fire-and-forget) ─────────────────────────────
  fetch(API_BASE + "/api/visit", { method: "POST" }).catch(() => {}); // REPOINT #1

  // ────────────────────────────────────────────────────────────
  // Reusable compare-zoom widget
  //
  //   * Single image shown with a left/right wipe slider (Before | After).
  //   * Mouse wheel zooms around the cursor (1x..8x).
  //   * Drag the divider/knob OR drag anywhere at 1x => move the slider.
  //   * Drag anywhere when zoomed (scale > 1x)        => pan the image.
  //   * Double-click resets to 1x / centered.
  //
  // The slider clip-paths are applied to two stacked panes so the divider
  // sits in *screen* space (it never moves as the user zooms or pans).
  // ────────────────────────────────────────────────────────────
  function createCompareZoom(host, opts) {
    opts = opts || {};
    const ZOOM_MIN = 1.0, ZOOM_MAX = 8.0, ZOOM_STEP = 1.25;

    const box = document.createElement("div");
    box.className = "cmpz" + (opts.large ? " cmpz-large" : "");

    const paneBefore = document.createElement("div");
    paneBefore.className = "cmpz-pane cmpz-pane-before";
    const imgBefore = document.createElement("img");
    imgBefore.className = "cmpz-img";
    imgBefore.alt = "Before";
    imgBefore.draggable = false;
    paneBefore.appendChild(imgBefore);

    const paneAfter = document.createElement("div");
    paneAfter.className = "cmpz-pane cmpz-pane-after";
    const imgAfter = document.createElement("img");
    imgAfter.className = "cmpz-img";
    imgAfter.alt = "After";
    imgAfter.draggable = false;
    paneAfter.appendChild(imgAfter);

    const tagBefore = document.createElement("div");
    tagBefore.className = "cmpz-tag cmpz-tag-before";
    tagBefore.textContent = "Before";
    const tagAfter = document.createElement("div");
    tagAfter.className = "cmpz-tag cmpz-tag-after";
    tagAfter.textContent = "After";

    const divider = document.createElement("div");
    divider.className = "cmpz-divider";
    const knob = document.createElement("div");
    knob.className = "cmpz-knob";
    knob.textContent = "⇄";

    box.append(paneBefore, paneAfter, tagBefore, tagAfter, divider, knob);
    host.appendChild(box);

    const state = { scale: 1, tx: 0, ty: 0, sliderPct: 50 };

    function applyTransform() {
      const t = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
      imgBefore.style.transform = t;
      imgAfter.style.transform  = t;
      if (opts.onZoomChange) opts.onZoomChange(state.scale);
    }
    function applySlider() {
      paneBefore.style.clipPath = `inset(0 ${100 - state.sliderPct}% 0 0)`;
      paneAfter.style.clipPath  = `inset(0 0 0 ${state.sliderPct}%)`;
      divider.style.left = state.sliderPct + "%";
      knob.style.left    = state.sliderPct + "%";
    }
    function updateCursor() {
      box.classList.toggle("zoomable", state.scale > 1.001);
    }
    function clampPan() {
      const r = box.getBoundingClientRect();
      const sX = r.width  * (state.scale - 1);
      const sY = r.height * (state.scale - 1);
      if (state.tx > 0) state.tx = 0;
      if (state.ty > 0) state.ty = 0;
      if (state.tx < -sX) state.tx = -sX;
      if (state.ty < -sY) state.ty = -sY;
    }
    function zoomTo(newS, fx, fy) {
      newS = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newS));
      if (Math.abs(newS - state.scale) < 1e-4) return;
      const k = newS / state.scale;
      state.tx = fx - (fx - state.tx) * k;
      state.ty = fy - (fy - state.ty) * k;
      state.scale = newS;
      clampPan();
      applyTransform();
      updateCursor();
    }
    function zoomBy(factor, fx, fy) {
      const r = box.getBoundingClientRect();
      if (fx === undefined) fx = r.width  / 2;
      if (fy === undefined) fy = r.height / 2;
      zoomTo(state.scale * factor, fx, fy);
    }
    function reset() {
      state.scale = 1; state.tx = 0; state.ty = 0;
      applyTransform();
      updateCursor();
    }
    function setSlider(pct) {
      state.sliderPct = Math.max(0, Math.min(100, pct));
      applySlider();
    }

    function localXY(e) {
      const r = box.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - r.left, y: cy - r.top, w: r.width, h: r.height };
    }

    // wheel zoom
    box.addEventListener("wheel", (e) => {
      e.preventDefault();
      const p = localXY(e);
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      zoomTo(state.scale * factor, p.x, p.y);
    }, { passive: false });

    // dblclick to reset
    box.addEventListener("dblclick", (e) => {
      e.preventDefault();
      reset();
    });

    // pointer handling: knob always = slider; otherwise pan if zoomed, else slider
    let drag = null;
    function onDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      const onKnob = (e.target === knob);
      const isPan  = state.scale > 1.001 && !onKnob;
      const p = localXY(e);
      drag = {
        mode: isPan ? "pan" : "slide",
        startX: p.x, startY: p.y,
        tx: state.tx, ty: state.ty,
        startPct: state.sliderPct,
      };
      if (drag.mode === "slide" && !onKnob) {
        // snap the slider to where the user clicked
        setSlider((p.x / p.w) * 100);
        drag.startPct = state.sliderPct;
        drag.startX = p.x;
      }
      if (drag.mode === "pan") box.classList.add("grabbing");
      if (e.cancelable) e.preventDefault();
    }
    function onMove(e) {
      if (!drag) return;
      const p = localXY(e);
      if (drag.mode === "pan") {
        state.tx = drag.tx + (p.x - drag.startX);
        state.ty = drag.ty + (p.y - drag.startY);
        clampPan();
        applyTransform();
      } else {
        const dxPct = ((p.x - drag.startX) / p.w) * 100;
        setSlider(drag.startPct + dxPct);
      }
    }
    function onUp() {
      drag = null;
      box.classList.remove("grabbing");
    }
    box.addEventListener("mousedown",  onDown);
    box.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove",  onMove, { passive: false });
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("touchend",   onUp);

    applyTransform();
    applySlider();
    updateCursor();

    return {
      box,
      setImages(beforeUrl, afterUrl) {
        imgBefore.src = beforeUrl;
        imgAfter.src  = afterUrl;
      },
      reset, setSlider, zoomBy, zoomTo,
      get state() { return state; },
    };
  }

  // ── strength slider ─────────────────────────────────────────
  function updateStrengthLabel() {
    strengthValue.textContent = Number(strength.value).toFixed(2);
  }
  strength.addEventListener("input", updateStrengthLabel);
  updateStrengthLabel();

  // ── dropzone ────────────────────────────────────────────────
  function setFile(file) {
    currentFile = file;
    if (!file) {
      runBtn.disabled = true;
      dzEmpty.hidden = false;
      dzPreview.hidden = true;
      dzPreview.removeAttribute("src");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      dzPreview.src = e.target.result;
      dzPreview.hidden = false;
      dzEmpty.hidden = true;
    };
    reader.readAsDataURL(file);
    runBtn.disabled = false;
    hideError();
  }
  dz.addEventListener("click", () => fileInput.click());
  dz.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (f) setFile(f);
  });
  ;["dragenter", "dragover"].forEach(evt =>
    dz.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dz.classList.add("dragover");
    })
  );
  ;["dragleave", "drop"].forEach(evt =>
    dz.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dz.classList.remove("dragover");
    })
  );
  dz.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFile(f);
  });

  // ── run / poll ──────────────────────────────────────────────
  function showError(msg) {
    errorLine.textContent = msg;
    errorLine.hidden = false;
  }
  function hideError() {
    errorLine.hidden = true;
    errorLine.textContent = "";
  }
  function setRunning(running) {
    runBtn.disabled = running || !currentFile;
    runBtn.textContent = running ? "Adding detail…" : "Add detail";
    progress.hidden = !running;
    if (!running) progressFill.style.width = "5%";
  }

  async function runJob() {
    if (!currentFile) return;
    hideError();
    setRunning(true);
    resetViewerForRerun();

    const fd = new FormData();
    fd.append("image", currentFile);
    fd.append("detail_strength", String(Number(strength.value)));

    let resp;
    try {
      resp = await fetch(API_BASE + "/api/run", { method: "POST", body: fd }); // REPOINT #2
    } catch (e) {
      setRunning(false); showError("Network error. Try again.");
      return;
    }
    if (!resp.ok) {
      setRunning(false);
      const t = await resp.text().catch(() => "");
      showError(t || `Server returned ${resp.status}`);
      return;
    }
    const data = await resp.json();
    currentJob = data.job_id;
    pollStatus(currentJob);
  }
  runBtn.addEventListener("click", runJob);

  function pollStatus(jobId) {
    if (jobId !== currentJob) return;
    fetch(API_BASE + `/api/status/${jobId}`) // REPOINT #3
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(j => {
        if (jobId !== currentJob) return;
        const pct = Math.max(5, Math.min(98, (j.progress_pct || 0) * 100));
        progressFill.style.width = pct + "%";
        progressDesc.textContent = j.progress_desc || "Working…";
        progressTime.textContent = `${j.elapsed_seconds || 0}s`;
        if (j.status === "done") {
          progressFill.style.width = "100%";
          progressDesc.textContent = "Done";
          showResult(jobId);
        } else if (j.status === "error") {
          setRunning(false);
          showError(j.error || "Job failed");
        } else {
          setTimeout(() => pollStatus(jobId), 600);
        }
      })
      .catch(() => {
        setRunning(false);
        showError("Lost connection to server.");
      });
  }

  // ── result viewer (single slider + zoom) ────────────────────
  const resultCompare = createCompareZoom(viewerStage, {
    large: true,
    onZoomChange: (s) => { vtScale.textContent = Math.round(s * 100) + "%"; },
  });
  vtZoomIn .addEventListener("click", () => resultCompare.zoomBy(1.25));
  vtZoomOut.addEventListener("click", () => resultCompare.zoomBy(1 / 1.25));
  vtReset  .addEventListener("click", () => resultCompare.reset());

  function resetViewerForRerun() {
    fbUp.classList.remove("selected");
    fbDown.classList.remove("selected");
  }
  function showResult(jobId) {
    currentBeforeUrl = dzPreview.src;
    currentAfterUrl  = API_BASE + `/api/result/${jobId}?ts=${Date.now()}`; // REPOINT #4

    resultCompare.setImages(currentBeforeUrl, currentAfterUrl);
    resultCompare.reset();
    resultCompare.setSlider(50);

    viewerEmpty.hidden  = true;
    viewerResult.hidden = false;
    viewerFooter.hidden = false;
    downloadBtn.href    = currentAfterUrl;
    setRunning(false);
  }

  // ── feedback ────────────────────────────────────────────────
  function sendFeedback(rating) {
    if (!currentJob) return;
    const fd = new FormData();
    fd.append("job_id", currentJob);
    fd.append("rating", rating);
    fetch(API_BASE + "/api/feedback", { method: "POST", body: fd }) // REPOINT #5
      .then(r => r.json())
      .then(_ => {
        fbUp.classList.toggle("selected", rating === "up");
        fbDown.classList.toggle("selected", rating === "down");
      })
      .catch(() => {});
  }
  fbUp.addEventListener("click", () => sendFeedback("up"));
  fbDown.addEventListener("click", () => sendFeedback("down"));

  // ── demo gallery ────────────────────────────────────────────
  function renderDemoCard(cat) {
    const card = document.createElement("div");
    card.className = "example-card";
    if (!cat.pairs || cat.pairs.length === 0) {
      card.innerHTML = `
        <div class="example-head">
          <div class="example-title">${cat.label}</div>
          <div class="example-count">add demos to demos/${cat.id}/</div>
        </div>
        <div class="example-blurb">${cat.blurb}</div>
        <div class="cmpz" style="display:flex;align-items:center;justify-content:center;color:#4a4d58;font-size:0.86rem;text-align:center;padding:24px;">
          Drop ${cat.id}/01_before.png + 01_after.png to populate this card
        </div>`;
      return card;
    }

    const head = document.createElement("div");
    head.className = "example-head";
    head.innerHTML = `<div class="example-title">${cat.label}</div>
                      <div class="example-count">${cat.pairs.length} example${cat.pairs.length === 1 ? "" : "s"}</div>`;
    const blurb = document.createElement("div");
    blurb.className = "example-blurb"; blurb.textContent = cat.blurb;

    card.appendChild(head);
    card.appendChild(blurb);

    const compareHost = document.createElement("div");
    compareHost.className = "example-compare-host";
    card.appendChild(compareHost);

    const cz = createCompareZoom(compareHost, { large: false });
    let activeIdx = 0;
    function show(idx) {
      activeIdx = idx;
      const p = cat.pairs[idx];
      cz.setImages(p.before, p.after);
      cz.reset();
      cz.setSlider(50);
    }
    show(0);

    if (cat.pairs.length > 1) {
      const thumbs = document.createElement("div");
      thumbs.className = "example-thumbs";
      cat.pairs.forEach((p, idx) => {
        const t = document.createElement("div");
        t.className = "example-thumb" + (idx === 0 ? " active" : "");
        t.style.backgroundImage = `url('${p.after}')`;
        t.addEventListener("click", () => {
          show(idx);
          [...thumbs.children].forEach((c, j) => c.classList.toggle("active", j === idx));
        });
        thumbs.appendChild(t);
      });
      card.appendChild(thumbs);
    }
    return card;
  }

  fetch("demos.local.json") // REPOINT #6 — demos are static; no backend needed
    .then(r => r.json())
    .then(data => {
      const cats = data.categories || [];
      examplesGrid.innerHTML = "";
      cats.forEach(cat => examplesGrid.appendChild(renderDemoCard(cat)));
    })
    .catch(() => {
      examplesGrid.innerHTML = `<div class="example-empty">Could not load examples.</div>`;
    });
})();
