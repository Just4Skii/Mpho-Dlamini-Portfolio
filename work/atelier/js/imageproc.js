(function () {
  "use strict";
  const U = window.U;
  const IP = {};

  IP.PALETTES = {
    "PICO-8": ["#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#FF004D", "#FFA300", "#FFEC27", "#00E436", "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"],
    "Game Boy": ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
    "Sweetie 16": ["#1a1c2c", "#5d275d", "#b13e53", "#ef7d57", "#ffcd75", "#a7f070", "#38b764", "#257179", "#29366f", "#3b5dc9", "#41a6f6", "#73eff7", "#f4f4f4", "#94b0c2", "#566c86", "#333c57"],
    "Monochrome": ["#101010", "#444444", "#808080", "#c0c0c0", "#f5f5f5"],
    "Sepia Ink": ["#241a12", "#4a3625", "#7a5c3e", "#b08d64", "#e8d5b5"],
    "Endesga 32": ["#fbeee6", "#ffcda5", "#e9967e", "#c05d63", "#90374b", "#65193d", "#f4f4f4", "#c6cbd1", "#839098", "#57696d", "#37444d", "#223039", "#a3f6ff", "#61d4ff", "#3da1f4", "#3468ce", "#5c47c8", "#46289b", "#b8aeff", "#e27fff", "#c85fd0", "#943bb7", "#5c2f87", "#d3f898", "#8be26a", "#48b860", "#2a8a54", "#17663c", "#fff200", "#ffa300", "#f25c35", "#c22032"]
  };

  IP.loadFileAsImage = function (file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error("Not an image file"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (!img.naturalWidth) { reject(new Error("Image could not be decoded")); return; }
          resolve(img);
        };
        img.onerror = () => reject(new Error("Unsupported or corrupted image"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
  };

  IP.fitToCanvas = function (img, w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.min(w / iw, h / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return c;
  };

  IP.getData = c => c.getContext("2d").getImageData(0, 0, c.width, c.height);

  IP.grayField = function (canvas, linearize) {
    const { width: w, height: h } = canvas;
    const d = IP.getData(canvas).data;
    const g = new Float32Array(w * h);
    if (linearize) {
      for (let i = 0, p = 0; i < g.length; i++, p += 4) {
        g[i] = 0.2126 * IP.linearize(d[p]) + 0.7152 * IP.linearize(d[p + 1]) + 0.0722 * IP.linearize(d[p + 2]);
        g[i] /= 255;
      }
    } else {
      for (let i = 0, p = 0; i < g.length; i++, p += 4) {
        g[i] = (0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2]) / 255;
      }
    }
    return g;
  };

  IP.blurField = function (field, w, h, radius) {
    if (radius <= 0) return field;
    let src = field;
    for (let pass = 0; pass < 2; pass++) {
      src = _boxBlurF(src, w, h, radius, true);
      src = _boxBlurF(src, w, h, radius, false);
    }
    return src;
  };

  function _boxBlurF(src, w, h, r, horizontal) {
    const out = new Float32Array(src.length);
    const norm = 1 / (2 * r + 1);
    if (horizontal) {
      for (let y = 0; y < h; y++) {
        const row = y * w;
        let acc = 0;
        for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
          out[row + x] = acc * norm;
          const xa = Math.min(w - 1, x + r + 1), xr = Math.max(0, x - r);
          acc += src[row + xa] - src[row + xr];
        }
      }
    } else {
      for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let y = -r; y <= r; y++) acc += src[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
          out[y * w + x] = acc * norm;
          const ya = Math.min(h - 1, y + r + 1), yr = Math.max(0, y - r);
          acc += src[ya * w + x] - src[yr * w + x];
        }
      }
    }
    return out;
  }

  IP.sobel = function (gray, w, h) {
    const mag = new Float32Array(w * h);
    const dirX = new Float32Array(w * h);
    const dirY = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const tl = gray[i - w - 1], tc = gray[i - w], tr = gray[i - w + 1];
        const ml = gray[i - 1], mr = gray[i + 1];
        const bl = gray[i + w - 1], bc = gray[i + w], br = gray[i + w + 1];
        const gx = tr + 2 * mr + br - tl - 2 * ml - bl;
        const gy = bl + 2 * bc + br - tl - 2 * tc - tr;
        mag[i] = Math.hypot(gx, gy);
        dirX[i] = gx;
        dirY[i] = gy;
      }
    }
    IP.normalizeField(mag);
    return { mag, dirX, dirY };
  };

  IP.normalizeField = function (field) {
    let max = 0;
    for (let i = 0; i < field.length; i++) if (field[i] > max) max = field[i];
    if (max > 0) for (let i = 0; i < field.length; i++) field[i] /= max;
    return field;
  };

  IP.nms = function (mag, dirX, dirY, w, h) {
    const out = new Float32Array(mag.length);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const m = mag[i];
        if (m <= 0) continue;
        const gx = dirX[i], gy = dirY[i];
        let dx, dy;
        if (Math.abs(gx) >= Math.abs(gy)) { dx = gx >= 0 ? 1 : -1; dy = 0; }
        else { dx = 0; dy = gy >= 0 ? 1 : -1; }
        if (m >= mag[i + dy * w + dx] && m >= mag[i - dy * w - dx]) out[i] = m;
      }
    }
    return out;
  };

  IP.hysteresisMask = function (thin, w, h, hiRatio) {
    const mask = new Uint8Array(thin.length);
    let max = 0;
    for (let i = 0; i < thin.length; i++) if (thin[i] > max) max = thin[i];
    if (max <= 0) return mask;
    const hi = max * hiRatio;
    const lo = hi * 0.4;
    const stack = [];
    for (let i = 0; i < thin.length; i++) {
      if (thin[i] >= hi) { mask[i] = 1; stack.push(i); }
    }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w, y = (i / w) | 0;
      if (x > 0 && !mask[i - 1] && thin[i - 1] >= lo) { mask[i - 1] = 1; stack.push(i - 1); }
      if (x < w - 1 && !mask[i + 1] && thin[i + 1] >= lo) { mask[i + 1] = 1; stack.push(i + 1); }
      if (y > 0 && !mask[i - w] && thin[i - w] >= lo) { mask[i - w] = 1; stack.push(i - w); }
      if (y < h - 1 && !mask[i + w] && thin[i + w] >= lo) { mask[i + w] = 1; stack.push(i + w); }
      if (x > 0 && y > 0 && !mask[i - w - 1] && thin[i - w - 1] >= lo) { mask[i - w - 1] = 1; stack.push(i - w - 1); }
      if (x < w - 1 && y > 0 && !mask[i - w + 1] && thin[i - w + 1] >= lo) { mask[i - w + 1] = 1; stack.push(i - w + 1); }
      if (x > 0 && y < h - 1 && !mask[i + w - 1] && thin[i + w - 1] >= lo) { mask[i + w - 1] = 1; stack.push(i + w - 1); }
      if (x < w - 1 && y < h - 1 && !mask[i + w + 1] && thin[i + w + 1] >= lo) { mask[i + w + 1] = 1; stack.push(i + w + 1); }
    }
    return mask;
  };

  IP.maskToField = function (mask, w, h) {
    const f = new Float32Array(mask.length);
    for (let i = 0; i < mask.length; i++) f[i] = mask[i] ? 1 : 0;
    return IP.blurField(f, w, h, 1);
  };

  IP.pixelate = function (srcCanvas, targetW, targetH) {
    const sw = srcCanvas.width, sh = srcCanvas.height;
    const small = document.createElement("canvas");
    small.width = targetW;
    small.height = targetH;
    const sctx = small.getContext("2d");
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(srcCanvas, 0, 0, sw, sh, 0, 0, targetW, targetH);
    return small;
  };

  IP.medianCutPalette = function (imgData, k, sampleMax) {
    const d = imgData.data;
    const n = d.length / 4;
    const step = Math.max(1, Math.floor(n / (sampleMax || 12000)));
    const px = [];
    for (let i = 0; i < n; i += step) {
      const o = i * 4;
      if (d[o + 3] < 20) continue;
      px.push([d[o], d[o + 1], d[o + 2]]);
    }
    if (!px.length) px.push([0, 0, 0]);
    let buckets = [px];
    while (buckets.length < k) {
      let bi = -1, range = -1, channel = 0;
      for (let b = 0; b < buckets.length; b++) {
        const bucket = buckets[b];
        if (bucket.length < 2) continue;
        for (let ch = 0; ch < 3; ch++) {
          let mn = 255, mx = 0;
          for (const p of bucket) {
            if (p[ch] < mn) mn = p[ch];
            if (p[ch] > mx) mx = p[ch];
          }
          if (mx - mn > range) { range = mx - mn; bi = b; channel = ch; }
        }
      }
      if (bi < 0 || range <= 0) break;
      buckets[bi].sort((a, b2) => a[channel] - b2[channel]);
      const mid = buckets[bi].length >> 1;
      buckets.splice(bi, 1, buckets[bi].slice(0, mid), buckets[bi].slice(mid));
    }
    const palette = [];
    for (const bucket of buckets) {
      if (!bucket.length) continue;
      let r = 0, g = 0, b = 0;
      for (const p of bucket) { r += p[0]; g += p[1]; b += p[2]; }
      palette.push([Math.round(r / bucket.length), Math.round(g / bucket.length), Math.round(b / bucket.length)]);
    }
    return palette.length ? palette : [[0, 0, 0]];
  };

  IP.nearestPaletteIndex = function (r, g, b, palette) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const dr = r - palette[i][0], dg = g - palette[i][1], db = b - palette[i][2];
      const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  IP.quantizeImageData = function (imgData, palette) {
    const d = imgData.data;
    const indices = new Int16Array(d.length / 4);
    for (let p = 0, i = 0; p < indices.length; p++, i += 4) {
      const idx = IP.nearestPaletteIndex(d[i], d[i + 1], d[i + 2], palette);
      indices[p] = idx;
      d[i] = palette[idx][0];
      d[i + 1] = palette[idx][1];
      d[i + 2] = palette[idx][2];
      d[i + 3] = 255;
    }
    return indices;
  };

  IP.adjustSaturation = function (imgData, factor) {
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      d[i] = U.clamp(lum + (d[i] - lum) * factor, 0, 255);
      d[i + 1] = U.clamp(lum + (d[i + 1] - lum) * factor, 0, 255);
      d[i + 2] = U.clamp(lum + (d[i + 2] - lum) * factor, 0, 255);
    }
  };

  IP.traceContours = function (field, w, h, iso) {
    const segs = [];
    const lin = (a, b) => {
      const d = b - a;
      if (d === 0) return 0.5;
      return U.clamp((iso - a) / d, 0, 1);
    };
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const i = y * w + x;
        const tl = field[i], tr = field[i + 1], br = field[i + w + 1], bl = field[i + w];
        const c = (tl > iso ? 8 : 0) | (tr > iso ? 4 : 0) | (br > iso ? 2 : 0) | (bl > iso ? 1 : 0);
        if (c === 0 || c === 15) continue;
        const T = [x + lin(tl, tr), y], R = [x + 1, y + lin(tr, br)];
        const B = [x + lin(bl, br), y + 1], L = [x, y + lin(tl, bl)];
        switch (c) {
          case 1: segs.push([L, B]); break;
          case 2: segs.push([B, R]); break;
          case 3: segs.push([L, R]); break;
          case 4: segs.push([T, R]); break;
          case 5: {
            const avg = (tl + tr + br + bl) / 4;
            if (avg > iso) { segs.push([L, T]); segs.push([B, R]); }
            else { segs.push([L, B]); segs.push([T, R]); }
            break;
          }
          case 6: segs.push([T, B]); break;
          case 7: segs.push([L, T]); break;
          case 8: segs.push([L, T]); break;
          case 9: segs.push([T, B]); break;
          case 10: {
            const avg = (tl + tr + br + bl) / 4;
            if (avg > iso) { segs.push([L, B]); segs.push([T, R]); }
            else { segs.push([L, T]); segs.push([B, R]); }
            break;
          }
          case 11: segs.push([T, R]); break;
          case 12: segs.push([L, R]); break;
          case 13: segs.push([B, R]); break;
          case 14: segs.push([L, B]); break;
        }
      }
    }

    const key = p => p[0].toFixed(3) + "|" + p[1].toFixed(3);
    const endpointMap = new Map();
    for (let i = 0; i < segs.length; i++) {
      for (const p of segs[i]) {
        const k = key(p);
        let arr = endpointMap.get(k);
        if (!arr) { arr = []; endpointMap.set(k, arr); }
        arr.push({ seg: i, x: p[0], y: p[1] });
      }
    }

    const used = new Uint8Array(segs.length);
    const lines = [];
    for (let i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      used[i] = 1;
      const line = [segs[i][0], segs[i][1]];
      for (let side = 0; side < 2; side++) {
        const atEnd = side === 0;
        let guard = 0;
        while (guard++ < 100000) {
          const cur = atEnd ? line[line.length - 1] : line[0];
          const ref = atEnd ? line[line.length - 2] : line[1];
          if (!ref) break;
          let dx = cur[0] - ref[0], dy = cur[1] - ref[1];
          const dl = Math.hypot(dx, dy);
          if (dl < 1e-9) break;
          dx /= dl; dy /= dl;
          const cands = endpointMap.get(key(cur));
          if (!cands) break;
          let best = -1, bestScore = -Infinity;
          for (const c of cands) {
            if (used[c.seg]) continue;
            const ox = c.x - cur[0], oy = c.y - cur[1];
            const ol = Math.hypot(ox, oy);
            if (ol < 1e-9) { best = c.seg; bestScore = 2; break; }
            const score = (ox * dx + oy * dy) / ol;
            if (score > bestScore) { bestScore = score; best = c.seg; }
          }
          if (best < 0) break;
          used[best] = 1;
          const s = segs[best];
          const nxt = key(s[0]) === key(cur) ? s[1] : s[0];
          if (atEnd) line.push(nxt);
          else line.unshift(nxt);
        }
      }
      if (line.length >= 4) {
        const pts = new Array(line.length);
        for (let j = 0; j < line.length; j++) pts[j] = { x: line[j][0], y: line[j][1] };
        lines.push(pts);
      }
    }
    return lines;
  };

  IP.regionAnalysis = function (indices, palette, w, h) {
    const labels = new Int32Array(w * h).fill(-1);
    const regions = [];
    const stack = new Int32Array(w * h);
    for (let seed = 0; seed < indices.length; seed++) {
      if (labels[seed] !== -1) continue;
      const label = regions.length;
      const colorIdx = indices[seed];
      let sp = 0;
      stack[sp++] = seed;
      labels[seed] = label;
      let area = 0, sr = 0, sg = 0, sb = 0;
      let minX = w, minY = h, maxX = -1, maxY = -1;
      const seedX = seed % w, seedY = (seed / w) | 0;
      while (sp > 0) {
        const pi = stack[--sp];
        const px = pi % w, py = (pi / w) | 0;
        area++;
        const col = palette[colorIdx];
        sr += col[0]; sg += col[1]; sb += col[2];
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
        if (px > 0 && labels[pi - 1] === -1 && indices[pi - 1] === colorIdx) { labels[pi - 1] = label; stack[sp++] = pi - 1; }
        if (px < w - 1 && labels[pi + 1] === -1 && indices[pi + 1] === colorIdx) { labels[pi + 1] = label; stack[sp++] = pi + 1; }
        if (py > 0 && labels[pi - w] === -1 && indices[pi - w] === colorIdx) { labels[pi - w] = label; stack[sp++] = pi - w; }
        if (py < h - 1 && labels[pi + w] === -1 && indices[pi + w] === colorIdx) { labels[pi + w] = label; stack[sp++] = pi + w; }
      }
      regions.push({
        area,
        color: U.rgbToHex(sr / area, sg / area, sb / area),
        seed: { x: seedX, y: seedY },
        bbox: [minX, minY, maxX, maxY],
        colorIdx
      });
    }
    return { labels, regions };
  };

  IP.linearize = function (c) {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  IP.multiScaleBlurs = function (gray, w, h) {
    return {
      I0: gray,
      I1: IP.blurField(gray, w, h, 1),
      I2: IP.blurField(gray, w, h, 2),
      I3: IP.blurField(gray, w, h, 5)
    };
  };

  IP.edgeScore = function (strength, length, semantic, depthDisc, curvature, contrast) {
    const s = 0.30 * strength + 0.20 * length + 0.20 * semantic + 0.15 * depthDisc + 0.10 * curvature + 0.05 * contrast;
    return U.clamp(s, 0, 1);
  };

  IP.depthGradient = function (depth, w, h) {
    const Dx = new Float32Array(w * h), Dy = new Float32Array(w * h), Gd = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const dx = (depth[i + 1] - depth[i - 1]) * 0.5;
        const dy = (depth[i + w] - depth[i - w]) * 0.5;
        Dx[i] = dx; Dy[i] = dy;
        Gd[i] = Math.hypot(dx, dy);
      }
    }
    let max = 0; for (let i = 0; i < Gd.length; i++) if (Gd[i] > max) max = Gd[i];
    if (max > 0) for (let i = 0; i < Gd.length; i++) Gd[i] /= max;
    return { Dx, Dy, Gd };
  };

  IP.combineEdges = function (visualEdge, depthEdge, alpha, beta) {
    alpha = alpha === undefined ? 0.65 : alpha;
    beta = beta === undefined ? 0.35 : beta;
    const out = new Float32Array(visualEdge.length);
    for (let i = 0; i < out.length; i++) out[i] = U.clamp(alpha * visualEdge[i] + beta * depthEdge[i], 0, 1);
    return out;
  };

  IP.estimateNormals = function (Dx, Dy, w, h) {
    const Nx = new Float32Array(w * h), Ny = new Float32Array(w * h), Nz = new Float32Array(w * h);
    for (let i = 0; i < Dx.length; i++) {
      let nx = -Dx[i], ny = -Dy[i], nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      Nx[i] = nx / len; Ny[i] = ny / len; Nz[i] = nz / len;
    }
    return { Nx, Ny, Nz };
  };

  IP.estimateLighting = function (Nx, Ny, Nz, Lx, Ly, Lz) {
    if (Lx === undefined) { Lx = -0.5; Ly = -0.6; Lz = 1.0; }
    const len = Math.hypot(Lx, Ly, Lz) || 1;
    Lx /= len; Ly /= len; Lz /= len;
    const light = new Float32Array(Nx.length);
    for (let i = 0; i < light.length; i++) {
      const d = Nx[i] * Lx + Ny[i] * Ly + Nz[i] * Lz;
      light[i] = d > 0 ? d : 0;
    }
    return light;
  };

  IP.estimatePerspective = function (lines) {
    const candidates = [];
    for (const line of lines) {
      if (line.length < 2) continue;
      const a = line[0], b = line[line.length - 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      if (Math.hypot(dx, dy) < 20) continue;
      candidates.push({ a, b, dx, dy });
    }
    const vps = [];
    for (let i = 0; i < Math.min(40, candidates.length); i++) {
      for (let j = i + 1; j < Math.min(40, candidates.length); j++) {
        const l1 = candidates[i], l2 = candidates[j];
        const det = l1.dx * l2.dy - l1.dy * l2.dx;
        if (Math.abs(det) < 1e-6) continue;
        const vx = (l1.a.x * l1.dy - l1.a.y * l1.dx) * l2.dx - (l2.a.x * l2.dy - l2.a.y * l2.dx) * l1.dx;
        const vy = (l1.a.x * l1.dy - l1.a.y * l1.dx) * l2.dy - (l2.a.x * l2.dy - l2.a.y * l2.dx) * l1.dy;
        const inv = 1 / det;
        vps.push({ x: vx * inv, y: vy * inv });
      }
      if (vps.length > 80) break;
    }
    return vps.slice(0, 3);
  };

  IP.curvatureAt = function (pts, i) {
    if (i <= 0 || i >= pts.length - 1) return 0;
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
    const dx1 = p1.x - p0.x, dy1 = p1.y - p0.y;
    const dx2 = p2.x - p1.x, dy2 = p2.y - p1.y;
    const cross = Math.abs(dx1 * dy2 - dy1 * dx2);
    const len = Math.hypot(dx1, dy1) * Math.hypot(dx2, dy2) || 1;
    return cross / len;
  };

  window.ImageProc = IP;
})();
