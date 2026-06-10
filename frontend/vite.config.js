import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Change to '/repo-name/' if deploying to GitHub Pages under a project repo
  server: { port: 5173 },
})
