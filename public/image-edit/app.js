"use strict";
// Nano ImageEdit 2.0 Online console. Adapted from the image-edit-studio package: the page talks to
// /api/imageedit/* on nanopocket.ai (sign-in + credits), photos go browser -> R2 on a presigned PUT, and
// results come back as redirects to presigned R2 GETs. See docs/image-edit.md.
const $ = (id) => document.getElementById(id);
const API = "/api/imageedit";
const COST = 50; // credits per edit; the server is the source of truth (lib/imageedit.ts)
const MAX_SIDE = 4096; // long side after in-browser re-encode; iOS cannot allocate a larger canvas
const KEEP = " Keep everything else in the image exactly the same.";

// ------------------------------------------------------------------ tools
const ICONS = {
  magic: '<path d="m15 4 5 5L9 20H4v-5z"/><path d="m13 6 5 5"/><path d="M19 15v4M17 17h4M5 3v4M3 5h4"/>',
  add: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
  remove: '<path d="m7 21-4-4a2 2 0 0 1 0-2.8L13.2 4a2 2 0 0 1 2.8 0L20 8a2 2 0 0 1 0 2.8L11 20"/><path d="M22 21H7M9 11l6 6"/>',
  replace: '<path d="M4 7h11l-3-3M20 17H9l3 3"/><path d="M20 7v4M4 17v-4"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  style: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  season: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.2-6.1 2.4-.5 4.8-2 5.8-3.9"/>',
  restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
};
const PRESETS = {
  style: [
    ["Golden hour", "Change the lighting to golden hour just before sunset: warm, low sunlight, long soft shadows and a warm orange-pink sky. Keep all objects and details exactly the same.", "linear-gradient(135deg,#f7b267,#f25c54)"],
    ["Moonlit night", "Turn this scene into a moonlit night: a dark blue night sky, everything softly lit by moonlight. Keep the scene and composition exactly the same.", "linear-gradient(135deg,#0f2027,#2c5364)"],
    ["Foggy morning", "Make it an early foggy morning with soft, diffused light and mist. Keep all objects and the composition exactly the same.", "linear-gradient(135deg,#bdc3c7,#6c7a89)"],
    ["Teal & orange", "Apply a moody cinematic teal-and-orange color grade to the photo. Keep all content exactly the same.", "linear-gradient(135deg,#136a8a,#f39c12)"],
    ["Black & white film", "Convert the photo to a rich black-and-white film look with deep contrast. Keep all content exactly the same.", "linear-gradient(135deg,#ddd,#222)"],
    ["Blue hour", "Change the lighting to blue hour just after sunset: a deep blue sky, soft cool ambient light and warm glowing windows and street lights. Keep all objects and the composition exactly the same.", "linear-gradient(135deg,#1e3c72,#f5af19)"],
  ],
  season: [
    ["Autumn", "Change the season to autumn: the trees have orange, red and yellow leaves, with fallen leaves on the ground. Keep the composition exactly the same.", "linear-gradient(135deg,#d35400,#f1c40f)"],
    ["Winter snow", "Change the season to winter: snow covering the ground, snow on the trees and roofs, and an overcast winter sky. Keep the composition exactly the same.", "linear-gradient(135deg,#e6f0ff,#8fa9c9)"],
    ["Spring blossom", "Change the season to spring: fresh light-green leaves and trees in pink and white blossom, soft spring sunlight. Keep the composition exactly the same.", "linear-gradient(135deg,#fbc2eb,#a6e3a1)"],
    ["Lush summer", "Change the season to midsummer: lush deep-green trees and grass, bright sunlight and a clear blue sky. Keep the composition exactly the same.", "linear-gradient(135deg,#56ab2f,#4facfe)"],
  ],
  restore: [
    ["Restore damage", "Restore this damaged old photograph: remove the spots, scratches, stains and damaged borders, improve the contrast, and colorize it with natural, realistic colors. Keep the composition exactly the same.", "linear-gradient(135deg,#8e6e53,#d9c3a5)"],
    ["Colorize", "Colorize this old photograph with natural, realistic colors and fix the faded contrast. Keep all people, objects and the composition exactly the same.", "linear-gradient(135deg,#6a5d4d,#e07a5f,#3d85c6)"],
  ],
};
const TOOLS = {
  magic: { name: "Magic Edit", desc: "Paint over an area and describe what it should become, or describe a change to the whole photo.", brush: true,
    placeholder: "Describe what the painted area should become…",
    chips: ["Make it bright red", "Turn it into a wooden bench", "Replace it with a potted plant", "Make it look brand new", "Add a warm lamp glow"] },
  add: { name: "Add", desc: "Add a new object. It's detected automatically after generation; paint an area to limit where it can go.", brush: true,
    fields: [["what", "What to add", "e.g. a golden retriever sitting on the grass"], ["extra", "Extra details (optional)", "e.g. include its reflection on the water"]],
    chips: [["a golden retriever sitting on the grass, looking at the camera"], ["a small red wooden canoe on the calm water"], ["a clear glass vase with pink tulips on the table"], ["a flock of birds flying in the sky"]] },
  remove: { name: "Remove", desc: "Remove objects or people. The background behind them is filled in naturally.", brush: true,
    fields: [["what", "What to remove", "e.g. the bicycle leaning on the wall"], ["extra", "Extra details (optional)", "e.g. fill in the floor naturally"]],
    chips: [["all the people in the background"], ["the bicycle"], ["the power lines and cables"], ["the parked cars"]] },
  replace: { name: "Replace", desc: "Swap one object for another in the same place.", brush: true,
    fields: [["what", "Replace this", "e.g. the banana"], ["with_", "With this", "e.g. a bunch of purple grapes"], ["extra", "Extra details (optional)", "e.g. keep the bowl the same"]],
    chips: [["the banana", "a bunch of purple grapes"], ["the yellow car", "a red vintage Volkswagen Beetle"], ["the wooden chair", "a modern white armchair"]] },
  text: { name: "Text", desc: "Change text on signs, packaging or posters, keeping the original font style and perspective.", brush: true,
    fields: [["what", "Current text", "e.g. Latin Barber Shop"], ["with_", "New text", "e.g. Nano Barber Shop"], ["extra", "Extra details (optional)", "e.g. keep the same 3D letter style"]],
    chips: [["Latin Barber Shop", "Nano Barber Shop"], ["CITI TRENDS", "NANO TRENDS"]] },
  style: { name: "Light & Style", desc: "Relight or color-grade the whole photo. Your original detail is kept; only color and light change.", global: true },
  season: { name: "Season", desc: "Change the season. New content (leaves, snow) comes from the model; everything else keeps your detail.", global: true },
  restore: { name: "Restore", desc: "Repair old or damaged photos: remove scratches and stains, fix contrast and colorize.", global: true },
};
const TOOL_ORDER = ["magic", "add", "remove", "replace", "text", "|", "style", "season", "restore"];

