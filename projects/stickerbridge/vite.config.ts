import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// NOTE: the Tailwind plugin is intentionally omitted · this app ports the
// original standalone page 1:1 with its own stylesheet (Tailwind preflight
// would alter the design).

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@/projects/stickerbridge', replacement: path.resolve(__dirname, './src') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  base: './',
  build: {
    outDir: 'dist',
  },
});
