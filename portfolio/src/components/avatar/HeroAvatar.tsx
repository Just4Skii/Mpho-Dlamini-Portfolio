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
    // Fixed model extents (metres). The GLB is a known asset, so framing is
    // computed from constants instead of a runtime bounding box — measuring the
    // box after the mixer starts produced wildly different camera distances.
    const MODEL_HEIGHT = 1.84;
    const MODEL_WIDTH = 0.92;
    const fitCamera = () => {
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const aspect = Math.max(0.15, camera.aspect);
      // Full-fit distance for the column, then the requested enlargement.
      const distH = MODEL_HEIGHT / (2 * tanHalf);
      const distW = MODEL_WIDTH / (2 * tanHalf * aspect);
      const baseZ = Math.max(distH, distW) / SIZE_SCALE;
      camera.userData.baseZ = baseZ;

      // At >1x the figure is taller than the column, so anchor the top of the
      // head to the top of the stage and let the legs run past the bottom edge:
      // an intentional portrait crop rather than a decapitated model.
      const visibleHalf = baseZ * tanHalf;
      const anchorY = MODEL_HEIGHT / 2 - visibleHalf * 0.98;
      camera.position.set(0, anchorY, baseZ);
      camera.lookAt(0, anchorY, 0);
      camera.userData.anchorY = anchorY;
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
      fitCamera();
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

        // Centre on the mesh as authored; the camera uses the fixed constants
        // above, so a mid-animation pose can never skew the framing.
        root.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);
        fitCamera();

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
          mixer.clipAction(gltf.animations[0]).reset().play();
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
        // Falling reads better pulled back a little, so nothing crops on rotation.
        const baseZ = (camera.userData.baseZ as number) ?? camera.position.z;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ * (1 + fall * 0.12), 0.08);
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
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
