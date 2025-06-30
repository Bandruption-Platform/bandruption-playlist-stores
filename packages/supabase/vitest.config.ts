import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load environment variables from the root directory
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '')
  
  return {
    test: {
      environment: 'node',
      globals: true,
      env: env, // Make environment variables available in tests
    },
  }
})