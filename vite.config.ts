import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig({
  root: 'src/renderer',
  base: './',
  plugins: [react(), electron()],
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
      '@components': path.resolve(__dirname, 'src/renderer/src/components'),
      '@hooks': path.resolve(__dirname, 'src/renderer/src/hooks'),
      '@store': path.resolve(__dirname, 'src/renderer/src/store')
    }
  }
});
