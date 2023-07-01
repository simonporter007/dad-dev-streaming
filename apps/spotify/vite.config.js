import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        secure: false,
      },
    },
    plugins: [react()],
    esbuild: {
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  },
});
