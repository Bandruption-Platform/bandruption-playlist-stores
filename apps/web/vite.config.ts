import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the root of the monorepo
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  
  // Validate required environment variables for the web app
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  for (const envVar of requiredEnvVars) {
    if (!env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}. Please check your .env file in the root directory.`);
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared/types': path.resolve(__dirname, '../../packages/shared/src'),
        '@shared/ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@shared/supabase': path.resolve(__dirname, '../../packages/supabase/src'),
      },
    },
    envDir: path.resolve(__dirname, '../..'), // Point to root directory for .env
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
  };
});
