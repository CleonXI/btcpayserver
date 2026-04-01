import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  root: '.',
  publicDir: false,
  build: {
    outDir: 'wwwroot/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        'tailwind': 'Styles/tailwind.css',
        'btcpay-components': 'wwwroot/js/btcpay-components.js',
        'utils': 'wwwroot/main/utils.js',
        'copy-to-clipboard': 'wwwroot/js/copy-to-clipboard.js',
        'toast-utils': 'wwwroot/js/toast-utils.js',
        'theme-switch': 'wwwroot/js/theme-switch.js',
        'site': 'wwwroot/main/site.js',
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