// ------------------------------------------------------------------ state
const S = {
  versions: [], byId: {}, current: null, redo: [], tool: "magic", view: "result", tempView: null,
  fields: {}, area: "brush", brushMode: "limit", merge: "auto", preset: {}, variations: 1, seed: 42, randomSeed: true,
  hints: { gate_in: "", gate_out: "" }, hintsTouched: false,
  zoom: { s: 1, x: 0, y: 0, fit: true }, brush: "paint", brushSize: 60, hasPaint: false, maskDirty: false, space: false, cmp: 0.5,
  docName: "",
};
for (const t in TOOLS) S.fields[t] = { what: "", with_: "", extra: "" };

// ------------------------------------------------------------------ helpers
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const icon = (name) => el("span", { html: `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>`, style: "display:contents" });
function toast(msg, kind = "", link = null) {
  const t = el("div", { class: `toast ${kind}` }, msg,
    link ? el("a", { href: link.href, style: "margin-left:8px;color:inherit;text-decoration:underline" }, link.label) : null);
  $("toasts").append(t);
  setTimeout(() => t.remove(), kind === "err" ? (link ? 12000 : 7000) : 4500);
}
let credits = null;
function setCredits(n) {
  if (typeof n !== "number") return;
  credits = n;
  const p = $("creditsPill");
  if (p) p.textContent = `${n} credits`;
}
async function refreshCredits() {
  try {
    const r = await fetch("/api/credits/balance", { cache: "no-store" });
    if (r.ok) setCredits((await r.json()).available);
  } catch (_) { /* the pill is cosmetic; the server enforces */ }
}
class ApiError extends Error {
  constructor(msg, status, body) { super(msg); this.status = status; this.body = body; }
}
async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  if (!r.ok) {
    let body = {};
    try { body = await r.json(); } catch (_) { /* keep default */ }
    if (r.status === 401) { location.href = "/auth/login?next=/image-edit/launch"; }
    if (r.status === 402 && typeof body.available === "number") setCredits(body.available);
    throw new ApiError(body.detail || `Request failed (${r.status})`, r.status, body);
  }
  return r.json();
}
function showError(e) {
  if (e && e.status === 402) toast(e.message, "err", { href: "/credits", label: "Buy credits" });
  else toast(e.message, "err");
}
const cur = () => S.byId[S.current];
const parentOf = (v) => (v && v.parent ? S.byId[v.parent] : null);
const fmtEta = (s) => (s >= 60 ? `~${Math.floor(s / 60)} min ${Math.round(s % 60)} s left` : `~${Math.max(1, Math.round(s))} s left`);
const shortPrompt = (p) => (p || "").replace(KEEP, "").replace(/ Keep (all|everything|the scene|the composition).*$/i, "").trim();

function buildPrompt(tool, f) {
  const what = f.what.trim(), with_ = f.with_.trim();
  const extra = f.extra.trim() ? " " + f.extra.trim().replace(/\.$/, "") + "." : "";
  let p;
  if (tool === "add") p = `Add ${what || "the object"}.${extra}`;
  else if (tool === "replace") p = `Replace ${what || "the object"} with ${with_ || "the new object"}, in the same place.${extra}`;
  else if (tool === "remove") p = `Remove ${what || "the object"}, revealing the background behind it naturally.${extra}`;
  else if (tool === "text") p = what && with_ ? `Change the text "${what}" to "${with_}", keeping the same font style, colors and perspective.${extra}` : `Add the text "${with_ || what}".${extra}`;
  else return null;
  return p + KEEP;
}
function defaultGates(tool, f) {
  const what = f.what.trim(), with_ = f.with_.trim();
  return { add: ["", what], remove: [what, ""], replace: [what, with_], text: ["text, letters on a sign", "text, letters on a sign"] }[tool] || ["", ""];
}

// ------------------------------------------------------------------ rail + panel
function renderRail() {
  const rail = $("rail");
  rail.innerHTML = "";
  for (const t of TOOL_ORDER) {
    if (t === "|") { rail.append(el("div", { class: "sep" })); continue; }
    rail.append(el("button", { class: `tool ${S.tool === t ? "on" : ""}`, title: TOOLS[t].desc, onclick: () => setTool(t) },
      icon(t), TOOLS[t].name.replace("Light & Style", "Light")));
  }
}

function setTool(t) {
  S.tool = t;
  S.hintsTouched = false;
  if (TOOLS[t].global && !S.preset[t]) S.preset[t] = PRESETS[t][0][0];
  S.brush = defaultBrush();
  renderRail();
  renderPanel();
  refreshPrompt(true);
  renderChips();
  updateCursor();
  renderMaskVisibility();
}

