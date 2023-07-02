import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'http://192.168.0.159:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://192.168.0.159:5000/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
