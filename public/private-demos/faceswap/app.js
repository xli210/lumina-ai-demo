/* ═══════════════════════════════════════════════════════════════
   Face Studio — multi-face swap frontend
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  //  ⇩⇩⇩  REPOINT #0 — set this to YOUR backend's base URL.  ⇩⇩⇩
  //
  //  Leave it "" only if THIS page is served by the same server that
  //  exposes the /v5/api/* routes. To call your own backend, set e.g.:
  //        const API_BASE = "https://api.yourdomain.com";
  //   or   const API_BASE = "/faceswap";         // a path on your site
  //
  //  Your backend must expose these routes (it forwards them to the model
  //  API, adding the secret X-API-Key, and logs 1 credit on each successful
  //  /v5/api/generate):
  //     POST {API_BASE}/v5/api/detect          (multipart: body_image)
  //     POST {API_BASE}/v5/api/generate        (multipart: detection_id, ref_N…)
  //     GET  {API_BASE}/v5/api/status/{jobId}
  //     GET  {API_BASE}/v5/api/result/{jobId}   (returns image/png)
  //     POST {API_BASE}/v5/api/feedback         (optional)
  //     POST {API_BASE}/v5/api/visit            (optional analytics)
  //  Virtual-face templates are fully static (face_templates.local.json).
  //  Masking + manual corrections are 100% client-side (no backend).
  // ══════════════════════════════════════════════════════════════════════
  //
  //  Nanopocket integration:
  //    All calls route through same-origin Next.js proxy routes under
  //    /api/private-demos/faceswap/*. The proxy injects the secret
  //    X-API-Key (never exposed to the browser) and forwards to the
  //    Face Swap upstream tunnel. Admin auth is enforced upstream of
  //    every call by middleware + per-route session check.
  const API_BASE = "/api/private-demos/faceswap";

  const MAX_FACES = 64; // upper bound for the refFiles array; the actual
                        // limit is whatever the backend reports per request
                        // (data.max_faces from /v5/api/detect).

  // ── State ──
  let bodyFile = null;
  let bodyObjectUrl = null;
  let detectionId = null;
  let detectedFaces = [];          // [{ index, bbox_max_dim, thumb_b64, seg_panel_b64, seg_map_b64, present_classes }]
  let refFiles = new Array(MAX_FACES).fill(null);
  // Per-face set of class-ids to preserve from the original image
  // (occlusion preserve). Map<faceIdx:int -> Set<classId:int>>.
  let preserveClasses = new Map();
  // Per-face decoded panel & seg data used to redraw the highlight overlay
  // each time a chip is toggled.
  // Map<faceIdx:int -> { img:HTMLImageElement, classMap:Uint8Array, w:int, h:int, colors:Map<int, [r,g,b]> }>
  let segCache = new Map();
  let polling = null;
  let detectAbort = null;
  let selectedMode = "face_swap"; // "face_swap" | "head_swap" (only used when 1 face)

  // ── DOM refs ──
  const zoneBody = document.getElementById("zone-body");
  const inputBody = document.getElementById("input-body");
  const placeholderBody = document.getElementById("placeholder-body");
  const previewBody = document.getElementById("preview-body");
  const imgBody = document.getElementById("img-body");
  const removeBody = document.getElementById("remove-body");

  const detectStatus = document.getElementById("detect-status");
  const facesStep = document.getElementById("faces-step");
  const facesGrid = document.getElementById("faces-grid");
  const generateStep = document.getElementById("generate-step");
  const modeSection = document.getElementById("mode-section");
  const modeCards = document.querySelectorAll(".v5-mode-card");

  const btnGenerate = document.getElementById("btn-generate");
  const actionHint = document.getElementById("action-hint");

  const progressSection = document.getElementById("progress-section");
  const progressBar = document.getElementById("progress-bar");
  const progressElapsed = document.getElementById("progress-elapsed");

  const resultSection = document.getElementById("result-section");
  const resultTime = document.getElementById("result-time");
  const btnDownload = document.getElementById("btn-download");

  // Feedback widget refs
  const feedbackBar = document.getElementById("feedback-bar");
  const feedbackUp = document.getElementById("feedback-up");
  const feedbackDown = document.getElementById("feedback-down");
  const feedbackThanks = document.getElementById("feedback-thanks");

  // Virtual face library refs (inline 3x3 picker)
  const vfaceInline = document.getElementById("vface-inline");
  const vfaceGrid = document.getElementById("vface-grid");
  const vfaceHint = document.getElementById("vface-inline-hint");

  let currentJobId = null;
  let feedbackSent = false;
  let faceTemplates = [];          // [{ id, url, name }]

  // ── Record visit ──
  fetch(API_BASE + "/v5/api/visit", { method: "POST" }).catch(() => {}); // REPOINT #1

  // ── Mode selector (only relevant when exactly 1 face detected) ──
  modeCards.forEach((card) => {
    card.addEventListener("click", () => {
      modeCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      selectedMode = card.dataset.mode || "face_swap";
      applyOccluderVisibility();
      updateGenButton();
    });
  });

  function updateModeVisibility() {
    const showSelector = detectedFaces.length === 1;
    modeSection.hidden = !showSelector;
    if (!showSelector) {
      // >1 faces (or 0): always face_swap (multi-face pipeline)
      selectedMode = "face_swap";
      modeCards.forEach((c) => {
        c.classList.toggle("active", c.dataset.mode === "face_swap");
      });
    }
    applyOccluderVisibility();
  }

  // Occluder selection is only meaningful for the face_swap pipeline. For
  // head_swap the whole head is regenerated by FLUX + detail-transfer, so
  // pulling pixels back from the body would clash with the new head.
  function applyOccluderVisibility() {
    const hide = selectedMode === "head_swap";
    document.querySelectorAll(".v5-face-occlude").forEach((el) => {
      el.hidden = hide;
    });
  }

  // ── Load + render the inline virtual face library on page load ──
  fetch("face_templates.local.json") // REPOINT #2 — templates are static; no backend
    .then((r) => (r.ok ? r.json() : { templates: [] }))
    .then((d) => {
      faceTemplates = d.templates || [];
      renderVFaceGrid();
    })
    .catch(() => {});

  // ── Body upload zone ──
  zoneBody.addEventListener("click", (e) => {
    if (e.target.closest(".remove-btn")) return;
    inputBody.click();
  });
  inputBody.addEventListener("change", () => {
    if (inputBody.files.length) handleBody(inputBody.files[0]);
  });
  zoneBody.addEventListener("dragover", (e) => {
    e.preventDefault();
    zoneBody.classList.add("dragover");
  });
  zoneBody.addEventListener("dragleave", () => zoneBody.classList.remove("dragover"));
  zoneBody.addEventListener("drop", (e) => {
    e.preventDefault();
    zoneBody.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleBody(e.dataTransfer.files[0]);
  });
  removeBody.addEventListener("click", (e) => {
    e.stopPropagation();
    resetBody();
  });

  function resetBody() {
    bodyFile = null;
    if (bodyObjectUrl) { URL.revokeObjectURL(bodyObjectUrl); bodyObjectUrl = null; }
    detectionId = null;
    detectedFaces = [];
    refFiles = new Array(MAX_FACES).fill(null);
    imgBody.src = "";
    previewBody.hidden = true;
    placeholderBody.hidden = false;
    inputBody.value = "";
    facesStep.hidden = true;
    generateStep.hidden = true;
    vfaceInline.hidden = true;
    facesGrid.innerHTML = "";
    setDetectStatus("_Upload a photo to auto-detect faces._", "");
    resetResultUI();
    updateGenButton();
  }

  function setDetectStatus(text, kind) {
    detectStatus.textContent = text;
    detectStatus.className = "v5-detect-status" + (kind ? " " + kind : "");
  }

  function resetResultUI() {
    progressSection.hidden = true;
    resultSection.hidden = true;
    progressBar.style.width = "0%";
  }

  function handleBody(file) {
    if (!file.type.startsWith("image/")) return;
    bodyFile = file;
    if (bodyObjectUrl) URL.revokeObjectURL(bodyObjectUrl);
    bodyObjectUrl = URL.createObjectURL(file);
    imgBody.src = bodyObjectUrl;
    placeholderBody.hidden = true;
    previewBody.hidden = false;
    detectFaces();
  }

  // ── Detect faces ──
  async function detectFaces() {
    if (detectAbort) detectAbort.abort();
    detectAbort = new AbortController();

    setDetectStatus("Detecting faces…", "");
    facesStep.hidden = true;
    generateStep.hidden = true;
    vfaceInline.hidden = true;
    facesGrid.innerHTML = "";
    detectedFaces = [];
    detectionId = null;
    refFiles = new Array(MAX_FACES).fill(null);
    updateGenButton();

    const fd = new FormData();
    fd.append("body_image", bodyFile);

    try {
      const res = await fetch(API_BASE + "/v5/api/detect", { // REPOINT #3
        method: "POST",
        body: fd,
        signal: detectAbort.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      detectionId = data.detection_id;
      detectedFaces = data.faces || [];

      if (!detectedFaces.length) {
        setDetectStatus("No faces detected. Try a clearer photo with visible faces.", "error");
        return;
      }

      setDetectStatus(
        `${detectedFaces.length} face(s) detected. Upload a reference for any face you want to swap.`,
        "ok"
      );
      renderFaces();
      updateModeVisibility();
      facesStep.hidden = false;
      generateStep.hidden = false;
      // Show the inline 9-face library only if we actually have faces detected.
      if (faceTemplates.length) vfaceInline.hidden = false;
    } catch (e) {
      if (e.name === "AbortError") return;
      setDetectStatus("Detection failed: " + e.message, "error");
    }
  }

  // ── Render face cards (each with its own ref upload) ──
  function renderFaces() {
    facesGrid.innerHTML = "";
    // Reset per-face preserved-class state so a new image starts fresh.
    preserveClasses = new Map();
    segCache = new Map();
    const banner = document.getElementById("occlude-banner");
    const anySeg = detectedFaces.some(
      (f) => !!f.seg_panel_b64 && !!f.seg_map_b64
              && Array.isArray(f.present_classes) && f.present_classes.length > 0
    );
    if (banner) banner.hidden = !anySeg;

    detectedFaces.forEach((f) => {
      const i = f.index;

      // Seed default-preserve set from server-side defaults (the Sapiens
      // wrapper marks hands/arms/hair/etc. as default_preserve=true).
      const defaults = new Set();
      (f.present_classes || []).forEach((c) => {
        if (c.default_preserve) defaults.add(c.id);
      });
      preserveClasses.set(i, defaults);

      const hasSeg =
        !!f.seg_panel_b64 &&
        !!f.seg_map_b64 &&
        Array.isArray(f.present_classes) &&
        f.present_classes.length > 0;

      let segPanelHtml = "";
      if (hasSeg) {
        const toggles = f.present_classes
          .map((c) => {
            const checked = c.default_preserve ? "checked" : "";
            const activeClass = c.default_preserve ? "active" : "";
            const rgb = `rgb(${c.color[0]},${c.color[1]},${c.color[2]})`;
            return `
              <label class="v5-cls-toggle ${activeClass}"
                     data-face-idx="${i}"
                     data-class-id="${c.id}"
                     style="--chip-color:${rgb}"
                     title="${c.area_pct}% of the face panel">
                <span class="v5-cls-swatch" style="background:${rgb}"></span>
                <span class="v5-cls-name">${c.name.replace(/_/g, " ")}</span>
                <span class="v5-cls-switch" aria-hidden="true">
                  <span class="v5-cls-switch-knob"></span>
                </span>
                <input type="checkbox" class="v5-cls-switch-input"
                       data-face-idx="${i}"
                       data-class-id="${c.id}"
                       ${checked}>
              </label>`;
          })
          .join("");
        segPanelHtml = `
          <details class="v5-face-occlude" open>
            <summary>Keep occluders</summary>
            <div class="v5-occlude-body">
              <div class="v5-occlude-overlay">
                <canvas id="seg-canvas-${i}" class="v5-seg-canvas"></canvas>
              </div>
              <div class="v5-cls-toggles" data-face-idx="${i}">${toggles}</div>
            </div>
          </details>`;
      }

      const card = document.createElement("div");
      card.className = "v5-face-card";
      card.dataset.idx = i;
      card.innerHTML = `
        <div class="v5-face-card-head">
          <span class="v5-face-title">Face ${i + 1}</span>
          <span class="v5-face-meta">~${f.bbox_max_dim}px</span>
        </div>
        <div class="v5-face-thumb">
          <img src="data:image/png;base64,${f.thumb_b64}" alt="Face ${i + 1}">
        </div>
        <div class="v5-face-ref-zone" data-idx="${i}">
          <input type="file" accept="image/*" id="ref-input-${i}" hidden>
          <div class="v5-ref-placeholder" id="ref-placeholder-${i}">
            <strong>Reference</strong>
            Click or drop image
          </div>
          <div class="v5-ref-preview" id="ref-preview-${i}" hidden>
            <img id="ref-img-${i}" alt="Ref ${i + 1}">
            <button type="button" class="v5-ref-remove" data-idx="${i}" title="Remove">&times;</button>
          </div>
        </div>
        ${segPanelHtml}
      `;
      facesGrid.appendChild(card);

      // Wire up class-toggle switches for this face.
      card.querySelectorAll(".v5-cls-toggle").forEach((label) => {
        const input = label.querySelector(".v5-cls-switch-input");
        const sync = () => {
          const faceIdx = parseInt(label.dataset.faceIdx, 10);
          const classId = parseInt(label.dataset.classId, 10);
          const set = preserveClasses.get(faceIdx) || new Set();
          if (input.checked) {
            set.add(classId);
            label.classList.add("active");
          } else {
            set.delete(classId);
            label.classList.remove("active");
          }
          preserveClasses.set(faceIdx, set);
          renderSegHighlight(faceIdx);
        };
        input.addEventListener("change", sync);
      });

      // Kick off async load of the panel + seg-map images for this face,
      // then draw the initial highlight overlay (based on the
      // default-preserve chips that are already active).
      if (hasSeg) {
        loadSegForFace(f).then(() => renderSegHighlight(i)).catch((e) => {
          console.warn("Failed to load seg overlay for face", i, e);
        });
      }

      const zone = card.querySelector(".v5-face-ref-zone");
      const input = card.querySelector(`#ref-input-${i}`);
      zone.addEventListener("click", (e) => {
        if (e.target.closest(".v5-ref-remove")) return;
        input.click();
      });
      input.addEventListener("change", () => {
        if (input.files.length) setRef(i, input.files[0]);
      });
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        if (e.dataTransfer.files.length) setRef(i, e.dataTransfer.files[0]);
      });

      const removeBtn = card.querySelector(".v5-ref-remove");
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearRef(i);
      });
    });
  }

  // ── Occlusion seg overlay ──
  // Decode the panel image + seg-map PNG for one face into a flat Uint8
  // class map so we can quickly recolor on every chip toggle.
  function loadSegForFace(face) {
    return new Promise((resolve, reject) => {
      const i = face.index;
      const panel = new Image();
      const segImg = new Image();
      let panelLoaded = false;
      let segLoaded = false;

      function maybeDone() {
        if (!(panelLoaded && segLoaded)) return;
        const w = face.seg_w || panel.naturalWidth;
        const h = face.seg_h || panel.naturalHeight;
        // Read pixel data from the seg-map PNG via an off-screen canvas.
        const tmp = document.createElement("canvas");
        tmp.width = w;
        tmp.height = h;
        const tctx = tmp.getContext("2d");
        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(segImg, 0, 0, w, h);
        const segData = tctx.getImageData(0, 0, w, h).data; // RGBA
        const classMap = new Uint8Array(w * h);
        for (let p = 0; p < w * h; p++) classMap[p] = segData[p * 4]; // R channel

        // Build a lookup of class colors so render is O(1) per pixel.
        const colors = new Map();
        (face.present_classes || []).forEach((c) => colors.set(c.id, c.color));

        segCache.set(i, { img: panel, classMap, w, h, colors });
        resolve();
      }

      panel.onload = () => { panelLoaded = true; maybeDone(); };
      panel.onerror = () => reject(new Error("panel image failed to load"));
      segImg.onload = () => { segLoaded = true; maybeDone(); };
      segImg.onerror = () => reject(new Error("seg-map image failed to load"));

      panel.src = `data:image/png;base64,${face.seg_panel_b64}`;
      segImg.src = `data:image/png;base64,${face.seg_map_b64}`;
    });
  }

  // Re-render the canvas for face `i`: draw the panel desaturated, then
  // overlay the selected classes' regions in their native colors with a
  // crisp boundary so it's obvious what's preserved.
  function renderSegHighlight(i) {
    const cache = segCache.get(i);
    if (!cache) return;
    const canvas = document.getElementById(`seg-canvas-${i}`);
    if (!canvas) return;
    const { img, classMap, w, h, colors } = cache;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // Step 1: base photo, slightly dimmed so the highlights pop.
    ctx.drawImage(img, 0, 0, w, h);
    ctx.fillStyle = "rgba(20, 20, 30, 0.30)";
    ctx.fillRect(0, 0, w, h);

    const selected = preserveClasses.get(i);
    if (!selected || selected.size === 0) return; // nothing to highlight

    // Step 2: paint selected classes in their palette color (semi-transparent
    // so the underlying photo is still visible).
    const base = ctx.getImageData(0, 0, w, h);
    const out = base.data;
    const ALPHA = 0.65;       // overlay opacity per pixel
    const INV = 1.0 - ALPHA;
    for (let p = 0; p < w * h; p++) {
      const cid = classMap[p];
      if (!selected.has(cid)) continue;
      const col = colors.get(cid);
      if (!col) continue;
      const o = p * 4;
      out[o]     = col[0] * ALPHA + out[o] * INV;
      out[o + 1] = col[1] * ALPHA + out[o + 1] * INV;
      out[o + 2] = col[2] * ALPHA + out[o + 2] * INV;
    }
    ctx.putImageData(base, 0, 0);

    // Step 3: outline each selected class for extra visibility.
    drawSelectedOutlines(ctx, classMap, w, h, selected, colors);
  }

  // Quick 1-pixel outline: for each pixel inside a selected class with
  // any neighbor that is NOT in the same class, brighten with the class
  // color. Keeps highlight regions distinguishable when the colors are
  // muted on a photo background.
  function drawSelectedOutlines(ctx, classMap, w, h, selected, colors) {
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        const cid = classMap[p];
        if (!selected.has(cid)) continue;
        const up = classMap[p - w];
        const dn = classMap[p + w];
        const lt = classMap[p - 1];
        const rt = classMap[p + 1];
        if (up === cid && dn === cid && lt === cid && rt === cid) continue;
        const col = colors.get(cid);
        if (!col) continue;
        const o = p * 4;
        data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2];
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function setRef(i, file) {
    if (!file.type.startsWith("image/")) return;
    refFiles[i] = file;
    const card = facesGrid.querySelector(`.v5-face-card[data-idx="${i}"]`);
    const placeholder = document.getElementById(`ref-placeholder-${i}`);
    const preview = document.getElementById(`ref-preview-${i}`);
    const img = document.getElementById(`ref-img-${i}`);
    img.src = URL.createObjectURL(file);
    placeholder.hidden = true;
    preview.hidden = false;
    if (card) card.classList.add("has-ref");
    updateGenButton();
  }

  function clearRef(i) {
    refFiles[i] = null;
    const card = facesGrid.querySelector(`.v5-face-card[data-idx="${i}"]`);
    const placeholder = document.getElementById(`ref-placeholder-${i}`);
    const preview = document.getElementById(`ref-preview-${i}`);
    const img = document.getElementById(`ref-img-${i}`);
    const input = document.getElementById(`ref-input-${i}`);
    img.src = "";
    placeholder.hidden = false;
    preview.hidden = true;
    if (input) input.value = "";
    if (card) card.classList.remove("has-ref");
    updateGenButton();
  }

  // ── Generate button state ──
  function updateGenButton() {
    const selectedCount = refFiles.filter(Boolean).length;
    const ready = bodyFile && detectionId && selectedCount > 0;
    btnGenerate.disabled = !ready;
    if (!bodyFile) {
      actionHint.textContent = "Upload a photo to begin.";
    } else if (!detectionId) {
      actionHint.textContent = "Detecting faces…";
    } else if (selectedCount === 0) {
      actionHint.textContent = "Upload a reference for at least one face to enable Generate.";
    } else if (selectedMode === "head_swap") {
      actionHint.textContent = "Ready: head swap (whole-head replacement, slower).";
    } else {
      actionHint.textContent = `Ready: ${selectedCount} face(s) will be swapped.`;
    }
  }

  // ── Generate ──
  btnGenerate.addEventListener("click", startGeneration);

  async function startGeneration() {
    if (!detectionId) return;
    const selectedCount = refFiles.filter(Boolean).length;
    if (selectedCount === 0) return;

    setProcessing(true);
    progressSection.hidden = false;
    resultSection.hidden = true;
    progressBar.style.width = "0%";
    progressElapsed.textContent = "0s";
    resetFeedback();

    const fd = new FormData();
    fd.append("detection_id", detectionId);
    fd.append("mode", selectedMode);
    // All advanced params left at server defaults; mask dilation default is 20px.
    refFiles.forEach((f, i) => {
      if (f) fd.append(`ref_${i}`, f);
    });

    // Per-face occlusion-preserve picks: { "0": [1,4,15], ... }
    // Head swap regenerates the whole head, so we skip occlusion preserve
    // for that mode -- otherwise we'd paste body pixels back over the new head.
    const preserveObj = {};
    if (selectedMode !== "head_swap") {
      preserveClasses.forEach((classSet, faceIdx) => {
        if (classSet && classSet.size > 0) {
          preserveObj[String(faceIdx)] = [...classSet];
        }
      });
    }
    fd.append("preserve_classes_json", JSON.stringify(preserveObj));

    try {
      const res = await fetch(API_BASE + "/v5/api/generate", { method: "POST", body: fd }); // REPOINT #4
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      pollStatus(data.job_id);
    } catch (err) {
      setProcessing(false);
      actionHint.textContent = "Error: " + err.message;
    }
  }

  function pollStatus(jobId) {
    polling = setInterval(async () => {
      try {
        const res = await fetch(API_BASE + `/v5/api/status/${jobId}`); // REPOINT #5
        const data = await res.json();

        const pct = Math.max(0, Math.min(1, data.progress_pct || 0)) * 100;
        progressBar.style.width = pct.toFixed(1) + "%";
        progressElapsed.textContent = `${(data.elapsed_seconds || 0).toFixed(0)}s`;

        if (data.status === "done") {
          clearInterval(polling);
          polling = null;
          showResult(jobId, data.elapsed_seconds || 0);
          setProcessing(false);
        } else if (data.status === "error") {
          clearInterval(polling);
          polling = null;
          setProcessing(false);
          actionHint.textContent = "Error: " + (data.error || "Generation failed");
        }
      } catch {
        // network blip — keep polling
      }
    }, 1500);
  }

  function showResult(jobId, elapsed) {
    const url = API_BASE + `/v5/api/result/${jobId}?t=${Date.now()}`; // REPOINT #6
    currentJobId = jobId;
    resultTime.textContent = `${elapsed.toFixed(1)}s`;
    resultSection.hidden = false;
    progressBar.style.width = "100%";
    resetFeedback();
    compareView.load(bodyObjectUrl, url).catch((err) => {
      console.warn("compare load failed:", err);
    });
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    actionHint.textContent = "Done!";
  }

  // ────────────────────────────────────────────────────────────────────────
  // Canvas-based before / after compare viewer with synced zoom-and-pan and
  // a brush tool that lets the user "bring back" pixels from the original.
  // All work is done client-side on offscreen-style canvases at the result's
  // native resolution; the visible <canvas> elements are CSS-transformed to
  // implement zoom + pan without re-rasterising.
  // ────────────────────────────────────────────────────────────────────────
  const compareView = (() => {
    let resultImg = null;
    let bodyImg = null;
    let W = 0, H = 0;                       // result resolution
    let bodyCv, maskCv, maskCvAfter, afterCv; // in-DOM canvases (= working canvases)
    let resultBackup = null;                // ImageData snapshot of pristine result
    let paneBefore, paneAfter;
    let contentBefore, contentAfter;
    let brushCursor;

    let baseScale = 1;                      // fit-to-pane scale
    let zoom = 1.0;                         // user zoom multiplier
    let panX = 0, panY = 0;

    let brushOn = false;
    let brushSize = 40;                     // CSS px

    let drag = null;                        // "pan" | "paint" | null
    let lastClientX = 0, lastClientY = 0;
    let lastImgX = 0, lastImgY = 0;

    const elZoom = document.getElementById("cmp-zoom");
    const elZoomVal = document.getElementById("cmp-zoom-val");
    const elBrushToggle = document.getElementById("cmp-brush-toggle");
    const elBrushSize = document.getElementById("cmp-brush-size");
    const elBrushSizeVal = document.getElementById("cmp-brush-size-val");
    const elFit = document.getElementById("cmp-fit");
    const elClear = document.getElementById("cmp-clear");
    const elApply = document.getElementById("cmp-apply");
    const elReset = document.getElementById("cmp-reset");

    function loadImage(url) {
      return new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = (e) => rej(e);
        im.src = url;
      });
    }

    function load(bodyUrl, resultUrl) {
      if (!bodyUrl || !resultUrl) {
        return Promise.reject(new Error("missing body or result url"));
      }
      return Promise.all([loadImage(bodyUrl), loadImage(resultUrl)]).then(
        ([b, r]) => {
          bodyImg = b;
          resultImg = r;
          setup();
        },
      );
    }

    function setup() {
      W = resultImg.naturalWidth;
      H = resultImg.naturalHeight;

      bodyCv = document.getElementById("cmp-body-canvas");
      maskCv = document.getElementById("cmp-mask-canvas");
      maskCvAfter = document.getElementById("cmp-mask-canvas-after");
      afterCv = document.getElementById("cmp-after-canvas");
      paneBefore = document.getElementById("cmp-pane-before");
      paneAfter = document.getElementById("cmp-pane-after");
      contentBefore = document.getElementById("cmp-content-before");
      contentAfter = document.getElementById("cmp-content-after");
      brushCursor = document.getElementById("cmp-brush-cursor");

      [bodyCv, maskCv, maskCvAfter, afterCv].forEach((c) => {
        c.width = W;
        c.height = H;
        c.style.width = W + "px";
        c.style.height = H + "px";
      });

      // Body: scaled to result resolution.
      bodyCv.getContext("2d").drawImage(bodyImg, 0, 0, W, H);
      // After: pristine result.
      const actx = afterCv.getContext("2d");
      actx.clearRect(0, 0, W, H);
      actx.drawImage(resultImg, 0, 0, W, H);
      resultBackup = actx.getImageData(0, 0, W, H);
      // Mask: empty (both copies).
      maskCv.getContext("2d").clearRect(0, 0, W, H);
      maskCvAfter.getContext("2d").clearRect(0, 0, W, H);

      // Pane aspect ratio mirrors the image so both panes are equal-size.
      const aspect = `${W} / ${H}`;
      paneBefore.style.aspectRatio = aspect;
      paneAfter.style.aspectRatio = aspect;

      // Compute fit-scale and centre after layout settles.
      requestAnimationFrame(() => {
        fitToView();
      });

      // First-time wiring (idempotent — guard with a flag on the module).
      if (!_wired) {
        wireControls();
        wireInteractions();
        wireResize();
        _wired = true;
      }
      syncBrushButton();
      updateZoomUI();
      updateBrushUI();
    }

    let _wired = false;

    function fitToView() {
      const pw = paneBefore.clientWidth;
      const ph = paneBefore.clientHeight;
      if (!pw || !ph) return;
      baseScale = Math.min(pw / W, ph / H);
      zoom = 1.0;
      panX = (pw - W * baseScale) / 2;
      panY = (ph - H * baseScale) / 2;
      applyTransforms();
      updateZoomUI();
    }

    function applyTransforms() {
      const s = baseScale * zoom;
      const t = `translate(${panX}px, ${panY}px) scale(${s})`;
      contentBefore.style.transform = t;
      contentAfter.style.transform = t;
    }

    function updateZoomUI() {
      const pct = Math.round(zoom * 100);
      elZoom.value = String(Math.min(500, Math.max(50, pct)));
      elZoomVal.textContent = `${pct}%`;
    }

    function updateBrushUI() {
      elBrushSizeVal.textContent = `${brushSize} px`;
      brushCursor.style.width = brushSize + "px";
      brushCursor.style.height = brushSize + "px";
    }

    function syncBrushButton() {
      elBrushToggle.classList.toggle("cmp-btn-active", brushOn);
      const lab = document.getElementById("cmp-brush-toggle-label");
      if (lab) lab.textContent = brushOn ? "Brush: on" : "Brush: off";
      paneBefore.classList.toggle("cmp-brushing", brushOn);
      brushCursor.hidden = !brushOn;
    }

    function setZoom(newZoom, anchorX, anchorY) {
      newZoom = Math.max(0.5, Math.min(5.0, newZoom));
      const pw = paneBefore.clientWidth;
      const ph = paneBefore.clientHeight;
      const ax = anchorX == null ? pw / 2 : anchorX;
      const ay = anchorY == null ? ph / 2 : anchorY;
      const oldS = baseScale * zoom;
      const newS = baseScale * newZoom;
      panX = ax - (ax - panX) * (newS / oldS);
      panY = ay - (ay - panY) * (newS / oldS);
      zoom = newZoom;
      applyTransforms();
      updateZoomUI();
    }

    function clientToImage(clientX, clientY, pane) {
      const rect = pane.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const s = baseScale * zoom;
      return [(px - panX) / s, (py - panY) / s];
    }

    function paintSegment(x0, y0, x1, y1) {
      const r = brushSize / (baseScale * zoom) / 2; // brush radius in image px
      for (const cv of [maskCv, maskCvAfter]) {
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "rgba(80, 200, 255, 1)";
        ctx.strokeStyle = "rgba(80, 200, 255, 1)";
        ctx.lineWidth = r * 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x1, y1, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function clearMask() {
      maskCv.getContext("2d").clearRect(0, 0, W, H);
      maskCvAfter.getContext("2d").clearRect(0, 0, W, H);
    }

    function applyMask() {
      // 1. Build a FEATHERED copy of the painted mask so the brought-back
      //    region blends smoothly into the existing after composite,
      //    instead of pasting a hard-edged body patch on top.
      //    Feather radius scales with the brush size (a bigger brush implies
      //    the user wants a softer, wider transition).
      const featherPx = Math.max(8, Math.round(brushSize * 0.4));
      const feathered = document.createElement("canvas");
      feathered.width = W;
      feathered.height = H;
      const fctx = feathered.getContext("2d");
      fctx.filter = `blur(${featherPx}px)`;
      fctx.drawImage(maskCv, 0, 0);
      fctx.filter = "none";

      // 2. body * feathered_alpha -> tmp.
      const tmp = document.createElement("canvas");
      tmp.width = W;
      tmp.height = H;
      const tctx = tmp.getContext("2d");
      tctx.drawImage(bodyCv, 0, 0);
      tctx.globalCompositeOperation = "destination-in";
      tctx.drawImage(feathered, 0, 0);

      // 3. Composite over after canvas (source-over respects tmp's alpha,
      //    giving a soft cross-fade between the brought-back body region
      //    and the existing after pixels).
      const actx = afterCv.getContext("2d");
      actx.globalCompositeOperation = "source-over";
      actx.drawImage(tmp, 0, 0);
      clearMask();
    }

    function resetAfter() {
      const actx = afterCv.getContext("2d");
      actx.putImageData(resultBackup, 0, 0);
      clearMask();
    }

    function wireControls() {
      elZoom.addEventListener("input", () => {
        const z = parseInt(elZoom.value, 10) / 100;
        setZoom(z, null, null);
      });
      elFit.addEventListener("click", fitToView);
      elBrushToggle.addEventListener("click", () => {
        brushOn = !brushOn;
        syncBrushButton();
      });
      elBrushSize.addEventListener("input", () => {
        brushSize = parseInt(elBrushSize.value, 10);
        updateBrushUI();
      });
      elClear.addEventListener("click", clearMask);
      elApply.addEventListener("click", applyMask);
      elReset.addEventListener("click", resetAfter);
    }

    function wireInteractions() {
      let activePane = null; // pane being painted on; cursor is anchored here
      const onDown = (e, pane) => {
        e.preventDefault();
        if (brushOn) {
          const [ix, iy] = clientToImage(e.clientX, e.clientY, pane);
          drag = "paint";
          activePane = pane;
          lastImgX = ix;
          lastImgY = iy;
          paintSegment(ix, iy, ix, iy);
        } else {
          drag = "pan";
          lastClientX = e.clientX;
          lastClientY = e.clientY;
          pane.classList.add("cmp-grabbing");
        }
      };
      const onMove = (e) => {
        if (drag === "pan") {
          const dx = e.clientX - lastClientX;
          const dy = e.clientY - lastClientY;
          panX += dx;
          panY += dy;
          lastClientX = e.clientX;
          lastClientY = e.clientY;
          applyTransforms();
        } else if (drag === "paint" && activePane) {
          const [ix, iy] = clientToImage(e.clientX, e.clientY, activePane);
          paintSegment(lastImgX, lastImgY, ix, iy);
          lastImgX = ix;
          lastImgY = iy;
        }
        if (brushOn) {
          // Anchor cursor to whichever pane the mouse is over; brushCursor is
          // a child of paneBefore so we always position it relative to its
          // own rect, but move it (visually) to the pane currently hovered.
          const overPane = elementUnderPane(e.clientX, e.clientY);
          if (overPane) {
            const rect = overPane.getBoundingClientRect();
            // Re-parent brushCursor on the fly so it sits inside the hovered pane.
            if (brushCursor.parentNode !== overPane) {
              overPane.appendChild(brushCursor);
            }
            brushCursor.hidden = false;
            brushCursor.style.left = e.clientX - rect.left + "px";
            brushCursor.style.top = e.clientY - rect.top + "px";
          } else {
            brushCursor.hidden = true;
          }
        }
      };
      const onUp = () => {
        drag = null;
        activePane = null;
        paneBefore.classList.remove("cmp-grabbing");
        paneAfter.classList.remove("cmp-grabbing");
      };
      const onWheel = (e, pane) => {
        e.preventDefault();
        const rect = pane.getBoundingClientRect();
        const ax = e.clientX - rect.left;
        const ay = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        setZoom(zoom * factor, ax, ay);
      };

      function elementUnderPane(cx, cy) {
        const inPane = (p) => {
          const r = p.getBoundingClientRect();
          return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
        };
        if (inPane(paneBefore)) return paneBefore;
        if (inPane(paneAfter)) return paneAfter;
        return null;
      }

      paneBefore.addEventListener("pointerdown", (e) => onDown(e, paneBefore));
      paneAfter.addEventListener("pointerdown", (e) => onDown(e, paneAfter));
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      paneBefore.addEventListener("wheel", (e) => onWheel(e, paneBefore), { passive: false });
      paneAfter.addEventListener("wheel", (e) => onWheel(e, paneAfter), { passive: false });
      [paneBefore, paneAfter].forEach((p) => {
        p.classList.add("cmp-pane-clip");
        p.addEventListener("pointerleave", () => {
          if (drag !== "paint") brushCursor.hidden = true;
        });
      });
    }

    function wireResize() {
      window.addEventListener("resize", () => {
        if (!W) return;
        const oldFitW = baseScale;
        const pw = paneBefore.clientWidth;
        const ph = paneBefore.clientHeight;
        const newFitW = Math.min(pw / W, ph / H);
        if (Math.abs(newFitW - oldFitW) < 1e-6) return;
        // Keep the same screen-centre point in image coords.
        baseScale = newFitW;
        applyTransforms();
      });
    }

    function getAfterDataUrl() {
      return afterCv ? afterCv.toDataURL("image/png") : null;
    }

    return { load, getAfterDataUrl };
  })();

  // Wire download to export the current after composite (post-bring-back).
  if (btnDownload) {
    btnDownload.addEventListener("click", (e) => {
      const url = compareView.getAfterDataUrl();
      if (url) btnDownload.href = url;
    });
  }

  function setProcessing(on) {
    const btnText = btnGenerate.querySelector(".btn-text");
    const btnLoader = btnGenerate.querySelector(".btn-loader");
    if (on) {
      btnGenerate.classList.add("processing");
      btnText.hidden = true;
      btnLoader.hidden = false;
      btnGenerate.disabled = true;
    } else {
      btnGenerate.classList.remove("processing");
      btnText.hidden = false;
      btnLoader.hidden = true;
      updateGenButton();
    }
  }

  // ── Feedback (thumbs up / down) ──
  function resetFeedback() {
    feedbackSent = false;
    feedbackUp.classList.remove("selected");
    feedbackDown.classList.remove("selected");
    feedbackUp.disabled = false;
    feedbackDown.disabled = false;
    feedbackThanks.hidden = true;
  }

  async function sendFeedback(rating) {
    if (feedbackSent || !currentJobId) return;
    feedbackSent = true;

    if (rating === "up") {
      feedbackUp.classList.add("selected");
    } else {
      feedbackDown.classList.add("selected");
    }
    feedbackUp.disabled = true;
    feedbackDown.disabled = true;

    try {
      const fd = new FormData();
      fd.append("job_id", currentJobId);
      fd.append("rating", rating);
      const res = await fetch(API_BASE + "/v5/api/feedback", { method: "POST", body: fd }); // REPOINT #7
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      feedbackThanks.hidden = false;
    } catch (e) {
      // allow retry on transient failure
      feedbackSent = false;
      feedbackUp.disabled = false;
      feedbackDown.disabled = false;
      feedbackUp.classList.remove("selected");
      feedbackDown.classList.remove("selected");
      console.warn("feedback failed", e);
    }
  }

  feedbackUp.addEventListener("click", () => sendFeedback("up"));
  feedbackDown.addEventListener("click", () => sendFeedback("down"));

  // ── Inline virtual face library (3x3 grid) ──
  function renderVFaceGrid() {
    if (!faceTemplates.length) {
      vfaceGrid.innerHTML = '<p class="vface-empty">No virtual faces available.</p>';
      return;
    }
    // No loading="lazy" — we want all 9 thumbnails visible immediately.
    vfaceGrid.innerHTML = faceTemplates
      .map(
        (t) => `
          <button type="button" class="vface-cell" data-id="${t.id}" title="${t.name}">
            <img src="${t.url}" alt="${t.name}">
          </button>
        `,
      )
      .join("");

    vfaceGrid.querySelectorAll(".vface-cell").forEach((btn) => {
      btn.addEventListener("click", () => useTemplate(btn.dataset.id, btn));
    });
  }

  async function useTemplate(id, btn) {
    const tpl = faceTemplates.find((t) => t.id === id);
    if (!tpl) return;

    // Pick target slot: first detected face whose ref is empty; if all are
    // filled, replace face 0 (so re-clicking templates lets the user iterate).
    let target = null;
    for (const f of detectedFaces) {
      if (!refFiles[f.index]) { target = f.index; break; }
    }
    if (target == null && detectedFaces.length) target = detectedFaces[0].index;
    if (target == null) {
      vfaceHint.textContent = "Upload a body photo first to detect faces.";
      return;
    }

    if (btn) btn.classList.add("loading");
    try {
      const res = await fetch(tpl.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], tpl.name, {
        type: blob.type || "image/png",
      });
      setRef(target, file);
      vfaceHint.textContent = `Used as reference for Face ${target + 1}.`;
    } catch (e) {
      console.warn("Failed to load template", e);
      vfaceHint.textContent = "Couldn't load that virtual face — try another.";
    } finally {
      if (btn) btn.classList.remove("loading");
    }
  }

  // initial state
  updateGenButton();
})();
