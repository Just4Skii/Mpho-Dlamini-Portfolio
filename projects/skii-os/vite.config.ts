import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Skii OS - a browser port of the Android TV launcher that ships as
// Skii-OS-v2.0.0.apk. The rendering engine, the realm manifest and the
// ambience sprite atlases are the same assets the television runs, so the
// ambience you see here is the ambience the set-top box draws.
//
// base './' because the assembled site is published under /work/skii-os/.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177
  },
  base: './',
  build: { outDir: 'dist', sourcemap: false }
});
