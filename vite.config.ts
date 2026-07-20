/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El base path coincide con la ruta de GitHub Pages: https://felipe-moreno-marciales.github.io/rummiq-web/
export default defineConfig({
  base: '/rummiq-web/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Umbrales altos reservados al dominio; se ajustan por fase.
      include: ['src/domain/**/*.ts'],
      exclude: ['src/domain/**/*.{test,spec}.ts', 'src/domain/**/types.ts'],
    },
  },
});
