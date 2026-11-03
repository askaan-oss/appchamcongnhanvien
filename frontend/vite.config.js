import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5013',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Backend is not running on localhost:5013' }))
            }
          })
        }
      },
      '/hubs': {
        target: 'http://localhost:5013',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {})
        }
      }
    }
  },
  preview: {
    port: 5173,
    allowedHosts: true,
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
