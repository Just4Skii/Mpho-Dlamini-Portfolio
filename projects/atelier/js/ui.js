(function () {
  "use strict";
  const U = window.U;

  class UI {
    constructor(app) {
      this.app = app;
      this.el = {};
      const ids = document.querySelectorAll("[id]");
      for (const el of ids) this.el[el.id] = el;

      this.recentColors = [];
      this.currentPalette = "PICO-8";
      this.artistModeOn = true;
      this.uploadedImage = null;
      this._confirmResolve = null;

      const safe = name => {
        try {
          this[name]();
        } catch (err) {
          console.error("UI init failed in " + name + ":", err);
        }
      };
      ["_bindTopbar", "_bindToolbar", "_bindOptions", "_bindColorPane", "_bindPixelPane",
        "_bindLayerPane", "_bindAutoPane", "_bindUploadModal", "_bindExportModal",
        "_bindHud", "_bindMisc", "_syncHistoryButtons", "populatePalettes", "populatePresets"
      ].forEach(safe);

      this.app.engine.on("history", () => this._syncHistoryButtons());
      this.app.engine.on("layers", U.debounce(() => { try { this.renderLayers(); } catch (e) { console.error(e); } }, 60));
      this.app.engine.on("layers", () => this._syncFooter());
      this.app.engine.on("doc", () => this._syncDoc());
      this.app.engine.on("view", () => this._syncView());
      this.app.engine.on("artwork", U.debounce(() => { try { this.renderLayers(); } catch (e) { console.error(e); } }, 220));
      this.app.tools.on("tool", t => this._syncTool(t));
      this.app.tools.on("colors", () => this._syncColors());
      this.app.tools.on("settings", () => this._syncSettings());
      this.app.tools.on("pickedColor", hex => this._pushRecent(hex));

      ["_syncDoc", "_syncView", "_syncColors", "_syncSettings"].forEach(safe);
      try { this._syncTool(this.app.tools.tool); } catch (e) { console.error(e); }
      try { this.renderLayers(); } catch (e) { console.error(e); }
    }

    /* ================= helpers ================= */

    toast(msg, kind) {
      const box = document.createElement("div");
      box.className = "toast" + (kind ? " " + kind : "");
      box.textContent = msg;
      this.el.toasts.appendChild(box);
      setTimeout(() => {
        box.classList.add("out");
        setTimeout(() => box.remove(), 260);
      }, 3400);
    }

    confirm(title, msg, okLabel) {
      return new Promise(resolve => {
        this.el.cfTitle.textContent = title;
        this.el.cfMsg.textContent = msg;
        this.el.cfOk.textContent = okLabel || "Confirm";
        this.el.modalConfirm.classList.remove("hidden");
        this._confirmResolve = resolve;
      });
    }

    _resolveConfirm(v) {
      this.el.modalConfirm.classList.add("hidden");
      if (this._confirmResolve) { this._confirmResolve(v); this._confirmResolve = null; }
    }

    loaderShow(text) {
      this.el.loaderText.textContent = text || "Working…";
      this.el.loaderBarFill.style.width = "0%";
      this.el.loader.classList.remove("hidden");
    }

    loaderProgress(frac, text) {
      if (text) this.el.loaderText.textContent = text;
      this.el.loaderBarFill.style.width = Math.round(U.clamp(frac, 0, 1) * 100) + "%";
    }

    loaderHide() {
      this.el.loader.classList.add("hidden");
    }

    dismissEmpty() {
      this.el.emptyState.classList.add("gone");
    }

    /* ================= topbar ================= */

    _syncHistoryButtons() {
      this.el.btnUndo.disabled = !this.app.engine.canUndo;
      this.el.btnRedo.disabled = !this.app.engine.canRedo;
    }

    _bindTopbar() {
      const A = this.app;
      this.el.btnNew.onclick = async () => {
        const ok = await this.confirm("New canvas", "Start a fresh canvas? Current artwork will be cleared (undo history resets).", "New canvas");
        if (!ok) return;
        A.engine.resetDocument(A.engine.doc.w, A.engine.doc.h);
        A.plan = null;
        A.artist.reset();
        this._setPlanUi(null);
        this.toast("Fresh canvas ready", "success");
      };
      this.el.btnOpen.onclick = () => this.openUploadModal();
      this.el.btnExport.onclick = () => this.openExportModal();
      this.el.btnUndo.onclick = () => A.engine.undo();
      this.el.btnRedo.onclick = () => A.engine.redo();
      this.el.zoomIn.onclick = () => A.engine.zoomAt(A.engine.wrap.clientWidth / 2, A.engine.wrap.clientHeight / 2, 1.25);
      this.el.zoomOut.onclick = () => A.engine.zoomAt(A.engine.wrap.clientWidth / 2, A.engine.wrap.clientHeight / 2, 0.8);
      this.el.zoomPct.onclick = () => A.engine.fitToScreen();
      this.el.btnPanelToggle.onclick = () => this.el.panel.classList.toggle("collapsed");
      this.el.btnArtistMode.onclick = () => {
        this.artistModeOn = !this.artistModeOn;
        this.el.btnArtistMode.classList.toggle("on", this.artistModeOn);
        this.toast(this.artistModeOn ? "Artist Mode on — plans will be painted live" : "Artist Mode off — plans will be applied instantly", "info");
      };
      this.el.btnArtistMode.classList.add("on");
    }

    /* ================= toolbar ================= */

    _bindToolbar() {
      this.el.toolbar.addEventListener("click", e => {
        const btn = e.target.closest(".tool[data-tool]");
        if (!btn) return;
        this.app.tools.setTool(btn.dataset.tool);
      });
      this.el.btnClearCanvas.onclick = () => {
        this.app.engine.clearLayer();
        this.dismissEmpty();
      };
    }

    _syncTool(t) {
      for (const btn of this.el.toolbar.querySelectorAll(".tool[data-tool]")) {
        btn.classList.toggle("active", btn.dataset.tool === t);
      }
      this.el.footTool.textContent = (this.app.tools.TOOL_LABELS[t] || t).toUpperCase();
      const s = this.app.tools.settings;
      const groups = {
        gSize: ["brush", "pencil", "pen", "eraser", "flow", "line", "rect", "ellipse"],
        gOpacity: ["brush", "pencil", "pen", "eraser", "flow", "line", "rect", "ellipse"],
        gBpx: ["pixel"],
        gTolerance: ["fill"],
        gFillShape: ["rect", "ellipse"],
        gSnap: ["line", "rect", "ellipse"],
        gSym: ["flow"],
        gRainbow: ["flow"]
      };
      for (const [gid, tools] of Object.entries(groups)) {
        this.el[gid].classList.toggle("hidden", !tools.includes(t));
      }
      const anyVisible = Object.keys(groups).some(gid => groups[gid].includes(t));
      this.el.optbar.classList.toggle("hidden", !anyVisible);
      this.el_canvasWrapClass(t);
      this._syncSettings();
      void s;
    }

    el_canvasWrapClass(t) {
      const wrap = this.app.engine.wrap;
      wrap.classList.remove("tool-pan", "tool-eyedrop", "tool-fill");
      if (t === "pan") wrap.classList.add("tool-pan");
      if (t === "eyedrop") wrap.classList.add("tool-eyedrop");
      if (t === "fill") wrap.classList.add("tool-fill");
    }

    /* ================= options bar ================= */

    _bindOptions() {
      const T = this.app.tools;
      const bindRange = (id, valId, fmt, apply) => {
        const r = this.el[id];
        const set = () => {
          this.el[valId].textContent = fmt(r.value);
          const min = +r.min, max = +r.max;
          r.style.setProperty("--fill", ((r.value - min) / (max - min) * 100) + "%");
        };
        r.addEventListener("input", () => { set(); apply(+r.value); });
        set();
        return r;
      };

      bindRange("optSize", "optSizeVal", v => v, v => { T.settings.size = v; });
      bindRange("optOpacity", "optOpacityVal", v => v + "%", v => { T.settings.opacity = v / 100; });
      bindRange("optBpx", "optBpxVal", v => v + "×", v => { T.settings.bpx = v; });
      bindRange("optTolerance", "optToleranceVal", v => v, v => { T.settings.tolerance = v; });

      this.el.optFillShape.onchange = e => { T.settings.fillShape = e.target.checked; };
      this.el.optSnap.onchange = e => { T.settings.snap = e.target.checked; this.app.engine.doc.snap = e.target.checked; };
      this.el.optSym.onchange = e => { T.settings.symmetry = +e.target.value; };
      this.el.optRainbow.onchange = e => { T.settings.rainbow = e.target.checked; };
    }

    _syncSettings() {
      const T = this.app.tools.settings;
      this.el.optSize.value = U.clamp(Math.round(T.size), 1, 120);
      this.el.optSizeVal.textContent = Math.round(T.size * 10) / 10;
      this.el.optOpacity.value = Math.round(T.opacity * 100);
      this.el.optOpacityVal.textContent = Math.round(T.opacity * 100) + "%";
      this.el.optBpx.value = T.bpx;
      this.el.optBpxVal.textContent = T.bpx + "×";
      this.el.optTolerance.value = T.tolerance;
      this.el.optToleranceVal.textContent = T.tolerance;
      this.el.optFillShape.checked = T.fillShape;
      this.el.optSnap.checked = T.snap;
      this.el.optSym.value = String(T.symmetry);
      this.el.optRainbow.checked = T.rainbow;
      for (const id of ["optSize", "optOpacity", "optBpx", "optTolerance"]) {
        const r = this.el[id];
        const min = +r.min, max = +r.max;
        r.style.setProperty("--fill", ((r.value - min) / (max - min) * 100) + "%");
      }
    }

    /* ================= color pane ================= */

    populatePalettes() {
      const sel = this.el.paletteSelect;
      sel.innerHTML = "";
      for (const name of Object.keys(window.ImageProc.PALETTES)) {
        const o = document.createElement("option");
        o.value = name;
        o.textContent = name;
        sel.appendChild(o);
      }
      sel.value = this.currentPalette;
      this.renderPaletteGrid();
      const selA = this.el.paletteSelAuto;
      selA.innerHTML = '<option value="">Auto (median-cut from image)</option>';
      for (const name of Object.keys(window.ImageProc.PALETTES)) {
        const o = document.createElement("option");
        o.value = name;
        o.textContent = name;
        selA.appendChild(o);
      }
    }

    renderPaletteGrid() {
      const grid = this.el.paletteGrid;
      grid.innerHTML = "";
      const pal = window.ImageProc.PALETTES[this.currentPalette] || [];
      for (const hex of pal) {
        const d = document.createElement("div");
        d.className = "pal-swatch";
        d.style.background = hex;
        d.title = hex;
        d.onclick = () => {
          this.app.tools.setPrimary(hex);
          this.dismissEmpty();
        };
        d.oncontextmenu = e => {
          e.preventDefault();
          this.app.tools.setSecondary(hex);
        };
        grid.appendChild(d);
      }
    }

    _bindColorPane() {
      const T = this.app.tools;
      this.el.colorInput.addEventListener("input", e => {
        T.setPrimary(e.target.value);
        this.dismissEmpty();
      });
      this.el.hexInput.addEventListener("change", e => {
        let v = e.target.value.trim();
        if (!v.startsWith("#")) v = "#" + v;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) T.setPrimary(v);
        else this.toast("Invalid hex color", "error");
      });
      this.el.paletteSelect.onchange = e => {
        this.currentPalette = e.target.value;
        this.renderPaletteGrid();
      };
      this.el.curSwatch.onclick = () => this.el.colorInput.click();
      this.el.secSwatch.onclick = () => T.swapColors();
      this.el.btnSwapColors.onclick = () => T.swapColors();
      this.el.btnBgWhite.onclick = () => {
        this.app.engine.fillEntireLayer(T.colors.secondary, "White background");
        this.dismissEmpty();
      };
    }

    _syncColors() {
      const T = this.app.tools;
      this.el.curSwatch.style.background = T.colors.primary;
      this.el.secSwatch.style.background = T.colors.secondary;
      this.el.colorInput.value = T.colors.primary.toLowerCase().length === 7 ? T.colors.primary.toLowerCase() : "#000000";
      this.el.hexInput.value = T.colors.primary;
    }

    _pushRecent(hex) {
      this.recentColors = [hex, ...this.recentColors.filter(h => h !== hex)].slice(0, 14);
      const grid = this.el.recentGrid;
      grid.innerHTML = "";
      for (const h of this.recentColors) {
        const d = document.createElement("div");
        d.className = "pal-swatch";
        d.style.background = h;
        d.title = h;
        d.onclick = () => this.app.tools.setPrimary(h);
        grid.appendChild(d);
      }
    }

    /* ================= pixel pane ================= */

    _bindPixelPane() {
      const E = this.app.engine;
      this.el.pxModeChk.onchange = e => {
        E.doc.pixelMode = e.target.checked;
        E.requestRender();
        this.toast(e.target.checked ? "Pixel-art mode ON — strokes snap to the lattice" : "Pixel-art mode off", "info");
        if (e.target.checked) {
          E.doc.showGrid = true;
          this.el.gridChk.checked = true;
        }
        this._syncDoc();
      };
      this.el.resPreset.onchange = e => {
        this.el.resCustomRow.classList.toggle("hidden", e.target.value !== "custom");
      };
      this.el.btnApplyRes.onclick = () => {
        let w, h;
        if (this.el.resPreset.value === "custom") {
          w = U.clamp(parseInt(this.el.resW.value, 10) || 64, 8, 512);
          h = U.clamp(parseInt(this.el.resH.value, 10) || 64, 8, 512);
        } else {
          w = h = parseInt(this.el.resPreset.value, 10);
        }
        if (E.doc.pixelMode) {
          E.doc.pixelSize = 1;
        }
        E.setDocSize(w, h, this.el.resScaleContent.checked);
        this.toast(`Canvas set to ${w} × ${h}`, "success");
      };
      this.el.gridChk.onchange = e => {
        E.doc.showGrid = e.target.checked;
        E.requestRender();
      };
      this.el.cellSize.addEventListener("input", e => {
        E.doc.pixelSize = +e.target.value;
        this.el.cellSizeVal.textContent = e.target.value;
        E.requestRender();
      });
    }

    _syncDoc() {
      const doc = this.app.engine.doc;
      this.el.statDim.textContent = `${doc.w} × ${doc.h}${doc.pixelMode ? " px-mode" : ""}`;
      this.el.pxModeChk.checked = doc.pixelMode;
      this.el.gridChk.checked = doc.showGrid;
      this.el.cellSize.value = doc.pixelSize;
      this.el.cellSizeVal.textContent = doc.pixelSize;
      this.el.cellHint.textContent = doc.pixelMode
        ? "Pixel mode is active: every document pixel is one art pixel."
        : "Cell size controls the lattice used by pixel tools when pixel mode is off.";
      this.el.footMem.textContent = `${this.app.engine.layers.length} layer${this.app.engine.layers.length > 1 ? "s" : ""}`;
    }

    _syncView() {
      const z = this.app.engine.zoom;
      this.el.statZoom.textContent = Math.round(z * 100) + "%";
      this.el.zoomPct.textContent = Math.round(z * 100) + "%";
    }

    _syncFooter() {
      this.el.footMem.textContent = `${this.app.engine.layers.length} layer${this.app.engine.layers.length > 1 ? "s" : ""}`;
    }

    /* ================= layers pane ================= */

    renderLayers() {
      const E = this.app.engine;
      const list = this.el.layerList;
      list.innerHTML = "";
      for (let i = E.layers.length - 1; i >= 0; i--) {
        const layer = E.layers[i];
        const item = document.createElement("div");
        item.className = "layer-item" + (i === E.activeIdx ? " active" : "");

        const thumb = document.createElement("div");
        thumb.className = "layer-thumb";
        const tc = document.createElement("canvas");
        tc.width = tc.height = 36;
        const tctx = tc.getContext("2d");
        const scale = Math.min(36 / E.doc.w, 36 / E.doc.h);
        const dw = E.doc.w * scale, dh = E.doc.h * scale;
        tctx.imageSmoothingEnabled = !E.doc.pixelMode || scale < 1;
        tctx.drawImage(layer.canvas, (36 - dw) / 2, (36 - dh) / 2, dw, dh);
        thumb.appendChild(tc);

        const info = document.createElement("div");
        info.className = "layer-info";
        info.innerHTML = `<div class="layer-name"></div><div class="layer-meta">${Math.round(layer.opacity * 100)}%</div>`;
        info.querySelector(".layer-name").textContent = layer.name;

        const eye = document.createElement("button");
        eye.className = "eye-btn" + (layer.visible ? "" : " off");
        eye.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2 12 c3 -5 6.5 -7.5 10 -7.5 S19 7 22 12 c-3 5 -6.5 7.5 -10 7.5 S5 17 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>';
        eye.onclick = ev => {
          ev.stopPropagation();
          E.toggleLayerVisible(i);
        };

        item.appendChild(thumb);
        item.appendChild(info);
        item.appendChild(eye);
        item.onclick = () => E.setActiveLayer(i);
        list.appendChild(item);
      }
      const lo = this.el.layerOpacity;
      lo.value = Math.round(E.activeLayer.opacity * 100);
      this.el.layerOpacityVal.textContent = Math.round(E.activeLayer.opacity * 100) + "%";
      lo.style.setProperty("--fill", ((lo.value - lo.min) / (lo.max - lo.min) * 100) + "%");
    }

    _bindLayerPane() {
      const E = this.app.engine;
      this.el.btnAddLayer.onclick = () => E.addLayer();
      this.el.btnDupLayer.onclick = () => E.duplicateLayer();
      this.el.btnMergeLayer.onclick = () => E.mergeDown();
      this.el.btnUpLayer.onclick = () => E.moveLayer(1);
      this.el.btnDownLayer.onclick = () => E.moveLayer(-1);
      this.el.btnDelLayer.onclick = async () => {
        if (E.layers.length <= 1) { this.toast("At least one layer must remain", "warn"); return; }
        E.deleteLayer();
      };
      this.el.layerOpacity.addEventListener("input", e => {
        E.setLayerOpacity(E.activeIdx, +e.target.value / 100);
        this.el.layerOpacityVal.textContent = e.target.value + "%";
      });
    }

    /* ================= auto pane ================= */

    populatePresets() {
      const sel = this.el.presetSel;
      sel.innerHTML = "";
      for (const [id, p] of Object.entries(window.Tracer.PRESETS)) {
        const o = document.createElement("option");
        o.value = id;
        o.textContent = p.label;
        sel.appendChild(o);
      }
      sel.value = "ink";
      this._syncPresetDesc();
    }

    _syncPresetDesc() {
      const p = window.Tracer.PRESETS[this.el.presetSel.value];
      this.el.presetDesc.textContent = p ? p.desc : "";
      this.el.autoPaletteWrap.classList.toggle("hidden", !(p && p.style === "pixel"));
    }

    _bindAutoPane() {
      this.el.presetSel.onchange = () => this._syncPresetDesc();
      this.el.detailRange.addEventListener("input", () => {
        this.el.detailVal.textContent = this.el.detailRange.value;
        const min = +this.el.detailRange.min, max = +this.el.detailRange.max;
        this.el.detailRange.style.setProperty("--fill", ((this.el.detailRange.value - min) / (max - min) * 100) + "%");
      });
      this.el.detailRange.dispatchEvent(new Event("input"));

      this.el.btnUploadTrace.onclick = () => this.openUploadModal();
      this.el.btnStartDrawPlan.onclick = () => this.startPlan();
      this.el.btnSkipPlan.onclick = () => {
        if (!this.app.plan) return;
        if (this.app.artist.done) { this.toast("This plan is already complete", "warn"); return; }
        this.runInstant();
      };

      const nvidia = window.NvidiaAPI;
      const depth = window.DepthAPI;
      const syncNvidiaUI = () => {
        const has = nvidia ? nvidia.hasKey() : false;
        const depHas = depth ? depth.hasKey() : false;
        const anyHas = has || depHas;
        this.el.nvidiaKeyStatus.textContent = anyHas ? "● Key saved locally" : "No key saved";
        this.el.nvidiaKeyStatus.style.color = anyHas ? "#10b981" : "";
        if (nvidia && this.el.aiModelsHint) {
          this.el.aiModelsHint.textContent = anyHas ? "Will use: llama-3.2-11b-vision (fast structure) + nemotron-parse (text). Falls back locally if offline." : "Add a key to unlock: vision structure, text preservation, and depth ordering.";
        }
      };
      syncNvidiaUI();
      this.el.btnSaveNvidiaKey.onclick = () => {
        const v = (this.el.nvidiaKeyInput.value || "").trim();
        if (!v || !v.startsWith("nvapi-")) { this.toast("Paste a valid nvapi-... key", "warn"); return; }
        if (nvidia) nvidia.saveKey(v);
        if (depth) depth.saveKey(v);
        this.el.nvidiaKeyInput.value = "";
        syncNvidiaUI();
        this.toast("NVIDIA key saved locally — never leaves your browser except to api.nvidia.com", "success");
      };
      this.el.btnClearNvidiaKey.onclick = () => {
        if (nvidia) nvidia.clearKey();
        if (depth) depth.clearKey();
        syncNvidiaUI();
        this.toast("Key removed", "info");
      };
      this.el.btnTestNvidia.onclick = async () => {
        const k = (nvidia && nvidia.loadKey()) || (depth && depth.loadKey());
        if (!k) { this.toast("Save a key first", "warn"); return; }
        this.el.nvidiaKeyStatus.textContent = "Testing…";
        try {
          const res = await fetch("https://integrate.api.nvidia.com/v1/models", { headers: { "Authorization": "Bearer " + k } });
          if (!res.ok) throw new Error(res.status + " " + await res.text().then(t => t.slice(0, 200)));
          this.toast("API key valid — vision models ready", "success");
        } catch (e) { this.toast("Test failed: " + e.message, "error"); }
        syncNvidiaUI();
      };
    }

    _gatherTraceOpts() {
      return {
        docW: this.app.engine.doc.w,
        docH: this.app.engine.doc.h,
        detail: +this.el.detailRange.value,
        stages: {
          con: this.el.stCon.checked,
          sketch: this.el.stSketch.checked,
          detail: this.el.stDetail.checked,
          shade: this.el.stShade.checked,
          final: this.el.stFinal.checked
        },
        colorize: this.el.colorizeChk.checked,
        paletteName: this.el.paletteSelAuto.value || null
      };
    }

    _setPlanUi(meta) {
      const has = !!meta;
      this.el.btnStartDrawPlan.disabled = !has;
      this.el.btnSkipPlan.disabled = !has;
      if (has) {
        this.el.autoStatus.classList.add("live");
        this.el.autoStatus.innerHTML =
          `<strong>Plan loaded.</strong> ${meta.totalStrokes} drawing operations across ` +
          `${meta.stages.length} stages (${meta.stages.map(s => s.label).join(" → ")}).` +
          `<br>Estimated duration at 1×: ~${U.formatMs(meta.estMs)}. Press <em>Start Artist</em> or the HUD play button.`;
      } else {
        this.el.autoStatus.classList.remove("live");
        this.el.autoStatus.textContent = "No plan loaded yet.";
      }
    }

    startPlan() {
      if (!this.app.plan) return;
      if (this.app.artist.done && this.app.artist.idx > 0) {
        this.toast("This plan is already complete — use New or upload another image to redraw", "warn");
        return;
      }
      this.dismissEmpty();
      if (this.artistModeOn) {
        this.app.artist.start();
        this.toast("The artist is painting — watch the cursor!", "success");
      } else {
        this.runInstant();
      }
    }

    runInstant() {
      this.dismissEmpty();
      const A = this.app;
      A.ui.loaderShow("Applying artwork instantly…");
      setTimeout(() => {
        A.artist.skip();
        A.ui.loaderHide();
      }, 30);
    }

    /* ================= upload modal ================= */

    openUploadModal() {
      this.el.modalUpload.classList.remove("hidden");
      this._upStep(1);
    }

    closeUploadModal() {
      this.el.modalUpload.classList.add("hidden");
    }

    _upStep(n) {
      this.el.upStep1.classList.toggle("hidden", n !== 1);
      this.el.upStep2.classList.toggle("hidden", n !== 2);
      this.el.upStep3.classList.toggle("hidden", n !== 3);
      this.el.upError.classList.toggle("hidden", n !== 4);
    }

    _bindUploadModal() {
      const dz = this.el.dropzone;
      const fi = this.el.fileInput;
      dz.onclick = () => fi.click();
      dz.ondragover = e => { e.preventDefault(); dz.classList.add("drag"); };
      dz.ondragleave = () => dz.classList.remove("drag");
      dz.ondrop = e => {
        e.preventDefault();
        dz.classList.remove("drag");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) this._loadFile(e.dataTransfer.files[0]);
      };
      fi.onchange = () => {
        if (fi.files && fi.files[0]) this._loadFile(fi.files[0]);
        fi.value = "";
      };
      this.el.btnCloseUpload.onclick = () => this.closeUploadModal();
      this.el.btnChooseOther.onclick = () => this._upStep(1);
      this.el.btnErrBack.onclick = () => this._upStep(1);
      this.el.btnLater.onclick = () => this.closeUploadModal();
      this.el.btnAnalyze.onclick = () => this._analyze();
      this.el.btnLaunchArtist.onclick = () => {
        this.closeUploadModal();
        this.startPlan();
      };
      this.el.modalUpload.addEventListener("mousedown", e => {
        if (e.target === this.el.modalUpload) this.closeUploadModal();
      });
    }

    async _loadFile(file) {
      try {
        const img = await window.ImageProc.loadFileAsImage(file);
        this.uploadedImage = img;
        const scan = window.ScanAPI ? window.ScanAPI.analyze(img) : null;
        this._lastScan = scan;
        this.el.upPreview.src = img.src;
        const kb = file.size > 1048576 ? (file.size / 1048576).toFixed(1) + " MB" : Math.round(file.size / 1024) + " KB";
        const scanLine = scan ? `<div style="margin-top:6px;padding:6px 8px;background:rgba(124,108,255,.12);border:1px solid rgba(124,108,255,.25);border-radius:6px;font-size:11px;line-height:1.6"><b>API Scan:</b> ${scan.original.w}×${scan.original.h} · ${scan.original.mp}MP · aspect ${scan.original.aspect.toFixed(3)}<br><b>Suggested canvas:</b> ${scan.suggested.w}×${scan.suggested.h} · scale ${scan.suggested.scale.toFixed(3)}${scan.suggested.aspectPreserved ? " · aspect preserved" : ""} <button id="btnFitScan" class="btn tiny" style="margin-left:8px;height:22px;padding:0 8px">Match canvas</button></div>` : "";
        this.el.upInfo.innerHTML =
          `<div>${file.name}</div>` +
          `<div>${img.naturalWidth} × ${img.naturalHeight} px</div>` +
          `<div>${kb} · will be traced onto a ${this.app.engine.doc.w} × ${this.app.engine.doc.h} canvas</div>` + scanLine;
        if (scan) {
          setTimeout(() => {
            const b = document.getElementById("btnFitScan");
            if (b) b.onclick = () => {
              this.app.engine.setDocSize(scan.suggested.w, scan.suggested.h, false);
              this.toast(`Canvas matched to image: ${scan.suggested.w}×${scan.suggested.h}`, "success");
              this.el.upInfo.innerHTML = this.el.upInfo.innerHTML.replace(/will be traced onto[^<]*/, `will be traced onto a ${scan.suggested.w} × ${scan.suggested.h} canvas`);
            };
          }, 30);
        }
        this._upStep(2);
      } catch (err) {
        this.el.errMsg.textContent = "Could not load that file: " + err.message;
        this._upStep(4);
      }
    }

    async _analyze() {
      const A = this.app;
      const presetId = this.el.presetSel.value;
      const P = window.Tracer.PRESETS[presetId];
      const opts = this._gatherTraceOpts();

      if (A.engine.doc.pixelMode) {
        opts.pixelRes = A.engine.doc.w;
      }
      this.loaderShow("Analyzing image…");
      try {
        this.loaderProgress(0.05, "Preparing source…");
        await U.tickAsync();
        let src;
        if (window.ScanAPI && this._lastScan) {
          const s = this._lastScan.suggested;
          const exactFits = Math.abs(s.w - A.engine.doc.w) < 2 && Math.abs(s.h - A.engine.doc.h) < 2;
          if (!exactFits && Math.abs(s.w / s.h - this._lastScan.original.aspect) < 0.002) {
            const needsResize = Math.abs(s.w - A.engine.doc.w) > 4 || Math.abs(s.h - A.engine.doc.h) > 4;
            if (needsResize) {
              this.loaderProgress(0.07, `Relaying dimensions ${this._lastScan.original.w}×${this._lastScan.original.h} → canvas ${s.w}×${s.h}…`);
              A.engine.setDocSize(s.w, s.h, false);
              await U.tickAsync();
            }
            src = window.ScanAPI.fitExact(this.uploadedImage, s.w, s.h);
            opts.docW = s.w; opts.docH = s.h;
            opts._scanRelay = this._lastScan;
          } else {
            src = window.ImageProc.fitToCanvas(this.uploadedImage, A.engine.doc.w, A.engine.doc.h);
          }
        } else {
          src = window.ImageProc.fitToCanvas(this.uploadedImage, A.engine.doc.w, A.engine.doc.h);
        }
        A.sourceImageCanvas = src;
        let apiStrokes = null;
        if (window.ScanAPI) {
          this.loaderProgress(0.12, "Trying external vector API…");
          await U.tickAsync();
          try { apiStrokes = await window.ScanAPI.tryAPITrace(src, opts); } catch (e) { void e; }
        }
        if (apiStrokes) opts._apiStrokes = apiStrokes;
        if (this.el.chkUseAI && this.el.chkUseAI.checked && window.NvidiaAPI && window.NvidiaAPI.hasKey()) {
          this.loaderProgress(0.14, "AI: analyzing structure & depth…");
          await U.tickAsync();
          try {
            const structure = await window.NvidiaAPI.analyzeStructure(src, null, opts.detail);
            opts._aiStructure = structure;
            opts._aiMasks = window.NvidiaAPI.structureToMasks(structure, src.width, src.height);
            this.toast(`AI found ${structure.subjects.length} subjects + ${structure.text_regions.length} text regions`, "success");
          } catch (e) { console.warn("AI structure failed, using local", e.message); }
        }
        if (this.el.chkUseAI && this.el.chkUseAI.checked && window.DepthAPI) {
          const dkey = window.DepthAPI.loadKey() || (window.NvidiaAPI && window.NvidiaAPI.loadKey());
          if (dkey) {
            this.loaderProgress(0.16, "AI: estimating depth…");
            try {
              const dm = await window.DepthAPI.getDepthMap(src, dkey);
              opts._depthMap = dm.depth; opts._depthW = dm.w; opts._depthH = dm.h; opts._depthSource = dm.source;
            } catch (e) { console.warn("Depth failed", e.message); }
          }
        }
        const plan = await window.Tracer.buildPlan(src, presetId, opts, (frac, text) => this.loaderProgress(frac / 100, text));
        A.plan = plan;
        A.artist.load(plan);
        this.loaderHide();
        const m = plan.meta;
        this.el.planSummary.innerHTML =
          `${m.totalStrokes} operations · ${m.stages.length} stages<br>` +
          `${m.stages.map(s => s.label).join(" → ")}<br>` +
          `~${U.formatMs(m.estMs)} at 1× speed` + (plan.meta.apiUsed ? `<br><span style="color:#7c6cff">● External API trace used — dimensions relayed ${opts.docW}×${opts.docH}</span>` : `<br><span style="color:#8a93a6">○ Local Canny pipeline — dimensions ${opts.docW}×${opts.docH}</span>`);
        if (m.previewCanvas) {
          const pv = document.createElement("canvas");
          pv.width = 120;
          pv.height = Math.max(1, Math.round(120 * m.previewCanvas.height / m.previewCanvas.width));
          pv.style.cssText = "border-radius:8px;border:1px solid rgba(255,255,255,.15);image-rendering:pixelated;margin-top:8px;";
          pv.className = "plan-preview-canvas";
          pv.getContext("2d").drawImage(m.previewCanvas, 0, 0, pv.width, pv.height);
          this.el.planSummary.after(pv);
          const olds = this.el.upStep3.querySelectorAll(".plan-preview-canvas");
          for (let i = olds.length - 1; i > 1; i--) olds[i - 1].remove();
        }
        this._setPlanUi(m);
        this._upStep(3);
        this.dismissEmpty();
        let traceMsg = "Drawing plan built — ready to paint";
        if (m.totalStrokes < 8) traceMsg += " · very little structure found — try raising Detail";
        this.toast(traceMsg, m.totalStrokes < 8 ? "warn" : "success");
      } catch (err) {
        this.loaderHide();
        console.error(err);
        this.el.errMsg.textContent = "Analysis failed: " + err.message;
        this._upStep(4);
      }
    }

    /* ================= export modal ================= */

    openExportModal() {
      this.el.expTransp.disabled = this.el.expFormat.value === "jpeg";
      this.el.modalExport.classList.remove("hidden");
    }

    _bindExportModal() {
      this.el.expFormat.onchange = e => {
        this.el.expTransp.disabled = e.target.value === "jpeg";
        if (e.target.value === "jpeg") this.el.expTransp.checked = false;
      };
      const closeBtns = this.el.modalExport.querySelectorAll("#btnCloseExport");
      closeBtns.forEach(b => b.onclick = () => this.el.modalExport.classList.add("hidden"));
      this.el.modalExport.addEventListener("mousedown", e => {
        if (e.target === this.el.modalExport) this.el.modalExport.classList.add("hidden");
      });
      this.el.btnDoExport.onclick = () => this._doExport();
    }

    _doExport() {
      try {
        const scale = +this.el.expScale.value;
        const fmt = this.el.expFormat.value;
        const transparent = fmt === "png" && this.el.expTransp.checked;
        const canvas = this.app.engine.exportComposite(scale, transparent);
        const mime = fmt === "jpeg" ? "image/jpeg" : "image/png";
        const url = canvas.toDataURL(mime, 0.92);
        const a = document.createElement("a");
        let name = (this.el.expName.value || "atelier-artwork").replace(/[^\w\-]+/g, "_");
        a.download = name + "." + (fmt === "jpeg" ? "jpg" : "png");
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.el.modalExport.classList.add("hidden");
        this.toast(`Exported ${canvas.width} × ${canvas.height} PNG-style ${fmt.toUpperCase()}`, "success");
      } catch (err) {
        this.toast("Export failed: " + err.message, "error");
      }
    }

    /* ================= HUD ================= */

    _bindHud() {
      const A = this.app;
      this.el.hudPause.onclick = () => A.artist.toggle();
      this.el.hudSkip.onclick = () => A.artist.skip();
      this.el.hudSpeed.addEventListener("input", () => {
        const v = +this.el.hudSpeed.value / 100;
        A.artist.setSpeed(v);
        this.el.hudSpeedVal.textContent = v.toFixed(1).replace(/\.0$/, "") + "×";
        const min = +this.el.hudSpeed.min, max = +this.el.hudSpeed.max;
        this.el.hudSpeed.style.setProperty("--fill", ((this.el.hudSpeed.value - min) / (max - min) * 100) + "%");
      });
      this.el.hudSpeed.dispatchEvent(new Event("input"));

      const artist = A.artist;
      artist.on("start", () => this._hudShow());
      artist.on("resumed", () => {
        this._hudIcon(true);
        this.el.hudOpLabel.textContent = "Painting…";
      });
      artist.on("paused", reason => {
        this._hudIcon(false);
        this.el.hudOpLabel.textContent = reason === "manual" ? "Paused — you drew manually" : "Paused";
        this.el.stageLabel.textContent = "paused";
        this.el.stageLabel.classList.remove("busy");
      });
      artist.on("progress", p => {
        this.el.hudProgressBar.style.width = (p * 100).toFixed(1) + "%";
        this.el.hudPct.textContent = Math.round(p * 100) + "%";
      });
      artist.on("stage", key => {
        const meta = artist.plan && artist.plan.meta;
        if (!meta) return;
        const idx = meta.stages.findIndex(s => s.key === key);
        const segs = this.el.hudStages.children;
        for (let i = 0; i < segs.length; i++) {
          segs[i].classList.toggle("current", i === idx);
          segs[i].classList.toggle("done", idx >= 0 && i < idx);
        }
        if (idx >= 0) {
          this.el.stageLabel.textContent = meta.stages[idx].label.toLowerCase() + "…";
          this.el.stageLabel.classList.add("busy");
        }
      });
      artist.on("oplabel", txt => {
        this.el.hudOpLabel.textContent = txt;
      });
      artist.on("done", () => {
        this._hudIcon(false);
        this.el.stageLabel.textContent = "finished";
        this.el.stageLabel.classList.remove("busy");
        for (const seg of this.el.hudStages.children) { seg.classList.add("done"); seg.classList.remove("current"); }
        this.toast("Artwork complete — export it anytime", "success");
        setTimeout(() => {
          if (artist.done) this.el.artistHUD.classList.add("hidden");
        }, 2200);
      });
      artist.on("loaded", meta => this._buildHudStages(meta));
    }

    _buildHudStages(meta) {
      const box = this.el.hudStages;
      box.innerHTML = "";
      for (const s of meta.stages) {
        const d = document.createElement("div");
        d.className = "hud-stage";
        d.textContent = s.label;
        box.appendChild(d);
      }
    }

    _hudShow() {
      this.el.artistHUD.classList.remove("hidden");
    }

    _hudIcon(playing) {
      this.el.hudPlayIcon.innerHTML = playing
        ? '<path d="M8 5 h3 v14 H8 Z M13 5 h3 v14 h-3 Z"/>'
        : '<path d="M8 5 l11 7 l-11 7 Z"/>';
    }

    /* ================= misc ================= */

    _bindMisc() {
      const A = this.app;
      this.el.esStartDraw.onclick = () => {
        A.tools.setTool("flow");
        this.dismissEmpty();
        this.toast("Wave your mouse across the canvas", "info");
      };
      this.el.esUpload.onclick = () => this.openUploadModal();
      this.el.cfOk.onclick = () => this._resolveConfirm(true);
      this.el.cfCancel.onclick = () => this._resolveConfirm(false);

      document.addEventListener("keydown", e => this._keydown(e));
      document.addEventListener("keyup", e => {
        if (e.code === "Space") {
          A.spaceDown = false;
          A.tools.spaceMode = false;
          A.engine.wrap.classList.remove("space-pan");
        }
      });

      A.engine.view.addEventListener("pointerdown", e => {
        if (A.artist.running && !A.artist.paused && !A.artist.skipping) {
          A.artist.pause("manual");
          this.toast("Artist paused — draw freely, then resume from the HUD", "info");
        }
        A.tools.pointerDown(e);
        this.dismissEmpty();
      });
      window.addEventListener("pointermove", e => A.tools.pointerMove(e));
      window.addEventListener("pointerup", () => A.tools.pointerUp());

      A.engine.view.addEventListener("wheel", e => {
        e.preventDefault();
        const rect = A.engine.view.getBoundingClientRect();
        const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
        const f = Math.exp(-e.deltaY * 0.0014);
        A.engine.zoomAt(sx, sy, f);
      }, { passive: false });

      A.engine.view.addEventListener("contextmenu", e => e.preventDefault());

      this.el.toolbar.addEventListener("contextmenu", e => e.preventDefault());

      A.tools.on("pointer", w => {
        const x = Math.floor(w.x), y = Math.floor(w.y);
        this.el.statPos.textContent =
          (x < 0 || y < 0 || x > A.engine.doc.w || y > A.engine.doc.h)
            ? "—" : `x${x} y${y}`;
      });
      A.tools.on("strokeEnd", () => this.dismissEmpty());
    }

    _keydown(e) {
      const A = this.app;
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;
      const k = e.key.toLowerCase();

      if (e.ctrlKey || e.metaKey) {
        if (k === "z") {
          e.preventDefault();
          e.shiftKey ? A.engine.redo() : A.engine.undo();
          return;
        }
        if (k === "y") { e.preventDefault(); A.engine.redo(); return; }
        if (k === "e") { e.preventDefault(); this.openExportModal(); return; }
        return;
      }

      switch (k) {
        case "b": A.tools.setTool("brush"); break;
        case "p": A.tools.setTool("pencil"); break;
        case "x": A.tools.setTool("pixel"); break;
        case "n": A.tools.setTool("pen"); break;
        case "f": A.tools.setTool("flow"); break;
        case "e": A.tools.setTool("eraser"); break;
        case "l": A.tools.setTool("line"); break;
        case "r": A.tools.setTool("rect"); break;
        case "o": A.tools.setTool("ellipse"); break;
        case "g": A.tools.setTool("fill"); break;
        case "i": A.tools.setTool("eyedrop"); break;
        case "h": A.tools.setTool("pan"); break;
        case "[": A.tools.applyAuto({ size: Math.max(1, A.tools.settings.size / 1.3) }); break;
        case "]": A.tools.applyAuto({ size: Math.min(200, A.tools.settings.size * 1.3) }); break;
        case "0": A.engine.fitToScreen(); break;
        case "+": case "=": A.engine.zoomAt(A.engine.wrap.clientWidth / 2, A.engine.wrap.clientHeight / 2, 1.25); break;
        case "-": A.engine.zoomAt(A.engine.wrap.clientWidth / 2, A.engine.wrap.clientHeight / 2, 0.8); break;
        case "tab": e.preventDefault(); this.el.panel.classList.toggle("collapsed"); break;
        case "delete": case "backspace": A.engine.clearLayer(); break;
        case "escape":
          A.tools.cancelSession();
          this.el.modalUpload.classList.add("hidden");
          this.el.modalExport.classList.add("hidden");
          this.el.modalConfirm.classList.add("hidden");
          if (this._confirmResolve) this._resolveConfirm(false);
          break;
      }
      if (e.code === "Space" && !e.repeat && tag !== "button") {
        e.preventDefault();
        A.spaceDown = true;
        A.tools.spaceMode = true;
        A.engine.wrap.classList.add("space-pan");
      }
    }
  }

  window.UI = UI;
})();
