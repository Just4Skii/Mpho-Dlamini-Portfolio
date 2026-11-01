/**
 * Merge animation clips from other GLBs into a base avatar.
 *
 * Both Avaturn exports share one rig and identical node names, so a clip can be
 * copied across by matching node names — no retargeting, no resampling: the
 * keyframes are byte-identical to what the exporter produced.
 *
 * Usage: node scripts/merge-animations.mjs <base.glb> <out.glb> <clip.glb>...
 */
import fs from 'fs';
import path from 'path';

const [, , BASE_PATH, OUT_PATH, ...CLIP_PATHS] = process.argv;
if (!BASE_PATH || !OUT_PATH) {
  console.error('usage: node scripts/merge-animations.mjs <base.glb> <out.glb> <clip.glb>...');
  process.exit(1);
}

function readGlb(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file}: not a GLB`);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf-8'));
  const binStart = 20 + jsonLength + 8;
  const bin = Buffer.from(buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLength)));
  return { json, bin };
}

const COMPONENT_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPE_COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

/** Read one accessor as float32 values (clip data is uncompressed float here). */
function readFloats(json, bin, index) {
  const acc = json.accessors[index];
  const view = json.bufferViews[acc.bufferView];
  const itemSize = TYPE_COUNT[acc.type];
  const start = (view.byteOffset || 0) + (acc.byteOffset || 0);
  const out = new Float32Array(acc.count * itemSize);
  for (let i = 0; i < out.length; i++) out[i] = bin.readFloatLE(start + i * 4);
  return { data: out, itemSize };
}

const base = readGlb(BASE_PATH);
const baseNodeIndex = new Map();
base.json.nodes.forEach((node, i) => {
  if (node.name) baseNodeIndex.set(node.name, i);
});

const animations = [...(base.json.animations || [])];
const chunks = [base.bin];
let offset = base.bin.length;
const bufferViews = [...base.json.bufferViews];
const accessors = [...base.json.accessors];

const pushBuffer = (typed) => {
  const bytes = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
  const pad = (4 - (bytes.length % 4)) % 4;
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length });
  chunks.push(bytes, Buffer.alloc(pad));
  offset += bytes.length + pad;
  return bufferViews.length - 1;
};

const addAccessor = (typed, itemSize, isTime) => {
  const view = pushBuffer(typed);
  const type = itemSize === 1 ? 'SCALAR' : itemSize === 3 ? 'VEC3' : 'VEC4';
  const acc = {
    bufferView: view,
    componentType: 5126,
    count: typed.length / itemSize,
    type
  };
  if (isTime) {
    acc.min = [typed[0]];
    acc.max = [typed[typed.length - 1]];
  }
  accessors.push(acc);
  return accessors.length - 1;
};

for (const clipPath of CLIP_PATHS) {
  const clipGlb = readGlb(clipPath);
  const sourceNames = clipGlb.json.nodes.map((n) => n.name || '');
  for (const anim of clipGlb.json.animations || []) {
    const samplers = [];
    const channels = [];
    // Accessors are shared between channels; cache so times are stored once.
    const cache = new Map();

    for (const channel of anim.channels) {
      const nodeName = sourceNames[channel.target.node];
      const targetNode = baseNodeIndex.get(nodeName);
      if (targetNode === undefined) continue;

      const sampler = anim.samplers[channel.sampler];
      const key = `${sampler.input}:${sampler.output}`;
      let pair = cache.get(key);
      if (!pair) {
        const times = readFloats(clipGlb.json, clipGlb.bin, sampler.input);
        const values = readFloats(clipGlb.json, clipGlb.bin, sampler.output);
        pair = {
          input: addAccessor(times.data, 1, true),
          output: addAccessor(values.data, values.itemSize, false)
        };
        cache.set(key, pair);
      }

      samplers.push({
        input: pair.input,
        output: pair.output,
        interpolation: sampler.interpolation || 'LINEAR'
      });
      channels.push({
        sampler: samplers.length - 1,
        target: { node: targetNode, path: channel.target.path }
      });
    }

    animations.push({ name: anim.name, channels, samplers });
    console.log(`merged "${anim.name}": ${channels.length} channels from ${path.basename(clipPath)}`);
  }
}

const json = {
  ...base.json,
  animations,
  accessors,
  bufferViews,
  buffers: [{ byteLength: offset }]
};

let jsonBuf = Buffer.from(JSON.stringify(json), 'utf-8');
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
const bin = Buffer.concat(chunks);
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
console.log(
  `wrote ${OUT_PATH}: ${animations.length} clips, ${(fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2)} MB`
);
