import { defineConfig } from 'vite'

// Project is served from https://kate-emanuel.github.io/fun-finances/
export default defineConfig({
  base: '/fun-finances/',
  // Ensure all assets are processed and included
  build: {
    sourcemap: true,
    assetsInlineLimit: 0
  }
})
