/**
 * Retarget a second animation onto the Avaturn/Mixamo avatar.
 *
 * Inputs:
 *   <avatar.glb>  Avaturn export whose skeleton is a Mixamo rig
 *   <clip.glb>    Mesh2Motion / UE-style humanoid clip GLB (CC0)
 *   <out.glb>     animation-only GLB written for three.js retargeting
 *
 * The output contains no meshes and no skin: it is a set of rotation (and one
 * hip translation) tracks keyed by the avatar's own bone names, so a three.js
 * AnimationMixer binds them onto the avatar's skeleton directly.
 *
 * Usage: node scripts/retarget-mixamo-clip.mjs <avatar.glb> <clip.glb> <out.glb>
 */
import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const [, , TARGET_PATH, CLIP_PATH, OUT_PATH] = process.argv;
if (!TARGET_PATH || !CLIP_PATH || !OUT_PATH) {
  console.error('usage: node scripts/retarget-mixamo-clip.mjs <avatar.glb> <clip.glb> <out.glb>');
  process.exit(1);
}

const FPS = 30;

// ------------------------------------------------------------- GLB loading
/**
 * We load through three.js' GLTFLoader rather than reading accessors by hand,
 * because CC0 clip packs are commonly meshopt-compressed (EXT_meshopt_compression)
 * and the raw JSON view indices are meaningless until decompressed.
 *
 * onlyAnimation mode skips scene assembly: clip packs ship a dummy mesh with
 * textures that a DOM-less node process cannot decode, and we never need it.
 */
async function loadGltf(file, { onlyAnimation = false } = {}) {
  await MeshoptDecoder.ready;
  const buffer = fs.readFileSync(file);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  if (onlyAnimation) {
    // Do not assemble the scene: clip packs ship a dummy textured mesh that a
    // DOM-less node process cannot decode, and we never need it. We only need the
    // animation sampler arrays, so decode the root buffer and read them directly.
    const json = JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(arrayBuffer, 20, new DataView(arrayBuffer).getUint32(12, true))
      )
    );
    const rootBuffer = await decodeRootBuffer(json, arrayBuffer);
    const arrays = readAccessorArrays(json, new Uint8Array(rootBuffer));

    const animations = (json.animations || []).map((anim) => {
      const tracks = [];
      for (const ch of anim.channels) {
        const nodeName = json.nodes[ch.target.node]?.name;
        const sampler = anim.samplers[ch.sampler];
        const input = arrays[sampler.input];
        const output = arrays[sampler.output];
        if (!nodeName || !input || !output) continue;
        const prop = ch.target.path === 'rotation' ? 'quaternion' : ch.target.path;
        tracks.push(new THREE.NumberKeyframeTrack(`${nodeName}.${prop}`, input, output));
      }
      return new THREE.AnimationClip(anim.name || 'clip', -1, tracks);
    });

    const nodeNames = (json.nodes || []).map((n) => n.name || '');
    const rest = (json.nodes || []).map((n) => ({
      t: new THREE.Vector3().fromArray(n.translation || [0, 0, 0]),
      q: new THREE.Quaternion().fromArray(n.rotation || [0, 0, 0, 1])
    }));
    const parents = new Array(json.nodes.length).fill(-1);
    json.nodes.forEach((n, i) => (n.children || []).forEach((c) => (parents[c] = i)));
    return { json, animations, nodeNames, rest, parents };
  }

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', resolve, reject);
  });
}

/**
 * Rebuild the glTF "root buffer" described by EXT_meshopt_compression.
 * Follows the same contract GLTFLoader uses: each compressed bufferView copies its
 * decoded bytes into the root buffer at its own byteOffset.
 */
