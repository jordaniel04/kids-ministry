import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// @mdi/font declara @font-face con eot/woff2/woff/ttf; los navegadores modernos
// solo necesitan woff2, pero Vite empaqueta los 4 formatos (~2.3MB extra) porque
// todos están referenciados en el CSS del paquete. Este plugin recorta el CSS
// para que solo quede la referencia a woff2 antes de que Vite resuelva los assets.
function mdiFontWoff2Only(): Plugin {
  return {
    name: 'mdi-font-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('@mdi/font') || !id.endsWith('.css')) return null;
      return code.replace(
        /src:\s*url\([^)]+\.eot[^)]*\)[^;]*;\s*src:\s*url\([^)]+\.eot[^)]*\)\s*format\("embedded-opentype"\),\s*url\(([^)]+\.woff2[^)]*)\)\s*format\("woff2"\),[^;]*;/,
        'src: url($1) format("woff2");'
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    mdiFontWoff2Only(),
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
          if (id.includes('node_modules/vuetify')) return 'vuetify';
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) return 'vue';
          if (id.includes('node_modules/pdf-lib')) return 'pdf-lib';
          if (id.includes('node_modules/jspdf')) return 'jspdf';
          if (id.includes('node_modules/jszip')) return 'jszip';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  }
})
