import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0',
    port: 6762,

    allowedHosts: [
      'demo.babylonengineering.com',
    ],

    proxy: {
      '/api': {
        target: 'https://equilbackend.babylonengineering.com',
        changeOrigin: true,
      },
    },
  },
});