async function decodeRootBuffer(json, arrayBuffer) {
  const compressible = (json.buffers || []).filter((b) => b.extensions?.EXT_meshopt_compression);
  const rootLength = Math.max(0, ...compressible.map((b) => b.byteLength));
  const root = new Uint8Array(rootLength);
  const jsonLength = new DataView(arrayBuffer).getUint32(12, true);
  // The single binary chunk holds every fallback buffer back to back.
  const chunkStart = 20 + jsonLength + 8;
  const bufferOffsets = [];
  let cursor = 0;
  for (const b of json.buffers || []) {
    bufferOffsets.push(cursor);
    cursor += b.byteLength;
  }

  for (const view of json.bufferViews || []) {
    const ext = view.extensions?.EXT_meshopt_compression;
    if (!ext) continue;
    const extent = ext.count * ext.byteStride;
    const source = new Uint8Array(
      arrayBuffer,
      chunkStart + bufferOffsets[ext.buffer] + (ext.byteOffset || 0),
      ext.byteLength
    );
    // decodeGltfBufferAsync returns freshly allocated bytes: (count, size, source, mode, filter)
    const decoded = await MeshoptDecoder.decodeGltfBufferAsync(
      ext.count,
      ext.byteStride,
      source,
      ext.mode,
      ext.filter
    );
    // Compressed views decode to integer components (int16 for QUATERNION, so half
    // the width the accessor advertises). Convert back to float, writing at the
    // width the accessor actually declares.
    const floatBytes = convertDecodedToFloat(decoded, ext, view, json);
    const offset = view.byteOffset || 0;
    if (offset + floatBytes.length <= root.length) root.set(floatBytes, offset);
  }
  return root.buffer;
}

/** Normalise meshopt integer output back into little-endian float32. */
function convertDecodedToFloat(decoded, ext, view, json) {
  const items = ext.count;

  if (ext.filter === 'QUATERNION') {
    // int16 quaternions with one implicit padding lane; stored as 4 floats (16 B).
    const out = new Uint8Array(items * 16);
    const dv = new DataView(out.buffer);
    for (let i = 0; i < items; i++) {
      const src = i * ext.byteStride;
      const parts = [];
      for (let c = 0; c < 4; c++) {
        const v = decoded[src + c * 2] | (decoded[src + c * 2 + 1] << 8);
        parts.push((v << 16 >> 16) / 32767);
      }
      const len = Math.hypot(parts[0], parts[1], parts[2], parts[3]) || 1;
      for (let c = 0; c < 4; c++) dv.setFloat32(i * 16 + c * 4, parts[c] / len, true);
    }
    return out;
  }

  if (ext.filter === 'EXPONENTIAL') {
    // Three int8 mantissas plus a shared exponent, stored as 3 floats (12 B).
    const out = new Uint8Array(items * 12);
    const dv = new DataView(out.buffer);
    for (let i = 0; i < items; i++) {
      const src = i * ext.byteStride;
      const exponent = (decoded[src + 3] << 24) >> 24;
      for (let c = 0; c < 3; c++) {
        const mantissa = ((decoded[src + c] << 24) >> 24) / 127 - 1;
        dv.setFloat32(i * 12 + c * 4, mantissa * Math.pow(2, exponent), true);
      }
    }
    return out;
  }

  // No filter (ATTRIBUTES): meshopt returns INT16 lanes. The number of components
  // is the stride divided by 2 — never derive it from the declared byteLength,
  // which glTF-Transform writes in the wrong unit (int16 items instead of floats).
  // No filter (ATTRIBUTES). Only the view's own byteLength tells us the storage
  // width, because the EXT_meshopt block pads byteStride to four int16 lanes.
  //   float32: 1367 items x 4 B = 5468 B      int16: 114 items x 12 lanes x 2 B
  const components = ext.byteStride / 2;
  const bytesPerItem = view.byteLength / items;
  const isFloatStorage = bytesPerItem === 4;
  const width = Math.max(1, Math.min(4, Math.round(bytesPerItem / (isFloatStorage ? 4 : 2))));
  const out = new Uint8Array(items * width * 4);
  const dv = new DataView(out.buffer);
  const srcView = new DataView(decoded.buffer, decoded.byteOffset, decoded.byteLength);
  for (let i = 0; i < items; i++) {
    for (let c = 0; c < width; c++) {
      const k = i * width + c;
      if (isFloatStorage) {
        // Already float32 in the decoded lane.
        dv.setFloat32(k * 4, srcView.getFloat32(k * 4, true), true);
      } else {
        const v = decoded[k * 2] | (decoded[k * 2 + 1] << 8);
        dv.setFloat32(k * 4, (v << 16 >> 16) / 32767, true);
      }
    }
  }
  void json;
  return out;
}

