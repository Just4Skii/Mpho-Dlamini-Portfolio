# Atelier — Autonomous Drawing Studio

A fully client-side digital art studio where artwork appears as you wave your mouse —
and where an animated virtual artist traces any uploaded image onto the canvas,
stroke by stroke, stage by stage.

**No build step. No server. No uploads leave your machine.**

## Run it

Double-click `index.html` — that's it. Everything runs locally in the browser.

(Optional: serve it with any static server, e.g. `npx serve .`, for a cleaner URL.)

> Recommended: Chrome / Edge / Firefox, a window at least ~1100px wide.

---

## The two core experiences

### 1. Wave your mouse (Flow Ribbon)

The app starts with the **Flow Ribbon** tool active. Just move your mouse across the
canvas: strokes are smoothed, velocity-tapered, hue-shifted ("Rainbow flow") and
optionally mirrored into 2/4/6/8-fold kaleidoscope symmetry. It feels like the
canvas is painting itself under your hand.

### 2. Upload & Auto Trace & Draw

1. Click **Open Image** (or drop a file anywhere on the upload panel).
2. Choose a **style preset**, detail level, stages, palette.
3. Press **Analyze & Build Plan** — the image is processed entirely in-browser:
   - Gaussian-blurred Sobel edge fields + marching-squares contour tracing
   - Median-cut color quantization + region boundary extraction
   - Tone-isolines and darkness-masked hatching generation
4. The plan becomes a real drawing sequence. With **Artist Mode** on, press
   **Start Artist** and watch the virtual cursor move to each stroke, switch tools
   and colors, draw with humanized speed variation, micro-pauses and wobble —
   through Construction → Sketch → Detail → Shading → Final Ink (or Block-In →
   Refine for pixel styles).
5. **Pause** anytime, edit manually, **resume** from the HUD. Or **Skip** to the
   finished piece.

---

## Presets

| Preset | What actually changes |
|---|---|
| Pixel Art | Downsample → quantize to 16-color palette → run-length pixel ops drawn run-by-run |
| Limited-Color Pixel Art | Same pipeline at low res with 8 colors |
| Pencil Sketch | Graphite construction lines, jittered sketch passes, hatching, double ink pass |
| Ink Drawing | Confident variable-width black linework, dense tonal hatching |
| Anime/Manga Line Art | Uniform clean outlines + flat color region fills (enable *Color fill*) |
| Technical Sketch | Straightened rigid guides, thin precise finals, no jitter |
| Minimal Illustration | 5-color quantization, thick bold outlines, flat fills |
| Monochrome Study | Desaturated source, tonal contours + cross-hatching |

---

## Real tools included

Pencil · Pixel pencil · Brush · Fine-line pen · Eraser · Line · Rectangle ·
Ellipse (with pixel-perfect rasterizers in pixel mode) · Fill bucket (scanline
flood fill, cell-grid aware) · Eyedropper · Flow ribbon · Pan · Zoom ·
Undo/redo (dirty-rect history) · Layers (add/dup/delete/merge/reorder/opacity) ·
Export PNG/JPEG at 1–8× scale.

### Pixel-art mode

Toggle **Pixels → Pixel-art mode**: the document becomes a true pixel lattice
(resolutions from 32² to 256²+), every stroke snaps, grid overlays appear,
bucket fill works per-cell, and export scales nearest-neighbor.

---

## Keyboard

| Keys | Action |
|---|---|
| `F B P X N E L R O G I H` | flow, brush, pencil, pixel, pen, eraser, line, rect, ellipse, fill, eyedrop, pan |
| `[` / `]` | brush size down / up |
| `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` | undo / redo |
| `Ctrl+E` | export |
| Space + drag, right/middle drag | pan |
| Wheel | zoom at cursor |
| `0` | fit to screen |
| `+` / `-` | zoom in / out |
| `Tab` | toggle side panel |
| `Del` | clear active layer |

---

## Architecture

```
index.html          markup shell
css/styles.css      dark studio theme
js/utils.js         math, color, RDP, path resampling, emitter
js/engine.js        document, layers, transforms, render loop, dirty-rect undo,
                    gestures, flood fill, export
js/imageproc.js     blur/sobel/pixelate/median-cut/sketch/marching-squares/
                    region analysis/palettes
js/tracer.js        preset-driven staged stroke-plan generation
js/artist.js        virtual artist: humanized cursor motion, stroke animation,
                    pause/resume/skip/speed, progress model
js/tools.js         all drawing tools + stroke renderers shared with the artist
js/ui.js            panels, modals, HUD wiring, toasts, shortcuts
js/main.js          bootstrap + artist cursor rendering
```

Every generated op lands on the layer as real pixels with its own undo step, so
the automatic process and manual editing mix freely.

### Extensibility

The OS-level mouse cannot be controlled from a web page (by design). The virtual
cursor exists precisely for this reason — it mirrors exactly what the automated
artist does. For external hardware control, `window.AtelierExternalDriver`
exposes `stroke() / fill() / pixrun()` primitives that a local companion app
(e.g. via WebSocket) could drive using the same plan data (`AtelierApp.artist.ops`).

## Privacy

All image processing happens on your device using Canvas 2D — nothing is uploaded
anywhere. Google Fonts is the only network request and the app degrades gracefully
without it.
