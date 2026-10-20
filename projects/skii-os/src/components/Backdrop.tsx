import { useEffect, useRef } from 'react';
import { AmbienceEngine, type AmbienceFamily, type AmbienceOptions } from '../engine/ambience';

interface BackdropProps {
  wallpaper: string;
  family: AmbienceFamily;
  accent: string;
  secondaryAccent: string;
  particleMode: number;
  fogLevel: number;
  /** extra slow zoom, used when the ambient screensaver takes over */
  cinematic?: boolean;
}

/**
 * The wallpaper, the volumetric fog and the ambience particles, all on one
 * canvas at the panel's native 1280x720. This is the same layering order as
 * the Android renderer: art, then fog over the art, then the particles on
 * top of the haze.
 */
export function Backdrop({
  wallpaper, family, accent, secondaryAccent, particleMode, fogLevel, cinematic,
}: BackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AmbienceEngine | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const stateRef = useRef({ family, accent, secondaryAccent, particleMode, fogLevel, cinematic });

  stateRef.current = { family, accent, secondaryAccent, particleMode, fogLevel, cinematic };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!engineRef.current) engineRef.current = new AmbienceEngine();
    const engine = engineRef.current;
    engine.resize(canvas.width, canvas.height);
    engine.setFamily(family);

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const s = stateRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- the artwork, with a slow micro-zoom so it never sits dead ---
      const img = imageRef.current;
      if (img && img.naturalWidth) {
        const zoom = 1.02 + 0.015 * Math.sin((now - start) / 2600);
        const dw = canvas.width * zoom;
        const dh = canvas.height * zoom;
        ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
      } else {
        ctx.fillStyle = '#07070a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // --- the realm's own scrim, so the text always reads ---
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(4,4,8,0.62)');
      grad.addColorStop(0.42, 'rgba(4,4,8,0.18)');
      grad.addColorStop(1, 'rgba(4,4,8,0.74)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- fog and particles ---
      const opts: AmbienceOptions = {
        particleMode: s.particleMode,
        fogLevel: s.fogLevel,
        accent: s.accent,
        secondaryAccent: s.secondaryAccent,
      };
      engine.setFamily(s.family);
      engine.draw(ctx, opts);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // the artwork itself
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.src = `wallpapers/${wallpaper}`;
    img.onload = () => { imageRef.current = img; };
    return () => { imageRef.current = null; };
  }, [wallpaper]);

  // the family changes with the realm
  useEffect(() => {
    engineRef.current?.setFamily(family);
  }, [family]);

  return <canvas ref={canvasRef} width={1280} height={720} className="skii-backdrop" />;
}
