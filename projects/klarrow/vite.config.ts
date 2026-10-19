import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Embedded Klarrow workbench (canonical source: Just4Skii/Klarrow src/frontend).
// Vite dev proxy forwards /api to the local API started by the Klarrow repo's
// start-klarrow.cmd (default http://127.0.0.1:5099) so `npm run dev:klarrow`
// works against the real engine without touching VITE_API_BASE.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://127.0.0.1:5099',
        changeOrigin: true
      }
    }
  },
  base: './',
  build: { outDir: 'dist', sourcemap: true }
});
