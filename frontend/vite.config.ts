import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Durante desarrollo, el frontend corre en el puerto 5173 y el backend
// Express en el 5000; el proxy evita problemas de CORS y permite usar
// rutas relativas ("/api/...") iguales en dev y en producción.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/archivos-baches': 'http://localhost:5000',
    },
  },
})
