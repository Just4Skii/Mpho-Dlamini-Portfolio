/**
 * Recolour the avatar's skin to a natural caramel tone.
 *
 * The Avaturn export gives the whole body mesh one atlas (face, neck, forearms,
 * hands, feet, lips, tiny teeth). The source skin is almost greyscale, so colour
 * alone cannot identify it — the regions are selected geometrically from the UV
 * layout instead, with a soft feather so seams do not show.
 *
 * Usage: node scripts/skin-tone.mjs <in.glb> <out.glb>
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const [, , IN_PATH, OUT_PATH] = process.argv;
if (!IN_PATH || !OUT_PATH) {
  console.error('usage: node scripts/skin-tone.mjs <in.glb> <out.glb>');
  process.exit(1);
}

// Skin regions in UV space of the 1024x1024 body atlas. Coordinates were read
// off the rendered UV grid (scripts/_uv-grid.mjs): the face owns most of the
// bottom-left quadrant, the neck is its top band, forearms run across the top
// strip, and the hands/feet islands sit in the right-hand columns.
const REGIONS = [
  { name: 'face', x0: 0.0, y0: 0.31, x1: 0.47, y1: 0.99, feather: 0.015 },
  { name: 'neck', x0: 0.05, y0: 0.0, x1: 0.37, y1: 0.31, feather: 0.015 },
  { name: 'forearms', x0: 0.0, y0: 0.0, x1: 0.47, y1: 0.26, feather: 0.015 },
  { name: 'feet', x0: 0.66, y0: 0.0, x1: 1.0, y1: 0.3, feather: 0.015 },
  { name: 'arm', x0: 0.74, y0: 0.28, x1: 1.0, y1: 0.6, feather: 0.015 },
  { name: 'hand', x0: 0.72, y0: 0.6, x1: 1.0, y1: 0.99, feather: 0.015 },
  // The other hand's fingers live in their own islands near the bottom centre
  // (palm + fingernail pieces), between the legs sheet and the right-hand column.
  { name: 'fingers', x0: 0.47, y0: 0.82, x1: 0.76, y1: 1.0, feather: 0.012 },
  // Thighs and calves: bare skin under the shorts in the casual variant.
  { name: 'thighs', x0: 0.0, y0: 0.36, x1: 0.47, y1: 0.99, feather: 0.02 },
  { name: 'legs', x0: 0.37, y0: 0.28, x1: 0.73, y1: 0.99, feather: 0.02 }
];

// ------------------------------------------------------------------ GLB I/O
const buf = fs.readFileSync(IN_PATH);
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
const jsonLength = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf-8'));
const binChunkStart = 20 + jsonLength;
let bin = buf.subarray(binChunkStart + 8, binChunkStart + 8 + buf.readUInt32LE(binChunkStart));

const bodyMaterial = (json.materials || []).find((m) => /body/i.test(m.name || ''));
const textureIndex = bodyMaterial.pbrMetallicRoughness.baseColorTexture.index;
const image = json.images[json.textures[textureIndex].source];
const view = json.bufferViews[image.bufferView];
const start = view.byteOffset || 0;
const end = start + view.byteLength;

const { data, info } = await sharp(bin.subarray(start, end))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;

// A texel is skin if it sits inside any region, and is not protected.
const regionMask = (x, y) => {
  let best = 0;
  for (const r of REGIONS) {
    const px = x / width;
    const py = y / height;
    const inside =
      px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1;
    if (!inside) continue;
    const dx = Math.min(px - r.x0, r.x1 - px);
    const dy = Math.min(py - r.y0, r.y1 - py);
    const edge = Math.min(dx, dy) / r.feather;
    best = Math.max(best, Math.min(1, edge));
  }
  return best;
};

let changed = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const o = (y * width + x) * 4;
    if (data[o + 3] < 8) continue;
    const weight = regionMask(x, y);
    if (weight <= 0) continue;

    // Multiplicative tint. The scan is essentially greyscale, so scaling each
    // channel by a caramel ratio produces the tan while preserving every bit of
    // local contrast — pores, knuckles, eyelids and lips all keep their detail.
    // (Replacing pixels by luminance alone left some skin unchanged, which is
    // what produced grey fingertips next to a tan hand.)
    const r = data[o] * 0.86;
    const g = data[o + 1] * 0.6;
    const b = data[o + 2] * 0.45;

    data[o] = Math.round(data[o] * (1 - weight) + Math.min(255, r) * weight);
    data[o + 1] = Math.round(data[o + 1] * (1 - weight) + Math.min(255, g) * weight);
    data[o + 2] = Math.round(data[o + 2] * (1 - weight) + Math.min(255, b) * weight);
    changed++;
  }
}
console.log(`recoloured ${changed.toLocaleString()} texels (${((changed / (width * height)) * 100).toFixed(1)}%)`);

// ---------------------------------------------------------------- scalp/hair
// The grey band along the sides of the head comes from the separate hair mesh.
// Its scalp band is the top strip of the hair texture; the fringe and the
// darkest strands are left alone so it still reads as hair.
const hairMesh = (json.meshes || []).find((m) => /hair/i.test(m.name || ''));
if (hairMesh) {
  const hairMat = json.materials[hairMesh.primitives[0].material];
  const hairImage = json.images[json.textures[hairMat.pbrMetallicRoughness.baseColorTexture.index].source];
  const hairView = json.bufferViews[hairImage.bufferView];
  const hairStart = hairView.byteOffset || 0;
  const hair = await sharp(bin.subarray(hairStart, hairStart + hairView.byteLength))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const HW = hair.info.width;
  const HH = hair.info.height;
  let hairChanged = 0;
  for (let y = 0; y < HH; y++) {
    for (let x = 0; x < HW; x++) {
      const o = (y * HW + x) * 4;
      if (hair.data[o + 3] < 8) continue;
      // Top third of the hair map is the scalp; the fringe hangs below it.
      if (y / HH > 0.34) continue;
      // Skip the darkest strand texels (lowlight detail).
      const lum = (0.2126 * hair.data[o] + 0.7152 * hair.data[o + 1] + 0.0722 * hair.data[o + 2]) / 255;
      if (lum < 0.09) continue;
      // Natural dark-brown hair, scaled by the original strand luminance so
      // highlights and the parting survive.
      const shaped = Math.pow(lum, 0.9);
      const target = [
        255 * Math.min(0.34, shaped * 0.3),
        255 * Math.min(0.24, shaped * 0.2),
        255 * Math.min(0.2, shaped * 0.15)
      ];
      hair.data[o] = Math.round(target[0]);
      hair.data[o + 1] = Math.round(target[1]);
      hair.data[o + 2] = Math.round(target[2]);
      hairChanged++;
    }
  }
  const hairPng = await sharp(hair.data, { raw: { width: HW, height: HH, channels: 4 } })
    // Keep alpha: the hair map uses per-strand transparency, and dropping it
    // paints the whole head card opaque, which reads as a white scalp.
    .png({ compressionLevel: 9 })
    .toBuffer();
  // Splice the new hair map in and shift the views that follow it.
  const hairEnd = hairStart + hairView.byteLength;
  const hairBin = Buffer.concat([bin.subarray(0, hairStart), hairPng, bin.subarray(hairEnd)]);
  const hairDelta = hairPng.length - hairView.byteLength;
  json.bufferViews.forEach((bv) => {
    const offset = bv.byteOffset || 0;
    if (offset >= hairEnd) bv.byteOffset = offset + hairDelta;
  });
  hairView.byteLength = hairPng.length;
  bin = hairBin;
  console.log(`scalp recoloured: ${hairChanged.toLocaleString()} texels (${HW}x${HH} hair map)`);
}

const encoded = await sharp(data, { raw: { width, height, channels: 4 } })
  .removeAlpha()
  .jpeg({ quality: 92 })
  .toBuffer();

const newBin = Buffer.concat([bin.subarray(0, start), encoded, bin.subarray(end)]);
const sizeDelta = encoded.length - view.byteLength;
json.bufferViews.forEach((bv) => {
  const offset = bv.byteOffset || 0;
  if (offset > start) bv.byteOffset = offset + sizeDelta;
});
view.byteLength = encoded.length;
json.buffers[0].byteLength = newBin.length;

let jsonBuf = Buffer.concat([
  Buffer.from(JSON.stringify(json), 'utf-8')
]);
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
const binPadded = Buffer.concat([newBin, Buffer.alloc((4 - (newBin.length % 4)) % 4)]);

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binPadded.length, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonBuf.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binPadded.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, Buffer.concat([header, jsonHeader, jsonBuf, binHeader, binPadded]));
console.log(`wrote ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2)} MB)`);
