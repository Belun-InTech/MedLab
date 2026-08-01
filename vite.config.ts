import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
    // Dev only: the SPA and API are one origin in production (Express serves dist/),
    // so this keeps fetch('/api/...') identical in both modes — no CORS either way.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT ?? 3001}`,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
