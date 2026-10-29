(function () {
  "use strict";
  const U = window.U;
  const { Emitter } = U;

  class Engine extends Emitter {
    constructor(wrapEl, viewEl, overlayEl) {
      super();
      this.wrap = wrapEl;
      this.view = viewEl;
      this.vctx = viewEl.getContext("2d");
      this.overlay = overlayEl;
      this.octx = overlayEl.getContext("2d");
      this.dpr = Math.max(1, window.devicePixelRatio || 1);

      this.doc = {
        w: 1280, h: 800,
        pixelMode: false,
        pixelSize: 8,
        snap: false,
        showGrid: false
      };
      this.view2 = { z: 1, x: 0, y: 0 };
      this.layers = [];
      this.activeIdx = 0;

      this.dirty = true;
      this.painters = new Set();
      this.gesture = null;
      this._openOp = null;
      this.undoStack = [];
      this.redoStack = [];
      this.maxHistory = 60;

      this.checkerPattern = null;
      this.scratch = document.createElement("canvas");

      this._resize();
      new ResizeObserver(() => this._resize()).observe(wrapEl);
      this._raf = this._raf.bind(this);
      requestAnimationFrame(this._raf);
    }

    /* ---------- setup ---------- */
    _resize() {
      const w = this.wrap.clientWidth, h = this.wrap.clientHeight;
      if (w === 0 || h === 0) return;
      this.dpr = Math.max(1, window.devicePixelRatio || 1);
      for (const c of [this.view, this.overlay]) {
        c.width = Math.round(w * this.dpr);
        c.height = Math.round(h * this.dpr);
      }
      const pc = document.createElement("canvas");
      pc.width = pc.height = 16;
      const pctx = pc.getContext("2d");
      pctx.fillStyle = "#3a4152";
      pctx.fillRect(0, 0, 16, 16);
      pctx.fillStyle = "#2c3242";
      pctx.fillRect(0, 0, 8, 8);
      pctx.fillRect(8, 8, 8, 8);
      this.checkerPattern = this.vctx.createPattern(pc, "repeat");
      this.fitToScreen();
    }

    _raf() {
      if (this.dirty || this.painters.size) this.draw();
      requestAnimationFrame(this._raf);
    }

    requestRender() { this.dirty = true; }

    addPainter(fn) { this.painters.add(fn); this.requestRender(); }
    removePainter(fn) { this.painters.delete(fn); this.requestRender(); }

    /* ---------- coordinate transforms ---------- */
    get zoom() { return this.view2.z; }
    screenToWorld(sx, sy) { return { x: (sx - this.view2.x) / this.view2.z, y: (sy - this.view2.y) / this.view2.z }; }
    worldToScreen(wx, wy) { return { x: wx * this.view2.z + this.view2.x, y: wy * this.view2.z + this.view2.y }; }
    pointerToWorld(e) {
      const r = this.view.getBoundingClientRect();
      return this.screenToWorld(e.clientX - r.left, e.clientY - r.top);
    }

    zoomAt(sx, sy, factor) {
      if (!isFinite(factor) || factor <= 0) return;
      const v = this.view2;
      const nz = Math.min(64, Math.max(0.04, v.z * factor));
      const k = nz / v.z;
      v.x = sx - (sx - v.x) * k;
      v.y = sy - (sy - v.y) * k;
      v.z = nz;
      this.requestRender();
      this.emit("view");
    }

    fitToScreen(pad) {
      pad = pad !== undefined ? pad : 90;
      const cw = this.wrap.clientWidth, ch = this.wrap.clientHeight;
      if (!cw || !ch) return;
      const z = Math.min((cw - pad) / this.doc.w, (ch - pad) / this.doc.h);
      this.view2.z = Math.max(0.04, Math.min(64, z));
      this.centerView();
      this.emit("view");
    }

    centerView() {
      const cw = this.wrap.clientWidth, ch = this.wrap.clientHeight;
      this.view2.x = (cw - this.doc.w * this.view2.z) / 2;
      this.view2.y = (ch - this.doc.h * this.view2.z) / 2;
      this.requestRender();
    }

    panBy(dx, dy) {
      this.view2.x += dx;
      this.view2.y += dy;
      this.requestRender();
    }

    /* ---------- document & layers ---------- */
    _makeLayer(name) {
      const canvas = document.createElement("canvas");
      canvas.width = this.doc.w;
      canvas.height = this.doc.h;
      return { id: window.U.uid(), name, canvas, ctx: canvas.getContext("2d", { willReadFrequently: true }), visible: true, opacity: 1, locked: false };
    }

    _snapshotAll() {
      return {
        dims: { w: this.doc.w, h: this.doc.h },
        activeIdx: this.activeIdx,
        layers: this.layers.map(l => ({
          name: l.name,
          visible: l.visible,
          opacity: l.opacity,
          locked: l.locked,
          canvas: this._cloneCanvas(l.canvas)
        }))
      };
    }

    _installSnapshot(snap) {
      const prevActiveId = this.layers[this.activeIdx] && this.layers[this.activeIdx].id;
      this.doc.w = snap.dims.w;
      this.doc.h = snap.dims.h;
      this.layers = snap.layers.map(sl => {
        const canvas = this._cloneCanvas(sl.canvas);
        return {
          id: window.U.uid(),
          name: sl.name,
          canvas,
          ctx: canvas.getContext("2d", { willReadFrequently: true }),
          visible: sl.visible,
          opacity: sl.opacity,
          locked: sl.locked
        };
      });
      let idx = U.clamp(snap.activeIdx, 0, this.layers.length - 1);
      void prevActiveId;
      this.activeIdx = idx;
    }

    _beginStructuralOp(label) {
      const before = this._snapshotAll();
      const self = this;
      return {
        finish() {
          const after = self._snapshotAll();
          self.pushCommand({
            label,
            undo: () => self._installSnapshot(before),
            redo: () => self._installSnapshot(after)
          });
        }
      };
    }

    resetDocument(w, h) {
      this.doc.w = w;
      this.doc.h = h;
      this.layers = [];
      this.layers.push(this._makeLayer("Background"));
      this.activeIdx = 0;
      this.undoStack = [];
      this.redoStack = [];
      this.emit("history");
      this.emit("layers");
      this.emit("doc");
      this.fitToScreen();
    }

    setDocSize(w, h, scaleContent) {
      w = Math.round(U.clamp(w, 8, 4096));
      h = Math.round(U.clamp(h, 8, 4096));
      const op = this._beginStructuralOp("Resize canvas");
      const oldW = this.doc.w, oldH = this.doc.h;
      this.doc.w = w;
      this.doc.h = h;
      for (const l of this.layers) {
        const nc = document.createElement("canvas");
        nc.width = w; nc.height = h;
        const nctx = nc.getContext("2d", { willReadFrequently: true });
        nctx.imageSmoothingEnabled = !this.doc.pixelMode;
        nctx.imageSmoothingQuality = "high";
        if (scaleContent) nctx.drawImage(l.canvas, 0, 0, oldW, oldH, 0, 0, w, h);
        l.canvas = nc;
        l.ctx = nctx;
      }
      op.finish();
      this.emit("doc");
      this.fitToScreen();
    }

    _cloneCanvas(c) {
      const n = document.createElement("canvas");
      n.width = c.width; n.height = c.height;
      n.getContext("2d").drawImage(c, 0, 0);
      return n;
    }

    get activeLayer() { return this.layers[this.activeIdx]; }

    setActiveLayer(idx) {
      this.activeIdx = Math.max(0, Math.min(idx, this.layers.length - 1));
      this.emit("layers");
      this.requestRender();
    }

    addLayer() {
      const op = this._beginStructuralOp("Add layer");
      const l = this._makeLayer("Layer " + (this.layers.length + 1));
      this.layers.splice(this.activeIdx + 1, 0, l);
      this.activeIdx++;
      op.finish();
      this.emit("layers");
      this.requestRender();
    }

    duplicateLayer() {
      const src = this.activeLayer;
      const l = this._makeLayer(src.name + " copy");
      l.ctx.drawImage(src.canvas, 0, 0);
      l.opacity = src.opacity;
      const op = this._beginStructuralOp("Duplicate layer");
      this.layers.splice(this.activeIdx + 1, 0, l);
      this.activeIdx++;
      op.finish();
      this.emit("layers");
      this.requestRender();
    }

    deleteLayer() {
      if (this.layers.length <= 1) return;
      const op = this._beginStructuralOp("Delete layer");
      const idx = this.activeIdx;
      this.layers.splice(idx, 1);
      this.activeIdx = Math.max(0, idx - 1);
      op.finish();
      this.emit("layers");
      this.requestRender();
    }

    mergeDown() {
      if (this.activeIdx === 0) return;
      const top = this.layers[this.activeIdx];
      const below = this.layers[this.activeIdx - 1];
      const op = this._beginStructuralOp("Merge down");
      below.ctx.globalAlpha = top.opacity;
      below.ctx.drawImage(top.canvas, 0, 0);
      below.ctx.globalAlpha = 1;
      this.layers.splice(this.activeIdx, 1);
      this.activeIdx--;
      op.finish();
      this.emit("layers");
      this.requestRender();
    }

    moveLayer(dir) {
      const target = this.activeIdx + dir;
      if (target < 0 || target >= this.layers.length) return;
      const op = this._beginStructuralOp("Reorder layer");
      const [l] = this.layers.splice(this.activeIdx, 1);
      this.layers.splice(target, 0, l);
      this.activeIdx = target;
      op.finish();
      this.emit("layers");
      this.requestRender();
    }

    setLayerOpacity(idx, val) {
      this.layers[idx].opacity = val;
      this.requestRender();
      this.emit("layers");
    }

    toggleLayerVisible(idx) {
      this.layers[idx].visible = !this.layers[idx].visible;
      this.requestRender();
      this.emit("layers");
    }

    /* ---------- history ---------- */
    pushCommand(cmd) {
      this.undoStack.push(cmd);
      if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
      this.redoStack = [];
      this.emit("history");
    }

    undo() {
      const cmd = this.undoStack.pop();
      if (!cmd) return;
      cmd.undo();
      this.redoStack.push(cmd);
      this.emit("history");
      this.emit("layers");
      this.requestRender();
    }

    redo() {
      const cmd = this.redoStack.pop();
      if (!cmd) return;
      cmd.redo();
      this.undoStack.push(cmd);
      this.emit("history");
      this.emit("layers");
      this.requestRender();
    }

    get canUndo() { return this.undoStack.length > 0; }
    get canRedo() { return this.redoStack.length > 0; }

    /* ---------- raster op tracking (dirty-rect undo) ---------- */
    beginOp(layer) {
      this._openOp = {
        layer,
        before: layer.ctx.getImageData(0, 0, this.doc.w, this.doc.h),
        minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity
      };
      return this._openOp;
    }

    touchOp(x, y, pad) {
      const op = this._openOp;
      if (!op) return;
      pad = pad || 0;
      op.minX = Math.min(op.minX, x - pad);
      op.minY = Math.min(op.minY, y - pad);
      op.maxX = Math.max(op.maxX, x + pad);
      op.maxY = Math.max(op.maxY, y + pad);
    }

    cancelOp() { this._openOp = null; }

    commitOp(label) {
      const op = this._openOp;
      this._openOp = null;
      if (!op) return;
      const { layer, before } = op;
      if (op.maxX < op.minX) return;
      const x = Math.max(0, Math.floor(op.minX)), y = Math.max(0, Math.floor(op.minY));
      const x2 = Math.min(this.doc.w, Math.ceil(op.maxX)), y2 = Math.min(this.doc.h, Math.ceil(op.maxY));
      const w = Math.max(1, x2 - x), h = Math.max(1, y2 - y);
      const after = layer.ctx.getImageData(x, y, w, h);
      const ctx = layer.ctx;
      const beforeSub = ctx.createImageData(w, h);
      for (let row = 0; row < h; row++) {
        const srcStart = ((y + row) * before.width + x) * 4;
        beforeSub.data.set(before.data.subarray(srcStart, srcStart + w * 4), row * w * 4);
      }
      this.pushCommand({
        label,
        undo: () => ctx.putImageData(beforeSub, x, y),
        redo: () => ctx.putImageData(after, x, y)
      });
    }

    /* ---------- gestures (in-progress strokes) ---------- */
    beginGesture(opts) {
      const t = document.createElement("canvas");
      t.width = this.doc.w;
      t.height = this.doc.h;
      const layer = opts.layer || this.activeLayer;
      this.gesture = {
        temp: t,
        ctx: t.getContext("2d"),
        erase: !!opts.erase,
        opacity: opts.opacity !== undefined ? opts.opacity : 1,
        layer
      };
      this.beginOp(layer);
      return this.gesture;
    }

    commitGesture(label) {
      const g = this.gesture;
      if (!g) return;
      this.gesture = null;
      g.ctx.globalCompositeOperation = "source-over";
      const lctx = g.layer.ctx;
      lctx.save();
      lctx.globalAlpha = g.opacity;
      if (g.erase) lctx.globalCompositeOperation = "destination-out";
      lctx.drawImage(g.temp, 0, 0);
      lctx.restore();
      this.commitOp(label || "Draw");
      this.requestRender();
      this.emit("artwork");
    }

    cancelGesture() {
      if (!this.gesture) return;
      this.gesture = null;
      this.cancelOp();
      this.requestRender();
    }

    /* ---------- raster helpers ---------- */
    fillEntireLayer(hex, label) {
      const layer = this.activeLayer;
      this.beginOp(layer);
      layer.ctx.save();
      layer.ctx.fillStyle = hex;
      layer.ctx.fillRect(0, 0, this.doc.w, this.doc.h);
      layer.ctx.restore();
      this.touchOp(0, 0, 0);
      this.touchOp(this.doc.w, this.doc.h, 0);
      this.commitOp(label || "Fill background");
      this.requestRender();
      this.emit("artwork");
    }

    clearLayer() {
      this.fillEntireLayer("rgba(0,0,0,0)", "Clear layer");
    }

    floodFill(wx, wy, hex, tolerance, cellGrid) {
      const layer = this.activeLayer;
      const W = this.doc.w, H = this.doc.h;
      const rgb = window.U.hexToRgb(hex);
      tolerance = Math.round(window.U.clamp(tolerance, 0, 255));

      this.beginOp(layer);
      let minX = W, minY = H, maxX = -1, maxY = -1;
      const mark = (x, y) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      };
      let changed = 0;

      const img = layer.ctx.getImageData(0, 0, W, H);
      const data = img.data;

      if (cellGrid) {
        const cs = Math.max(1, Math.round(this.doc.pixelMode ? 1 : this.doc.pixelSize));
        const gw = Math.ceil(W / cs), gh = Math.ceil(H / cs);
        const cellCol = new Int32Array(gw * gh);
        for (let cy = 0; cy < gh; cy++) {
          for (let cx = 0; cx < gw; cx++) {
            const px = Math.min(W - 1, cx * cs + (cs >> 1));
            const py = Math.min(H - 1, cy * cs + (cs >> 1));
            const i = (py * W + px) * 4;
            cellCol[cy * gw + cx] = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
          }
        }
        const sx = Math.floor(wx / cs), sy = Math.floor(wy / cs);
        if (sx < 0 || sy < 0 || sx >= gw || sy >= gh) { this.cancelOp(); return 0; }
        const target = cellCol[sy * gw + sx];
        const repl = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
        if (target === repl) { this.cancelOp(); return 0; }
        const visited = new Uint8Array(gw * gh);
        const stack = [sy * gw + sx];
        while (stack.length) {
          const ci = stack.pop();
          if (visited[ci]) continue;
          visited[ci] = 1;
          if (cellCol[ci] !== target) continue;
          const cx = ci % gw, cy = (ci / gw) | 0;
          if (cx > 0) stack.push(ci - 1);
          if (cx < gw - 1) stack.push(ci + 1);
          if (cy > 0) stack.push(ci - gw);
          if (cy < gh - 1) stack.push(ci + gw);
          mark(cx * cs, cy * cs);
          mark(cx * cs + cs, cy * cs + cs);
        }
        layer.ctx.fillStyle = hex;
        for (let ci = 0; ci < visited.length; ci++) {
          if (!visited[ci] || cellCol[ci] !== target) continue;
          const cx = ci % gw, cy = (ci / gw) | 0;
          layer.ctx.fillRect(cx * cs, cy * cs, cs, cs);
          changed++;
        }
      } else {
        const sx = Math.floor(wx), sy = Math.floor(wy);
        if (sx < 0 || sy < 0 || sx >= W || sy >= H) { this.cancelOp(); return 0; }
        const si = (sy * W + sx) * 4;
        const tr = data[si], tg = data[si + 1], tb = data[si + 2], ta = data[si + 3];
        const match = i => {
          const dr = Math.abs(data[i] - tr), dg = Math.abs(data[i + 1] - tg);
          const db = Math.abs(data[i + 2] - tb), da = Math.abs(data[i + 3] - ta);
          return dr + dg + db + da <= tolerance * 3;
        };
        if (Math.abs(rgb.r - tr) + Math.abs(rgb.g - tg) + Math.abs(rgb.b - tb) <= tolerance * 3 && ta === 255) {
          this.cancelOp();
          return 0;
        }
        const visited = new Uint8Array(W * H);
        const stack = [sy * W + sx];
        while (stack.length) {
          const pi = stack.pop();
          if (visited[pi]) continue;
          visited[pi] = 1;
          if (!match(pi * 4)) continue;
          const px = pi % W, py = (pi / W) | 0;
          if (px > 0) stack.push(pi - 1);
          if (px < W - 1) stack.push(pi + 1);
          if (py > 0) stack.push(pi - W);
          if (py < H - 1) stack.push(pi + W);
          mark(px, py);
        }
        layer.ctx.fillStyle = hex;
        for (let pi = 0; pi < visited.length; pi++) {
          if (visited[pi] && match(pi * 4)) {
            layer.ctx.fillRect(pi % W, (pi / W) | 0, 1, 1);
            changed++;
          }
        }
      }

      if (maxX < 0) { this.cancelOp(); return 0; }
      this.touchOp(minX - 1, minY - 1, 0);
      this.touchOp(maxX + 2, maxY + 2, 0);
      this.commitOp("Fill");
      this.requestRender();
      this.emit("artwork");
      return changed;
    }

    eyedropSample(wx, wy) {
      const x = Math.floor(wx), y = Math.floor(wy);
      const W = this.doc.w, H = this.doc.h;
      if (x < 0 || y < 0 || x >= W || y >= H) return null;
      let ar = 0, ag = 0, ab = 0, aa = 0;
      for (const layer of this.layers) {
        if (!layer.visible) continue;
        const d = layer.ctx.getImageData(x, y, 1, 1).data;
        const sa = d[3] / 255;
        if (sa === 0) continue;
        const outA = sa + aa * (1 - sa);
        if (outA === 0) continue;
        ar = (d[0] * sa + ar * aa * (1 - sa)) / outA;
        ag = (d[1] * sa + ag * aa * (1 - sa)) / outA;
        ab = (d[2] * sa + ab * aa * (1 - sa)) / outA;
        aa = outA;
      }
      if (aa < 0.02) return null;
      return window.U.rgbToHex(ar, ag, ab);
    }

    /* ---------- export ---------- */
    exportComposite(scale, transparentBg) {
      scale = scale || 1;
      const c = document.createElement("canvas");
      c.width = Math.round(this.doc.w * scale);
      c.height = Math.round(this.doc.h * scale);
      const ctx = c.getContext("2d");
      if (!transparentBg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
      }
      ctx.imageSmoothingEnabled = !this.doc.pixelMode;
      ctx.imageSmoothingQuality = "high";
      for (const layer of this.layers) {
        if (!layer.visible) continue;
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0, c.width, c.height);
      }
      ctx.globalAlpha = 1;
      return c;
    }

    /* ---------- main render ---------- */
    draw() {
      this.dirty = false;
      const { vctx, octx, dpr, doc } = this;
      const vw = this.view.width, vh = this.view.height;
      const v = this.view2;

      vctx.setTransform(1, 0, 0, 1, 0, 0);
      vctx.clearRect(0, 0, vw, vh);

      const dx = v.x * dpr, dy = v.y * dpr, dw = doc.w * v.z * dpr, dh = doc.h * v.z * dpr;

      if (dx < vw && dy < vh && dx + dw > 0 && dy + dh > 0) {
        vctx.save();
        vctx.beginPath();
        vctx.rect(dx, dy, dw, dh);
        vctx.clip();
        vctx.fillStyle = this.checkerPattern;
        vctx.fillRect(dx, dy, dw, dh);

        vctx.setTransform(v.z * dpr, 0, 0, v.z * dpr, dx, dy);
        vctx.imageSmoothingEnabled = !doc.pixelMode;
        vctx.imageSmoothingQuality = "high";

        for (const layer of this.layers) {
          if (!layer.visible || layer.opacity <= 0) continue;
          if (this.gesture && this.gesture.erase && layer === this.gesture.layer) {
            const s = this.scratch;
            if (s.width !== doc.w || s.height !== doc.h) { s.width = doc.w; s.height = doc.h; }
            const sctx = s.getContext("2d");
            sctx.globalCompositeOperation = "source-over";
            sctx.clearRect(0, 0, doc.w, doc.h);
            sctx.drawImage(layer.canvas, 0, 0);
            sctx.globalCompositeOperation = "destination-out";
            sctx.drawImage(this.gesture.temp, 0, 0);
            sctx.globalCompositeOperation = "source-over";
            vctx.globalAlpha = layer.opacity;
            vctx.drawImage(s, 0, 0);
            continue;
          }
          vctx.globalAlpha = layer.opacity;
          vctx.drawImage(layer.canvas, 0, 0);
          if (this.gesture && !this.gesture.erase && layer === this.gesture.layer) {
            vctx.globalAlpha = layer.opacity * this.gesture.opacity;
            vctx.drawImage(this.gesture.temp, 0, 0);
          }
        }

        vctx.globalAlpha = 1;

        if (doc.showGrid) this._drawGrid(vctx, v.z);

        vctx.restore();

        vctx.setTransform(1, 0, 0, 1, 0, 0);
        vctx.strokeStyle = "rgba(124,108,255,.55)";
        vctx.lineWidth = 1;
        vctx.strokeRect(dx - 0.5, dy - 0.5, dw + 1, dh + 1);
        vctx.strokeStyle = "rgba(0,0,0,.6)";
        vctx.strokeRect(dx - 4.5, dy - 4.5, dw + 9, dh + 9);
      }

      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, vw, vh);
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const painter of this.painters) painter(octx, this);
    }

    _drawGrid(ctx, z) {
      const doc = this.doc;
      const step = doc.pixelMode ? 1 : doc.pixelSize;
      if (step * z < 5) return;
      const majorEvery = doc.pixelMode ? 8 : 4;
      const minor = new Path2D();
      const major = new Path2D();
      for (let gx = 0; gx <= doc.w; gx += step) {
        const path = (gx / step) % majorEvery === 0 ? major : minor;
        path.moveTo(gx, 0);
        path.lineTo(gx, doc.h);
      }
      for (let gy = 0; gy <= doc.h; gy += step) {
        const path = (gy / step) % majorEvery === 0 ? major : minor;
        path.moveTo(0, gy);
        path.lineTo(doc.w, gy);
      }
      ctx.lineWidth = 1 / z;
      ctx.strokeStyle = "rgba(255,255,255,.10)";
      ctx.stroke(minor);
      ctx.strokeStyle = "rgba(255,255,255,.24)";
      ctx.stroke(major);
    }
  }

  window.Engine = Engine;
})();
