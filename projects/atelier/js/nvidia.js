(function () {
  "use strict";
  const N = {};

  const STORAGE_KEY = "atelier_nvidia_key_v1";

  N.saveKey = function (k) {
    try { localStorage.setItem(STORAGE_KEY, (k || "").trim()); return true; } catch (e) { return false; }
  };
  N.loadKey = function () {
    try { return (localStorage.getItem(STORAGE_KEY) || "").trim(); } catch (e) { return ""; }
  };
  N.hasKey = function () { return !!N.loadKey(); };
  N.clearKey = function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { } };

  N.listUsefulModels = function () {
    return [
      { id: "meta/llama-3.2-11b-vision-instruct", use: "Fast accurate image structure → bounding boxes, depth order, SVG sketch", why: "Fixes squiggle: cursor follows real objects, not noise" },
      { id: "meta/llama-3.2-90b-vision-instruct", use: "Highest accuracy vision (90B) — detailed contour + text extraction", why: "When 11B is not enough for fine words/details" },
      { id: "microsoft/kosmos-2", use: "Grounded phrase → precise bbox [x,y,x,y] for any phrase", why: "Anchor strokes to 'main subject' coordinates, 100% dimension-accurate" },
      { id: "nvidia/nemotron-parse", use: "Document OCR + layout — preserves words/text with boxes", why: "Your image has words — this keeps them legible, not scribbled" },
      { id: "nvidia/vila", use: "NVIDIA VLM — alternative structure analysis", why: "Fallback if Llama is rate-limited" }
    ];
  };

  async function callVision(model, apiKey, imageB64, prompt, maxTokens) {
    const body = {
      model: model,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: "data:image/jpeg;base64," + imageB64 } }
        ]
      }],
      max_tokens: maxTokens || 800,
      temperature: 0.1
    };
    const endpoint = "/api/nvidia/analyze";
    const isBackendAvailable = location.protocol !== "file:";
    if (isBackendAvailable) {
      try {
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: imageB64, detail: 6, prompt, model })
        });
        if (r.ok) {
          const j = await r.json();
          const content = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || j.content || "";
          if (content) return content;
        }
      } catch (e) { console.warn("Backend proxy unavailable, falling back to direct", e.message); }
    }
    if (!apiKey) throw new Error("No backend and no API key — add NVAPI_KEY to server env or paste key in UI (direct fallback)");
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(model + " " + res.status + " " + t.slice(0, 300));
    }
    const j = await res.json();
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  }

  N.analyzeStructure = async function (srcCanvas, apiKey, detail) {
    const effKey = apiKey || N.loadKey();
    if (!effKey) throw new Error("No API key");
    const c = document.createElement("canvas");
    const maxSide = 896;
    const scale = Math.min(1, maxSide / Math.max(srcCanvas.width, srcCanvas.height));
    c.width = Math.round(srcCanvas.width * scale);
    c.height = Math.round(srcCanvas.height * scale);
    c.getContext("2d").drawImage(srcCanvas, 0, 0, c.width, c.height);
    const b64 = c.toDataURL("image/jpeg", 0.82).split(",")[1];

    const prompt = `You are an expert tracer. Analyze this image for a pen plotter.

Return ONLY valid JSON, no markdown, no explanation:
{
  "width": ${srcCanvas.width},
  "height": ${srcCanvas.height},
  "subjects": [
    {"label":"main subject","bbox":[x1,y1,x2,y2],"depth":0.9,"importance":1.0,"contour_hint":"outline of ..."},
    {"label":"secondary","bbox":[x1,y1,x2,y2],"depth":0.5,"importance":0.7}
  ],
  "text_regions": [
    {"text":"visible words","bbox":[x1,y1,x2,y2]}
  ],
  "stroke_order": ["outermost silhouette","major forms","text","details","shading"]
}
Rules:
- bbox coordinates are 0..1000 normalized to image (x1 < x2, y1 < y2)
- depth 0.0=far background, 1.0=closest foreground
- Sort subjects by depth far→near for correct occlusion
- Be accurate to the image — do not invent objects
- If text is visible, list it`;

    const raw = await callVision("meta/llama-3.2-11b-vision-instruct", effKey, b64, prompt, 900);
    let jsonStr = raw.trim();
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start >= 0 && end > start) jsonStr = jsonStr.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    parsed._source = "nvidia:llama-3.2-11b-vision";
    parsed._scale = scale;
    parsed._canvas = { w: srcCanvas.width, h: srcCanvas.height };
    return parsed;
  };

  N.structureToMasks = function (structure, pw, ph) {
    if (!structure || !structure.subjects) return null;
    const masks = [];
    for (const s of structure.subjects) {
      if (!s.bbox || s.bbox.length !== 4) continue;
      const x1 = Math.round(s.bbox[0] / 1000 * pw), y1 = Math.round(s.bbox[1] / 1000 * ph);
      const x2 = Math.round(s.bbox[2] / 1000 * pw), y2 = Math.round(s.bbox[3] / 1000 * ph);
      masks.push({ x1: Math.max(0, x1), y1: Math.max(0, y1), x2: Math.min(pw - 1, x2), y2: Math.min(ph - 1, y2), depth: s.depth || 0.5, importance: s.importance || 0.5, label: s.label });
    }
    masks.sort((a, b) => a.depth - b.depth);
    return masks;
  };

  window.NvidiaAPI = N;
})();