const COMPONENT = {  5120: { size: 1, get: 'getInt8', norm: 127 },
  5121: { size: 1, get: 'getUint8', norm: 255 },
  5122: { size: 2, get: 'getInt16', norm: 32767 },
  5123: { size: 2, get: 'getUint16', norm: 65535 },
  5125: { size: 4, get: 'getUint32', norm: 1 },
  5126: { size: 4, get: 'getFloat32', norm: 1 }
};
const TYPE_COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

/** Materialise every float (or normalised integer) accessor into a plain array. */
function readAccessorArrays(json, bin) {
  const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const out = {};
  (json.accessors || []).forEach((acc, index) => {
    if (acc.bufferView === undefined) return;
    const view = json.bufferViews[acc.bufferView];
    // EXT_meshopt_compression offsets are relative to the decoded root buffer.
    const viewBase = view.byteOffset || 0;
    const comp = COMPONENT[acc.componentType];
    if (!comp) return;
    const itemSize = TYPE_COUNT[acc.type];
    const stride = view.byteStride || comp.size * itemSize;
    const start = viewBase + (acc.byteOffset || 0);
    const arr = new Float32Array(acc.count * itemSize);
    for (let i = 0; i < acc.count; i++) {
      for (let c = 0; c < itemSize; c++) {
        let v = dv[comp.get](start + i * stride + c * comp.size, true);
        if (acc.normalized) v = Math.max(v / comp.norm, -1);
        arr[i * itemSize + c] = v;
      }
    }
    out[index] = arr;
  });
  return out;
}

/** Remove every texture/image/material reference from a binary glTF. */
function stripImages(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.getUint32(0, true) !== 0x46546c67) return arrayBuffer;
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(arrayBuffer, 20, jsonLength)));
  // Drop imagery and any extension that would request a texture.
  delete json.images;
  delete json.textures;
  delete json.samplers;
  (json.materials || []).forEach((mat) => {
    delete mat.pbrMetallicRoughness?.baseColorTexture;
    delete mat.pbrMetallicRoughness?.metallicRoughnessTexture;
    delete mat.normalTexture;
    delete mat.occlusionTexture;
    delete mat.emissiveTexture;
  });
  if (json.extensionsUsed) {
    json.extensionsUsed = json.extensionsUsed.filter(
      (e) => !/texture|image|material_variants|ktx|basis/i.test(e)
    );
  }
  let encoded = new TextEncoder().encode(JSON.stringify(json));
  const pad = (4 - (encoded.length % 4)) % 4;
  if (pad) {
    const padded = new Uint8Array(encoded.length + pad).fill(0x20);
    padded.set(encoded);
    encoded = padded;
  }
  const rest = new Uint8Array(arrayBuffer, 20 + jsonLength);
  const out = new Uint8Array(12 + 8 + encoded.length + rest.length);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, 0x46546c67, true);
  outView.setUint32(4, 2, true);
  outView.setUint32(8, out.length, true);
  outView.setUint32(12, encoded.length, true);
  outView.setUint32(16, 0x4e4f534a, true);
  out.set(encoded, 20);
  out.set(rest, 20 + encoded.length);
  return out.buffer;
}

