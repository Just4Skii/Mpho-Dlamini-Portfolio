/**
 * Skii OS ambience engine.
 *
 * A direct port of the renderer's ambience layer from the Android build
 * (`AnimeBackdropView.java` in the Skii OS television launcher). The
 * families, the sprite atlases, the per-family drift and the fog planes are
 * the same, so the ambience here is the ambience the set-top box draws.
 *
 * The one deliberate difference: smoke is not a sprite on either platform.
 * A smoke sprite is a solid puff and reads as cotton wool, so both renderers
 * build a rising column of very soft, overlapping gradient plumes instead.
 */

export type AmbienceFamily =
  | 'starlight' | 'sakura' | 'cyberrain' | 'embers' | 'floaties' | 'hearts'
  | 'snow' | 'leaves' | 'bubbles' | 'fog' | 'fireflies' | 'rain' | 'feathers'
  | 'aurora' | 'smoke' | 'shootingstars' | 'dandelion' | 'butterflies' | 'confetti';

export const FAMILIES: AmbienceFamily[] = [
  'starlight', 'sakura', 'cyberrain', 'embers', 'floaties', 'hearts',
  'snow', 'leaves', 'bubbles', 'fog', 'fireflies', 'rain', 'feathers',
  'aurora', 'smoke', 'shootingstars', 'dandelion', 'butterflies', 'confetti',
];

/** family name -> particle type id (mirrors ThemeConfig.particleTypeFor) */
export const PARTICLE_OF: Record<AmbienceFamily, number> = {
  starlight: 0, sakura: 1, cyberrain: 2, embers: 3, floaties: 4, hearts: 5,
  snow: 6, leaves: 7, bubbles: 8, fog: 9, fireflies: 10, rain: 11,
  feathers: 12, aurora: 13, smoke: 14, shootingstars: 15, dandelion: 16,
  butterflies: 17, confetti: 18,
};

/** particle type id -> sprite atlas (null = drawn procedurally) */
export const SPRITE_FILE: Record<number, string | null> = {
  0: 'starlight.png', 1: 'sakura.png', 2: 'cyberrain.png', 3: 'embers.png',
  4: 'floaties.png', 5: 'hearts.png', 6: 'snow.png', 7: 'leaves.png',
  8: 'bubbles.png', 9: null, 10: 'fireflies.png', 11: 'rain.png',
  12: 'feathers.png', 13: null, 14: null, 15: 'shootingstars.png',
  16: 'dandelion.png', 17: 'butterflies.png', 18: 'confetti.png',
};

/** how opaque a family's sprites are (mirrors spriteAlpha) */
const ALPHA_OF: Record<number, number> = {
  0: 0.92, 1: 0.92, 2: 1, 3: 0.88, 4: 0.37, 5: 1, 6: 0.84, 7: 0.96,
  8: 0.69, 10: 0.80, 11: 1, 12: 0.92, 15: 1, 16: 0.47, 17: 0.96, 18: 1,
};

/** the colour a family's sprites are tinted with (mirrors spriteTint) */
const TINT_OF: Record<number, 'accent' | 'warm' | 'white' | 'cool' | 'pink' | 'smoke'> = {
  0: 'warm', 1: 'accent', 2: 'accent', 3: 'accent', 4: 'accent', 5: 'pink',
  6: 'white', 7: 'accent', 8: 'cool', 10: 'accent', 11: 'cool', 12: 'accent',
  14: 'smoke', 15: 'white', 16: 'white', 17: 'accent', 18: 'accent',
};

/** on-screen size of one sprite in pixels (mirrors spriteSize) */
const SIZE_OF: Record<number, number> = {
  0: 22, 1: 24, 2: 44, 3: 28, 4: 36, 5: 26, 6: 20, 7: 30, 8: 26,
  10: 30, 11: 44, 12: 30, 15: 52, 16: 34, 17: 30, 18: 26,
};

const MAX_PARTICLES = 36;
const FRAME = 64;            // sprite atlas frame size
const SPRITE_FPS = 13;        // atlas playback rate

