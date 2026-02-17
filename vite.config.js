import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Importante: Actualización automática
      includeAssets: ['favicon.png', 'images/logo-pwa.png'],
      
      // --- CONFIGURACIÓN "ANTI-ZOMBIE" ---
      workbox: {
        cleanupOutdatedCaches: true, // Borra versiones viejas
        skipWaiting: true,           // Fuerza la instalación inmediata
        clientsClaim: true,          // Toma el control sin recargar
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // Sube límite a 4MB
      },
      // -----------------------------------

      manifest: {
        name: 'XVII Congreso IASPM-AL 2026',
        short_name: 'IASPM 2026',
        description: 'App oficial del XVII Congreso de la IASPM-AL',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'images/logo-pwa.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'images/logo-pwa.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'iaspm-al-2026.clickwebhoover.online',
      'localhost'
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    },
    watch: {
      usePolling: true
    }
  }
})