// ------------------------------------------------------------------ GLB read
function readGlb(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file}: not a GLB`);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString('utf-8'));
  const bin = buf.subarray(20 + jsonLength + 8);
  return { json, bin };
}

// ------------------------------------------------------------- rest skeleton
function buildSkeleton(json, wanted) {
  const bones = new Map();
  json.nodes.forEach((node) => {
    if (!node.name || !wanted(node.name)) return;
    const name = node.name;
    const t = new THREE.Vector3().fromArray(node.translation || [0, 0, 0]);
    const r = new THREE.Quaternion().fromArray(node.rotation || [0, 0, 0, 1]);
    const s = new THREE.Vector3().fromArray(node.scale || [1, 1, 1]);
    bones.set(node.name, { name, local: new THREE.Matrix4().compose(t, r, s), parent: null, world: null });
  });
  json.nodes.forEach((node) => {
    const b = node.name && bones.get(node.name);
    if (!b) return;
    for (const ci of node.children || []) {
      const child = bones.get(json.nodes[ci]?.name);
      if (child) child.parent = b.name;
    }
  });
  const world = (b) => {
    if (b.world) return b.world;
    b.world = b.parent
      ? new THREE.Matrix4().multiplyMatrices(world(bones.get(b.parent)), b.local)
      : b.local.clone();
    return b.world;
  };
  bones.forEach(world);
  const restWorldQuat = new Map();
  bones.forEach((b, n) => {
    const q = new THREE.Quaternion();
    b.world.decompose(new THREE.Vector3(), q, new THREE.Vector3());
    restWorldQuat.set(n, q);
  });
  return { bones, restWorldQuat };
}

// ------------------------------------------------------------- bone name map
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const UE_TO_MIXAMO = {
  root: 'Hips', pelvis: 'Hips', spine_01: 'Spine', spine_02: 'Spine1', spine_03: 'Spine2',
  neck_01: 'Neck', head: 'Head',
  clavicle_l: 'LeftShoulder', upperarm_l: 'LeftArm', lowerarm_l: 'LeftForeArm', hand_l: 'LeftHand',
  clavicle_r: 'RightShoulder', upperarm_r: 'RightArm', lowerarm_r: 'RightForeArm', hand_r: 'RightHand',
  thigh_l: 'LeftUpLeg', calf_l: 'LeftLeg', foot_l: 'LeftFoot', ball_l: 'LeftToeBase',
  thigh_r: 'RightUpLeg', calf_r: 'RightLeg', foot_r: 'RightFoot', ball_r: 'RightToeBase'
};
for (const finger of ['thumb', 'index', 'middle', 'ring', 'pinky']) {
  for (let j = 1; j <= 3; j++) {
    UE_TO_MIXAMO[`${finger}_0${j}_l`] = `LeftHand${cap(finger)}${j}`;
    UE_TO_MIXAMO[`${finger}_0${j}_r`] = `RightHand${cap(finger)}${j}`;
  }
}

function detectNameMap(srcNames, tgtNames) {
  const strip = (n) => n.replace(/^mixamorig[:_ ]/i, '');
  const tgtByStripped = new Map([...tgtNames].map((n) => [strip(n).toLowerCase(), n]));
  const map = new Map();
  let exact = 0;
  let table = 0;
  for (const src of srcNames) {
    const direct = tgtByStripped.get(strip(src).toLowerCase());
    if (direct) {
      map.set(src, direct);
      exact++;
      continue;
    }
    const mapped = UE_TO_MIXAMO[src.toLowerCase()];
    if (mapped && tgtByStripped.has(mapped.toLowerCase())) {
      map.set(src, tgtByStripped.get(mapped.toLowerCase()));
      table++;
    }
  }
  return { map, exact, table };
}

// ------------------------------------------------------------------- sampling
function sampleQuat(times, values, t) {
  const n = times.length;
  if (t <= times[0]) return new THREE.Quaternion().fromArray(values, 0);
  if (t >= times[n - 1]) return new THREE.Quaternion().fromArray(values, (n - 1) * 4);
  let i = 0;
  while (i < n - 2 && times[i + 1] < t) i++;
  const a = (t - times[i]) / Math.max(1e-6, times[i + 1] - times[i]);
  return new THREE.Quaternion()
    .fromArray(values, i * 4)
    .slerp(new THREE.Quaternion().fromArray(values, (i + 1) * 4), a)
    .normalize();
}

function sampleVec3(times, values, t) {
  const n = times.length;
  if (t <= times[0]) return new THREE.Vector3().fromArray(values, 0);
  if (t >= times[n - 1]) return new THREE.Vector3().fromArray(values, (n - 1) * 3);
  let i = 0;
  while (i < n - 2 && times[i + 1] < t) i++;
  const a = (t - times[i]) / Math.max(1e-6, times[i + 1] - times[i]);
  return new THREE.Vector3()
    .fromArray(values, i * 3)
    .lerp(new THREE.Vector3().fromArray(values, (i + 1) * 3), a);
}

// ------------------------------------------------------------- rest skeleton
/** World-space rest transform of one node, accumulated through its parent chain. */
function worldRest(src, nodeIndex) {
  const chain = [];
  for (let i = nodeIndex; i !== -1; i = src.parents[i]) chain.push(i);
  chain.reverse();
  const m = new THREE.Matrix4();
  for (const i of chain) {
    const { t, q } = src.rest[i];
    m.multiply(new THREE.Matrix4().compose(t, q, new THREE.Vector3(1, 1, 1)));
  }
  const q = new THREE.Quaternion();
  m.decompose(new THREE.Vector3(), q, new THREE.Vector3());
  return { q, p: new THREE.Vector3().setFromMatrixPosition(m) };
}

function loadTarget(file) {
  // Avaturn exports are plain, uncompressed glTF: their node tree can be read
  // straight from JSON without assembling meshes or decoding any texture.
  const { json, bin } = readGlb(file);
  json.__bin = bin;
  const nodeNames = json.nodes.map((n) => n.name || '');
  const rest = json.nodes.map((n) => ({
    t: new THREE.Vector3().fromArray(n.translation || [0, 0, 0]),
    q: new THREE.Quaternion().fromArray(n.rotation || [0, 0, 0, 1])
  }));
  const parents = new Array(json.nodes.length).fill(-1);
  json.nodes.forEach((n, i) => (n.children || []).forEach((c) => (parents[c] = i)));

  // Skeleton as GLTFLoader binds it: a Bone's local frame is exactly the raw
  // glTF node rotation (verified against the running viewer — IBMs do not alter
  // bone.quaternion). Comparing against this explicitly keeps the offline
  // retarget identical to the runtime.
  const skeleton = new Map();
  const runtimeFrame = new Map();
  const skin = (json.skins || [])[0];
  if (skin) {
    for (const joint of skin.joints) {
      const name = nodeNames[joint];
      if (!name) continue;
      skeleton.set(name, { parent: nodeNames[parents[joint]] || null });
      runtimeFrame.set(name, rest[joint].q.clone());
    }
  }
  return { json, nodeNames, rest, parents, skeleton, runtimeFrame, bin, skin };
}

/**
 * Quaternion part of the inverse bind matrix for one joint.
 *
 * GLTFLoader does: bone.matrixWorld = rest * bindInverse, i.e. the node's rest
 * rotation is multiplied by  inverse(IBMs'_rotation). The local frame a glTF
 * animation channel is expressed in is therefore that bind pose, and comparing
 * against it explicitly keeps our offline retarget identical to the runtime.
 */
function bindQuaternion(json, skin, jointIndex) {
  const accIndex = skin.inverseBindMatrices;
  if (accIndex === undefined) return new THREE.Quaternion();
  // Inline accessor read (float32 MAT4, no compression on Avaturn exports).
  const acc = json.accessors[accIndex];
  const view = json.bufferViews[acc.bufferView];
  const start = (view.byteOffset || 0) + (acc.byteOffset || 0) + jointIndex * 64;
  const dv = new DataView(json.__bin.buffer, json.__bin.byteOffset, json.__bin.byteLength);
  const m = new THREE.Matrix4();
  const elements = [];
  for (let i = 0; i < 16; i++) elements.push(dv.getFloat32(start + i * 4, true));
  m.fromArray(elements);
  const inverse = new THREE.Matrix4().copy(m).invert();
  const q = new THREE.Quaternion();
  inverse.decompose(new THREE.Vector3(), q, new THREE.Vector3());
  return q.normalize();
}

// --------------------------------------------------------------- retarget
const main = async () => {
  const target = loadTarget(TARGET_PATH);
  const clipGltf = await loadGltf(CLIP_PATH, { onlyAnimation: true });
  const trackName = (t) => t.name.split('.').slice(0, -1).join('.');

  const clip = clipGltf.animations[0];
  if (!clip) throw new Error('clip GLB has no animation');
  const clipName = clip.name || path.basename(CLIP_PATH, '.glb');

  // Rest pose (bone-local) of both rigs.
  const srcBones = new Map();
  clipGltf.nodeNames.forEach((name, i) => {
    if (!name) return;
    srcBones.set(name, {
      parent: clipGltf.parents[i] === -1 ? null : clipGltf.nodeNames[clipGltf.parents[i]],
      t: clipGltf.rest[i].t.clone(),
      q: clipGltf.rest[i].q.clone()
    });
  });

  const srcNames = new Set(srcBones.keys());
  const tgtNames = new Set(target.skeleton.keys());
  const { map, exact, table } = detectNameMap(srcNames, tgtNames);

  console.log(`target : ${path.basename(TARGET_PATH)} (${tgtNames.size} joints)`);
  console.log(`clip   : ${path.basename(CLIP_PATH)} -> ${clipName} (${clip.tracks.length} tracks)`);
  console.log(`mapping: ${map.size} bones (${exact} exact name, ${table} UE->Mixamo table)`);
  if (map.size < 10) throw new Error('bone mapping failed: rigs are not compatible');

  // Group sampled keyframes per source bone.
  const perBone = new Map();
  let duration = 0;
  for (const t of clip.tracks) {
    const name = trackName(t);
    if (!map.has(name)) continue;
    let last = 0;
    for (let i = t.times.length - 1; i >= 0; i--) {
      if (Number.isFinite(t.times[i])) {
        last = t.times[i];
        break;
      }
    }
    duration = Math.max(duration, last);
    if (!perBone.has(name)) perBone.set(name, { times: t.times, rotation: null, position: null });
    if (t.name.endsWith('.quaternion')) perBone.get(name).rotation = t.values;
    if (t.name.endsWith('.position')) perBone.get(name).position = t.values;
  }
  if (!perBone.size) throw new Error('no usable tracks after mapping');
  if (!(duration > 0.01)) {
    throw new Error(
      'animation timeline is unusable; the clip must be decoded with the meshopt width workaround.'
    );
  }

  const frameCount = Math.max(2, Math.round(duration * FPS) + 1);
  const tgtWorld = computeWorldRest(target);
  const srcWorld = computeWorldRest({
    nodeNames: clipGltf.nodeNames,
    rest: clipGltf.rest,
    parents: clipGltf.parents
  });
  const rotations = computeRotations({
    duration,
    frameCount,
    perBone,
    map,
    srcBones,
    srcWorld,
    tgtWorld
  });
  const positions = [];

  writeGlb(OUT_PATH, { rotations, positions, duration, frameCount, clipName });
  console.log(
    `wrote  : ${OUT_PATH} (${(fs.statSync(OUT_PATH).size / 1024).toFixed(1)} KB, ` +
      `${rotations.length} rotations, ${positions.length} translation, ${duration.toFixed(2)}s @ ${FPS}fps)`
  );
};

const LEAN = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

/** World-space rest rotation of a bone, with the source pack's Z-up removed. */
function srcWorldRest(restQ) {
  return restQ.clone().multiply(LEAN);
}

/**
 * Rotation-only transfer in world space.
 *
 * Bone-local copying cannot work across these rigs: the UE pack keeps a -90 degree
 * armature root while the avatar bakes Y-up into its nodes, so identical local
 * quaternions produce different poses (that is what produced T-poses and splayed
 * arms in earlier attempts). World space is comparable once the source's Z-up
 * rotation is removed.
 */
function computeRotations({ duration, frameCount, perBone, map, srcBones, srcWorld, tgtWorld }) {
  const rotations = [];
  for (const [srcName, data] of perBone) {
    const tgtName = map.get(srcName);
    const srcQ = srcWorld.get(srcName);
    const tgtQ = tgtWorld.get(tgtName);
    if (!data.rotation || !srcQ || !tgtQ) continue;

    const srcRest = srcBones.get(srcName).q;
    const swingRest = srcWorldRest(srcRest).clone().invert();

    const out = [];
    for (let f = 0; f < frameCount; f++) {
      const t = (f / (frameCount - 1)) * duration;
      const local = sampleQuat(data.times, data.rotation, t);
      // World rotation of the source bone at time t (Y-up).
      const srcWorldAt = local.clone().multiply(srcWorldRest(srcRest)).normalize();
      // Motion relative to the source rest pose, in world space.
      const delta = srcWorldAt.clone().multiply(swingRest).normalize();
      // The same motion applied to the target bone's world rest orientation.
      out.push(delta.clone().multiply(tgtQ).normalize());
    }
    rotations.push({ name: tgtName, quats: out });
  }
  return rotations;
}

/** World rest rotations for every named node in a glTF skeleton. */
function computeWorldRest({ nodeNames, rest, parents }) {
  const cache = new Map();
  const world = (index) => {
    if (cache.has(index)) return cache.get(index);
    const parent = parents[index];
    const local = rest[index].q.clone();
    const result = parent === -1 ? local : world(parent).clone().multiply(local);
    cache.set(index, result);
    return result;
  };
  const out = new Map();
  nodeNames.forEach((name, i) => {
    if (name) out.set(name, world(i));
  });
  return out;
}

/** Serialise an animation-only GLB (no meshes, no skin). */
function writeGlb(file, { rotations, positions, duration, frameCount, clipName }) {
  const chunks = [];
  let offset = 0;
  const bufferViews = [];
  const accessors = [];
  const push = (typed) => {
    const bytes = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
    const pad = (4 - (bytes.length % 4)) % 4;
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length });
    chunks.push(bytes, Buffer.alloc(pad));
    offset += bytes.length + pad;
    return bufferViews.length - 1;
  };
  const minOf = (arr, stride, i) => {
    let m = Infinity;
    for (let k = 0; k < arr.length / stride; k++) m = Math.min(m, arr[k * stride + i]);
    return m;
  };
  const maxOf = (arr, stride, i) => {
    let m = -Infinity;
    for (let k = 0; k < arr.length / stride; k++) m = Math.max(m, arr[k * stride + i]);
    return m;
  };

  const timeData = new Float32Array(frameCount);
  for (let f = 0; f < frameCount; f++) timeData[f] = (f / (frameCount - 1)) * duration;
  accessors.push({
    bufferView: push(timeData),
    componentType: 5126,
    count: frameCount,
    type: 'SCALAR',
    min: [0],
    max: [duration]
  });
  const timeAccessor = 0;

  const samplers = [];
  const channels = [];
  const nodes = [];
  const nodeIndex = new Map();
  const nodeFor = (name) => {
    if (!nodeIndex.has(name)) {
      nodeIndex.set(name, nodes.length);
      nodes.push({ name });
    }
    return nodeIndex.get(name);
  };
  const addCurve = (name, data, type, itemSize) => {
    accessors.push({
      bufferView: push(data),
      componentType: 5126,
      count: data.length / itemSize,
      type,
      min: Array.from({ length: itemSize }, (_, i) => minOf(data, itemSize, i)),
      max: Array.from({ length: itemSize }, (_, i) => maxOf(data, itemSize, i))
    });
    samplers.push({ input: timeAccessor, output: accessors.length - 1 });
    channels.push({
      sampler: samplers.length - 1,
      target: { node: nodeFor(name), path: type === 'VEC4' ? 'rotation' : 'translation' }
    });
  };

  for (const r of rotations) {
    const typed = new Float32Array(frameCount * 4);
    r.quats.forEach((q, i) => typed.set([q.x, q.y, q.z, q.w], i * 4));
    addCurve(r.name, typed, 'VEC4', 4);
  }
  for (const p of positions) {
    const typed = new Float32Array(frameCount * 3);
    p.vecs.forEach((v, i) => typed.set([v.x, v.y, v.z], i * 3));
    addCurve(p.name, typed, 'VEC3', 3);
  }

  const gltf = {
    asset: { version: '2.0', generator: 'graffgrid retarget (three.js)' },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    animations: [{ name: clipName, channels, samplers }],
    buffers: [{ byteLength: offset }],
    bufferViews,
    accessors
  };

  let jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf-8');
  jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
  const binBuf = Buffer.concat(chunks);
  const bin = Buffer.concat([binBuf, Buffer.alloc((4 - (binBuf.length % 4)) % 4)]);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + bin.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(bin.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([header, jsonHeader, jsonBuf, binHeader, bin]));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
