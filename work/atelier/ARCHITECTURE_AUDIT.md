# Atelier — Architecture Audit & Implementation Plan
## Phase A: Codebase Audit (Step 1 of Research)

**Date:** 2026-05-13
**Spec:** "Beyond Vectorization: An Artistically Intelligent Pipeline..."

### 1. File Inventory
```
index.html      — shell, topbar, toolbar, canvas-wrap, panels, modals, script order
css/styles.css  — dark theme, layout, HUD
js/utils.js     — U.clamp/lerp/dist/rand/hsv/RDP/smooth/jitter/pathLength/Emitter
js/scan.js      — ScanAPI.analyze (dimensions → suggested canvas, aspectPreserved)
js/depth.js     — DepthAPI local heuristic + Nvidia depth fallback
js/nvidia.js    — NvidiaAPI (save/load key → localStorage, listUsefulModels, callVision, analyzeStructure)
js/engine.js    — Engine (doc w/h, layers, view2, dpr, checkerPattern, gestures, dirty-rect undo, floodFill, exportComposite, draw loop, painter set)
js/imageproc.js — ImageProc (palettes, loadFileAsImage via FileReader, fitToCanvas letterbox, grayField, blurField, sobel, nms, hysteresisMask, maskToField, pixelate, medianCut, quantize, traceContours with direction-continuous chaining, regionAnalysis + NEW: linearize, multiScaleBlurs, edgeScore, depthGradient, combineEdges, estimateNormals, estimateLighting, estimatePerspective, curvatureAt)
js/tracer.js    — Tracer.PRESETS (8), buildPlan → _planPixel / _planStroke. _planStroke is the core reconstruction entry.
js/artist.js    — Artist (Emitter, plan ops, weights capping, rAF _tick, _stepOp with approach/stroke/pixrun/dwell, stall guard, batched skip)
js/tools.js     — Tools (Emitter, 12 tools, makeRenderer for pencil/pen/brush/eraser/pixel/flow, _commitShape, _painter overlay)
js/ui.js        — UI (el map, bindTopbar/Toolbar/Options/Color/Pixel/Layer/Auto/Upload/Export/Hud/Misc, safe wrappers, syncDoc/View/Colors, renderLayers, _analyze with ScanAPI + Nvidia structure + Depth)
js/main.js      — App bootstrap (Engine+Tools+Artist+UI, _paintArtistCursor, AtelierExternalDriver shim)
server.js       — Secure proxy POST /api/nvidia/analyze (env NVAPI_KEY) + static serve + /api/health
start_server.bat— python -m http.server 8000 fallback
```

### 2. Dependency Map — Where Images Enter → Where Drawing Happens

