import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  root: 'src/editor',
  base: '/editor/',
  server: {
    port: 5001,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/editor/index.html')
      },

      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/editor'),
      '@components': resolve(__dirname, 'src/editor/scripts/components'),
      '@panels': resolve(__dirname, 'src/editor/scripts/panels'),
      '@utils': resolve(__dirname, 'src/editor/scripts/utils'),
      '@config': resolve(__dirname, 'src/editor/scripts/config')
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss
      ]
    }
  }
})