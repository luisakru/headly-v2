import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Headly',
        short_name: 'Headly',
        lang: 'de',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        theme_color: '#F2EDE4',
        background_color: '#F2EDE4',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell and fonts, so the app opens offline after the first visit.
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'apple-touch-icon.png'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    env: { TZ: 'Europe/Berlin' },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
