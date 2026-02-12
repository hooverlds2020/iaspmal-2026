// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Actualizamos los activos incluidos
      includeAssets: ['favicon.png', 'images/logo-pwa.png'], 
      manifest: {
        name: 'XVII Congreso IASPM-AL 2026', // Ajustado a XVII según tu logo
        short_name: 'IASPM 2026',
        description: 'App oficial del XVII Congreso de la IASPM-AL en San Cristóbal de Las Casas',
        theme_color: '#ffffff', // Fondo blanco para que el logo XVII luzca mejor
        background_color: '#ffffff',
        display: 'standalone', 
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            // Ruta al nuevo logo XVII que subiste
            src: 'images/logo-pwa.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'images/logo-pwa.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'images/logo-pwa.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' 
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