| # | Question | Current Answer (file:line) | Required Change | New Responsibility |
|---|---|---|---|---|
| 1 | Where uploaded images enter | `ui.js:587 _loadFile` → `ImageProc.loadFileAsImage` (FileReader dataURL) → `uploadedImage` `upPreview.src` | Keep, but add ScanAPI dimension relay + file:// warning | `ui.js:590` must call `ScanAPI.analyze` and show suggested canvas + Match button (done), `imageproc.js:15` must use FileReader (done) |
| 2 | Where NVIDIA/API analysis occurs | `ui.js:657 _analyze` → `Tracer.buildPlan` → `nvidia.js:55 analyzeStructure` direct fetch with Bearer from localStorage | **Must route via backend** to hide key. Keep localStorage as fallback only when no server. | `nvidia.js:26 callVision` now tries `POST /api/nvidia/analyze` first, falls back to direct. `server.js:1` holds key from env. Frontend never logs key. |
| 3 | Where image-processing occurs | `imageproc.js` (gray, blur, sobel, nms, hysteresis, traceContours) | Expand to multi-representation pipeline per research: multi-scale blurs σ1.2/2.5/5.0, edgeScore, depthGradient, normals, lighting, perspective | Add `multiScaleBlurs, edgeScore, depthGradient, combineEdges, estimateNormals, estimateLighting, estimatePerspective, curvatureAt` (done) and wire in tracer |
| 4 | Where tracing happens | `tracer.js:183 _planStroke` (old: single Sobel iso → paths) | Replace with dimensional pipeline: Normalize → Multi-scale → Edges (Canny) → Depth → EdgeScore → Contours classified → Geometry → etc. Retain info per stage | `_planStroke` now builds `scene` object with `grayscale, blurred, edges, depthMap, normalMap, perspective, regions, strokes` and retains for next stage |
| 5 | Where paths/strokes are generated | `tracer.js:296 mkStroke` + `prepContours` (RDP/smooth/jitter) → `pushStrokeStage` | Add scoring + Bezier fitting + pressure/width/depth/confidence attributes per Stroke spec | `mkStroke` now returns `{pts, color, size, opacity, tool, depth, confidence, importance, phase, semanticType}` and uses `clampDoc` + `depth` modulation |
| 6 | Where strokes are ordered | `tracer.js:62 sortBySweep` (band minY/40 then len) | Replace with prioritized scoring: `Priority = Σ w·Score` (semantic, geometric, depth, contour, confidence, composition) + hard constraints + occlusion topological sort | Keep `sortBySweep` for within-stage, but add global priority sort after depth weighting and AI mask filtering |
| 7 | Where construction/sketch/detail/final stages are selected | `tracer.js:394` `opts.stages.con/sketch/detail/shade/final` checkboxes → `pushStrokeStage("con",...)` etc. | Keep UI names, change internal meaning per research: Construction = only high-confidence geometric guides; Sketch = silhouette+depth boundaries; Detail = lower-confidence secondary; Final = highest-confidence + line-weight hierarchy + cleanup | Already done: con uses simplified strongPrep segments, sketch uses mid+strong, detail uses strong+region+tone, shade uses depth-aware hatch, final uses principalPool. Need to add Thumbnail/Gesture phases and tighten definitions. |
| 8 | Where virtual cursor receives its path | `artist.js:381 _initOp` (stroke → approach→stroke state, fill→approach→dwell) | Upgrade to curvature-aware speed `v=base/(1+k·κ)` and pressure simulation, keep natural wobble | `artist.js:254` already has `slow` from curvature `da>0.9 ?0.45:...`, `humanFactor`, `microPause`, `speedScale`; `artist.js:177 _tick` now clamps dt `max(0,min(50,...))` |
| 9 | Where canvas rendering occurs | `engine.js:583 draw()` (checker, layers composite, gesture temp, grid, border, overlay painters) | Preserve; ensure depth-aware compositing respects occlusion graph (draw far→near). Already handles per-layer alpha and gesture temp. | Keep, but add feature flag `intelligentTracer` vs `legacyTracer` for comparison |
| 10 | Where drawing style, line width, opacity, speed, timing are calculated | `tracer.js:313 size·fAvg, opacity` + `artist.js:254 pxPerSec, humanFactor, settle` | Expand to research formulas: `width = base·(0.7+0.3·depth)·importance`, `pressure = 0.55+0.25·importance+0.15·curvature+0.10·depth`, `speed = base/(1+k·κ)`, atmospheric far `opacity↓` | `tracer.js:498` depth modulation `size·(0.75+0.6·avgDepth)` etc. + `artist.js:270` slow on curvature implemented. Need to add full pressure + atmospheric passes |

### 3. Current Tracer Pipeline (After Recent Fixes)

```
IMAGE (ScanAPI.analyze → suggested W'×H')
  ↓ draw to proc canvas (procSize 420+58·detail)
  → gray → grayB (blur r=minDim/160)
  → Sobel → thin (NMS) → hysteresis hi=lerp0.30→0.15 (strong) hi*0.62 (mid) → maskToField → traceContours 0.5 → strongLines/midLines
  → quantize (medianCut) → boundaryField → regionLines
  → grayTone blur 60 → toneLines (iso 0.32/0.5/0.68)
  → hatch (maskMid excluded, depth-aware if DepthAPI)
  → prepContours (RDP <2 keep, jitter/smooth, anti-scramble 6·diag+40, diag<3.5 drop)
  → mkStroke (clamp to doc, size·fAvg)
  → stages: con (RDP 22→10), sketch (cap 40+90·dt), detail (110+220·dt), shade (hatch), color (region seeds), final (principalPool 80+140·dt)
  → depthMap modulation (if available) + AI mask filtering
  → estMs → meta {stages, previewCanvas, apiUsed}
```

