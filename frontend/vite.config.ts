import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,      // your frontend URL will be http://localhost:5173/
    open: true,      // automatically opens the browser
    proxy: {
      '/api': 'http://localhost:8000', // only API requests go to Laravel
    },
  },
})