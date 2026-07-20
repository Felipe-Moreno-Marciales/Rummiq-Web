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
    setupFiles: ['./src/pruebas/configuracion.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Umbrales altos reservados al dominio (funciones puras del juego).
      include: ['src/dominio/**/*.ts'],
      exclude: ['src/dominio/**/*.{test,spec}.ts', 'src/dominio/**/tipos.ts'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
