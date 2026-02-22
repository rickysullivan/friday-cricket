import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

const normalizeBasePath = (value = '/') => {
  if (!value || value === '/') return '/';
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH || '/');
const manifestId = basePath;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-384.png',
        'icon-512.png',
        'icon-1024.png',
        'icon-maskable-512.png',
        'icon-maskable-1024.png',
        'shortcut-start-96.png',
        'shortcut-watch-96.png',
        'screenshot-mobile.png',
        'screenshot-desktop.png'
      ],
      manifest: {
        id: manifestId,
        name: 'Wickety Cricket',
        short_name: 'Wickety',
        description: 'Offline-first cricket scorekeeping for quick match tracking.',
        theme_color: '#10b981',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: basePath,
        start_url: basePath,
        categories: ['sports', 'utilities'],
        protocol_handlers: [
          {
            protocol: 'web+wickety',
            url: `${basePath}?protocol=%s`
          }
        ],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-1024.png',
            sizes: '1024x1024',
            type: 'image/png'
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-maskable-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-mobile.png',
            sizes: '1170x2532',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        shortcuts: [
          {
            name: 'Start scoring',
            short_name: 'Start',
            description: 'Open setup and start a new match.',
            url: `${basePath}?intent=start`,
            icons: [
              {
                src: 'shortcut-start-96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Watch a game',
            short_name: 'Watch',
            description: 'Open spectator join flow.',
            url: `${basePath}?intent=watch`,
            icons: [
              {
                src: 'shortcut-watch-96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        importScripts: [`${basePath}sw-custom.js`],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
