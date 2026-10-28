import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves a project site under /<repo>/, so the Pages
  // workflow sets PAGES_BASE to /ngo-eval-webapp/. Every other deploy
  // (local preview, Firebase, any static host at the domain root) uses
  // the default '/'.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['./src/test/setup.js'],
  },
})