**Gaps vs 44-step Research Pipeline:**
- [PARTIAL] Normalize: ScanAPI does dimensions, but not linearized color space → add IP.linearize already added but not used in gray conversion (now used via ImageProc.grayField still uses Y=0.2126R+... without linearize; should linearize first)
- [DONE] Multi-scale blur: added `multiScaleBlurs` but not yet wired as I1/I2/I3 in tracer
- [PARTIAL] Edge scoring 0.30/0.20/... not yet computed per contour; currently uses length sort only
- [PARTIAL] Depth smoothing: DepthAPI.blurDepth uses blurField (box) not bilateral edge-aware
- [DONE] Depth gradient, normals, lighting added to imageproc but only used for hatch direction, not for stroke classification
- [MISSING] Perspective estimation: `estimatePerspective` exists but not called to generate guides; should generate vanishing-point guides with confidence
- [MISSING] Geometry primitive fitting: box/sphere/cylinder/ellipse fitting not yet
- [MISSING] Scene graph: flat `scene` object exists but not hierarchical Primary→Secondary→Environment→Texture with stroke budgets
- [MISSING] Occlusion graph: not built; depth discontinuities not used for ordering beyond depth sort
- [PARTIAL] Stroke prioritization: modular scores not yet separate; currently `sortBySweep` + length; need Semantic/Geometric/Depth/Contour/Confidence/Composition scores with configurable weights
- [MISSING] Hard constraints: primary boost, min confidence reject, duplicate merge, budget cap
- [PARTIAL] Construction justification: con strokes are RDP segments of strong lines, not fitted primitives
- [PARTIAL] Cross-contours: hatch uses normal-derived tangent (done for hatch, but not for dedicated cross-contour stage)
- [MISSING] Thumbnail/Gesture phases: not yet separate stages; currently con is first
- [PARTIAL] Curve quality: uses RDP+smoothPts, not adaptive Bézier fitting per `B(t)=(1-t)³P0+...`
- [DONE] Backend proxy: server.js created, nvidia.js routes via backend

### 4. Implementation Plan (Phases A-S, incremental, feature-flagged)

**Phase A — Audit** [DONE] This document.

**Phase B — Scene Representation** [IN PROGRESS]
- Formalize `ImageScene` structure in `js/scene.js` (or inside tracer.js) with fields: width,height,aspectRatio,grayscale,blurred{I0,I1,I2,I3},edges{mag,thin,masks},depthMap,normalMap,lighting,segmentation,regions,contours,sceneGraph,occlusionGraph. Retain for next stage.

**Phase C — Subject Detection + Hierarchy** [NEXT]
- Use Nvidia structure (`nvidia.js:55 analyzeStructure` already returns subjects with bbox/depth/importance) + local fallback via `regionAnalysis` largest area. Assign `hierarchy_level` + `stroke_budget` (e.g., Primary 55%, Secondary 25%, Environment 12%, Texture 8% configurable).

**Phase D — Stroke Budgeting** [NEXT]
- After hierarchy, cap total ops: `budgetPrimary = totalBudget·0.55` etc. Filter lowest-priority strokes per category when over budget.

**Phase E — Depth + Confidence** [PARTIAL]
- Replace `Depth.estimateLocal` heuristic with edge-aware bilateral smoothing: implement `IP.bilateralSmooth` (or reuse blur but preserve depth discontinuities). Add confidence from gradient magnitude + semantic boundary + model variance. Currently have `Depth.blurDepth` box only.

**Phase F — Occlusion Graph** [MISSING]
- Build from `depthGradient Gd` + T-junctions + `regionAnalysis` adjacency. Topological sort for draw order.

