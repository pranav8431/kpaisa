/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works on GitHub Pages (sub-path) and Vercel (root).
  base: './',
  test: {
    environment: 'node',
  },
})
