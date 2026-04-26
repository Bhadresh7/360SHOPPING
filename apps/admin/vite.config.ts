import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  envDir: '../../',
  server: {
    port: 5174,
    host: '0.0.0.0'
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
