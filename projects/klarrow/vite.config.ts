import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// NOTE: Tailwind is intentionally omitted · this app owns its stylesheet
// (platform contract: independently built, independently styled).

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@/projects/klarrow', replacement: path.resolve(__dirname, './src') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  base: './',
  build: {
    outDir: 'dist',
  },
});
