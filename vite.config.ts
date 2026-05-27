import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Lightning CSS minification drops the unprefixed backdrop-filter we use in popovers.
    cssMinify: false,
  },
})
