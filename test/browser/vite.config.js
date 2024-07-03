import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { babel } from '@rollup/plugin-babel';
import { fileURLToPath } from 'url';
import path from 'path';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  plugins: [
    babel({
      babelHelpers: 'bundled',
    }),
    vue(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    sourcemap: 'inline',
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
      'modules': path.resolve(projectRoot, 'modules'),
    },
  },
})