**Phase G — Contour Classification** [MISSING]
- For each candidate contour compute `edgeScore` and classify `type: silhouette|occluding|structural|material|shadow|construction`. Use `IP.edgeScore` and `contour classification` logic. Do not convert every edge to stroke.

**Phase H — Geometric Primitives** [MISSING]
- Fit box/sphere/cylinder/ellipse to each important object's contour via RANSAC-like error. Generate `ConstructionGuide` objects with purpose/source/parameters/confidence.

**Phase I — Justified Construction** [PARTIAL]
- Replace current `con` RDP segments with guides derived from fitted primitives + bounding box/centerline/axis only if confidence > threshold.

**Phase J — Perspective Inference** [MISSING]
- Call `IP.estimatePerspective` on long lines, validate via `supportingLines>=8`, `intersection clustering`, `semantic coherence` (lines belong to architecture/road), `depth consistency`. Suppress if low confidence.

**Phase K — Human/Character Specialization** [MISSING]
- Add `js/human.js` module triggered when `subject label == person`. Use pose landmarks (MediaPipe or SMPL stub) to generate gesture line + ribcage/pelvis masses. Feed back to General Reconstruction.

**Phase L — Stroke Prioritization Engine** [MISSING CORE]
- Implement `js/priority.js` with modular scores: SemanticScore (1.0 primary, 0.7 secondary...), GeometricScore (primitive fit), DepthScore (|Gd|), ContourScore (type weight), ConfidenceScore (variance+gradient+consistency), CompositionScore (rule-of-thirds). `Priority = Σ w·Score` with style-dependent weights. Expose weights for tuning.

**Phase M — Cross-contours** [PARTIAL: hatch uses normals, but not dedicated cross-contour stage]
- Generate dedicated cross-contour strokes along tangent `T = (-Ny,Nx)` sampled on surface, respecting occlusion, becoming denser where form needs clarification.

**Phase N — Improved Sketch Generation** [PARTIAL]
- Ensure sketch adds primary silhouette + depth boundaries + major overlaps, not just more of same edges.

**Phase O — Line Weight Hierarchy** [PARTIAL: depth size mod done, but not full `width = base·(0.7+0.3·depth)·importance·curvature·occlusion`]
- Implement full formula per research.

**Phase P — Shading/Hatching** [PARTIAL: currently `1-lighting` threshold 0.25/0.5/0.75 with T1/T2 perpendicular, but not material-aware]
- Add material-aware density: `density = darkness·maxDensity·materialFactor` and use VLM material label.

**Phase Q — Final Ink Cleanup** [PARTIAL: stages exist but cleanup not yet removing duplicates/tiny fragments/low-confidence]
- Add pass: `if (len<minLength && confidence<threshold) discard`, merge collinear, remove near-duplicates via Hausdorff distance.

**Phase R — Virtual Cursor Refinement** [MOSTLY DONE: wobble, curvature slow, pressure simulation `pressure=0.55+0.25·imp+0.15·curv+0.10·depth` partially in artist.js `pressure` via size, but add explicit pressure→width mapping]

**Phase S — Debugging/Evaluation Tools** [MISSING]
- Add debug overlay toggles (segmentation, depth, normals, contours, scores, budgets) and per-stroke explanation `Stroke #1842: Semantic 0.96 ... Reason: primary silhouette...`

**Feature Flag:** `window.USE_INTELLIGENT_TRACER = true` vs `legacyTracer`. Keep both until R confirms improvement. Existing harness expects intelligent tracer now (72 tests).

**Next Immediate Steps (This Turn):**
1. Wire `linearize` into gray conversion for accurate luminance.
2. Implement `edgeScore` filtering in prepContours.
3. Add depth-aware `strokeBudget` allocation.
4. Add `ConstructionGuide` generation from fitted primitives (box/cylinder) for at least the primary subject.
5. Add `CrossContour` generation as a new stage between Structural and Shading.
6. Ensure `server.js` is documented in README and UI warns about direct API fallback.

