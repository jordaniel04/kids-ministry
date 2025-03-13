import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        '/assets/icons/favicon.ico',
        '/assets/icons/apple-touch-icon.png',
        '/assets/icons/favicon-96x96.png'
      ],
      manifest: {
        name: 'Reportes Ministerio de Niños',
        short_name: 'Reportes',
        description: 'Sistema de gestión para el Ministerio de Niños',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/assets/icons/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/icons/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/assets/icons/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    hmr: {
      timeout: 5000,
      overlay: false
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
