(function () {
  "use strict";
  const U = window.U;

  class Artist extends U.Emitter {
    constructor(app) {
      super();
      this.app = app;
      this.plan = null;
      this.ops = [];
      this.idx = 0;
      this.running = false;
      this.paused = false;
      this.skipping = false;
      this.speed = 1;
      this.layer = null;
      this.cursor = { x: 0, y: 0, visible: false, down: false, angle: 0 };
      this.trail = [];
      this._weights = null;
      this._totalWeight = 1;
      this._stageWeights = [];
      this._rafId = null;
      this._lastTs = 0;
      this._state = null;
    }

    load(plan) {
      this.stop(true);
      this.plan = plan;
      this.ops = plan.ops.slice();
      this.idx = 0;
      this.paused = false;
      this.skipping = false;
      this._curStage = null;
      this._buildWeights();
      this.emit("loaded", plan.meta);
    }

    _buildWeights() {
      this._weights = new Float64Array(this.ops.length);
      this._stageWeights = {};
      let total = 0;
      let currentStage = null;
      for (let i = 0; i < this.ops.length; i++) {
        const o = this.ops[i];
        let w;
        if (o.op === "stroke") w = Math.min(U.pathLength(o.pts), 2600) + 240;
        else if (o.op === "pixrun") w = o.len + o.cell * 6;
        else if (o.op === "fill") w = 420;
        else w = 26;
        total += w;
        this._weights[i] = total;
        if (o.stage && o.stage !== currentStage) {
          currentStage = o.stage;
          this._stageWeights[currentStage] = { start: total - w, i };
        }
      }
      this._totalWeight = Math.max(1, total);
    }

    get progress() {
      if (!this.ops.length || this.idx <= 0) return 0;
      if (this.idx >= this.ops.length) return 1;
      return U.clamp(this._weights[this.idx - 1] / this._totalWeight, 0, 1);
    }

    get done() { return this.idx >= this.ops.length; }

    start() {
      if (!this.plan || !this.ops.length) return;
      if (this.done) { this.idx = 0; }
      this.running = true;
      this.paused = false;
      this.layer = this.app.engine.activeLayer;
      this.cursor.visible = true;
      const first = this._firstPointOf(this.ops[this.idx]);
      if (first) {
        this.cursor.x = first.x;
        this.cursor.y = first.y;
      }
      this.emit("start");
      this.emit("resumed");
      if (!this._rafId) {
        this._lastTs = performance.now();
        this._rafId = requestAnimationFrame(this._tick.bind(this));
      }
    }

    pause(reason) {
      if (!this.running || this.paused || this.skipping) return;
      this.paused = true;
      this.cursor.down = false;
      if (this._state && this._state.kind === "stroke" && this._state.handler) {
        try { this._state.handler.end && this._state.handler.end(); } catch (e) { void e; }
        this.app.engine.commitGesture("Auto stroke (paused)");
        this._advance();
      } else if (this._state && this._state.kind === "pixrun") {
        this.app.engine.commitGesture("Auto pixels (paused)");
        this._advance();
      }
      this._state = null;
      this.emit("paused", reason);
    }

    resume() {
      if (!this.running || !this.paused) return;
      this.paused = false;
      this._state = null;
      this.emit("resumed");
    }

    toggle() { this.paused ? this.resume() : this.pause("user"); }

    skip() {
      if (!this.plan || this.done || this.skipping) return;
      if (!this.running) this.start();
      this.skipping = true;
      this.paused = false;
      this.emit("skipping");
      this._skipLoop();
    }

    async _skipLoop() {
      const eng = this.app.engine;
      const session = !eng.gesture ? eng.beginGesture({ layer: this.layer || eng.activeLayer }) : null;
      let budgetStart = performance.now();
      while (this.idx < this.ops.length) {
        const op = this.ops[this.idx];
        this._execOpInstant(op, { batched: !!session });
        this._advance();
        if (performance.now() - budgetStart > 24) {
          this.emit("progress", this.progress);
          await U.tickAsync();
          budgetStart = performance.now();
        }
      }
      if (session) eng.commitGesture("Auto artwork");
      this.skipping = false;
      this._finish();
    }

    stop(silent) {
      this.running = false;
      this.paused = false;
      this.skipping = false;
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
      this._state = null;
      if (silent !== true) this.emit("stopped");
    }

    reset() {
      this.stop(true);
      this.idx = 0;
      this.cursor.visible = false;
      this.trail.length = 0;
      this.emit("progress", 0);
    }

    setSpeed(mult) {
      this.speed = U.clamp(mult, 0.25, 8);
    }

    _finish() {
      this.running = false;
      this.cursor.down = false;
      this.cursor.visible = false;
      this.emit("progress", 1);
      this.emit("done");
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    }
    _tick(ts) {
      this._rafId = requestAnimationFrame(this._tick.bind(this));
      const dtMs = Math.max(0, Math.min(50, ts - this._lastTs));
      this._lastTs = ts;

      this.trail.push({ x: this.cursor.x, y: this.cursor.y });
      if (this.trail.length > 16) this.trail.shift();

      if (!this.running || this.paused || this.skipping) {
        this.emit("frame");
        return;
      }

      let guard = 0;
      while (guard++ < 400) {
        if (this.idx >= this.ops.length) { this._finish(); break; }
        const progressed = this._stepOp(dtMs);
        if (!progressed) break;
      }
      this.emit("progress", this.progress);
      this.emit("frame");
    }

    _advance() { this.idx++; }

    _firstPointOf(op) {
      if (!op) return null;
      if (op.op === "stroke") return op.pts[0];
      if (op.op === "fill") return { x: op.x, y: op.y };
      if (op.op === "pixrun") return { x: op.x, y: op.y + op.cell / 2 };
      return null;
    }

    _stepOp(dtMs) {
      const op = this.ops[this.idx];
      if (!op) return false;

      if (!this._state) {
        this._initOp(op);
        if (!this._state) {
          this._advance();
          return true;
        }
      }

      const st = this._state;
      switch (st.kind) {
        case "note": {
          st.timer -= dtMs * this.speed;
          if (st.timer <= 0) { this._state = null; this._advance(); return true; }
          return false;
        }
        case "approach": {
          st.t += dtMs * this.speed;
          const dur = Math.max(st.dur, 1);
          const raw = U.clamp(st.t / dur, 0, 1);
          const e = U.easeInOutCubic(raw);
          const bx = U.lerp(st.from.x, st.to.x, e);
          const by = U.lerp(st.from.y, st.to.y, e);
          const wob = Math.sin(raw * Math.PI * 2.2) * Math.min(7, st.dist * 0.06) * (1 - raw);
          const nx = -(st.to.y - st.from.y), ny = (st.to.x - st.from.x);
          const nl = Math.hypot(nx, ny) || 1;
          this.cursor.x = bx + (nx / nl) * wob;
          this.cursor.y = by + (ny / nl) * wob;
          this.cursor.angle = Math.atan2(st.to.y - st.from.y, st.to.x - st.from.x);
          if (raw >= 1) {
            this.cursor.x = st.to.x;
            this.cursor.y = st.to.y;
            this._state = st.next;
            if (!st.next) { this._advance(); return true; }
            if (st.next.kind === "stroke" || st.next.kind === "pixrun") {
              this.cursor.down = true;
              st.next.pxPerSec = U.rand(850, 1250);
            }
          }
          return false;
        }
        case "stroke": {
          if (!(st.microPause > 0)) {
            if (!isFinite(st.arc)) {
              st.handler.end && st.handler.end();
              this.app.engine.commitGesture("Auto stroke (auto-recovered)");
              this.cursor.down = false;
              this._state = null;
              this._advance();
              return true;
            }
            if (st.arc === st.lastArcVal) {
              st.stallMs = (st.stallMs || 0) + dtMs * this.speed;
              if (st.stallMs > 2200 && st.i < st.pts.length - 1) {
                st.handler.end && st.handler.end();
                this.app.engine.commitGesture("Auto stroke (stalled)");
                this.cursor.down = false;
                this._state = null;
                this._advance();
                return true;
              }
            } else {
              st.stallMs = 0;
            }
            st.lastArcVal = st.arc;
          }
          st.arc += st.pxPerSec * (dtMs / 1000) * this.speed * st.humanFactor;
          st.humanTimer -= dtMs;
          if (st.humanTimer <= 0) {
            st.humanTimer = U.rand(220, 520);
            st.humanTarget = U.rand(0.72, 1.32);
          }
          st.humanFactor += (st.humanTarget - st.humanFactor) * 0.08;

          while (st.i < st.pts.length - 1 && st.arc >= st.cum[st.i + 1]) {
            st.i++;
            const p = st.pts[st.i];
            const doc = this.app.engine.doc;
            const cx = U.clamp(p.x, 0, doc.w), cy = U.clamp(p.y, 0, doc.h);
            const prev = st.pts[st.i - 1];
            const segLen = Math.max(0.01, U.dist(prev.x, prev.y, p.x, p.y));
            const dtSeg = segLen / Math.max(1, st.pxPerSec * this.speed) * 1000;
            let slow = 1;
            if (st.i >= 2) {
              const q = st.pts[st.i - 2];
              const a1 = Math.atan2(prev.y - q.y, prev.x - q.x);
              const a2 = Math.atan2(p.y - prev.y, p.x - prev.x);
              let da = Math.abs(a2 - a1);
              if (da > Math.PI) da = Math.PI * 2 - da;
              slow = da > 0.9 ? 0.45 : da > 0.45 ? 0.75 : 1;
            }
            st.speedScale += ((slow) - st.speedScale) * 0.2;
            const effPx = st.pxPerSec * st.speedScale;
            void effPx;
            st.handler.addPoint({ x: cx, y: cy }, dtSeg);
            this.app.engine.touchOp(cx, cy, st.op.size * 3 + 6);
            this.cursor.x = cx;
            this.cursor.y = cy;
            this.cursor.angle = Math.atan2(cy - U.clamp(prev.y, 0, doc.h), cx - U.clamp(prev.x, 0, doc.w));
            if (slow < 0.6 && Math.random() < 0.25) {
              st.microPause = U.rand(30, 110);
            }
          }
          if (st.microPause && st.microPause > 0) {
            st.microPause -= dtMs * this.speed;
            return false;
          }
          this.app.engine.requestRender();
          if (st.i >= st.pts.length - 1) {
            st.settle -= dtMs * this.speed;
            if (st.settle <= 0) {
              st.handler.end && st.handler.end();
              this.app.engine.commitGesture("Auto stroke");
              this.cursor.down = false;
              this._state = null;
              this._advance();
              return true;
            }
          }
          return false;
        }
        case "pixrun": {
          const pxPerSec = 620 * this.speed;
          st.done += pxPerSec * (dtMs / 1000);
          const w = Math.min(st.op.len, st.done) - st.drawn;
          if (w > 0) {
            const doc = this.app.engine.doc;
            const x0 = U.clamp(Math.round(st.op.x + st.drawn), 0, doc.w);
            const ww = U.clamp(Math.round(w), 0, doc.w - x0);
            const y0 = U.clamp(Math.round(st.op.y), 0, doc.h - 1);
            const hh = U.clamp(Math.max(1, Math.round(st.op.cell)), 1, doc.h - y0);
            if (ww <= 0 || hh <= 0) { st.done = st.op.len; }
            else {
              const gctx = this.app.engine.gesture.ctx;
              gctx.fillStyle = st.op.color;
              gctx.fillRect(x0, y0, ww, hh);
              this.app.engine.touchOp(x0, y0, hh);
              this.app.engine.touchOp(x0 + ww, y0 + hh, hh);
              st.drawn += w;
              this.cursor.x = U.clamp(x0 + ww, 0, doc.w);
              this.cursor.y = U.clamp(y0 + hh / 2, 0, doc.h);
              this.app.engine.requestRender();
            }
          }
          if (st.done >= st.op.len) {
            this.app.engine.commitGesture("Auto pixels");
            this.cursor.down = false;
            this._state = null;
            this._advance();
            return true;
          }
          return false;
        }
        case "dwell": {
          st.timer -= dtMs * this.speed;
          if (st.timer <= 0) {
            if (st.action) st.action();
            this._state = null;
            this._advance();
            return true;
          }
          return false;
        }
      }
      this._state = null;
      this._advance();
      return true;
    }

    _initOp(op) {
      const app = this.app;
      const T = app.tools;
      const speedBase = this.speed;

      if (op.stage && op.stage !== this._curStage) {
        this._curStage = op.stage;
        this.emit("stage", op.stage);
      }

      if (op.op === "tool") {
        T.applyAuto({ tool: op.v });
        this.emit("oplabel", "Tool · " + T.TOOL_LABELS[op.v]);
        this._state = { kind: "note", timer: U.rand(140, 320) };
        return;
      }
      if (op.op === "color") {
        T.applyAuto({ color: op.v });
        this.emit("oplabel", "Color · " + op.v.toUpperCase());
        this._state = { kind: "note", timer: U.rand(120, 280) };
        return;
      }
      if (op.op === "size") {
        T.applyAuto({ size: op.v });
        this.emit("oplabel", "Size · " + Math.round(op.v));
        this._state = { kind: "note", timer: U.rand(90, 200) };
        return;
      }
      if (op.op === "wait") {
        this._state = { kind: "note", timer: op.ms };
        return;
      }

      if (op.op === "stroke") {
        if (op.tool) T.applyAuto({ tool: op.tool });
        if (op.color) T.applyAuto({ color: op.color });
        if (op.size) T.applyAuto({ size: op.size });
        if (op.opacity !== undefined) T.applyAuto({ opacity: op.opacity });
        this.emit("oplabel", op.tool === "pencil" ? "Sketching…" : "Drawing stroke…");

        const pts = op.pts;
        const start = pts[0];
        const from = { x: this.cursor.x, y: this.cursor.y };
        const dist = U.dist(from.x, from.y, start.x, start.y);

        const gesture = app.engine.beginGesture({
          opacity: op.opacity !== undefined ? op.opacity : 1,
          layer: this.layer
        });
        const handler = T.makeRenderer(op.tool || "pen", gesture.ctx, { size: op.size || 2 }, op.color || T.settings.primary);
        handler.begin && handler.begin(start);
        handler.addPoint(start, 16);

        const totalLen = U.pathLength(pts);
        const cum = [0];
        for (let i = 1; i < pts.length; i++) {
          cum.push(cum[i - 1] + U.dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y));
        }

        const approachState = {
          kind: "approach",
          from, to: { x: start.x, y: start.y },
          dist,
          t: 0,
          dur: U.clamp(dist / (1500 * speedBase) * 1000, 80, 650),
          next: {
            kind: "stroke",
            op,
            pts,
            cum,
            arc: cum[0],
            i: 0,
            handler,
            pxPerSec: U.rand(850, 1250),
            humanFactor: 1,
            humanTarget: 1,
            humanTimer: 0,
            speedScale: 1,
            settle: U.rand(40, 130),
            microPause: 0
          }
        };
        this.cursor.down = false;
        this._state = approachState;
        return;
      }

      if (op.op === "pixrun") {
        T.applyAuto({});
        this.emit("oplabel", "Placing pixels…");
        app.engine.beginGesture({ opacity: 1, layer: this.layer });
        const from = { x: this.cursor.x, y: this.cursor.y };
        const to = { x: op.x, y: op.y + op.cell / 2 };
        this._state = {
          kind: "approach",
          from, to,
          dist: U.dist(from.x, from.y, to.x, to.y),
          t: 0,
          dur: U.clamp(U.dist(from.x, from.y, to.x, to.y) / (1500 * speedBase) * 1000, 70, 500),
          next: {
            kind: "pixrun",
            op,
            done: 0,
            drawn: 0
          }
        };
        return;
      }

      if (op.op === "fill") {
        T.applyAuto({ color: op.color });
        this.emit("oplabel", "Filling region…");
        const from = { x: this.cursor.x, y: this.cursor.y };
        const to = { x: op.x, y: op.y };
        const self = this;
        this._state = {
          kind: "approach",
          from, to,
          dist: U.dist(from.x, from.y, to.x, to.y),
          t: 0,
          dur: U.clamp(U.dist(from.x, from.y, to.x, to.y) / (1500 * speedBase) * 1000, 80, 550),
          next: {
            kind: "dwell",
            timer: 160,
            action: () => {
              self.cursor.down = true;
              app.engine.floodFill(to.x, to.y, op.color, op.tol !== undefined ? op.tol : 28, app.engine.doc.pixelMode);
              setTimeout(() => { self.cursor.down = false; }, 120);
            }
          }
        };
        return;
      }

      this._state = null;
    }

    _execOpInstant(op, opts) {
      opts = opts || {};
      const app = this.app;
      const T = app.tools;
      if (op.stage && op.stage !== this._curStage) {
        this._curStage = op.stage;
        this.emit("stage", op.stage);
      }
      if (op.op === "tool") { T.applyAuto({ tool: op.v }); return; }
      if (op.op === "color") { T.applyAuto({ color: op.v }); return; }
      if (op.op === "size") { T.applyAuto({ size: op.v }); return; }
      if (op.op === "wait") return;

      if (op.op === "stroke") {
        let gctx, layer;
        if (opts.batched) {
          layer = this.layer || app.engine.activeLayer;
          gctx = app.engine.gesture.ctx;
        } else {
          const gesture = app.engine.beginGesture({
            opacity: op.opacity !== undefined ? op.opacity : 1,
            layer: this.layer || app.engine.activeLayer
          });
          layer = gesture.layer;
          gctx = gesture.ctx;
        }
        const handler = T.makeRenderer(op.tool || "pen", gctx, { size: op.size || 2 }, op.color || "#000000");
        handler.begin && handler.begin(op.pts[0]);
        for (let i = 1; i < op.pts.length; i++) handler.addPoint(op.pts[i], 16);
        handler.end && handler.end();
        if (!opts.batched) {
          app.engine.touchOp(op.pts[0].x, op.pts[0].y, (op.size || 2) * 3 + 6);
          app.engine.touchOp(op.pts[op.pts.length - 1].x, op.pts[op.pts.length - 1].y, (op.size || 2) * 3 + 6);
          app.engine.commitGesture("Auto stroke");
        } else {
          const pad = (op.size || 2) * 3 + 6;
          app.engine.touchOp(op.pts[0].x, op.pts[0].y, pad);
          app.engine.touchOp(op.pts[op.pts.length - 1].x, op.pts[op.pts.length - 1].y, pad);
        }
        return;
      }
      if (op.op === "pixrun") {
        let gctx;
        if (opts.batched) {
          gctx = app.engine.gesture.ctx;
        } else {
          const layer = this.layer || app.engine.activeLayer;
          const g = app.engine.beginGesture({ opacity: 1, layer });
          gctx = g.ctx;
        }
        gctx.fillStyle = op.color;
        gctx.fillRect(Math.round(op.x), Math.round(op.y), Math.round(op.len), Math.max(1, Math.round(op.cell)));
        app.engine.touchOp(op.x, op.y, op.cell + 2);
        app.engine.touchOp(op.x + op.len, op.y + op.cell, op.cell + 2);
        if (!opts.batched) app.engine.commitGesture("Auto pixels");
        return;
      }
      if (op.op === "fill") {
        app.engine.floodFill(op.x, op.y, op.color, op.tol !== undefined ? op.tol : 28, app.engine.doc.pixelMode);
      }
    }
  }

  window.Artist = Artist;
})();
