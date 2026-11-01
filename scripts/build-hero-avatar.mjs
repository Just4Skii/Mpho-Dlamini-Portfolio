/**
 * Build the hero avatar asset.
 *
 * Takes the recoloured model and produces the single GLB the hero loads:
 *   • every texture downscaled to <= 512 px (the figure is ~300 px tall on
 *     screen, so 1024 px maps and a 1 MB hair PNG are wasted bandwidth)
 *   • re-encoded in place, preserving PNG alpha for the hair map
 *   • JSON + bufferViews rewritten so the GLB stays valid
 *
 * Usage: node scripts/build-hero-avatar.mjs <in.glb> <out.glb> [maxTexSize=512]
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const [, , IN_PATH, OUT_PATH, MAX_ARG] = process.argv;
const MAX_TEXTURE = Number(MAX_ARG ?? 512);

const buf = fs.readFileSync(IN_PATH);
const jsonLength = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf-8'));
const binStart = 20 + jsonLength + 8;
let bin = Buffer.from(buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLength)));

// Replace every image, walking each bufferView once and accumulating the shift.
const images = (json.images || [])
  .map((img, index) => ({
    index,
    view: json.bufferViews[img.bufferView],
    mime: img.mimeType
  }))
  .sort((a, b) => (a.view.byteOffset || 0) - (b.view.byteOffset || 0));

for (const { view, mime } of images) {
  const start = view.byteOffset || 0;
  const end = start + view.byteLength;
  const original = bin.subarray(start, end);

  const meta = await sharp(original).metadata();
  const scale = Math.min(1, MAX_TEXTURE / Math.max(meta.width, meta.height));
  let pipeline = sharp(original);
  if (scale < 1) {
    pipeline = pipeline.resize(Math.round(meta.width * scale), Math.round(meta.height * scale), {
      fit: 'inside',
      kernel: 'lanczos3'
    });
  }
  const encoded =
    mime === 'image/png'
      ? await pipeline.png({ compressionLevel: 9, palette: false }).toBuffer()
      : await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();

  bin = Buffer.concat([bin.subarray(0, start), encoded, bin.subarray(end)]);
  const shift = encoded.length - view.byteLength;

  // Only views that START after this image move; everything else keeps its place.
  // (Re-basing every offset globally corrupts any view whose bytes were not
  //  actually relocated, which is what produced the collapsed figure.)
  json.bufferViews.forEach((bv) => {
    if ((bv.byteOffset || 0) >= end) bv.byteOffset = (bv.byteOffset || 0) + shift;
  });
  view.byteLength = encoded.length;
}

json.buffers[0].byteLength = bin.length;
json.asset.generator = 'graffgrid hero avatar build (sharp)';

let jsonBuf = Buffer.from(JSON.stringify(json), 'utf-8');
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
const binPadded = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);

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

const inMb = fs.statSync(IN_PATH).size / 1024 / 1024;
const outMb = fs.statSync(OUT_PATH).size / 1024 / 1024;
console.log(
  `${path.basename(OUT_PATH)}: ${inMb.toFixed(2)} MB -> ${outMb.toFixed(2)} MB ` +
    `(${images.length} textures capped at ${MAX_TEXTURE}px)`
);
