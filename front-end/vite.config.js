import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Shukketsu Bugyo',
        short_name: '出欠奉行',
        description: 'React + Vite PWA Example',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/teacher/login',
        scope: '/',
        lang: 'ja',
        // icons: [
        //   {
        //     src: 'pwa-192x192.png',
        //     sizes: '192x192',
        //     type: 'image/png'
        //   },
        //   {
        //     src: 'pwa-512x512.png',
        //     sizes: '512x512',
        //     type: 'image/png'
        //   },
        //   {
        //     src: 'apple-touch-icon.png',
        //     sizes: '180x180',
        //     type: 'image/png'
        //   }
        // ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ]
});