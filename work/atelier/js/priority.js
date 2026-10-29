(function () {
  "use strict";
  const Prio = {};

  const DEFAULT_WEIGHTS = {
    semantic: 0.30,
    geometric: 0.20,
    depth: 0.18,
    contour: 0.15,
    confidence: 0.12,
    composition: 0.05
  };

  Prio.weightsForStyle = function (presetId) {
    const w = { ...DEFAULT_WEIGHTS };
    if (presetId === "technical") { w.geometric = 0.35; w.contour = 0.10; }
    if (presetId === "anime") { w.contour = 0.25; w.semantic = 0.25; }
    if (presetId === "minimal") { w.geometric = 0.30; w.composition = 0.10; }
    if (presetId === "highFidelity") { w.confidence = 0.18; w.contour = 0.20; }
    return w;
  };

  Prio.semanticScore = function (hierarchy) {
    if (hierarchy === "primary") return 1.0;
    if (hierarchy === "secondary") return 0.70;
    if (hierarchy === "environment") return 0.30;
    return 0.10;
  };

  Prio.geometricScore = function (pts) {
    if (!pts || pts.length < 3) return 0.3;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
    const w = maxX - minX, h = maxY - minY;
    const ar = w / (h || 1);
    const diag = Math.hypot(w, h);
    const len = window.U.pathLength(pts);
    const straightness = len / (diag || 1);
    let score = 0.5;
    if (straightness < 1.2) score = 0.90;
    else if (straightness < 1.6) score = 0.75;
    else if (straightness < 2.2) score = 0.60;
    else score = 0.40;
    if (ar > 0.85 && ar < 1.15 && len > diag * 2.5) score = Math.max(score, 0.88);
    return U.clamp(score, 0, 1);
  };

  Prio.depthScore = function (depthDelta) {
    return U.clamp(Math.min(1, depthDelta * 2.2), 0, 1);
  };

  Prio.contourScore = function (type) {
    if (type === "silhouette") return 1.0;
    if (type === "occluding") return 0.90;
    if (type === "structural") return 0.80;
    if (type === "crease") return 0.80;
    if (type === "material") return 0.40;
    if (type === "shadow") return 0.15;
    return 0.50;
  };

  Prio.confidenceScore = function (strength, curvatureConsistency, depthConsistency) {
    const s = U.clamp(strength, 0, 1);
    const g = U.clamp(curvatureConsistency, 0, 1);
    const d = U.clamp(depthConsistency, 0, 1);
    return U.clamp(0.5 * s + 0.3 * g + 0.2 * d, 0, 1);
  };

  Prio.compositionScore = function (pts, W, H) {
    if (!pts || !pts.length) return 0.5;
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p.x; cy += p.y; }
    cx /= pts.length; cy /= pts.length;
    const thirds = [{ x: W * 0.33, y: H * 0.33 }, { x: W * 0.66, y: H * 0.33 }, { x: W * 0.33, y: H * 0.66 }, { x: W * 0.66, y: H * 0.66 }];
    let minD = Infinity;
    for (const t of thirds) { const d = Math.hypot(cx - t.x, cy - t.y); if (d < minD) minD = d; }
    const maxD = Math.hypot(W * 0.33, H * 0.33) || 1;
    return U.clamp(0.55 + 0.45 * (1 - minD / maxD), 0, 1);
  };

  Prio.scoreStroke = function (stroke, ctx) {
    const sem = Prio.semanticScore(ctx.hierarchy);
    const geo = Prio.geometricScore(stroke.pts);
    const dep = Prio.depthScore(ctx.depthDelta || 0.3);
    const con = Prio.contourScore(ctx.contourType || "structural");
    const conf = Prio.confidenceScore(ctx.strength || 0.7, ctx.curvatureConsistency || 0.7, ctx.depthConsistency || 0.6);
    const comp = Prio.compositionScore(stroke.pts, ctx.W, ctx.H);
    const w = ctx.weights || DEFAULT_WEIGHTS;
    let priority = w.semantic * sem + w.geometric * geo + w.depth * dep + w.contour * con + w.confidence * conf + w.composition * comp;
    if (ctx.hierarchy === "primary") priority *= 1.5;
    return {
      priority: U.clamp(priority, 0, 1.5),
      scores: { semantic: sem, geometric: geo, depth: dep, contour: con, confidence: conf, composition: comp },
      breakdown: `S:${sem.toFixed(2)} G:${geo.toFixed(2)} D:${dep.toFixed(2)} C:${con.toFixed(2)} Cf:${conf.toFixed(2)} Cp:${comp.toFixed(2)}`
    };
  };

  Prio.hardConstraints = function (stroke, ctx) {
    if (ctx.confidence !== undefined && ctx.confidence < 0.35) return { reject: true, reason: "low confidence" };
    if (ctx.occlusionViolated) return { reject: true, reason: "occlusion violation" };
    if (ctx.duplicate) return { reject: true, reason: "duplicate" };
    if (ctx.budgetExceeded) return { reject: true, reason: "budget exceeded" };
    return { reject: false };
  };

  window.PriorityEngine = Prio;
})();
