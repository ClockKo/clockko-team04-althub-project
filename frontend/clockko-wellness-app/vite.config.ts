import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // Base URL for serving the app. For GitHub Pages project sites, set VITE_BASE="/clockko-team04-althub-project/" at build time.
  // Defaults to "/" for S3 or local dev.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Change to your backend URL/port
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
