import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/SDSS-Datathon-2026/',
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
