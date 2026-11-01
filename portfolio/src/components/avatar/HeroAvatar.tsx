import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * The hero avatar.
 *
 * It lives in the empty right-hand column of the hero and animates itself from
 * what the page is doing — nobody picks a clip:
 *
 *   • idle      → plays the embedded "just chilling" loop, slowly panning
 *   • scrolling → a procedural falling/floating fall animation while the page
 *                 moves, so a long scroll keeps it falling for as long as you
 *                 keep scrolling and it settles once you stop
 *
 * Everything is procedural rather than baked so it needs no extra download, and
 * it is skipped entirely for reduced-motion users and on narrow screens.
 */
export const HeroAvatar: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  // Bumped from the original framing at the owner's request: 1.5x larger.
  const SIZE_SCALE = 1.5;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;

    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.localClippingEnabled = false;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xdce8ff, 0x14160f, 1.25));
    const key = new THREE.DirectionalLight(0xfff4e2, 2.2);
    key.position.set(2.4, 3.6, 3.2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc6ff3d, 2.4);
    rim.position.set(-3.2, 2.0, -2.4);
    scene.add(rim);

    // ------------------------------------------------------------ motion state
    const scroll = { lastY: window.scrollY, velocity: 0, fall: 0 };
    const onScroll = () => {
      const y = window.scrollY;
      scroll.velocity += Math.abs(y - scroll.lastY);
      scroll.lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let mixer: THREE.AnimationMixer | null = null;
    let pivot: THREE.Object3D | null = null;
    // Pending clip-cycle timers, cleared on unmount.
    const timeouts: number[] = [];
    type Fit = { z: number; y: number };
    // Each clip gets its own camera fit: "Just_chilling" is a floor clip where he
    // lies down, so framing it like the standing clip cut him off at the border.
    // The camera eases between fits when the clip changes.
    const fits: Fit[] = [];
    const DEFAULT_FIT: Fit = { z: 6, y: 0.9 };
    let activeFit: Fit = { ...DEFAULT_FIT };
    let targetFit: Fit = { ...DEFAULT_FIT };

    const fitFor = (minY: number, maxY: number, halfWidth: number): Fit => {
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const aspect = Math.max(0.15, camera.aspect);
      const height = Math.max(0.6, maxY - minY);
      const width = Math.max(0.6, halfWidth * 2);
      const distH = height / (2 * tanHalf);
      const distW = width / (2 * tanHalf * aspect);
      const fullFit = Math.max(distH, distW) * 1.02;
      // Upright poses can be pushed past the frame edges (a tall figure cropped
      // at the knees reads as deliberate), but a lying pose must fit entirely or
      // it disappears behind the hero border.
      const upright = height / width > 1.15;
      // Upright: enlarge and anchor the top of the head near the top of the
      // column, so the legs crop at the hero border (reads as a portrait crop).
      // Lying: zoom out so no part hides behind the border.
      const zoom = upright ? 1.45 : 0.78;
      const dist = fullFit / zoom;
      const halfView = (dist * tanHalf) / 1;
      const y = upright ? maxY - halfView * 0.97 : (minY + maxY) / 2;
      return { z: dist, y };
    };

    const applyFit = (clipIndex: number) => {
      targetFit = fits[clipIndex] ?? DEFAULT_FIT;
    };

    let frameId = 0;
    const clock = new THREE.Clock();
    let sway = 0;

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // The camera now follows the active clip's fit, eased each frame.
      camera.position.set(0, activeFit.y, activeFit.z);
      camera.lookAt(0, activeFit.y, 0);
    };
    // ------------------------------------------------------------ visibility
    // Only render while the hero is on screen.
    let visible = true;
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    new GLTFLoader().load(
      '/models/hero-avatar.glb',
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        pivot = new THREE.Group();
        pivot.add(root);
        scene.add(pivot);

        // Centre the mesh on its authored origin; per-clip camera fits handle
        // the fact that one clip is a standing pose and the other lies down.
        root.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);

        // Skin and fabric are dielectric. The export ships a metalness map whose
        // bright texels turn hands and wrists into chrome under the rim light;
        // pinning the PBR response keeps the tan reading as skin.
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            const standard = material as THREE.MeshStandardMaterial;
            if (!standard.isMeshStandardMaterial) return;
            standard.metalness = 0;
            standard.metalnessMap = null;
            standard.roughness = Math.max(standard.roughness ?? 0.6, 0.75);
            standard.needsUpdate = true;
          });
        });

        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(root);

          // Per-clip fits, measured by stepping each clip and reading bone world
          // positions (bones approximate the body well enough for framing, and
          // avoid the problem that a skinned bounding box is not pose-aware).
          const bones: THREE.Object3D[] = [];
          root.traverse((o) => {
            if ((o as THREE.Bone).isBone) bones.push(o);
          });
          const probe = new THREE.Vector3();
          gltf.animations.forEach((clip, index) => {
            const action = mixer!.clipAction(clip);
            action.reset().play();
            let minY = Infinity;
            let maxY = -Infinity;
            let halfWidth = 0;
            const steps = 30;
            for (let s = 0; s <= steps; s++) {
              mixer!.setTime((clip.duration * s) / steps);
              root.updateWorldMatrix(true, true);
              for (const bone of bones) {
                bone.getWorldPosition(probe);
                // The pivot sits at the origin and is unrotated during probing, so
                // world coordinates are already the pivot frame — do NOT re-apply
                // root.position here (it is baked into the world position).
                minY = Math.min(minY, probe.y);
                maxY = Math.max(maxY, probe.y);
                halfWidth = Math.max(halfWidth, Math.abs(probe.x));
              }
            }
            action.stop();
            // Bones sit inside the body; pad generously for the suit, head and
            // shoes, which reach further than any joint, especially lying down.
            const pad = 0.3;
            fits[index] = fitFor(
              minY - pad,
              maxY + pad,
              Math.max(0.4, halfWidth + pad)
            );
          });
          mixer.setTime(0);
          activeFit = { ...(fits[0] ?? DEFAULT_FIT) };
          targetFit = { ...activeFit };
          camera.position.set(0, activeFit.y, activeFit.z);
          camera.lookAt(0, activeFit.y, 0);

          // Cycle: idle most of the time, and every so often play one of the
          // action clips, then fall back to idling. Nobody picks anything.
          const idle = gltf.animations[0];
          const actions = gltf.animations.slice(1);

          const playIdle = () => {
            if (!mixer) return;
            actions.forEach((c) => mixer!.clipAction(c).fadeOut(0.5));
            mixer.clipAction(idle).reset().fadeIn(0.5).play();
            applyFit(0);
          };

          const playRandom = () => {
            if (!mixer || actions.length === 0) return;
            const pick = Math.floor(Math.random() * actions.length);
            const clip = actions[pick];
            mixer.clipAction(idle).fadeOut(0.6);
            const action = mixer.clipAction(clip);
            action.reset();
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.fadeIn(0.6).play();
            applyFit(pick + 1);
          };

          playIdle();
          const scheduleNext = () => {
            const wait = 9000 + Math.random() * 9000;
            window.setTimeout(() => {
              playRandom();
              const back = window.setTimeout(function toIdle() {
                playIdle();
                scheduleNext();
              }, 5200);
              timeouts.push(back);
            }, wait);
          };
          scheduleNext();
        }
      },
      undefined,
      (err) => {
        // Surface the reason: a silently hidden avatar is impossible to debug.
        console.error('[hero-avatar] failed to load model', err);
        mount.style.opacity = '0';
      }
    );

    // Pause rendering entirely once the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);

      // Scrolling feeds a decaying "fall" amount: continuous while the page
      // moves, easing back to the idle loop after it stops.
      scroll.fall = Math.min(1, scroll.fall + scroll.velocity * 0.0009);
      scroll.fall *= Math.pow(0.35, dt); // ~0.5 s half-life
      scroll.velocity *= Math.pow(0.02, dt);

      if (mixer) mixer.update(dt);

      if (pivot) {
        sway += dt * 0.35;
        const idleDrift = Math.sin(sway) * 0.06;
        const fall = scroll.fall;

        // Idle: gentle yaw drift. Falling: tumble and descend slightly.
        pivot.rotation.y = idleDrift + fall * Math.sin(sway * 2.1) * 0.5;
        pivot.rotation.z = Math.sin(sway * 0.7) * 0.02 + fall * Math.sin(sway * 2.6) * 0.28;
        pivot.rotation.x = fall * Math.sin(sway * 1.7) * 0.16;
        pivot.position.y = -fall * 0.22 + Math.sin(sway * 0.9) * 0.012;
      }

      // Ease the camera toward the active clip's fit (standing vs lying down).
      activeFit.z = THREE.MathUtils.lerp(activeFit.z, targetFit.z, 0.045);
      activeFit.y = THREE.MathUtils.lerp(activeFit.y, targetFit.y, 0.045);
      const fall = scroll.fall;
      // Falling reads better pulled back a little, so nothing crops on rotation.
      camera.position.z = activeFit.z * (1 + fall * 0.12);
      camera.position.y = activeFit.y;
      camera.lookAt(0, activeFit.y, 0);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      timeouts.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      observer.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="hero-avatar" ref={mountRef} aria-hidden="true" />
  );
};
