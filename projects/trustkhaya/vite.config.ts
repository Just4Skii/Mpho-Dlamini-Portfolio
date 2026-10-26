import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Embedded TrustKhaya demo (canonical app: D:\\code randoms\\TrustKhaya).
// Same pure engine and seed data; the UI is a static, self-contained walkthrough.
export default defineConfig({
  plugins: [react()],
  server: { port: 5177 },
  base: './',
  build: { outDir: 'dist', sourcemap: true },
})