// Magic Edit's painted area is required, so it starts with the brush; elsewhere painting is optional and the
// pointer starts as a plain move/zoom cursor until Brush or Erase is picked.
const defaultBrush = () => (S.tool === "magic" && S.area === "brush" && !S.hasPaint ? "paint" : null);

function brushCard(title, withMode) {
  const card = el("div", { class: "card" }, el("div", { class: "card-title" }, title,
    S.hasPaint ? el("button", { class: "link", onclick: () => { clearMask(); renderPanel(); } }, "Clear") : null));
  const bt = el("div", { class: "brush-tools" });
  for (const [m, label, ic] of [["paint", "Brush", "B"], ["erase", "Erase", "E"]]) {
    bt.append(el("button", { class: S.brush === m ? "on" : "", "data-brush": m, title: `${label} (${ic}) · click again to stop`,
      onclick: () => setBrush(S.brush === m ? null : m) }, label));
  }
  card.append(bt);
  const range = el("input", { type: "range", min: 8, max: 300, value: S.brushSize, oninput: (e) => { S.brushSize = +e.target.value; } });
  card.append(el("div", { class: "range" }, "Size", range));
  card.append(el("div", { class: "hint", style: "font-size:12px;color:var(--muted);margin-top:8px" },
    S.brush ? "Painting. Click the button again or press Esc to go back to moving the photo."
      : "Pick Brush to paint. Until then, drag moves the photo and scroll zooms."));
  if (withMode && S.hasPaint) {
    const seg = el("div", { class: "seg full", style: "margin-top:10px" });
    for (const [m, label] of [["limit", "Limit auto mask"], ["only", "Only brushed area"]]) {
      seg.append(el("button", { class: S.brushMode === m ? "on" : "", onclick: () => { S.brushMode = m; renderPanel(); } }, label));
    }
    card.append(seg);
    card.append(el("div", { class: "hint", style: "font-size:12px;color:var(--muted);margin-top:6px" },
      S.brushMode === "limit" ? "The edit is found automatically, but only inside what you paint." : "Exactly the painted area is replaced."));
  }
  return card;
}

function renderPanel() {
  const t = S.tool, T = TOOLS[t], p = $("panel");
  p.innerHTML = "";
  p.append(el("h3", {}, T.name), el("p", { class: "desc" }, T.desc));

  if (t === "magic") {
    const seg = el("div", { class: "seg full", style: "margin-bottom:14px" });
    for (const [a, label] of [["brush", "Painted area"], ["image", "Entire image"]]) {
      seg.append(el("button", { class: S.area === a ? "on" : "", onclick: () => { S.area = a; S.brush = defaultBrush(); renderPanel(); refreshPrompt(); renderMaskVisibility(); updateCursor(); } }, label));
    }
    p.append(el("div", { class: "label" }, "Where to edit"), seg);
    if (S.area === "brush") {
      p.append(brushCard("Paint the area to change", false));
      p.append(el("div", { class: "tip", html: "<b>Tip:</b> paint a little beyond the object's edges, including its shadow. Everything outside the painted area stays pixel-identical." }));
    } else {
      p.append(el("div", { class: "tip", html: "<b>Whole-photo edit.</b> Color and light come from the model, fine detail from your photo where structure didn't change." }));
    }
  }

  if (T.fields) {
    for (const [k, label, ph] of T.fields) {
      const input = el("input", { type: "text", placeholder: ph, value: S.fields[t][k] });
      input.addEventListener("input", () => { S.fields[t][k] = input.value; refreshPrompt(); });
      p.append(el("div", { class: "field" }, el("label", {}, label), input));
    }
    p.append(brushCard("Limit to an area (optional)", true));
  }

  if (T.global) {
    const grid = el("div", { class: "presets" });
    for (const [name, prompt, bg] of PRESETS[t]) {
      grid.append(el("button", { class: `preset ${S.preset[t] === name ? "on" : ""}`, style: `background:${bg}`,
        onclick: () => { S.preset[t] = name; $("prompt").value = prompt; renderPanel(); } }, name));
    }
    p.append(el("div", { class: "field" }, el("label", {}, "Presets"), grid,
      el("div", { class: "hint" }, "Pick one, or write your own in the prompt bar below.")));
    const seg = el("div", { class: "seg full" });
    for (const [m, label] of [["auto", "Auto"], ["tone", "Tone"], ["hybrid", "Hybrid"], ["raw", "Raw"]]) {
      seg.append(el("button", { class: S.merge === m ? "on" : "", onclick: () => { S.merge = m; renderPanel(); } }, label));
    }
    const help = { auto: "Picks Tone for pure color/light edits and Hybrid when new content appears.",
      tone: "The model's color and light on your original pixels. Maximum detail.",
      hybrid: "Your detail where the structure survived; the model's pixels where it created new content.",
      raw: "The model's output everywhere, aligned to your photo." }[S.merge];
    p.append(el("div", { class: "field" }, el("label", {}, "How to blend the result"), seg, el("div", { class: "hint" }, help)));
    p.append(el("div", { class: "tip", html: "You can switch between Tone, Hybrid and Raw after it's done, without regenerating." }));
  }

  const adv = el("details", {}, el("summary", {}, "Advanced"));
  const seedIn = el("input", { type: "number", value: S.seed, style: "width:110px", oninput: (e) => { S.seed = parseInt(e.target.value || "0", 10); } });
  const rnd = el("input", { type: "checkbox", ...(S.randomSeed ? { checked: "" } : {}), onchange: (e) => { S.randomSeed = e.target.checked; } });
  adv.append(el("div", { class: "field" }, el("label", {}, "Seed"), el("div", { class: "row2" }, seedIn, el("label", { class: "check" }, rnd, "New seed each time"))));
  if (T.fields) {
    const gi = el("input", { type: "text", value: S.hints.gate_in, placeholder: "comma separated" });
    const go = el("input", { type: "text", value: S.hints.gate_out, placeholder: "comma separated" });
    gi.addEventListener("input", () => { S.hints.gate_in = gi.value; S.hintsTouched = true; });
    go.addEventListener("input", () => { S.hints.gate_out = go.value; S.hintsTouched = true; });
    adv.append(el("div", { class: "field" }, el("label", {}, "Detect on the original (things that disappear or change)"), gi),
      el("div", { class: "field" }, el("label", {}, "Detect on the result (things that appear)"), go,
        el("div", { class: "hint" }, "Filled in from your fields. These decide where the edit is pasted into your photo.")));
    S._hintInputs = [gi, go];
  } else S._hintInputs = null;
  p.append(adv);
  autosize();
}

