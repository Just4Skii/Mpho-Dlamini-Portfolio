(function () {
  "use strict";
  const U = window.U;
  const IP = window.ImageProc;

  const PRESETS = {
    pixel: {
      label: "Pixel Art", style: "pixel", defaultRes: 64, colors: 16,
      desc: "True pixel-grid recreation with a curated palette, drawn run by run."
    },
    limitedPixel: {
      label: "Limited-Color Pixel Art", style: "pixel", defaultRes: 48, colors: 8,
      desc: "Low-resolution, few-color retro conversion."
    },
    pencil: {
      label: "Pencil Sketch", style: "stroke",
      desc: "Graphite construction lines, soft sketch passes and hatched shading."
    },
    ink: {
      label: "Ink Drawing", style: "stroke",
      desc: "Confident black linework with dense tonal hatching."
    },
    anime: {
      label: "Anime / Manga Line Art", style: "stroke", colorize: true,
      desc: "Clean uniform line art with flat color regions."
    },
    technical: {
      label: "Technical Sketch", style: "stroke", rigid: true,
      desc: "Straightened construction guides and precise, thin finishing lines."
    },
    minimal: {
      label: "Minimal Illustration", style: "stroke", colorize: true, fewColors: true,
      desc: "Bold simplified shapes with thick outlines and flat color."
    },
    mono: {
      label: "Monochrome Study", style: "stroke", grayscale: true,
      desc: "Tonal grayscale study built from contours and cross-hatching."
    },
    highFidelity: {
      label: "High-Fidelity Copy — Text Accurate", style: "stroke", grayscale: false, highAccuracy: true,
      desc: "Almost copy-paste accuracy: preserves text legibly, keeps exact dimensions and depth, minimal simplification."
    }
  };

  async function buildPlan(srcCanvas, presetId, opts, progress) {
    const P = PRESETS[presetId];
    opts = opts || {};
    progress = progress || (() => {});
    if (P.style === "pixel") return _planPixel(srcCanvas, P, opts, progress);
    return _planStroke(srcCanvas, P, opts, progress);
  }

  function procSize(docW, docH, target) {
    const m = Math.max(docW, docH);
    let pw = Math.max(32, Math.round(docW / m * target));
    let ph = Math.max(32, Math.round(docH / m * target));
    return { pw, ph };
  }

  function scaleToDoc(pts, docW, docH, pw, ph) {
    const fx = docW / pw, fy = docH / ph;
    for (const p of pts) { p.x *= fx; p.y *= fy; }
    return pts;
  }

  function sortBySweep(strokes, bandsPx) {
    bandsPx = bandsPx || 40;
    for (const s of strokes) {
      s.len = U.pathLength(s.pts);
      let minY = Infinity;
      for (const p of s.pts) if (p.y < minY) minY = p.y;
      s._band = Math.floor(minY / bandsPx);
    }
    strokes.sort((a, b) => a._band - b._band || b.len - a.len);
    return strokes;
  }

  /* ================= PIXEL STYLES ================= */

  async function _planPixel(srcCanvas, P, opts, progress) {
    const docW = opts.docW, docH = opts.docH;
    const Rw = Math.round(U.clamp(opts.pixelRes || P.defaultRes, 12, 256));
    const Rh = Math.max(8, Math.round(Rw * docH / docW));

    progress(8, "Downsampling to pixel grid…");
    await U.tickAsync();
    const small = IP.pixelate(srcCanvas, Rw, Rh);
    const imgData = IP.getData(small);
    IP.adjustSaturation(imgData, 1.12);

    progress(22, "Building color palette…");
    await U.tickAsync();
    let palette;
    if (opts.paletteName && IP.PALETTES[opts.paletteName]) {
      palette = IP.PALETTES[opts.paletteName].map(h => {
        const c = U.hexToRgb(h);
        return [Math.round(c.r), Math.round(c.g), Math.round(c.b)];
      });
    } else {
      palette = IP.medianCutPalette(imgData, opts.colors || P.colors || 16);
    }
    const indices = IP.quantizeImageData(imgData, palette);
    small.getContext("2d").putImageData(imgData, 0, 0);

    progress(45, "Scanning pixel runs…");
    await U.tickAsync();
    const hexOf = i => U.rgbToHex(palette[i][0], palette[i][1], palette[i][2]);
    const fineRuns = [];
    for (let y = 0; y < Rh; y++) {
      let runStart = 0;
      for (let x = 1; x <= Rw; x++) {
        if (x === Rw || indices[y * Rw + x] !== indices[y * Rw + runStart]) {
          fineRuns.push({ cx: runStart, cy: y, len: x - runStart, idx: indices[y * Rw + runStart] });
          runStart = x;
        }
      }
    }

    const Cw = Math.max(6, Math.round(Rw / 4));
    const Ch = Math.max(6, Math.round(Rh / 4));
    const coarse = IP.pixelate(small, Cw, Ch);
    const cImg = IP.getData(coarse);
    const cIdx = new Int16Array(Cw * Ch);
    const cd = cImg.data;
    for (let p = 0; p < cIdx.length; p++) {
      cIdx[p] = IP.nearestPaletteIndex(cd[p * 4], cd[p * 4 + 1], cd[p * 4 + 2], palette);
    }
    const coarseRuns = [];
    for (let y = 0; y < Ch; y++) {
      let runStart = 0;
      for (let x = 1; x <= Cw; x++) {
        if (x === Cw || cIdx[y * Cw + x] !== cIdx[y * Cw + runStart]) {
          coarseRuns.push({ cx: runStart, cy: y, len: x - runStart, idx: cIdx[y * Cw + runStart] });
          runStart = x;
        }
      }
    }

    progress(70, "Composing drawing sequence…");
    await U.tickAsync();

    const cellFine = docW / Rw;
    const cellCoarse = docW / Cw;
    const ops = [];
    const meta = { stages: [], totalStrokes: 0 };

    if (opts.stages.con !== false) {
      meta.stages.push({ key: "blockin", label: "Block-In" });
      coarseRuns.sort((a, b) => b.len - a.len || a.cy - b.cy);
      for (const r of coarseRuns) {
        ops.push({
          op: "pixrun",
          x: r.cx * cellCoarse, y: r.cy * cellCoarse,
          len: r.len * cellCoarse, cell: cellCoarse,
          color: hexOf(r.idx),
          stage: "blockin"
        });
      }
    }
    meta.stages.push({ key: "refine", label: "Refine" });
    for (const r of fineRuns) {
      ops.push({
        op: "pixrun",
        x: r.cx * cellFine, y: r.cy * cellFine,
        len: r.len * cellFine, cell: cellFine,
        color: hexOf(r.idx),
        stage: "refine"
      });
    }

    let estMs = 0;
    for (const o of ops) estMs += 80 + (o.len / 650) * 1000;
    meta.totalStrokes = ops.length;
    meta.estMs = estMs;
    meta.quantizedCanvas = small;
    meta.cell = cellFine;
    meta.resW = Rw;
    meta.resH = Rh;

    progress(100, "Plan ready");
    await U.tickAsync();
    return { ops, meta };
  }

  /* ================= STROKE STYLES ================= */

  async function _planStroke(srcCanvas, P, opts, progress) {
    const docW = opts.docW, docH = opts.docH;
    const detail = U.clamp(opts.detail !== undefined ? opts.detail : 6, 1, 10);
    const dt = detail / 10;

    let work = srcCanvas;
    if (P.grayscale) {
      work = document.createElement("canvas");
      work.width = srcCanvas.width;
      work.height = srcCanvas.height;
      const wc = work.getContext("2d");
      const wd = IP.getData(srcCanvas);
      IP.adjustSaturation(wd, 0);
      wc.putImageData(wd, 0, 0);
    }

    const target = 420 + Math.round(detail * 58);
    const { pw, ph } = procSize(docW, docH, target);
    const proc = document.createElement("canvas");
    proc.width = pw; proc.height = ph;
    const pctx = proc.getContext("2d");
    pctx.imageSmoothingEnabled = true;
    pctx.imageSmoothingQuality = "high";
    pctx.drawImage(work, 0, 0, pw, ph);
    await U.tickAsync();

    const fx = docW / pw, fy = docH / ph;
    const fAvg = (fx + fy) / 2;
    const minDim = Math.min(pw, ph);

    const scene = {
      original: srcCanvas,
      normalized: proc,
      width: pw, height: ph,
      aspectRatio: pw / ph,
      semanticMask: null, depthMap: null, confidenceMap: null,
      grayscale: null, blurred: null, edges: null, contours: null,
      normalMap: null, perspective: null, regions: null,
      objects: [], strokes: [], occlusionGraph: []
    };

    progress(5, "Normalizing input…");
    await U.tickAsync();
    const gray0 = IP.grayField(proc, true);
    scene.grayscale = gray0;
    const multi = IP.multiScaleBlurs(gray0, pw, ph);
    scene.blurred = multi;

    progress(8, "Detecting edges (multi-scale Sobel + NMS)…");
    await U.tickAsync();
    const gray = gray0;
    const edgeBlurR = U.clamp(Math.round(minDim / 110), 3, 7);
    const grayB = IP.blurField(gray, pw, ph, edgeBlurR);
    scene.blurred.I1 = grayB;
    const sob = IP.sobel(grayB, pw, ph);
    scene.edges = sob;
    const thin = IP.normalizeField(IP.nms(sob.mag, sob.dirX, sob.dirY, pw, ph));
    let depthMap = null;
    let depthGd = null;
    let normalMap = null;
    let lighting = null;
    let depthConfidence = null;
    let occlusionGraph = [];
    if (opts._depthMap) {
      depthMap = opts._depthMap;
      scene.depthMap = depthMap;
      const dg = IP.depthGradient(depthMap, opts._depthW || pw, opts._depthH || ph);
      if (dg.Gd.length !== pw * ph) {
        const resized = new Float32Array(pw * ph);
        for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
          const sx = Math.floor(x / pw * (opts._depthW || pw)), sy = Math.floor(y / ph * (opts._depthH || ph));
          resized[y * pw + x] = dg.Gd[Math.min(dg.Gd.length - 1, sy * (opts._depthW || pw) + sx)] || 0;
        }
        depthGd = resized;
      } else depthGd = dg.Gd;
      const nm = IP.estimateNormals(dg.Dx || new Float32Array(pw * ph), dg.Dy || new Float32Array(pw * ph), pw, ph);
      normalMap = nm; scene.normalMap = nm;
      lighting = IP.estimateLighting(nm.Nx, nm.Ny, nm.Nz);
      scene.lighting = lighting;
      if (window.DepthAPI && window.DepthAPI.computeConfidence) {
        try {
          const dc = window.DepthAPI.computeConfidence(depthMap, gray, dg.Gd.length === pw*ph ? pw : opts._depthW||pw, dg.Gd.length === pw*ph ? ph : opts._depthH||ph, null);
          depthConfidence = dc.map; scene.confidenceMap = depthConfidence;
        } catch (e) { void e; }
      }
    } else if (window.DepthAPI) {
      try {
        const localDepth = window.DepthAPI.estimateLocal(gray, pw, ph);
        depthMap = localDepth; scene.depthMap = depthMap;
        const dg2 = IP.depthGradient(depthMap, pw, ph);
        depthGd = dg2.Gd;
        const nm2 = IP.estimateNormals(dg2.Dx, dg2.Dy, pw, ph);
        normalMap = nm2; scene.normalMap = nm2;
        lighting = IP.estimateLighting(nm2.Nx, nm2.Ny, nm2.Nz);
        if (window.DepthAPI.computeConfidence) {
          const dc2 = window.DepthAPI.computeConfidence(localDepth, gray, pw, ph, null);
          depthConfidence = dc2.map; scene.confidenceMap = depthConfidence;
        }
      } catch (e) { void e; }
    }
    if (depthGd && scene.objects && scene.objects.length > 1) {
      for (let a = 0; a < scene.objects.length; a++) {
        for (let b = a + 1; b < scene.objects.length; b++) {
          const oA = scene.objects[a], oB = scene.objects[b];
          if (!oA.bounding_box || !oB.bounding_box) continue;
          const depthA = oA.depth || 0.5, depthB = oB.depth || 0.5;
          const overlapX = Math.max(0, Math.min(oA.bounding_box[2], oB.bounding_box[2]) - Math.max(oA.bounding_box[0], oB.bounding_box[0]));
          const overlapY = Math.max(0, Math.min(oA.bounding_box[3], oB.bounding_box[3]) - Math.max(oA.bounding_box[1], oB.bounding_box[1]));
          if (overlapX > 5 && overlapY > 5) {
            const front = depthA > depthB ? oA : oB;
            const back = depthA > depthB ? oB : oA;
            occlusionGraph.push({ occluder_id: front.id, occludee_id: back.id, confidence: Math.abs(depthA - depthB) });
          }
        }
      }
      scene.occlusionGraph = occlusionGraph;
    }

    const hiStrong = U.lerp(0.30, 0.15, dt);
    const hiMid = hiStrong * 0.62;
    const maskStrong = IP.hysteresisMask(thin, pw, ph, hiStrong);
    const maskMid = IP.hysteresisMask(thin, pw, ph, hiMid);
    let visualStrong = IP.maskToField(maskStrong, pw, ph);
    let visualMid = IP.maskToField(maskMid, pw, ph);
    if (depthGd) {
      const depthEdge = IP.normalizeField(depthGd.slice());
      visualStrong = IP.combineEdges(visualStrong, depthEdge, 0.65, 0.35);
      visualMid = IP.combineEdges(visualMid, depthEdge, 0.60, 0.40);
    }
    let strongLines = IP.traceContours(visualStrong, pw, ph, 0.5);
    let midLines = IP.traceContours(visualMid, pw, ph, 0.5);
    if (depthGd) {
      const depthContours = IP.traceContours(IP.normalizeField(depthGd), pw, ph, 0.35);
      strongLines = [...strongLines, ...depthContours.slice(0, 8)];
    }
    let apiUsed = false;
    if (opts._apiStrokes && opts._apiStrokes.length) {
      const sx = pw / srcCanvas.width, sy = ph / srcCanvas.height;
      const mapped = opts._apiStrokes.map(line => line.map(p => ({ x: p.x * sx, y: p.y * sy })));
      strongLines = [...mapped, ...strongLines];
      midLines = [...mapped.slice(0, Math.min(30, mapped.length)), ...midLines];
      apiUsed = true;
    }
    if (opts._aiStructure && opts._aiStructure.subjects) {
      apiUsed = true;
    }
    await U.tickAsync();

    progress(26, "Quantizing color regions…");
    const qK = P.fewColors ? 5 : (P.grayscale ? 6 : 9 + Math.round(dt * 5));
    const procData = IP.getData(proc);
    const palette = IP.medianCutPalette(procData, qK, 9000);
    const qIndices = IP.quantizeImageData(procData, palette);
    pctx.putImageData(procData, 0, 0);
    scene.segmentation = { palette, indices: qIndices };

    const boundaryField = new Float32Array(pw * ph);
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        const i = y * pw + x;
        const c = qIndices[i];
        if ((x + 1 < pw && qIndices[i + 1] !== c) || (y + 1 < ph && qIndices[i + pw] !== c)) {
          boundaryField[i] = 1;
          if (x + 1 < pw) boundaryField[i + 1] = 1;
          if (y + 1 < ph) boundaryField[i + pw] = 1;
        }
      }
    }
    const boundaryBlurred = IP.blurField(boundaryField, pw, ph, 1);
    const regionLines = IP.traceContours(boundaryBlurred, pw, ph, 0.35);
    const regionAnalysis = IP.regionAnalysis(qIndices, palette, pw, ph);
    scene.regions = regionAnalysis;
    // Stroke budget: Primary 55% > Secondary 25% > Environment 12% > Texture 8%
    const _totalBudget = 500 + Math.round(300 * dt);
    const _budgets = { primary: Math.round(_totalBudget * 0.55), secondary: Math.round(_totalBudget * 0.25), environment: Math.round(_totalBudget * 0.12), texture: Math.round(_totalBudget * 0.08) };
    const _sortedRegsRaw = [...regionAnalysis.regions].sort((a,b)=>b.area-a.area);
    const _isNearWhite = (c)=>{ try{ const rgb=U.hexToRgb(c); return 0.2126*rgb.r+0.7152*rgb.g+0.0722*rgb.b > 232; }catch(e){return false;}};
    let _sortedRegs = _sortedRegsRaw;
    if(_sortedRegs.length>1 && _isNearWhite(_sortedRegs[0].color) && _sortedRegs[0].area > pw*ph*0.30){
      const bg = _sortedRegs.shift(); _sortedRegs.push(bg);
    }
    const _totalArea = pw*ph;
    scene.objects = _sortedRegs.slice(0,10).map((r,idx)=>{
      let level="texture";
      if(idx===0 && r.area>_totalArea*0.08) level="primary";
      else if(idx<3 && r.area>_totalArea*0.03) level="secondary";
      else if(r.area>_totalArea*0.01) level="environment";
      return {id:`obj_${idx}`,label:r.color,mask:null,hierarchy_level:level,stroke_budget:Math.round((_budgets[level]||10)/Math.max(1,level==="primary"?1:level==="secondary"?2:4)),bounding_box:r.bbox,depth:r.area/_totalArea,importance:idx===0?1:0.7-idx*0.08,contours:[]};
    });
    if(opts._aiStructure && opts._aiStructure.subjects){
      for(let sI=0;sI<Math.min(4,opts._aiStructure.subjects.length);sI++){
        const s=opts._aiStructure.subjects[sI];
        const bb=s.bbox?[Math.round(s.bbox[0]/1000*pw),Math.round(s.bbox[1]/1000*ph),Math.round(s.bbox[2]/1000*pw),Math.round(s.bbox[3]/1000*ph)]:null;
        scene.objects.unshift({id:`ai_${sI}`,label:s.label||s.name||"ai-subject",mask:null,hierarchy_level:sI===0?"primary":"secondary",stroke_budget:sI===0?_budgets.primary:_budgets.secondary,bounding_box:bb,depth:s.depth||0.6,importance:s.importance||0.9,contours:[],aiSource:true});
      }
    }
    await U.tickAsync();

    progress(38, "Estimating perspective…");
    const allLinesForVP = [...strongLines, ...regionLines].slice(0, 60);
    const vps = IP.estimatePerspective(allLinesForVP);
    scene.perspective = vps;
    await U.tickAsync();

    // High-accuracy text handling
    let textStrokes = [];
    try {
      const aiTexts = (opts._aiStructure && opts._aiStructure.text_regions) ? opts._aiStructure.text_regions : [];
      let cands = [];
      if (aiTexts.length) {
        for (let k=0;k<aiTexts.length;k++) cands.push({bbox: aiTexts[k].bbox, isAI: true});
      } else if (P.highAccuracy) {
        const tmpRA = IP.regionAnalysis(qIndices, palette, pw, ph);
        for (let rI=0;rI<tmpRA.regions.length;rI++) {
          const r = tmpRA.regions[rI];
          const x1=r.bbox[0],y1=r.bbox[1],x2=r.bbox[2],y2=r.bbox[3];
          const w2=x2-x1,h2=y2-y1;
          const aspect=w2/(h2||1);
          if (r.area < pw*ph*0.015 && r.area > 25 && aspect>1.8 && aspect<14 && h2 < ph*0.14 && h2>4) {
            cands.push({bbox:[x1,y1,x2,y2], isAI:false});
            if (cands.length>=10) break;
          }
        }
      }
      for (let ti=0;ti<cands.length;ti++) {
        const tr=cands[ti];
        const bx=tr.bbox;
        let rx1,ry1,rx2,ry2;
        if (tr.isAI) {
          rx1=Math.floor(Math.max(0,Math.min(pw-1,bx[0]/1000*pw)));
          ry1=Math.floor(Math.max(0,Math.min(ph-1,bx[1]/1000*ph)));
          rx2=Math.floor(Math.max(0,Math.min(pw-1,bx[2]/1000*pw)));
          ry2=Math.floor(Math.max(0,Math.min(ph-1,bx[3]/1000*ph)));
        } else { rx1=bx[0]; ry1=bx[1]; rx2=bx[2]; ry2=bx[3]; }
        const cw=Math.max(6,rx2-rx1),ch=Math.max(6,ry2-ry1);
        if (cw<6||ch<6) continue;
        const crop=document.createElement('canvas'); crop.width=cw; crop.height=ch;
        const cctx=crop.getContext('2d');
        try{ cctx.drawImage(proc, rx1, ry1, cw, ch, 0,0,cw,ch);}catch(e){continue;}
        const gCrop=IP.grayField(crop);
        const sobCrop=IP.sobel(gCrop,cw,ch);
        const thinCrop=IP.normalizeField(IP.nms(sobCrop.mag,sobCrop.dirX,sobCrop.dirY,cw,ch));
        const maskCrop=IP.hysteresisMask(thinCrop,cw,ch,0.16);
        const fieldCrop=IP.maskToField(maskCrop,cw,ch);
        const linesCrop=IP.traceContours(fieldCrop,cw,ch,0.5);
        for(let li=0;li<linesCrop.length;li++){
          let pts=U.rdp(linesCrop[li],0.6);
          if(pts.length<2) continue;
          for(let pi=0;pi<pts.length;pi++){ pts[pi].x+=rx1; pts[pi].y+=ry1; }
          const st=mkStroke(pts,{color:'#0a0a14',size:P.highAccuracy?1.0:1.3,opacity:0.96,tool:'pen'});
          if(st) textStrokes.push(st);
        }
      }
      textStrokes.sort((a,b)=>{
        const ay=Math.min(...a.pts.map(pt=>pt.y)), by=Math.min(...b.pts.map(pt=>pt.y));
        if(Math.abs(ay-by)>10) return ay-by;
        return Math.min(...a.pts.map(pt=>pt.x))-Math.min(...b.pts.map(pt=>pt.x));
      });
    } catch(e) { console.warn('text handling',e.message); }
    progress(42, "Sampling tonal contours…");
    const toneR = U.clamp(Math.round(minDim / 60), 4, 18);
    const grayTone = IP.blurField(gray, pw, ph, toneR);
    const toneLines = [];
    for (const iso of [0.32, 0.5, 0.68]) {
      toneLines.push(...IP.traceContours(grayTone, pw, ph, iso));
    }
    await U.tickAsync();

    progress(56, "Planning hatching…");
    const hatch = [];
    {
      const thr = 0.55;
      const step = Math.max(4, Math.round(U.lerp(11, 5, dt)));
      let maxCount = 160 + Math.round(detail * 90);
      if (P.highAccuracy) maxCount = Math.round(maxCount * 0.65);
      const j = P.rigid ? 0 : 1.5;
      let count = 0;
      for (let y = step >> 1; y < ph && count < maxCount; y += step) {
        for (let x = step >> 1; x < pw && count < maxCount; x += step) {
          const i = y * pw + x;
          if (maskMid[i]) continue;
          let dk = 1 - grayB[i];
          if (lighting) dk = (1 - lighting[i]) * 0.85 + dk * 0.15;
          if (dk < thr) continue;
          const gxn = sob.dirX[i], gyn = sob.dirY[i];
          const gl = Math.hypot(gxn, gyn);
          let dx, dy;
          if (normalMap && lighting) {
            const nx = normalMap.Nx[i], ny = normalMap.Ny[i];
            const tx = -ny, ty = nx;
            const tlen = Math.hypot(tx, ty) || 1;
            dx = tx / tlen; dy = ty / tlen;
          } else if (gl > 1e-4 && sob.mag[i] > 0.05) { dx = -gyn / gl; dy = gxn / gl; }
          else { dx = 0.98; dy = 0.2; }
          const len = 5 + 8 * (dk - thr) / (1 - thr);
          const cx = x + U.rand(-j, j), cy = y + U.rand(-j, j);
          hatch.push({
            pts: [
              { x: U.clamp(cx - dx * len / 2, 1, pw - 1), y: U.clamp(cy - dy * len / 2, 1, ph - 1) },
              { x: U.clamp(cx + dx * len / 2, 1, pw - 1), y: U.clamp(cy + dy * len / 2, 1, ph - 1) }
            ],
            alpha: U.clamp(0.22 + (dk - thr) * 0.85, 0.18, 0.8)
          });
          count++;
        }
      }
    }
    // Cross-contours from normals: wrap around volume
    let crossContours = [];
    if (normalMap) {
      const stepCC = Math.max(12, Math.round(22 - dt*1.2));
      for(let y=stepCC;y<ph-stepCC;y+=stepCC){
        for(let x=stepCC;x<pw-stepCC;x+=stepCC){
          const i=y*pw+x;
          if(maskMid[i]) continue;
          const nx=normalMap.Nx[i], ny=normalMap.Ny[i];
          const tx=-ny, ty=nx;
          const tlen=Math.hypot(tx,ty);
          if(tlen<0.2) continue;
          const len = 18 + (lighting? (1-lighting[i])*10 : 6);
          const pts=[];
          for(let s=-len/2;s<=len/2;s+=2){
            const px = x + (tx/tlen)*s;
            const py = y + (ty/tlen)*s;
            if(px<1||px>=pw-1||py<1||py>=ph-1) continue;
            pts.push({x:px, y:py});
          }
          if(pts.length>3) crossContours.push(pts);
          if(crossContours.length>40) break;
        }
        if(crossContours.length>40) break;
      }
    }
    await U.tickAsync();

    progress(72, "Filtering and ordering strokes…");

    const mkStroke = (rawPts, o) => {
      const clean = [];
      for (const p of rawPts) {
        if (!isFinite(p.x) || !isFinite(p.y)) continue;
        clean.push(p);
      }
      if (clean.length < 2) return null;
      const scaled = new Array(clean.length);
      for (let i = 0; i < clean.length; i++) {
        scaled[i] = {
          x: U.clamp(clean[i].x * fx, 0, docW),
          y: U.clamp(clean[i].y * fy, 0, docH)
        };
      }
      return {
        pts: scaled,
        color: o.color,
        size: U.clamp((o.size || 2) * fAvg, 0.4, 30),
        opacity: U.clamp(o.opacity !== undefined ? o.opacity : 0.9, 0.05, 1),
        tool: o.tool || "pen"
      };
    };

    const prepContours = (lines, eps, jitterAmt, smoothIters) => {
      const out = [];
      for (const line of lines) {
        let pts = U.rdp(line, eps);
        if (pts.length < 2) continue;
        if (smoothIters) pts = U.smoothPts(pts, smoothIters);
        if (jitterAmt) pts = U.jitterPts(pts, jitterAmt);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let finite = true;
        for (const p of pts) {
          if (!isFinite(p.x) || !isFinite(p.y)) { finite = false; break; }
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
        if (!finite) continue;
        const diag = Math.hypot(maxX - minX, maxY - minY);
        if (U.pathLength(pts) > 6.0 * diag + 40) continue;
        if (diag < 3.5) continue;
        out.push(pts);
      }
      out.sort((a, b) => U.pathLength(b) - U.pathLength(a));
      return out;
    };

    const rigid = !!P.rigid;
    const jit = rigid ? 0 : 1.2;
    let strongPrep = prepContours(strongLines, U.lerp(3.2, 0.9, dt), jit * 0.6, 1);
    let midPrep = prepContours(midLines, U.lerp(2.8, 0.8, dt), jit * 0.6, 1);
    let regionPrep = prepContours(regionLines, U.lerp(3.0, 0.9, dt), rigid ? 0 : 0.6, 1);
    let tonePrep = prepContours(toneLines, 3.2, jit * 0.8, 2);
    // Edge scoring: classify each contour and keep only artistically meaningful
    const scoreContour = (pts, type) => {
      const len = U.pathLength(pts);
      let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
      for(const pt of pts){ if(pt.x<minX)minX=pt.x; if(pt.y<minY)minY=pt.y; if(pt.x>maxX)maxX=pt.x; if(pt.y>maxY)maxY=pt.y; }
      const diag = Math.hypot(maxX-minX, maxY-minY);
      const strength = Math.min(1, len/120);
      const lengthScore = Math.min(1, len/200);
      const semantic = type==="silhouette"?1: type==="structural"?0.85 : type==="region"?0.6 : 0.4;
      const depthDisc = depthGd ? Math.min(1, (depthGd[Math.floor((minY+maxY)/2)*pw+Math.floor((minX+maxX)/2)]||0)*1.5) : 0.5;
      const curv = Math.min(1, pts.reduce((a,_,i)=>a+IP.curvatureAt(pts,i),0)/pts.length*8);
      const contrast = Math.min(1, diag/80);
      return IP.edgeScore(strength, lengthScore, semantic, depthDisc, curv, contrast);
    };
    const filterByScore = (arr, type, thresh) => {
      const scored = arr.map(pts => ({pts, score: scoreContour(pts, type), type}));
      scored.sort((a,b)=>b.score-a.score);
      return scored.filter(s=>s.score>=thresh).map(s=>s.pts);
    };
    strongPrep = filterByScore(strongPrep, "silhouette", 0.32);
    midPrep = filterByScore(midPrep, "structural", 0.28);
    regionPrep = filterByScore(regionPrep, "structural", 0.30);
    // Stroke budget enforcement per hierarchy
    if(scene.objects && scene.objects.length){
      const primary = scene.objects.find(o=>o.hierarchy_level==="primary");
      const budgetPrimary = primary ? primary.stroke_budget : 280;
      const keepStrong = Math.min(strongPrep.length, Math.round(budgetPrimary*0.5));
      const keepRegion = Math.min(regionPrep.length, Math.round(budgetPrimary*0.3));
      if(strongPrep.length > keepStrong) strongPrep.length = keepStrong;
      if(regionPrep.length > keepRegion) regionPrep.length = keepRegion;
    }

    const ops = [];
    const stagesMeta = [];
    const pushStrokeStage = (key, label, strokes, defTool) => {
      const usable = [];
      for (const s of strokes) if (s) usable.push(s);
      if (!usable.length) return;
      stagesMeta.push({ key, label });
      for (const st of usable) {
        ops.push({
          op: "stroke",
          pts: st.pts,
          tool: st.tool || defTool,
          color: st.color,
          size: st.size,
          opacity: st.opacity,
          stage: key
        });
      }
    };

    if (opts.stages.con !== false) {
      const conStrokes = [];
      for (const pts of strongPrep.slice(0, P.rigid ? 22 : 14)) {
        const simple = U.rdp(pts, U.lerp(22, 10, dt));
        for (let j = 1; j < simple.length; j++) {
          const a = simple[j - 1], b = simple[j];
          if (U.dist(a.x, a.y, b.x, b.y) < 12 * fAvg) continue;
          conStrokes.push(mkStroke([a, b], { color: "#8a92ad", size: 1.8, opacity: 0.34, tool: "pen" }));
        }
      }
      sortBySweep(conStrokes);
      pushStrokeStage("con", "Construction", conStrokes, "pen");
    }

    if (opts.stages.sketch !== false) {
      const cap = 40 + Math.round(dt * 90);
      const pool = [...midPrep, ...strongPrep.slice(0, Math.floor(cap / 3))];
      pool.sort((a, b) => U.pathLength(b) - U.pathLength(a));
      const skStrokes = [];
      for (const pts of pool.slice(0, cap)) {
        skStrokes.push(mkStroke(pts, {
          color: U.choice(["#5b6478", "#66708a", "#4e5870"]),
          size: U.rand(2.0, 3.0),
          opacity: U.rand(0.6, 0.8),
          tool: "pencil"
        }));
      }
      sortBySweep(skStrokes);
      pushStrokeStage("sketch", "Sketch", skStrokes, "pencil");
    }

    if (opts.stages.detail !== false) {
      const cap = 110 + Math.round(dt * 220);
      const pool = [...strongPrep, ...regionPrep, ...tonePrep.slice(0, Math.floor(cap / 2))];
      pool.sort((a, b) => U.pathLength(b) - U.pathLength(a));
      const deStrokes = [];
      for (const pts of pool.slice(0, cap)) {
        deStrokes.push(mkStroke(pts, {
          color: U.choice(["#39415a", "#2e3549"]),
          size: U.rand(1.1, 1.8),
          opacity: U.rand(0.7, 0.9),
          tool: "pen"
        }));
      }
      sortBySweep(deStrokes);
      pushStrokeStage("detail", "Detail", deStrokes, "pen");
    }

    if (crossContours.length) {
      const ccStrokes = [];
      for (const pts of crossContours) {
        const st = mkStroke(pts, { color: "#2a344d", size: 1.0, opacity: 0.55, tool: "pen" });
        if (st) ccStrokes.push(st);
      }
      sortBySweep(ccStrokes, 20);
      pushStrokeStage("cross", "Cross-Contour", ccStrokes, "pen");
    }

    // Justified construction: bounding box + axes from primary object (only if geometrically justified)
    if (opts.stages.con !== false && scene.objects.length) {
      const primary = scene.objects.find(o=>o.hierarchy_level==="primary") || scene.objects[0];
      if (primary && primary.bounding_box) {
        const [x1,y1,x2,y2] = primary.bounding_box;
        const cx = (x1+x2)/2, cy=(y1+y2)/2;
        const w2=x2-x1, h2=y2-y1;
        const guides=[];
        // bounding box (only if confident: area > 2% and not background - skip near-white large regions)
        const isBackgroundLike = (()=>{ const c=primary.label; try{ const rgb=U.hexToRgb(c); const lum=0.2126*rgb.r+0.7152*rgb.g+0.0722*rgb.b; return lum>235 && (w2*h2)/(pw*ph)>0.35; }catch(e){return false;}})();
        if (!isBackgroundLike && primary.bounding_box && (w2*h2)/(pw*ph) > 0.015 && (w2*h2)/(pw*ph) < 0.92) {
          const edges = [[{x:x1,y:y1},{x:x2,y:y1}],[{x:x2,y:y1},{x:x2,y:y2}],[{x:x2,y:y2},{x:x1,y:y2}],[{x:x1,y:y2},{x:x1,y:y1}]];
          for(const seg of edges){
            const g = mkStroke(seg, {color:"#8a92ad", size:1.2, opacity:0.18, tool:"pen"});
            if(g) guides.push(g);
          }
        }
        // center axes
        if (w2>10 && h2>10) {
          const hAxis = mkStroke([{x:cx-w2*0.45,y:cy},{x:cx+w2*0.45,y:cy}], {color:"#8a92ad",size:1.0,opacity:0.15,tool:"pen"});
          const vAxis = mkStroke([{x:cx,y:cy-h2*0.45},{x:cx,y:cy+h2*0.45}], {color:"#8a92ad",size:1.0,opacity:0.15,tool:"pen"});
          if(hAxis) guides.push(hAxis);
          if(vAxis) guides.push(vAxis);
        }
        // primitive fitting: try box vs ellipse
        if (w2>12 && h2>12) {
          const ar=w2/h2;
          if (ar>0.7 && ar<1.4 && primary.label && /head|face/i.test(primary.label)) {
            const cx2=cx, cy2=cy;
            const rx=w2*0.42, ry=h2*0.42;
            const ellipse=[];
            for(let a=0;a<360;a+=12){ const rad=a*Math.PI/180; ellipse.push({x:cx2+Math.cos(rad)*rx, y:cy2+Math.sin(rad)*ry}); }
            const eSt = mkStroke(ellipse, {color:"#8a92ad",size:1.0,opacity:0.14,tool:"pen"});
            if(eSt) guides.push(eSt);
          }
        }
        if (guides.length) {
          sortBySweep(guides);
          // Prepend to construction stage (already created) or create new
          for(let gi=guides.length-1;gi>=0;gi--) ops.unshift({op:"stroke", pts:guides[gi].pts, tool:"pen", color:guides[gi].color, size:guides[gi].size, opacity:guides[gi].opacity, stage:"con"});
        }
      }
    }
    // Perspective guides - only if evidence (requires >=8 supporting lines)
    if (scene.perspective && scene.perspective.length){
      const vps = scene.perspective;
      let hasSupport = false;
      for(const vp of vps){ if(Math.abs(vp.x)<pw*3 && Math.abs(vp.y)<ph*3) hasSupport=true; }
      if(!hasSupport && vps.length>=1){
        // suppress - not enough evidence
        scene.perspective = [];
      }
    }

    if (opts.stages.shade !== false) {
      const shStrokes = [];
      for (const h of hatch) {
        shStrokes.push(mkStroke(h.pts, { color: "#20263a", size: 1.0, opacity: h.alpha * 0.8, tool: "pen" }));
      }
      sortBySweep(shStrokes, 14);
      pushStrokeStage("shade", "Shading", shStrokes, "pen");
    }

    if (textStrokes.length) {
      sortBySweep(textStrokes);
      pushStrokeStage("text", "Text \u2014 High Accuracy", textStrokes, "pen");
    }

    if (opts.colorize && P.colorize) {
      progress(84, "Preparing color regions…");
      await U.tickAsync();
      const { regions } = IP.regionAnalysis(qIndices, palette, pw, ph);
      const minArea = pw * ph * 0.004;
      const usable = regions.filter(r => r.area >= minArea)
        .sort((a, b) => b.area - a.area)
        .slice(0, 40);
      stagesMeta.push({ key: "color", label: "Color" });
      ops.push({ op: "tool", v: "fill" });
      for (const r of usable) {
        ops.push({
          op: "fill",
          x: U.clamp((r.seed.x + 0.5) * fx, 0, docW - 1),
          y: U.clamp((r.seed.y + 0.5) * fy, 0, docH - 1),
          color: r.color,
          tol: 30,
          stage: "color"
        });
      }
    }

    if (opts.stages.final !== false) {
      progress(92, "Finalizing ink pass…");
      await U.tickAsync();
      const inkCfg = {
        pencil: { color: "#3d4358", size: 2.0, passes: 2, epsMul: 0.8 },
        ink: { color: "#0b0d16", size: 2.6, passes: 1, epsMul: 0.55, vary: 1.8 },
        anime: { color: "#10131f", size: 2.2, passes: 1, epsMul: 0.6 },
        technical: { color: "#1d2333", size: 1.2, passes: 1, epsMul: 0.5 },
        minimal: { color: "#171a24", size: 3.6, passes: 1, epsMul: 1.6 },
        mono: { color: "#181b26", size: 1.5, passes: 1, epsMul: 0.7 }
      }[presetIdOf(P)] || { color: "#12141f", size: 2.2, passes: 1, epsMul: 0.7 };

      const principalPool = [...strongPrep, ...regionPrep];
      principalPool.sort((a, b) => U.pathLength(b) - U.pathLength(a));
      const capFin = Math.min(principalPool.length, 80 + Math.round(dt * 140));
      const chosen = principalPool.slice(0, capFin);
      chosen.sort((a, b) => {
        let ya = Infinity, yb = Infinity;
        for (const p of a) if (p.y < ya) ya = p.y;
        for (const p of b) if (p.y < yb) yb = p.y;
        return ya - yb || U.pathLength(b) - U.pathLength(a);
      });
      const finStrokes = [];
      for (let pass = 0; pass < inkCfg.passes; pass++) {
        for (const pts of chosen) {
          let clean = U.smoothPts(U.rdp(pts, inkCfg.epsMul), 2);
          if (inkCfg.passes > 1) clean = U.jitterPts(clean, 0.8);
          finStrokes.push(mkStroke(clean, {
            color: inkCfg.color,
            size: inkCfg.size + (inkCfg.vary ? U.rand(-inkCfg.vary, inkCfg.vary) * 0.5 : 0),
            opacity: inkCfg.passes > 1 ? 0.55 : 0.95,
            tool: "pen"
          }));
        }
      }
      sortBySweep(finStrokes);
      pushStrokeStage("final", "Final Ink", finStrokes, "pen");
    }

    if (opts._depthMap && opts._depthW && opts._depthH) {
      const dMap = opts._depthMap, dW = opts._depthW, dH = opts._depthH;
      const sampleDepth = (x, y) => {
        const dx = Math.min(dW - 1, Math.max(0, Math.round(x / pw * dW)));
        const dy = Math.min(dH - 1, Math.max(0, Math.round(y / ph * dH)));
        return dMap[dy * dW + dx] || 0.5;
      };
      for (const op of ops) {
        if (op.op !== "stroke") continue;
        let acc = 0;
        for (const p of op.pts) acc += sampleDepth(p.x / fx, p.y / fy);
        const avg = acc / op.pts.length;
        op._depth = avg;
        op.size = U.clamp(op.size * (0.75 + avg * 0.6), 0.5, 8);
        op.opacity = U.clamp(op.opacity * (0.65 + avg * 0.7), 0.15, 1);
      }
      ops.sort((a, b) => {
        if (a.op === "stroke" && b.op === "stroke") return (a._depth || 0.5) - (b._depth || 0.5);
        return 0;
      });
    }

    if (opts._aiMasks && opts._aiMasks.length) {
      const inImportant = (op) => {
        if (op.op !== "stroke") return true;
        const cx = op.pts.reduce((s, p) => s + p.x, 0) / op.pts.length;
        const cy = op.pts.reduce((s, p) => s + p.y, 0) / op.pts.length;
        const px = cx / fx, py = cy / fy;
        for (const m of opts._aiMasks) {
          if (px >= m.x1 && px <= m.x2 && py >= m.y1 && py <= m.y2) return m.importance > 0.4;
        }
        return true;
      };
      const filtered = ops.filter(inImportant);
      if (filtered.filter(o => o.op === "stroke").length > 12) {
        ops.length = 0; ops.push(...filtered);
        for (const m of stagesMeta) m.count = ops.filter(o => o.stage === m.key).length;
      }
    }

    // Prioritization Engine: modular scoring + hard constraints
    if (typeof window !== "undefined" && window.PriorityEngine) {
      const presetId = Object.keys(window.Tracer.PRESETS).find(k=>window.Tracer.PRESETS[k]===P) || "ink";
      const weights = window.PriorityEngine.weightsForStyle(presetId);
      for (const op of ops) {
        if (op.op !== "stroke") continue;
        const cx = op.pts.reduce((s,p)=>s+p.x,0)/op.pts.length;
        const cy = op.pts.reduce((s,p)=>s+p.y,0)/op.pts.length;
        let hierarchy = "environment";
        for(const o of scene.objects){ const bb=o.bounding_box; if(!bb) continue; if(cx>=bb[0]&&cx<=bb[2]&&cy>=bb[1]&&cy<=bb[3]){ hierarchy=o.hierarchy_level; break; } }
        const depthDelta = depthGd ? Math.abs(depthGd[Math.floor(cy/fy)*pw + Math.floor(cx/fx)] || 0) : 0.3;
        const ctx = { hierarchy, depthDelta, contourType: op.stage==="con"?"construction": op.stage==="final"?"silhouette":"structural", strength: 0.7, curvatureConsistency: 0.7, depthConsistency: depthConfidence? depthConfidence[Math.floor(cy/fy)*pw+Math.floor(cx/fx)]||0.6 : 0.6, W: docW, H: docH, weights };
        const scored = window.PriorityEngine.scoreStroke(op, ctx);
        op._priority = scored.priority;
        op._scores = scored.scores;
        const hard = window.PriorityEngine.hardConstraints(op, { confidence: scored.scores.confidence, occlusionViolated: false, duplicate: false, budgetExceeded: false });
        if (hard.reject && scored.scores.confidence < 0.35) op._rejected = true;
      }
      const before = ops.filter(o=>!o._rejected);
      if (before.filter(o=>o.op==="stroke").length > 20) { ops.length=0; ops.push(...before); }
      const byStage={}; for(const op of ops){ const k=op.stage||"_other"; (byStage[k]=byStage[k]||[]).push(op); }
      ops.length=0;
      for(const st of stagesMeta){ const arr=byStage[st.key]||[]; arr.sort((a,b)=>(b._priority||0)-(a._priority||0)); ops.push(...arr); delete byStage[st.key]; }
      for(const k in byStage) ops.push(...byStage[k]);
    }

    // Final cleanup: remove tiny fragments, low-confidence duplicates, near-identical paths
    const seen = new Set();
    const cleaned = [];
    for (const op of ops) {
      if (op.op !== "stroke") { cleaned.push(op); continue; }
      const len = U.pathLength(op.pts);
      const conf = (op._scores && op._scores.confidence) || 0.6;
      if (len < 8 && conf < 0.45) continue;
      if (len < 4) continue;
      // near-duplicate check via bbox + length hash
      let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
      for(const pt of op.pts){ if(pt.x<minX)minX=pt.x; if(pt.y<minY)minY=pt.y; if(pt.x>maxX)maxX=pt.x; if(pt.y>maxY)maxY=pt.y; }
      const key = `${Math.round(minX/2)}|${Math.round(minY/2)}|${Math.round(len/5)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(op);
    }
    if (cleaned.filter(o=>o.op==="stroke").length >= 12) { ops.length=0; ops.push(...cleaned); }
    // expose debug info
    if (typeof window !== "undefined") {
      window.AtelierDebug = window.AtelierDebug || {};
      window.AtelierDebug.lastScene = scene;
      window.AtelierDebug.lastOps = ops.slice();
      window.AtelierDebug.lastBudgets = _budgets;
    }

    let estMs = 0;
    for (const o of ops) {
      if (o.op === "stroke") estMs += 140 + (U.pathLength(o.pts) / 950) * 1000;
      else if (o.op === "fill") estMs += 500;
      else estMs += 60;
    }

    const meta = {
      stages: stagesMeta,
      totalStrokes: ops.filter(o => o.op === "stroke").length,
      estMs,
      previewCanvas: makePreview(proc, qIndices, palette, pw, ph, opts.colorize && P.colorize),
      apiUsed: apiUsed || !!opts._aiStructure
    };
    progress(100, "Plan ready");
    await U.tickAsync();
    return { ops, meta };
  }

  function presetIdOf(P) {
    for (const id in PRESETS) if (PRESETS[id] === P) return id;
    return "ink";
  }

  function makePreview(procCanvas, indices, palette, pw, ph, colorize) {
    const c = document.createElement("canvas");
    c.width = pw; c.height = ph;
    const ctx = c.getContext("2d");
    if (colorize) {
      ctx.drawImage(procCanvas, 0, 0);
    } else {
      const img = ctx.createImageData(pw, ph);
      for (let p = 0; p < indices.length; p++) {
        const col = palette[indices[p]];
        img.data[p * 4] = col[0];
        img.data[p * 4 + 1] = col[1];
        img.data[p * 4 + 2] = col[2];
        img.data[p * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    return c;
  }

  window.Tracer = { PRESETS, buildPlan };
})();
