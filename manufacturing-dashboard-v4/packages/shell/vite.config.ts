import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 9000,
    open: false,
    proxy: {
      // Dev: proxy /page-xxx to Vite dev servers (for import map compatibility)
      '/page-overview': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/page-overview/, ''),
      },
      '/page-inventory': {
        target: 'http://localhost:9002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/page-inventory/, ''),
      },
      '/page-procurement': {
        target: 'http://localhost:9003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/page-procurement/, ''),
      },
      '/page-supplier': {
        target: 'http://localhost:9004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/page-supplier/, ''),
      },
      '/page-production': {
        target: 'http://localhost:9005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/page-production/, ''),
      },
      // Dev: proxy /packages to Vite dev servers (for spa.js files)
      // Production build output puts spa.js at packages/*/dist/spa.js
      '/packages/page-overview': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/packages\/page-overview/, ''),
      },
      '/packages/page-inventory': {
        target: 'http://localhost:9002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/packages\/page-inventory/, ''),
      },
      '/packages/page-procurement': {
        target: 'http://localhost:9003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/packages\/page-procurement/, ''),
      },
      '/packages/page-supplier': {
        target: 'http://localhost:9004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/packages\/page-supplier/, ''),
      },
      '/packages/page-production': {
        target: 'http://localhost:9005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/packages\/page-production/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    base: './',
  },
});
