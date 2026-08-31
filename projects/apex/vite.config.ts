import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@/projects/apex', replacement: path.resolve(__dirname, './src') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  base: mode === 'production' ? '/work/apex/' : '/',
  build: {
    outDir: 'dist',
  },
}));
