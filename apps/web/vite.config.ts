import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/types': path.resolve(__dirname, '../../packages/shared/src'),
      '@shared/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@shared/supabase': path.resolve(__dirname, '../../packages/supabase/src'),
    },
  },
  server: {
    port: 3000,
    allowedHosts: ['oddly-obliging-anemone.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
