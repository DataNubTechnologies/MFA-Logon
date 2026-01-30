import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@backend': path.resolve(__dirname, './backend'),
      '@services': path.resolve(__dirname, './backend/services'),
    }
  },
  server: {
    proxy: {
      '/sap': {
        target: 'https://cloud9.way2erp.us:44300',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  }
})
