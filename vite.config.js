import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar o JSON pesado do catálogo (5.8MB)
          'catalog-data': [
            './src/data/labor_atacadista_data.json',
          ],
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-window': ['react-window'],
        },
      },
    },
  },
})
