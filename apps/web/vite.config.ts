import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build'
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/admin': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      }
    }
  }
});