function refreshPrompt(toolChanged = false) {
  const t = S.tool, T = TOOLS[t], pr = $("prompt");
  if (T.fields) {
    pr.value = buildPrompt(t, S.fields[t]);
    if (!S.hintsTouched) {
      const [gi, go] = defaultGates(t, S.fields[t]);
      S.hints = { gate_in: gi, gate_out: go };
      if (S._hintInputs) { S._hintInputs[0].value = gi; S._hintInputs[1].value = go; }
    }
    pr.placeholder = "Filled in from the fields on the left; you can edit it.";
  } else if (T.global) {
    if (toolChanged) pr.value = PRESETS[t].find((x) => x[0] === S.preset[t])[1];
    pr.placeholder = "Describe the look you want…";
  } else {
    if (toolChanged) pr.value = "";
    pr.placeholder = S.area === "image" ? "Describe the change to the whole photo…" : T.placeholder;
  }
  autosize();
}

function renderChips() {
  const t = S.tool, T = TOOLS[t], c = $("chips");
  c.innerHTML = "";
  if (T.global) {
    for (const [name, prompt] of PRESETS[t]) c.append(el("button", { class: "chip", onclick: () => { S.preset[t] = name; $("prompt").value = prompt; renderPanel(); } }, name));
  } else if (T.fields) {
    for (const ex of T.chips) {
      c.append(el("button", { class: "chip", onclick: () => {
        S.fields[t].what = ex[0]; S.fields[t].with_ = ex[1] || ""; S.hintsTouched = false;
        renderPanel(); refreshPrompt();
      } }, ex.length > 1 ? `${ex[0]} → ${ex[1]}` : ex[0]));
    }
  } else {
    for (const ex of T.chips) c.append(el("button", { class: "chip", onclick: () => { $("prompt").value = ex; autosize(); $("prompt").focus(); } }, ex));
  }
}

// ------------------------------------------------------------------ document / upload
// Fix orientation (EXIF), cap the long side, and re-encode as PNG: the editor's worker reads a PNG source.
async function ingest(file) {
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (_) { bmp = await createImageBitmap(file); }
  const s = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(bmp, 0, 0, w, h);
  if (bmp.close) bmp.close();
  const blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Could not read that image."))), "image/png"));
  return { blob, w, h };
}
async function uploadFile(file) {
  if (!file || !file.type.startsWith("image/")) { toast("Please choose an image file.", "err"); return; }
  if (file.size > 40e6) { toast("That image is larger than 40 MB.", "err"); return; }
  toast("Preparing your photo…");
  try {
    const { blob, w, h } = await ingest(file);
    const ticket = await api(`${API}/uploads`, { method: "POST" });
    toast("Uploading…");
    const put = await fetch(ticket.put_url, { method: "PUT", body: blob, headers: { "Content-Type": "image/png" } });
    if (!put.ok) throw new Error(`Upload failed (${put.status}). Please try again.`);
    const url = URL.createObjectURL(blob);
    startDoc({ id: ticket.id, key: ticket.key, w, h, url, thumb: url, png: url }, file.name || "photo.png");
  } catch (e) { showError(e); }
}
let SAMPLES = [];
function useSample(name) {
  const s = SAMPLES.find((x) => x.name === name);
  if (!s) return;
  const url = `/image-edit/samples/${name}.jpg`;
  // The PNG the worker edits is pre-uploaded at this key, so a sample needs no upload.
  startDoc({ id: `sample_${name}`, key: `imageedit/samples/${name}.png`, w: s.w, h: s.h, url, thumb: `/image-edit/samples/${name}_t.jpg`, png: url }, `${name}.png`);
}
function startDoc(img, name) {
  S.versions = []; S.byId = {}; S.redo = []; S.docName = name;
  addVersion({ id: "v0", n: 0, parent: null, tool: "original", title: "Original", prompt: "Your photo", image: img, status: "done" });
  S.current = "v0";
  $("empty").classList.add("hidden");
  const mc = $("maskCanvas"), s = Math.min(1, 2048 / Math.max(img.w, img.h));
  mc.width = Math.round(img.w * s); mc.height = Math.round(img.h * s);
  clearMask();
  S.brush = defaultBrush();
  renderPanel();
  const c = $("canvas");
  c.style.width = img.w + "px"; c.style.height = img.h + "px";
  S.zoom.fit = true;
  S.view = "result";
  render();
  fit();
}
function addVersion(v) { S.versions.push(v); S.byId[v.id] = v; }

