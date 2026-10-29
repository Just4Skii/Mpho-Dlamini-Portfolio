(function () {
  "use strict";
  const U = {};

  U.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(U.rand(a, b + 1));
  U.choice = arr => arr[Math.floor(Math.random() * arr.length)];
  U.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  U.easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  U.easeOutQuad = t => 1 - (1 - t) * (1 - t);
  U.easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  U.hexToRgb = hex => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  U.rgbToHex = (r, g, b) =>
    "#" + [r, g, b].map(v => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("").toUpperCase();

  U.hsvToRgb = (h, s, v) => {
    h = ((h % 360) + 360) % 360;
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  };
  U.rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return { h, s: max === 0 ? 0 : d / max, v: max };
  };
  U.luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

  U.resamplePath = (pts, step) => {
    if (pts.length < 2) return pts.slice();
    const out = [pts[0]];
    let prev = pts[0], carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const cur = pts[i];
      const d = U.dist(prev.x, prev.y, cur.x, cur.y);
      if (d === 0) continue;
      let t = carry;
      while (t <= d) {
        out.push({
          x: U.lerp(prev.x, cur.x, t / d),
          y: U.lerp(prev.y, cur.y, t / d),
          t: cur.t !== undefined ? U.lerp(prev.t || 0, cur.t, t / d) : undefined
        });
        t += step;
      }
      carry = t - d;
      prev = cur;
    }
    return out;
  };

  U.rdp = (pts, eps) => {
    if (pts.length < 3) return pts.slice();
    const keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const [a, b] = stack.pop();
      const ax = pts[a].x, ay = pts[a].y, bx = pts[b].x, by = pts[b].y;
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      let maxD = -1, maxI = -1;
      for (let i = a + 1; i < b; i++) {
        let d;
        if (len2 < 1e-12) {
          d = U.dist(pts[i].x, pts[i].y, ax, ay);
        } else {
          d = Math.abs((pts[i].x - ax) * dy - (pts[i].y - ay) * dx) / Math.sqrt(len2);
        }
        if (d > maxD) { maxD = d; maxI = i; }
      }
      if (maxD > eps && maxI > 0) {
        keep[maxI] = 1;
        stack.push([a, maxI], [maxI, b]);
      }
    }
    const out = [];
    for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    return out;
  };

  U.smoothPts = (pts, iterations) => {
    let p = pts;
    for (let it = 0; it < iterations; it++) {
      const out = new Array(p.length);
      out[0] = p[0];
      out[p.length - 1] = p[p.length - 1];
      for (let i = 1; i < p.length - 1; i++) {
        out[i] = {
          x: (p[i - 1].x + p[i].x * 2 + p[i + 1].x) / 4,
          y: (p[i - 1].y + p[i].y * 2 + p[i + 1].y) / 4
        };
      }
      p = out;
    }
    return p;
  };

  U.jitterPts = (pts, amt) => {
    if (amt <= 0) return pts.map(p => ({ x: p.x, y: p.y }));
    return pts.map((p, i) => {
      const edgeFade = Math.min(1, i / 4, (pts.length - 1 - i) / 4);
      return {
        x: p.x + U.rand(-amt, amt) * edgeFade,
        y: p.y + U.rand(-amt, amt) * edgeFade
      };
    });
  };

  U.pathLength = pts => {
    let l = 0;
    for (let i = 1; i < pts.length; i++) l += U.dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
    return l;
  };

  class Emitter {
    constructor() { this._l = {}; }
    on(ev, fn) { (this._l[ev] = this._l[ev] || []).push(fn); return fn; }
    off(ev, fn) { const a = this._l[ev]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } }
    emit(ev, ...args) { const a = this._l[ev]; if (a) for (const fn of a.slice()) fn(...args); }
  }
  U.Emitter = Emitter;

  U.debounce = (fn, ms) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  U.tickAsync = () => new Promise(r => setTimeout(r, 0));

  U.formatMs = ms => ms > 90000 ? Math.round(ms / 60000) + " min" : Math.round(ms / 1000) + " s";

  window.U = U;
})();