export interface AmbienceOptions {
  /** 0 = off, 1 = subtle, 2 = dynamic */
  particleMode: number;
  /** 0 = no fog, 1 = faint, 2 = dense */
  fogLevel: number;
  accent: string;
  secondaryAccent: string;
}

/** A soft radial blob, pre-rendered once and reused for fog and smoke. */
function makeSoftBlob(size = 128): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(217,210,200,0.67)');
  grad.addColorStop(0.42, 'rgba(217,210,200,0.32)');
  grad.addColorStop(0.72, 'rgba(217,210,200,0.11)');
  grad.addColorStop(1, 'rgba(217,210,200,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/** Tint a white atlas to a colour while keeping its alpha (SRC_IN). */
function tintAtlas(src: HTMLImageElement, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d')!;
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export class AmbienceEngine {
  private px = new Float32Array(MAX_PARTICLES);
  private py = new Float32Array(MAX_PARTICLES);
  private pvx = new Float32Array(MAX_PARTICLES);
  private pvy = new Float32Array(MAX_PARTICLES);
  private pr = new Float32Array(MAX_PARTICLES);
  private pa = new Int32Array(MAX_PARTICLES);

  private w = 0;
  private h = 0;
  private breath = 0;

  private atlases = new Map<string, HTMLCanvasElement>();
  private raw = new Map<string, HTMLImageElement>();
  private blob = makeSoftBlob();

  private particle = 0;

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    let seed = 42;
    const rand = () => {
      // xorshift, so the layout is stable between reloads like the Java build
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return ((seed >>> 0) % 100000) / 100000;
    };
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.px[i] = rand() * w;
      this.py[i] = rand() * h;
      this.pvx[i] = (rand() - 0.5) * 0.9;
      this.pvy[i] = (rand() - 0.5) * 0.9;
      this.pr[i] = 1.4 + rand() * 2.8;
      this.pa[i] = 45 + Math.floor(rand() * 130);
    }
  }

  setFamily(family: AmbienceFamily) {
    this.particle = PARTICLE_OF[family];
  }

  /** Load (and cache) the atlas for a family. */
  private async atlasFor(file: string, color: string): Promise<HTMLCanvasElement | null> {
    const key = `${file}|${color}`;
    const hit = this.atlases.get(key);
    if (hit) return hit;
    let img = this.raw.get(file);
    if (!img) {
      img = new Image();
      img.src = `sprites/${file}`;
      await new Promise<void>((resolve) => {
        img!.onload = () => resolve();
        img!.onerror = () => resolve();
      });
      this.raw.set(file, img);
    }
    if (!img.naturalWidth) return null;
    const tinted = tintAtlas(img, color);
    this.atlases.set(key, tinted);
    return tinted;
  }

  private colorFor(kind: string, accent: string, secondary: string): string {
    switch (kind) {
      case 'warm': return '#FFF0CE';
      case 'white': return '#FFFFFF';
      case 'cool': return '#E6F0FF';
      case 'pink': return '#FF5F86';
      case 'smoke': return '#D9D1C6';
      default: return accent || secondary || '#FFFFFF';
    }
  }

  draw(ctx: CanvasRenderingContext2D, opts: AmbienceOptions) {
    const { w, h } = this;
    if (!w || !h) return;

    this.breath += 0.006;

    // --- the volumetric fog layer, under the particles ---
    if (opts.fogLevel > 0) this.drawFog(ctx, w, h, opts.fogLevel);

    // --- the ambience particles ---
    if (opts.particleMode <= 0) return;
    const p = this.particle;
    const count = p === 14 /* smoke */
      ? (opts.particleMode === 1 ? 7 : 12)
      : (opts.particleMode === 1 ? 16 : MAX_PARTICLES);
    const speed = opts.particleMode === 1 ? 0.65 : 1.15;

    const file = SPRITE_FILE[p];
    const alpha = ALPHA_OF[p] ?? 1;
    const size = SIZE_OF[p] ?? 26;

    if (file) {
      const color = this.colorFor(TINT_OF[p] ?? 'accent', opts.accent, opts.secondaryAccent);
      const key = `${file}|${color}`;
      let atlas = this.atlases.get(key) ?? null;
      if (!atlas) {
        // start loading it; the family appears on the next frame it is ready
        void this.atlasFor(file, color);
      }
      if (atlas) {
        const frames = Math.max(1, Math.floor(atlas.width / FRAME));
        ctx.save();
        for (let i = 0; i < count; i++) {
          const frame = Math.floor((this.breath * SPRITE_FPS + i * 2.7) % frames);
          const s = size * (0.72 + (this.pr[i] / 4.2) * 0.55);
          const rot = this.rotationFor(p, i);
          ctx.save();
          ctx.translate(this.px[i], this.py[i]);
          if (rot) ctx.rotate((rot * Math.PI) / 180);
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            atlas,
            frame * FRAME, 0, FRAME, FRAME,
            -s / 2, -s / 2, s, s,
          );
          ctx.restore();
          this.motion(p, i, speed);
        }
        ctx.restore();
        return;
      }
    }

    // --- the procedural families (fog, aurora, smoke) ---
    ctx.save();
    for (let i = 0; i < count; i++) {
      if (p === 14) this.drawSmokePlume(ctx, i);
      else this.drawProcedural(ctx, p, i, opts);
      this.motion(p, i, speed);
    }
    ctx.restore();
  }

  /** Smoke: a rising column of soft, overlapping plumes. */
  private drawSmokePlume(ctx: CanvasRenderingContext2D, i: number) {
    const BLOBS = 5;
    const base = 34 + this.pr[i] * 9;
    const phase = this.breath * 0.8 + i * 1.37;
    for (let b = 0; b < BLOBS; b++) {
      const t = b / (BLOBS - 1);
      const r = base * (0.62 + t * 1.05);
      const bx = this.px[i] + Math.sin(phase + b * 1.9) * base * (0.14 + t * 0.42);
      const by = this.py[i] - b * base * 0.55;
      ctx.globalAlpha = (30 - t * 15) / 255;
      ctx.drawImage(this.blob, bx - r, by - r * 0.86, r * 2, r * 1.72);
    }
    ctx.globalAlpha = 1;
  }

  /** The remaining procedural families: aurora and fog motes. */
  private drawProcedural(
    ctx: CanvasRenderingContext2D, p: number, i: number, opts: AmbienceOptions,
  ) {
    const r = this.pr[i];
    if (p === 13 /* aurora */) {
      ctx.globalAlpha = this.pa[i] / 255 * 0.5;
      const y = this.py[i];
      const grad = ctx.createLinearGradient(this.px[i] - 260, y, this.px[i] + 260, y);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, opts.accent);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(this.px[i] - 260, y - 2, 520, 4);
      ctx.globalAlpha = 1;
      return;
    }
    // fog / starlight motes
    ctx.globalAlpha = this.pa[i] / 255;
    ctx.fillStyle = p === 9 ? '#E8E4DC' : '#FFF0CE';
    ctx.beginPath();
    ctx.arc(this.px[i], this.py[i], r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /** Per-family drift, mirroring the Android renderer. */
  private motion(p: number, i: number, speed: number) {
    const r = this.pr[i];
    const b = this.breath;
    switch (p) {
      case 2:  this.py[i] += (1.8 + r * 0.6) * speed; this.px[i] -= 0.35 * speed; break;
      case 1:  this.px[i] += (this.pvx[i] + 0.35) * speed; this.py[i] += Math.abs(this.pvy[i]) * 0.75 * speed; break;
      case 3:  this.py[i] -= (0.45 + r * 0.30) * speed; this.px[i] += Math.sin((b + i) * 0.06) * 0.42 * speed; break;
      case 4:  this.py[i] -= (0.16 + r * 0.07) * speed; this.px[i] += Math.sin((b * 0.7 + i) * 0.035) * 0.75 * speed; break;
      case 5:  this.py[i] -= (0.30 + r * 0.14) * speed; this.px[i] += Math.sin((b * 0.9 + i) * 0.05) * 0.60 * speed; break;
      case 6:  this.py[i] += (0.75 + r * 0.45) * speed; this.px[i] += Math.sin((b + i) * 0.09) * 0.55 * speed; break;
      case 7:  this.py[i] += (0.55 + r * 0.35) * speed; this.px[i] += Math.cos((b + i) * 0.07) * 0.95 * speed; break;
      case 8:  this.py[i] -= (0.42 + r * 0.22) * speed; this.px[i] += Math.sin((b * 0.8 + i) * 0.045) * 0.55 * speed; break;
      case 10: this.px[i] += Math.cos(b * 0.6 + i) * 0.42 * speed; this.py[i] += Math.sin(b * 0.9 + i * 1.3) * 0.30 * speed; break;
      case 11: this.py[i] += (3.4 + r * 0.6) * speed; this.px[i] -= 0.30 * speed; break;
      case 12: this.py[i] += (0.42 + r * 0.16) * speed; this.px[i] += Math.sin((b + i) * 0.06) * 0.85 * speed; break;
      case 14: this.py[i] -= (0.26 + r * 0.08) * speed; this.px[i] += Math.sin((b + i) * 0.035) * 0.55 * speed; break;
      case 15: this.px[i] += (5.2 + r * 0.4) * speed; this.py[i] += 2.3 * speed; break;
      case 16: this.py[i] -= (0.22 + r * 0.05) * speed; this.px[i] += Math.sin((b + i) * 0.05) * 0.45 * speed; break;
      case 17: this.py[i] -= (0.38 + r * 0.16) * speed; this.px[i] += Math.sin((b + i) * 0.055) * 1.05 * speed; break;
      case 18: this.py[i] += (0.50 + r * 0.18) * speed; this.px[i] += Math.sin((b + i) * 0.07) * 0.95 * speed; break;
      default: this.px[i] += this.pvx[i] * speed; this.py[i] += this.pvy[i] * speed; break;
    }
    // wrap around the edges
    if (this.px[i] < -20) this.px[i] = this.w + 20;
    if (this.px[i] > this.w + 20) this.px[i] = -20;
    if (this.py[i] < -20) this.py[i] = this.h + 20;
    if (this.py[i] > this.h + 20) this.py[i] = -20;
  }

  private rotationFor(p: number, i: number): number {
    const b = this.breath;
    switch (p) {
      case 7:  return (b * 70 + i * 47) % 360;
      case 18: return (b * 130 + i * 53) % 360;
      case 6:  return (b * 26 + i * 31) % 360;
      case 12: return Math.sin((b + i) * 0.8) * 34;
      case 17: return Math.sin((b + i) * 1.2) * 16;
      case 1:  return Math.sin((b * 0.9 + i) * 0.05) * 30;
      case 3:  return Math.sin((b + i) * 0.06) * 22;
      case 15: return Math.sin((b + i) * 0.05) * 12;
      default: return Math.sin((b + i) * 0.04) * 8;
    }
  }

  /** Three depth planes of large, very soft blobs drifting across the art. */
  private drawFog(ctx: CanvasRenderingContext2D, w: number, h: number, level: number) {
    const baseAlpha = level >= 2 ? 15 : 9;
    const baseSpeed = level >= 2 ? 1.5 : 0.9;
    const planes = [
      { blobs: 4, radius: 420, alpha: baseAlpha * 0.8, speed: baseSpeed * 0.45, seed: 0 },
      { blobs: 4, radius: 250, alpha: baseAlpha * 1.0, speed: baseSpeed * 0.9, seed: 3 },
      { blobs: 3, radius: 150, alpha: baseAlpha * 1.35, speed: baseSpeed * 1.7, seed: 6 },
    ];
    for (const plane of planes) {
      for (let i = 0; i < plane.blobs; i++) {
        const idx = (i * 7 + plane.seed) % MAX_PARTICLES;
        const r = plane.radius * (0.75 + (this.pr[idx] / 4.2) * 0.5);
        const x = this.px[idx];
        const y = this.py[idx] * 0.9 + h * 0.12;
        ctx.globalAlpha = plane.alpha / 255;
        ctx.drawImage(this.blob, x - r, y - r * 0.72, r * 2, r * 1.44);
        this.px[idx] += plane.speed;
        if (this.px[idx] > w + r) this.px[idx] = -r;
      }
    }
    ctx.globalAlpha = 1;
  }
}
