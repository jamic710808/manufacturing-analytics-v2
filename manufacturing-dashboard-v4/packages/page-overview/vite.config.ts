import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import singleSpa from 'vite-plugin-single-spa';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  plugins: [
    react(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    singleSpa({
      orgName: 'mfg-dashboard',
      projectName: 'page-overview',
    }),
  ],
  server: {
    port: 9001,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: 'src/spa.ts',
      formats: ['system'],
    },
    rollupOptions: {
      output: {
        format: 'system',
        inlineDynamicImports: false,
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  },
});
