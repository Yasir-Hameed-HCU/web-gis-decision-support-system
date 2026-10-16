import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy → same-origin (mirrors the nginx prod proxy), so no CORS issues for
// the FastAPI API or GeoServer WMS/WFS (GeoServer sends no CORS headers).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/geoserver': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
