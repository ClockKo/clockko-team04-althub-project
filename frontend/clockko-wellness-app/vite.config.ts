import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // Base URL for serving the app
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
  build: {
    // Optimize build for production
    target: 'es2015',
    minify: 'terser',
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Only apply proxy in development
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    } : undefined
  },
  preview: {
    port: 4173,
    host: true
  }
})