// ------------------------------------------------------------------ canvas: zoom / pan / views
function applyZoom() {
  const { s, x, y } = S.zoom, c = $("canvas");
  c.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  c.style.setProperty("--inv", 1 / s);
  $("zoomVal").textContent = S.zoom.fit ? "Fit" : `${Math.round(s * 100)}%`;
  document.querySelectorAll(".cmp-tag, .cmp-knob").forEach((e) => {
    e.style.transform = (e.classList.contains("cmp-knob") ? "translate(-50%,-50%) " : "") + `scale(${1 / s})`;
  });
  document.querySelector(".cmp-tag.right").style.transformOrigin = "100% 0";
  $("cmpLine").style.width = `${2 / s}px`;
}
function fit() {
  const v = cur(); if (!v) return;
  const vp = $("viewport").getBoundingClientRect(), { w, h } = v.image;
  const s = Math.min((vp.width - 48) / w, (vp.height - 48) / h);
  S.zoom = { s, x: (vp.width - w * s) / 2, y: (vp.height - h * s) / 2, fit: true };
  applyZoom();
}
function zoomAt(ns, px, py) {
  const z = S.zoom;
  ns = Math.min(8, Math.max(0.03, ns));
  z.x = px - (px - z.x) * (ns / z.s); z.y = py - (py - z.y) * (ns / z.s); z.s = ns; z.fit = false;
  applyZoom();
}
function zoomCenter(f) { const vp = $("viewport").getBoundingClientRect(); zoomAt(S.zoom.s * f, vp.width / 2, vp.height / 2); }

function effectiveView() {
  const v = cur();
  if (!v || v.status !== "done" || !v.parent) return "result";
  return S.tempView || S.view;
}
function renderCanvas() {
  const v = cur(); if (!v) return;
  const par = parentOf(v), view = effectiveView(), base = $("imgBase"), top = $("imgTop"), c = $("canvas");
  const shown = v.status === "done" ? v : par;
  c.classList.toggle("compare", view === "compare");
  top.style.clipPath = "";
  base.style.display = "none";
  if (view === "compare") {
    base.src = par.image.url; base.style.display = "";
    top.src = v.image.url;
    top.style.clipPath = `inset(0 0 0 ${S.cmp * 100}%)`;
    $("cmpLine").style.left = `${S.cmp * 100}%`;
  } else if (view === "before") top.src = par.image.url;
  else if (view === "changes") top.src = v.changes;
  else top.src = shown.image.url;
  document.querySelectorAll("#viewSeg button").forEach((b) => {
    b.classList.toggle("on", b.dataset.view === view);
    b.disabled = !(v.status === "done" && v.parent) && b.dataset.view !== "result";
  });
  renderMaskVisibility();
}
function renderMaskVisibility() {
  const T = TOOLS[S.tool];
  const show = !!cur() && T.brush && !(S.tool === "magic" && S.area === "image") && effectiveView() === "result";
  $("maskCanvas").style.display = show ? "" : "none";
}
function setView(view) { S.view = view; renderCanvas(); }

// ------------------------------------------------------------------ brush
const brushActive = () => TOOLS[S.tool].brush && !(S.tool === "magic" && S.area === "image") && !!S.brush && !S.space && !!cur();
function setBrush(m) {
  if (m && !(TOOLS[S.tool].brush && !(S.tool === "magic" && S.area === "image"))) return;
  S.brush = m;
  if (m && effectiveView() !== "result") setView("result");
  renderPanel();
  updateCursor();
}
function updateCursor() {
  const vp = $("viewport");
  vp.classList.toggle("brush", brushActive());
  vp.classList.toggle("pan", !brushActive());
  $("brushCursor").classList.toggle("erase", S.brush === "erase");
  if (!brushActive()) $("brushCursor").style.display = "none";
}
function clearMask() {
  const mc = $("maskCanvas");
  mc.getContext("2d").clearRect(0, 0, mc.width, mc.height);
  S.maskDirty = false;
  S.hasPaint = false;
}
function nearDivider(e) {
  if (effectiveView() !== "compare") return false;
  const r = $("canvas").getBoundingClientRect();
  return Math.abs(e.clientX - (r.left + S.cmp * r.width)) < 18 && e.clientY >= r.top && e.clientY <= r.bottom;
}
function maskHasPaint() {
  if (!S.maskDirty) return false;
  const mc = $("maskCanvas"), d = mc.getContext("2d").getImageData(0, 0, mc.width, mc.height).data;
  for (let i = 3; i < d.length; i += 16) if (d[i] > 0) return true;
  return false;
}
function toMask(e) {
  const r = $("canvas").getBoundingClientRect(), mc = $("maskCanvas");
  return { x: ((e.clientX - r.left) / r.width) * mc.width, y: ((e.clientY - r.top) / r.height) * mc.height, k: mc.width / r.width };
}
function paintTo(p, last) {
  const ctx = $("maskCanvas").getContext("2d");
  ctx.globalCompositeOperation = S.brush === "erase" ? "destination-out" : "source-over";
  ctx.strokeStyle = ctx.fillStyle = "#ff3d7f";
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.lineWidth = S.brushSize * p.k;
  ctx.beginPath();
  if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); } else { ctx.arc(p.x, p.y, (S.brushSize * p.k) / 2, 0, Math.PI * 2); ctx.fill(); }
  S.maskDirty = true;
}

