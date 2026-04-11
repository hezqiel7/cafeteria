import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'APP_'],
  server: {
    host: '0.0.0.0' // Escuchar en todas las interfaces
  }
})
