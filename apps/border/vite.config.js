import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
  assetsInclude: ['**/*.mp3'],
});
