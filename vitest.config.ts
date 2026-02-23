import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 15000, // 15 seconds timeout for tests
    hookTimeout: 15000, // 15 seconds timeout for hooks
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})