function initPointer() {
  const vp = $("viewport"), cursor = $("brushCursor");
  let mode = null, last = null, start = null;
  vp.addEventListener("pointerdown", (e) => {
    if (!cur() || e.target.closest(".jobcard, .empty, .resultbar, .banner")) return;
    vp.setPointerCapture(e.pointerId);
    if (e.button === 0 && !brushActive() && nearDivider(e)) { mode = "cmp"; moveCmp(e); return; }
    if (e.button === 0 && brushActive()) {
      if (effectiveView() !== "result") setView("result");
      mode = "paint"; last = toMask(e); paintTo(last, null); return;
    }
    mode = "pan"; start = { x: e.clientX - S.zoom.x, y: e.clientY - S.zoom.y }; vp.classList.add("panning");
  });
  vp.addEventListener("pointermove", (e) => {
    const r = vp.getBoundingClientRect();
    if (brushActive()) {
      cursor.style.display = "block";
      cursor.style.left = e.clientX - r.left + "px"; cursor.style.top = e.clientY - r.top + "px";
      cursor.style.width = cursor.style.height = S.brushSize + "px";
    } else cursor.style.display = "none";
    vp.style.cursor = mode === "cmp" || (!mode && !brushActive() && nearDivider(e)) ? "ew-resize" : "";
    if (mode === "paint") { const p = toMask(e); paintTo(p, last); last = p; }
    else if (mode === "pan") { S.zoom.x = e.clientX - start.x; S.zoom.y = e.clientY - start.y; S.zoom.fit = false; applyZoom(); }
    else if (mode === "cmp") moveCmp(e);
  });
  const end = () => {
    if (mode === "paint") {
      const had = S.hasPaint;
      S.hasPaint = maskHasPaint();
      if (had !== S.hasPaint) renderPanel();
    }
    mode = null; last = null; vp.classList.remove("panning");
  };
  vp.addEventListener("pointerup", end);
  vp.addEventListener("pointercancel", end);
  vp.addEventListener("pointerleave", () => { cursor.style.display = "none"; });
  vp.addEventListener("wheel", (e) => {
    if (!cur()) return;
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    zoomAt(S.zoom.s * Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  vp.addEventListener("dblclick", (e) => { if (!brushActive()) fit(); });
}
function moveCmp(e) {
  const r = $("canvas").getBoundingClientRect();
  S.cmp = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  renderCanvas();
}

// ------------------------------------------------------------------ generate + jobs
async function generate() {
  const v = cur();
  if (!v) { toast("Upload a photo first.", "err"); return; }
  if (v.status !== "done") { toast("This version is still being generated. Pick a finished version to edit from.", "err"); return; }
  const t = S.tool, T = TOOLS[t], prompt = $("prompt").value.trim();
  if (!prompt) { toast("Describe the edit first.", "err"); $("prompt").focus(); return; }
  if (T.fields && !S.fields[t].what.trim() && !(t === "text" && S.fields[t].with_.trim())) {
    toast(`Fill in “${T.fields[0][1]}” first.`, "err"); return;
  }
  const useBrush = T.brush && !(t === "magic" && S.area === "image") && maskHasPaint();
  if (t === "magic" && S.area === "brush" && !useBrush) { toast("Paint over the area to change, or switch to “Entire image”.", "err"); return; }
  if (S.randomSeed) S.seed = Math.floor(Math.random() * 2 ** 31);
  const body = {
    src: v.image.id, tool: t, prompt, area: t === "magic" ? S.area : "auto", brush_mode: S.brushMode,
    mask: useBrush ? $("maskCanvas").toDataURL("image/png") : null,
    gate_in: S.hints.gate_in, gate_out: S.hints.gate_out, merge: S.merge, seed: S.seed, variations: S.variations,
    preset: T.global && PRESETS[t].find((p) => p[0] === S.preset[t] && p[1] === prompt) ? S.preset[t] : null,
    text_new: t === "text" && !S.fields.text.what.trim(),
  };
  await submit(body, v, t, TOOLS[t].name);
}
async function submit(body, parent, tool, baseTitle) {
  if (parent.status !== "done") { toast("Pick a finished version to edit from.", "err"); return; }
  body = { ...body, src: parent.image.id, src_key: parent.image.key };
  $("genBtn").disabled = true;
  try {
    const resp = await api(`${API}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const jobs = resp.jobs;
    setCredits(resp.available);
    if (resp.warning) toast(resp.warning, "err", { href: "/credits", label: "Buy credits" });
    let first = null;
    jobs.forEach((j, k) => {
      const n = S.versions.length;
      const title = baseTitle + (jobs.length > 1 ? ` · variation ${k + 1}` : "");
      addVersion({ id: `v${n}`, n, parent: parent.id, tool, title, baseTitle, prompt: body.prompt, status: "pending", job: j,
        seed: body.seed + k, req: { ...body, seed: body.seed + k, variations: 1 } });
      first = first || `v${n}`;
    });
    S.current = first; S.redo = [];
    S.brush = null;
    renderPanel();
    render();
    poll();
  } catch (e) { showError(e); }
  $("genBtn").disabled = false;
}

let pollTimer = null;
function poll() {
  clearTimeout(pollTimer);
  const pending = S.versions.filter((v) => v.status === "pending" && !v.fetched);
  if (!pending.length) return;
  Promise.all(pending.map(async (v) => {
    try {
      const j = await api(`${API}/jobs/${encodeURIComponent(v.job.id)}`);
      v.job = j;
      if (j.available !== undefined) setCredits(j.available);
      if (j.status === "done") {
        v.fetched = true;
        const img = new Image();
        img.onload = img.onerror = () => { finish(v, j.result); render(); };
        img.src = j.result.image.url;
      }
      else if (j.status === "error") { v.status = "error"; v.error = j.error; toast(j.error, "err"); }
      else if (j.status === "cancelled") { v.status = "cancelled"; }
    } catch (e) { /* transient */ }
  })).then(() => { render(); pollTimer = setTimeout(poll, 800); });
}
function finish(v, r) {
  Object.assign(v, { status: "done", image: r.image, raw: r.raw, changes: r.changes, alts: r.alts, chosen: r.chosen,
    kind: r.kind, info: r.info, timing: r.timing, warn: r.warn, prompt: r.prompt, seed: r.seed, bbox: r.bbox });
  if (v.id === S.current) { S.view = "compare"; S.cmp = v.bbox ? (v.bbox[0] + v.bbox[2]) / 2 : 0.5; }
  toast(`${v.title} is ready${r.warn ? " (see the note above the image)" : ""}.`, "ok");
}
async function cancelCurrent() {
  const v = cur();
  if (v && v.status === "pending") {
    await api(`${API}/jobs/${encodeURIComponent(v.job.id)}/cancel`, { method: "POST" }).catch(() => {});
    toast("Cancelling…");
  }
}

// ------------------------------------------------------------------ render
const ICON_RETRY = '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>';
const ICON_TARGET = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>';
function renderStrip() {
  const v = cur(), s = $("strip");
  s.innerHTML = "";
  $("banner").classList.add("hidden");
  s.classList.toggle("hidden", !(v && v.status === "done" && v.parent));
  if (!v || v.status !== "done" || !v.parent) return;
  const tm = v.timing, dot = () => el("span", { class: "dot" });
  s.append(el("span", { title: `seed ${v.seed}` }, `Done in ${Math.round(tm.total ?? tm.gen + tm.merge)} s`));
  if (v.kind === "partial") {
    s.append(dot(), el("span", {}, `${v.info.edited_pct}% changed`));
    if (v.info.untouched_identical) s.append(dot(), el("span", { class: "ok", title: "Every pixel outside the edit is bit-identical to the version you edited" }, "✓ rest pixel-identical"));
  }
  if (v.alts) {
    const seg = el("div", { class: "seg small" });
    for (const k of ["tone", "hybrid", "raw"]) {
      seg.append(el("button", { class: v.chosen === k ? "on" : "", title: "Switch the blend without regenerating", onclick: () => {
        v.chosen = k; v.image = v.alts[k]; render();
      } }, k[0].toUpperCase() + k.slice(1)));
    }
    s.append(dot(), el("span", { class: "alts" }, "Blend", seg));
  }
  if (v.bbox) s.append(el("button", { class: "btn tiny", title: "Zoom to the edited area", html: `${ICON_TARGET}Zoom to edit`, onclick: zoomToEdit }));
  if (v.req) s.append(el("button", { class: "btn tiny", title: "Same edit, new seed", html: `${ICON_RETRY}Try again`, onclick: () => tryAgain(v) }));
  if (v.warn) { $("banner").textContent = v.warn; $("banner").classList.remove("hidden"); }
}
function zoomToEdit() {
  const v = cur(); if (!v || !v.bbox) return;
  const [x0, y0, x1, y1] = v.bbox, { w, h } = v.image, vp = $("viewport").getBoundingClientRect();
  const bw = Math.max(0.05, x1 - x0) * w, bh = Math.max(0.05, y1 - y0) * h;
  const s = Math.min(2, Math.max(S.zoom.s, Math.min((vp.width * 0.55) / bw, (vp.height * 0.55) / bh)));
  const cx = ((x0 + x1) / 2) * w, cy = ((y0 + y1) / 2) * h;
  S.zoom = { s, x: vp.width / 2 - cx * s, y: vp.height / 2 - cy * s, fit: false };
  applyZoom();
}
function tryAgain(v) {
  const par = parentOf(v);
  submit({ ...v.req, seed: Math.floor(Math.random() * 2 ** 31), variations: 1 }, par, v.tool, v.baseTitle || v.title);
}

function renderJobCard() {
  const v = cur(), card = $("jobcard");
  if (!v || v.status !== "pending") { card.classList.add("hidden"); return; }
  card.classList.remove("hidden");
  const { pct, phase } = progressOf(v), j = v.job || {};
  $("jobStage").textContent = phase;
  $("jobEta").textContent = !v.fetched && j.eta ? fmtEta(j.eta) : "";
  $("jobBar").style.width = `${pct}%`;
  $("jobSub").textContent = "";
  $("jobCancel").style.visibility = v.fetched ? "hidden" : "";
}
function progressOf(v) {
  const j = v.job || {};
  if (v.fetched) return { pct: 97, phase: "Downloading image" };
  if (j.status === "queued") return { pct: 1, phase: "Queue" };
  if (j.status !== "running") return { pct: 1, phase: "Uploading image" };
  if (j.stage === "Generating the edit") return { pct: 8 + 80 * (j.step / j.steps), phase: "Processing image" };
  if (["Reading your prompt", "Encoding your photo", "Waiting in queue"].includes(j.stage)) return { pct: 4, phase: "Uploading image" };
  return { pct: 92, phase: "Processing image" };
}

function renderHistory() {
  const h = $("history");
  h.innerHTML = "";
  const list = [...S.versions].reverse();
  $("histCount").textContent = S.versions.length ? `${S.versions.length}` : "";
  if (!list.length) { h.append(el("div", { class: "muted pad" }, "Your edits appear here. Click any version to view it or keep editing from it.")); return; }
  for (const v of list) {
    const thumb = el("div", { class: "thumb", style: v.status === "done" ? `background-image:url(${v.image.thumb})` : "" });
    if (v.status === "pending") thumb.append(el("div", { class: "spinner" }));
    const meta = el("div", { class: "meta" },
      el("div", { class: "title" }, v.title, el("span", { class: "v" }, `v${v.n}${v.parent && v.parent !== "v0" ? ` · from v${S.byId[v.parent].n}` : ""}`)),
      el("div", { class: "p" }, v.status === "error" ? v.error : v.status === "cancelled" ? "Cancelled" : shortPrompt(v.prompt)));
    if (v.status === "pending") {
      const pct = progressOf(v).pct;
      meta.append(el("div", { class: "mini" }, el("div", { style: `width:${pct}%` })));
    }
    h.append(el("div", {
      class: `ver ${v.id === S.current ? "on" : ""} ${v.status === "error" ? "err" : ""} ${v.parent ? "child" : ""}`,
      title: v.status === "done" && v.seed !== undefined ? `seed ${v.seed}` : "",
      onclick: () => { if (v.status === "cancelled" || v.status === "error") return; select(v.id); },
    }, thumb, meta));
  }
}

function select(id) {
  if (id === S.current) return;
  S.current = id; S.redo = [];
  const v = cur();
  S.view = v.status === "done" && v.parent ? "compare" : "result";
  if (v.bbox) S.cmp = (v.bbox[0] + v.bbox[2]) / 2;
  render();
}
function autosize() {
  const t = $("prompt");
  t.style.height = "auto";
  t.style.height = Math.min(110, t.scrollHeight) + "px";
}

function renderTop() {
  const v = cur(), dl = $("downloadBtn");
  if (v && v.status === "done") {
    dl.classList.remove("disabled");
    dl.href = v.image.png;
    dl.download = `${(S.docName || "photo").replace(/\.[^.]+$/, "")}_v${v.n}.png`;
  } else dl.classList.add("disabled");
  $("undoBtn").disabled = !(v && v.parent);
  $("redoBtn").disabled = !S.redo.length;
  const img = v && (v.image || parentOf(v)?.image);
  $("docinfo").textContent = v ? `${S.docName} · ${img.w}×${img.h} · viewing v${v.n}` : "";
  const busy = v && v.status === "pending";
  $("genLabel").textContent = busy ? "Working…" : S.variations > 1 ? `Generate ${S.variations} · ${COST * S.variations} credits` : `Generate · ${COST} credits`;
}

function render() { renderTop(); renderCanvas(); renderStrip(); renderJobCard(); renderHistory(); updateCursor(); autosize(); }

// ------------------------------------------------------------------ wiring
function undo() { const v = cur(); if (v && v.parent) { S.redo.push(v.id); S.current = v.parent; S.view = "result"; render(); } }
function redo() { const id = S.redo.pop(); if (id) { S.current = id; S.view = "compare"; render(); } }

function init() {
  renderRail(); renderPanel(); refreshPrompt(true); renderChips(); initPointer();
  fetch("/image-edit/samples/manifest.json").then((r) => r.json()).then((list) => {
    SAMPLES = list;
    for (const s of list) $("samples").append(el("button", { title: s.name, style: `background-image:url(/image-edit/samples/${s.name}_t.jpg)`, onclick: () => useSample(s.name) }));
  }).catch(() => {});
  refreshCredits();
  $("browseBtn").onclick = () => $("fileInput").click();
  $("drop").onclick = (e) => { if (e.target === $("drop")) $("fileInput").click(); };
  $("newBtn").onclick = () => $("fileInput").click();
  $("fileInput").onchange = (e) => { uploadFile(e.target.files[0]); e.target.value = ""; };
  let dragDepth = 0;
  window.addEventListener("dragenter", (e) => { e.preventDefault(); dragDepth++; document.body.classList.add("dragging"); if (cur()) $("empty").classList.remove("hidden"); });
  window.addEventListener("dragleave", () => { if (--dragDepth <= 0) { document.body.classList.remove("dragging"); dragDepth = 0; if (cur()) $("empty").classList.add("hidden"); } });
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => {
    e.preventDefault(); dragDepth = 0; document.body.classList.remove("dragging");
    if (cur()) $("empty").classList.add("hidden");
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
  });
  window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) uploadFile(item.getAsFile());
  });
  document.querySelectorAll("#viewSeg button").forEach((b) => (b.onclick = () => setView(b.dataset.view)));
  document.querySelectorAll("#varSeg button").forEach((b, i) => (b.onclick = () => {
    S.variations = i + 1;
    document.querySelectorAll("#varSeg button").forEach((x, k) => x.classList.toggle("on", k === i));
    renderTop();
  }));
  $("genBtn").onclick = generate;
  $("jobCancel").onclick = cancelCurrent;
  $("undoBtn").onclick = undo; $("redoBtn").onclick = redo;
  $("zoomIn").onclick = () => zoomCenter(1.25); $("zoomOut").onclick = () => zoomCenter(0.8);
  $("zoomVal").onclick = fit;
  $("zoom100").onclick = () => { const vp = $("viewport").getBoundingClientRect(); zoomAt(1, vp.width / 2, vp.height / 2); };
  window.addEventListener("resize", () => { if (S.zoom.fit) fit(); });

  $("prompt").addEventListener("input", autosize);
  $("prompt").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); generate(); } });
  window.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (e.key === "Escape") { if (typing) document.activeElement.blur(); setBrush(null); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === " ") { if (!S.space) { S.space = true; updateCursor(); } e.preventDefault(); }
    else if (e.key === "b" || e.key === "B") setBrush(S.brush === "paint" ? null : "paint");
    else if (e.key === "e" || e.key === "E") setBrush(S.brush === "erase" ? null : "erase");
    else if (e.key === "Escape") setBrush(null);
    else if (e.key === "[") S.brushSize = Math.max(8, Math.round(S.brushSize / 1.2));
    else if (e.key === "]") S.brushSize = Math.min(300, Math.round(S.brushSize * 1.2));
    else if (e.key === "f" || e.key === "F") fit();
    else if (e.key === "1") $("zoom100").click();
    else if (e.key === "c" || e.key === "C") setView(effectiveView() === "compare" ? "result" : "compare");
    else if (e.key === "\\" && !S.tempView) { S.tempView = "before"; renderCanvas(); }
    else return;
    if (e.key === "[" || e.key === "]") renderPanel();
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === " ") { S.space = false; updateCursor(); }
    if (e.key === "\\") { S.tempView = null; renderCanvas(); }
  });
}
init();
