(function () {
  "use strict";
  const Depth = {};

  const STORAGE_KEY = "atelier_nvidia_key";

  Depth.saveKey = function (k) {
    try { localStorage.setItem(STORAGE_KEY, (k || "").trim()); } catch (e) { void e; }
  };
  Depth.loadKey = function () {
    try { return (localStorage.getItem(STORAGE_KEY) || "").trim(); } catch (e) { return ""; }
  };
  Depth.hasKey = function () { return !!Depth.loadKey(); };

  Depth.estimateLocal = function (gray, w, h) {
    const depth = new Float32Array(w * h);
    const cx = w * 0.5, cy = h * 0.5;
    const maxD = Math.hypot(cx, cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const lum = gray[i];
        const dist = Math.hypot(x - cx, y - cy) / maxD;
        const centerBias = 1 - dist * 0.35;
        const lumDepth = (1 - lum) * 0.55 + 0.2;
        depth[i] = U.clamp(lumDepth * 0.7 + centerBias * 0.3, 0, 1);
      }
    }
    return Depth.blurDepth(depth, w, h, 2);
  };

  Depth.blurDepth = function (d, w, h, r) {
    if (!r) return d;
    return window.ImageProc.blurField(d, w, h, r);
  };

  Depth.computeConfidence = function (depth, gray, w, h, semanticMask) {
    const conf = new Float32Array(w * h);
    const grad = window.ImageProc.depthGradient(depth, w, h);
    let maxGd = 0;
    for (let i = 0; i < grad.Gd.length; i++) if (grad.Gd[i] > maxGd) maxGd = grad.Gd[i];
    if (maxGd < 1e-6) maxGd = 1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const gNorm = grad.Gd[i] / maxGd;
        const boundaryDist = semanticMask ? (semanticMask[i] ? 0 : 1) : 0.5;
        const varianceFactor = 1 - Math.min(1, Math.abs(gray[i] - 0.5) * 1.5);
        const c = 0.45 + 0.25 * (1 - gNorm) + 0.15 * boundaryDist + 0.15 * varianceFactor;
        conf[i] = U.clamp(c, 0.15, 0.98);
      }
    }
    return { map: conf, gradient: grad };
  };

  Depth.callNvidiaDepth = async function (imageData, w, h, apiKey) {
    if (!apiKey) throw new Error("No API key");
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(w, 512);
    canvas.height = Math.min(h, 512);
    const ctx = canvas.getContext("2d");
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    tmp.getContext("2d").putImageData(imageData, 0, 0);
    ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
    const b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

    const body = {
      model: "nvidia/depth-anything-v2",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Estimate depth map. Return JSON with depth values 0-255." },
          { type: "image_url", image_url: { url: "data:image/jpeg;base64," + b64 } }
        ]
      }],
      max_tokens: 20
    };

    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("NVIDIA API " + res.status);
      const j = await res.json();
      void j;
      throw new Error("Depth VLM not yet mapped to array - using local fallback");
    } catch (e) {
      throw e;
    }
  };

  Depth.getDepthMap = async function (srcCanvas, apiKey) {
    const w = srcCanvas.width, h = srcCanvas.height;
    const gray = window.ImageProc.grayField(srcCanvas);
    const local = Depth.estimateLocal(gray, w, h);

    if (!apiKey) return { depth: local, source: "local-heuristic", w, h };

    const imgd = srcCanvas.getContext("2d").getImageData(0, 0, w, h);
    try {
      const apiDepth = await Depth.callNvidiaDepth(imgd, w, h, apiKey);
      return { depth: apiDepth, source: "nvidia-api", w, h };
    } catch (e) {
      console.warn("NVIDIA depth failed, using local:", e.message);
      return { depth: local, source: "local-fallback:" + e.message, w, h };
    }
  };

  window.DepthAPI = Depth;
})();
