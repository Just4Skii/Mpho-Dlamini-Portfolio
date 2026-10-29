(function () {
  "use strict";
  const U = window.U;
  const Scan = {};

  Scan.analyze = function (img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const aspect = w / h;
    const mp = (w * h / 1000000).toFixed(2);
    const maxDim = 1600;
    let cw, ch, scale;
    if (Math.max(w, h) <= maxDim) { cw = w; ch = h; scale = 1; }
    else if (w >= h) { cw = maxDim; ch = Math.round(maxDim / aspect); scale = maxDim / w; }
    else { ch = maxDim; cw = Math.round(maxDim * aspect); scale = maxDim / h; }
    const error = Math.abs(cw / ch - aspect);
    return {
      original: { w, h, aspect, mp, diagonal: Math.hypot(w, h) | 0 },
      suggested: { w: cw, h: ch, scale, error, aspectPreserved: error < 0.002 },
      histogram: null
    };
  };

  Scan.fitExact = function (img, cw, ch) {
    const c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, cw, ch);
    return c;
  };

  Scan.loadExternalTracer = function () {
    if (window.ImageTracer) return Promise.resolve(window.ImageTracer);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.js";
      s.onload = () => resolve(window.ImageTracer || null);
      s.onerror = () => reject(new Error("CDN unavailable"));
      document.head.appendChild(s);
      setTimeout(() => reject(new Error("timeout")), 7000);
    });
  };

  Scan.tryAPITrace = async function (srcCanvas, opts) {
    let api;
    try { api = await Scan.loadExternalTracer(); } catch (e) { void e; return null; }
    if (!api) return null;
    try {
      const imgd = srcCanvas.getContext("2d").getImageData(0, 0, srcCanvas.width, srcCanvas.height);
      const svgStr = api.imagedataToSVG(imgd, {
        ltres: 0.6, qtres: 0.6, pathomit: 12,
        colorsampling: 1, numberofcolors: opts.detail > 7 ? 16 : 8,
        mincolorratio: 0.02, colorquantcycles: 3,
        strokewidth: 1.2, roundcoords: 1, desc: false, viewbox: false
      });
      const paths = [];
      const re = /d="([^"]+)"/g;
      let m;
      while ((m = re.exec(svgStr)) !== null) paths.push(m[1]);
      if (!paths.length) return null;
      return Scan.svgPathsToStrokes(paths, srcCanvas.width, srcCanvas.height, opts);
    } catch (e) { void e; return null; }
  };

  Scan.svgPathsToStrokes = function (dStrings, pw, ph, opts) {
    const strokes = [];
    for (const d of dStrings) {
      const pts = Scan.parsePathD(d);
      if (pts.length < 3) continue;
      const simplified = U.rdp(pts, 1.2);
      if (simplified.length < 2) continue;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of simplified) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
      if (Math.hypot(maxX - minX, maxY - minY) < 4) continue;
      strokes.push(simplified);
    }
    return strokes;
  };

  Scan.parsePathD = function (d) {
    const pts = [];
    const tokens = d.match(/[MmLlHhVvCcQqZz]|[-+]?\d*\.?\d+/g);
    if (!tokens) return pts;
    let x = 0, y = 0, i = 0;
    let cmd = "";
    while (i < tokens.length) {
      const t = tokens[i];
      if (/[A-Za-z]/.test(t)) { cmd = t; i++; continue; }
      if (cmd === "M" || cmd === "L") { x = parseFloat(t); y = parseFloat(tokens[i + 1]); pts.push({ x, y }); i += 2; }
      else if (cmd === "m" || cmd === "l") { x += parseFloat(t); y += parseFloat(tokens[i + 1]); pts.push({ x, y }); i += 2; }
      else if (cmd === "H") { x = parseFloat(t); pts.push({ x, y }); i++; }
      else if (cmd === "h") { x += parseFloat(t); pts.push({ x, y }); i++; }
      else if (cmd === "V") { y = parseFloat(t); pts.push({ x, y }); i++; }
      else if (cmd === "v") { y += parseFloat(t); pts.push({ x, y }); i++; }
      else if (cmd === "C") {
        const x1 = parseFloat(t), y1 = parseFloat(tokens[i + 1]);
        const x2 = parseFloat(tokens[i + 2]), y2 = parseFloat(tokens[i + 3]);
        x = parseFloat(tokens[i + 4]); y = parseFloat(tokens[i + 5]);
        for (let s = 0.2; s <= 1.01; s += 0.2) {
          const t2 = s, mt = 1 - t2;
          pts.push({ x: mt * mt * mt * pts[pts.length - 1].x + 3 * mt * mt * t2 * x1 + 3 * mt * t2 * t2 * x2 + t2 * t2 * t2 * x, y: mt * mt * mt * pts[pts.length - 1].y + 3 * mt * mt * t2 * y1 + 3 * mt * t2 * t2 * y2 + t2 * t2 * t2 * y });
        }
        i += 6;
      } else if (cmd === "c") {
        const dx1 = parseFloat(t), dy1 = parseFloat(tokens[i + 1]);
        const dx2 = parseFloat(tokens[i + 2]), dy2 = parseFloat(tokens[i + 3]);
        const ndx = parseFloat(tokens[i + 4]), ndy = parseFloat(tokens[i + 5]);
        const x1 = x + dx1, y1 = y + dy1, x2 = x + dx2, y2 = y + dy2;
        const nx = x + ndx, ny = y + ndy;
        for (let s = 0.2; s <= 1.01; s += 0.2) {
          const t2 = s, mt = 1 - t2;
          pts.push({ x: mt * mt * mt * x + 3 * mt * mt * t2 * x1 + 3 * mt * t2 * t2 * x2 + t2 * t2 * t2 * nx, y: mt * mt * mt * y + 3 * mt * mt * t2 * y1 + 3 * mt * t2 * t2 * y2 + t2 * t2 * t2 * ny });
        }
        x = nx; y = ny; i += 6;
      } else if (cmd === "Z" || cmd === "z") { i++; }
      else i++;
    }
    return pts;
  };

  window.ScanAPI = Scan;
})();
