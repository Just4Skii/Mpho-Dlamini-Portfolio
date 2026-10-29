(function () {
  "use strict";
  const U = window.U;

  const TOOL_LABELS = {
    flow: "Flow Ribbon", brush: "Brush", pencil: "Pencil", pixel: "Pixel Pencil",
    pen: "Fine-line Pen", eraser: "Eraser", line: "Line", rect: "Rectangle",
    ellipse: "Ellipse", fill: "Fill Bucket", eyedrop: "Eyedropper", pan: "Pan"
  };

  class Tools extends U.Emitter {
    constructor(engine) {
      super();
      this.engine = engine;
      this.tool = "flow";
      this.TOOL_LABELS = TOOL_LABELS;
      this.settings = {
        size: 14,
        opacity: 1,
        bpx: 1,
        tolerance: 32,
        fillShape: false,
        snap: true,
        symmetry: 1,
        rainbow: true
      };
      this.colors = { primary: "#7c6cff", secondary: "#f4f6ff" };
      this.cursorScreen = { x: 0, y: 0, visible: false };
      this.session = null;
      this.spaceMode = false;
      this._stampCache = new Map();

      engine.addPainter((ctx, eng) => this._painter(ctx, eng));
    }

    /* ------------- public API ------------- */

    setTool(t) {
      if (!TOOL_LABELS[t]) return;
      this.tool = t;
      this.emit("tool", t);
    }

    setPrimary(hex) {
      hex = hex.toUpperCase();
      this.colors.primary = hex;
      this.emit("colors");
    }

    setSecondary(hex) {
      this.colors.secondary = hex.toUpperCase();
      this.emit("colors");
    }

    swapColors() {
      const p = this.colors.primary;
      this.colors.primary = this.colors.secondary;
      this.colors.secondary = p;
      this.emit("colors");
    }

    applyAuto(opts) {
      if (opts.tool !== undefined) this.setTool(opts.tool);
      if (opts.color !== undefined) this.colors.primary = opts.color.toUpperCase();
      if (opts.size !== undefined) this.settings.size = U.clamp(Math.round(opts.size * 10) / 10, 0.5, 200);
      if (opts.opacity !== undefined) this.settings.opacity = U.clamp(opts.opacity, 0.05, 1);
      this.emit("settings");
      this.emit("colors");
    }

    beginPan(sx, sy) {
      const v = this.engine.view2;
      this.session = { type: "pan", sx, sy, vx: v.x, vy: v.y };
      this.engine.wrap.classList.add("panning");
    }

    pointerDown(e) {
      const eng = this.engine;
      const sx = e.clientX - eng.view.getBoundingClientRect().left;
      const sy = e.clientY - eng.view.getBoundingClientRect().top;
      const w = eng.screenToWorld(sx, sy);

      if (e.button === 1 || e.button === 2 || this.spaceMode || e.altKey || this.tool === "pan") {
        this.beginPan(sx, sy);
        return;
      }
      if (e.button !== 0) return;

      const doc = eng.doc;

      if (this.tool === "eyedrop") {
        this.session = { type: "eyedrop" };
        this._pick(w);
        return;
      }

      if (this.tool === "fill") {
        eng.floodFill(
          this._snapX(w.x), this._snapY(w.y),
          this.colors.primary, this.settings.tolerance,
          doc.pixelMode
        );
        this.emit("strokeEnd", "fill");
        return;
      }

      if (this.tool === "line" || this.tool === "rect" || this.tool === "ellipse") {
        const p = this._snapPointForShape(w);
        this.session = { type: "shape", tool: this.tool, start: p, cur: p };
        return;
      }

      const erase = this.tool === "eraser";
      const gesture = eng.beginGesture({
        erase,
        opacity: this.settings.opacity
      });
      const handler = this.makeRenderer(this.tool, gesture.ctx, {
        size: this._effectiveSize(),
        symmetry: this.settings.symmetry,
        rainbow: this.settings.rainbow,
        bpx: this.settings.bpx
      }, this.colors.primary);
      const p0 = this._capture(w, null);
      handler.begin && handler.begin(p0);
      handler.addPoint(p0, 16);
      eng.touchOp(p0.x, p0.y, Math.max(this._effectiveSize() * 2 + 2, this.settings.bpx * doc.pixelSize * 2));
      this.session = { type: "paint", tool: this.tool, handler, lastT: performance.now(), pts: [p0] };
      eng.requestRender();
    }

    pointerMove(e) {
      const eng = this.engine;
      const rect = eng.view.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      this.cursorScreen.x = sx;
      this.cursorScreen.y = sy;
      this.cursorScreen.visible = true;
      const w = eng.screenToWorld(sx, sy);

      const s = this.session;
      if (!s) {
        this.emit("pointer", w);
        return;
      }

      if (s.type === "pan") {
        eng.panBy(sx - s.sx, sy - s.sy);
        s.sx = sx;
        s.sy = sy;
        return;
      }
      if (s.type === "eyedrop") {
        this._pick(w);
        return;
      }
      if (s.type === "shape") {
        s.cur = this._snapPointForShape(w, e.shiftKey);
        eng.requestRender();
        return;
      }
      if (s.type === "paint") {
        const now = performance.now();
        const dt = Math.max(4, now - s.lastT);
        const p = this._capture(w, s.pts[s.pts.length - 1]);
        const minDist = s.tool === "pixel" ? 0 : 0.75;
        if (!p) return;
        if (minDist > 0) {
          const lp = s.pts[s.pts.length - 1];
          if (lp && U.dist(lp.x, lp.y, p.x, p.y) < minDist) return;
        }
        s.lastT = now;
        s.pts.push(p);
        s.handler.addPoint(p, dt);
        eng.touchOp(p.x, p.y, this._effectiveSize() * 2 + 2);
        eng.requestRender();
      }
    }

    pointerUp() {
      const eng = this.engine;
      const s = this.session;
      if (!s) return;
      if (s.type === "pan") {
        eng.wrap.classList.remove("panning");
      } else if (s.type === "paint") {
        s.handler.end && s.handler.end();
        eng.commitGesture(TOOL_LABELS[s.tool] || "Draw");
        this.emit("strokeEnd", s.tool);
      } else if (s.type === "shape") {
        this._commitShape(s);
      }
      this.session = null;
      eng.requestRender();
    }

    cancelSession() {
      const s = this.session;
      if (!s) return;
      if (s.type === "paint") this.engine.cancelGesture();
      if (s.type === "pan") this.engine.wrap.classList.remove("panning");
      this.session = null;
      this.engine.requestRender();
    }

    /* ------------- internals ------------- */

    _effectiveSize() {
      if (this.tool === "pen") return U.clamp(this.settings.size, 0.8, 3.5);
      if (this.tool === "pencil") return Math.min(this.settings.size, 24);
      return this.settings.size;
    }

    _snapX(x) { return this.engine.doc.pixelMode ? Math.floor(x) : x; }
    _snapY(y) { return this.engine.doc.pixelMode ? Math.floor(y) : y; }

    _snapPointForShape(w, shiftKey) {
      const doc = this.engine.doc;
      let p = { x: w.x, y: w.y };
      if (doc.pixelMode) {
        p.x = Math.floor(p.x);
        p.y = Math.floor(p.y);
      } else if (doc.snap && this.settings.snap) {
        const c = doc.pixelSize;
        p.x = Math.round(p.x / c) * c;
        p.y = Math.round(p.y / c) * c;
      }
      if (shiftKey && this.session) {
        const st = this.session.start;
        if (this.tool === "line") {
          const dx = p.x - st.x, dy = p.y - st.y;
          const ang = Math.atan2(dy, dx);
          const snapped = Math.round(ang / (Math.PI / 4)) * (Math.PI / 4);
          const len = Math.hypot(dx, dy);
          p = { x: st.x + Math.cos(snapped) * len, y: st.y + Math.sin(snapped) * len };
        } else {
          const dx = Math.abs(p.x - st.x), dy = Math.abs(p.y - st.y);
          const m = Math.max(dx, dy);
          p.x = st.x + Math.sign(p.x - st.x || 1) * m;
          p.y = st.y + Math.sign(p.y - st.y || 1) * m;
        }
      }
      return p;
    }

    _capture(raw) {
      if (this.tool === "pixel") {
        return { x: Math.floor(raw.x), y: Math.floor(raw.y) };
      }
      return { x: raw.x, y: raw.y };
    }

    _pick(w) {
      const hex = this.engine.eyedropSample(this._snapX(w.x), this._snapY(w.y));
      if (hex) {
        this.setPrimary(hex);
        this.emit("pickedColor", hex);
      }
    }

    /* ------------- renderers ------------- */

    makeRenderer(tool, ctx, o, color) {
      const size = Math.max(0.6, o.size || 2);
      const self = this;
      if (tool === "pencil" || tool === "pen") {
        const w = tool === "pen" ? U.clamp(size, 0.7, 3.4) : Math.max(0.9, size);
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        let last = null;
        return {
          begin(p) { last = p; },
          addPoint(p) {
            if (!last) { last = p; return; }
            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            last = p;
          },
          end() { last = null; }
        };
      }

      if (tool === "brush" || tool === "eraser") {
        const hard = tool === "eraser";
        const stamp = self._getStamp(size, hard ? "#000000" : color, hard);
        const spacing = Math.max(1, size * 0.11);
        let last = null;
        const put = p => {
          ctx.drawImage(stamp, p.x - stamp.width / 2, p.y - stamp.height / 2);
        };
        return {
          begin(p) { last = p; put(p); },
          addPoint(p) {
            if (!last) { last = p; put(p); return; }
            const d = U.dist(last.x, last.y, p.x, p.y);
            const n = Math.ceil(d / spacing);
            for (let i = 1; i <= n; i++) {
              put({ x: U.lerp(last.x, p.x, i / n), y: U.lerp(last.y, p.y, i / n) });
            }
            last = p;
          },
          end() { last = null; }
        };
      }

      if (tool === "pixel") {
        const doc = self.engine.doc;
        const cell = doc.pixelMode ? 1 : doc.pixelSize;
        const bpx = Math.max(1, o.bpx || 1);
        const seen = new Set();
        return {
          begin(p) {},
          addPoint(p) {
            const cx = Math.floor(p.x / cell) - ((bpx / 2) | 0);
            const cy = Math.floor(p.y / cell) - ((bpx / 2) | 0);
            for (let ix = 0; ix < bpx; ix++) {
              for (let iy = 0; iy < bpx; iy++) {
                const gx = cx + ix, gy = cy + iy;
                const k = gx + "," + gy;
                if (seen.has(k)) continue;
                seen.add(k);
                ctx.fillStyle = color;
                ctx.fillRect(gx * cell, gy * cell, cell, cell);
              }
            }
          },
          end() {}
        };
      }

      if (tool === "flow") {
        const doc = self.engine.doc;
        const cx = doc.w / 2, cy = doc.h / 2;
        const folds = Math.max(1, o.symmetry || 1);
        const rainbow = o.rainbow !== undefined ? o.rainbow : true;
        const hsv = U.rgbToHsv(U.hexToRgb(color));
        const hueBase = rainbow ? (hsv.s < 0.15 ? U.rand(0, 360) : hsv.h) : hsv.h;
        const satPct = Math.round(hsv.s * 84 + 10);
        const litPct = Math.round(U.clamp(hsv.v * 58 + 14, 28, 74));
        let last = null, width = size, arc = 0, hue = hueBase;
        const seg = (a, b, w2, h2) => {
          for (let f = 0; f < folds; f++) {
            const ang = (f / folds) * Math.PI * 2;
            const mirror = folds >= 2 && f % 2 === 1 ? -1 : 1;
            const pa = _rot(a, cx, cy, ang, mirror);
            const pb = _rot(b, cx, cy, ang, mirror);
            ctx.save();
            ctx.lineCap = "round";
            ctx.globalCompositeOperation = "lighter";
            ctx.strokeStyle = `hsla(${h2},${satPct}%,${litPct}%,0.08)`;
            ctx.lineWidth = w2 * 3.0;
            _line(pa, pb);
            ctx.strokeStyle = `hsla(${h2},${satPct}%,${Math.min(80, litPct + 6)}%,0.20)`;
            ctx.lineWidth = w2 * 1.6;
            _line(pa, pb);
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = `hsla(${h2},${satPct}%,${Math.min(86, litPct + 12)}%,0.85)`;
            ctx.lineWidth = Math.max(0.8, w2 * 0.55);
            _line(pa, pb);
            ctx.restore();
          }
        };
        function _line(a, b) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        function _rot(p, ox, oy, ang, mirror) {
          let dx = (p.x - ox) * mirror, dy = p.y - oy;
          const ca = Math.cos(ang), sa = Math.sin(ang);
          return { x: ox + dx * ca - dy * sa, y: oy + dx * sa + dy * ca };
        }
        return {
          begin(p) { last = { ...p }; width = size; },
          addPoint(p, dtMs) {
            if (!last) { last = { ...p }; return; }
            const d = U.dist(last.x, last.y, p.x, p.y);
            if (d < 0.35) return;
            arc += d;
            const v = d / Math.max(8, dtMs);
            const target = size * U.clamp(1.3 / (1 + v * 0.02), 0.16, 1.2);
            width += (target - width) * 0.28;
            if (rainbow) hue = (hueBase + arc * 0.45) % 360;
            seg(last, p, width, hue);
            last = { ...p };
          },
          end() { last = null; }
        };
      }

      return this.makeRenderer("pen", ctx, o, color);
    }

    _getStamp(size, color, hard) {
      const key = Math.round(size) + "|" + color + "|" + (hard ? 1 : 0);
      if (this._stampCache.has(key)) return this._stampCache.get(key);
      const s = Math.max(2, Math.ceil(size) + 2);
      const c = document.createElement("canvas");
      c.width = c.height = s;
      const g = c.getContext("2d");
      const r = size / 2;
      const grad = g.createRadialGradient(s / 2, s / 2, r * (hard ? 0.75 : 0), s / 2, s / 2, r);
      const rgb = U.hexToRgb(color);
      if (hard) {
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.8, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},1)`);
        grad.addColorStop(0.55, `rgba(${rgb.r},${rgb.g},${rgb.b},0.85)`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      }
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
      if (this._stampCache.size > 48) this._stampCache.clear();
      this._stampCache.set(key, c);
      return c;
    }

    /* ------------- shapes ------------- */

    _commitShape(s) {
      const eng = this.engine;
      const doc = eng.doc;
      const a = s.start, b = s.cur;
      if (U.dist(a.x, a.y, b.x, b.y) < 0.5) return;
      const color = this.colors.primary;
      const size = this._effectiveSize();
      eng.beginGesture({ opacity: this.settings.opacity });
      const ctx = eng.gesture.ctx;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const minX = Math.min(a.x, b.x) - size, minY = Math.min(a.y, b.y) - size;
      const maxX = Math.max(a.x, b.x) + size, maxY = Math.max(a.y, b.y) + size;

      if (doc.pixelMode) {
        this._pixelShape(ctx, s.tool, a, b, color);
      } else {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = size;
        if (s.tool === "line") {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        } else if (s.tool === "rect") {
          const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
          const w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
          if (this.settings.fillShape) ctx.fillRect(x, y, w, h);
          else ctx.strokeRect(x, y, w, h);
        } else if (s.tool === "ellipse") {
          ctx.beginPath();
          ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
          if (this.settings.fillShape) ctx.fill();
          else ctx.stroke();
        }
      }

      eng.touchOp(minX, minY, 0);
      eng.touchOp(maxX, maxY, 0);
      eng.commitGesture(TOOL_LABELS[s.tool]);
      this.emit("strokeEnd", s.tool);
    }

    _pixelShape(ctx, tool, a, b, color) {
      const doc = this.engine.doc;
      const cell = doc.pixelMode ? 1 : doc.pixelSize;
      const bpx = this.settings.bpx;
      const px = (cx, cy) => {
        ctx.fillStyle = color;
        ctx.fillRect(cx * cell, cy * cell, cell * bpx, cell * bpx);
      };
      const ax = Math.floor(a.x / cell), ay = Math.floor(a.y / cell);
      const bx = Math.floor(b.x / cell), by = Math.floor(b.y / cell);

      if (tool === "line") {
        _bresenham(ax, ay, bx, by, px);
      } else if (tool === "rect") {
        const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx);
        const y0 = Math.min(ay, by), y1 = Math.max(ay, by);
        if (this.settings.fillShape) {
          for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px(x, y);
        } else {
          for (let x = x0; x <= x1; x++) { px(x, y0); px(x, y1); }
          for (let y = y0; y <= y1; y++) { px(x0, y); px(x1, y); }
        }
      } else if (tool === "ellipse") {
        const cxm = (ax + bx) / 2, cym = (ay + by) / 2;
        const rx = Math.abs(bx - ax) / 2, ry = Math.abs(by - ay) / 2;
        if (rx < 0.5 || ry < 0.5) { px(ax, ay); return; }
        if (this.settings.fillShape) {
          for (let y = Math.floor(cym - ry); y <= Math.ceil(cym + ry); y++) {
            const t = Math.min(1, Math.max(0, (y - cym) / ry));
            const halfSpan = rx * Math.sqrt(Math.max(0, 1 - t * t));
            for (let x = Math.round(cxm - halfSpan); x <= Math.round(cxm + halfSpan); x++) px(x, y);
          }
        } else {
          let x = 0, y = Math.round(ry);
          let d1 = ry * ry - rx * rx * ry + rx * rx * 0.25;
          let dx = 2 * rx * rx * y, dy = 2 * rx * rx * x;
          const plot4 = (xx, yy) => {
            px(Math.round(cxm + xx), Math.round(cym + yy));
            px(Math.round(cxm - xx), Math.round(cym + yy));
            px(Math.round(cxm + xx), Math.round(cym - yy));
            px(Math.round(cxm - xx), Math.round(cym - yy));
          };
          while (dx < dy) {
            plot4(x, y);
            if (d1 < 0) { x++; dx += 2 * rx * rx; d1 += dx + ry * ry; }
            else { x++; y--; dx += 2 * rx * rx; dy -= 2 * ry * ry; d1 += dx - dy + ry * ry; }
          }
          let d2 = ry * ry * (x + 0.5) * (x + 0.5) + rx * rx * (y - 1) * (y - 1) - rx * rx * ry * ry;
          while (y >= 0) {
            plot4(x, y);
            if (d2 > 0) { y--; dy -= 2 * ry * ry; d2 += rx * rx - dy; }
            else { y--; x++; dx += 2 * rx * rx; dy -= 2 * ry * ry; d2 += dx - dy + rx * rx; }
          }
        }
      }
    }

    /* ------------- overlay painting ------------- */

    _painter(ctx, eng) {
      const s = this.session;
      if (s && s.type === "shape") {
        const a = eng.worldToScreen(s.start.x, s.start.y);
        const b = eng.worldToScreen(s.cur.x, s.cur.y);
        ctx.save();
        ctx.strokeStyle = "rgba(124,108,255,.9)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        if (s.tool === "line") {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        } else if (s.tool === "rect") {
          ctx.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
        } else {
          ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.restore();
      }

      if (!this.cursorScreen.visible || (s && s.type === "pan")) return;
      const paintTools = ["brush", "pencil", "pen", "eraser", "flow", "pixel"];
      if (!paintTools.includes(this.tool)) return;
      const r = this._effectiveSize() * eng.zoom / 2;
      const x = this.cursorScreen.x, y = this.cursorScreen.y;
      ctx.save();
      if (this.tool === "pixel") {
        const doc = eng.doc;
        const cellPx = (doc.pixelMode ? 1 : doc.pixelSize) * eng.zoom * this.settings.bpx;
        ctx.strokeStyle = "rgba(255,255,255,.85)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - cellPx / 2, y - cellPx / 2, cellPx, cellPx);
      } else if (r >= 3) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,.55)";
        ctx.beginPath();
        ctx.arc(x, y, r + 1, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function _bresenham(x0, y0, x1, y1, plot) {
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      plot(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  window.Tools = Tools;
})();
