import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'XVII Congreso IASPM-AL 2026',
        short_name: 'IASPM 2026',
        description: 'App oficial del XVII Congreso de la IASPM-AL en San Cristóbal de Las Casas',
        theme_color: '#0d9488', // Color Teal de tu marca
        background_color: '#ffffff',
        display: 'standalone', // Modo App (sin barra de navegador)
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  // MANTENEMOS TU CONFIGURACIÓN DE SERVIDOR INTACTA
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
