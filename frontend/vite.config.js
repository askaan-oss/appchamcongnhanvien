import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5013',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:5013',
        ws: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          signalr: ['@microsoft/signalr'],
          ui: ['lucide-react', 'qrcode.react'],
        }
      }
    }
  }
})
