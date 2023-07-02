import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'https://daddevbot-backend.simonporter.co.uk/',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://daddevbot-backend.simonporter.co.uk/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
