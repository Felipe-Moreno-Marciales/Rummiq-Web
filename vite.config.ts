/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// El base path coincide con la ruta de GitHub Pages: https://felipe-moreno-marciales.github.io/rummiq-web/
export default defineConfig({
  base: '/rummiq-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'iconos/icono.svg', 'iconos/icono-maskable.svg'],
      manifest: {
        name: 'Rummiq Web',
        short_name: 'Rummiq',
        description:
          'Juego de fichas independiente inspirado en los clásicos de tipo rummy. Implementación no oficial.',
        lang: 'es',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        theme_color: '#b3541e',
        background_color: '#f4f1ea',
        categories: ['games'],
        icons: [
          { src: 'iconos/icono.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          {
            src: 'iconos/icono-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      // El service worker se desactiva en desarrollo y pruebas.
      devOptions: { enabled: false },
    }),
  ],
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
    // En pruebas, el módulo virtual del service worker se sustituye por un stub.
    alias: {
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/servicios/pwa/registroStub.ts', import.meta.url),
      ),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Umbrales altos reservados al dominio (funciones puras del juego).
      include: ['src/dominio/**/*.ts'],
      exclude: [
        'src/dominio/**/*.{test,spec}.ts',
        'src/dominio/**/tipos.ts',
        'src/dominio/**/tiposMotor.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
