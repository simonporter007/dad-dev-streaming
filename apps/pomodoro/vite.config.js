import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
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
