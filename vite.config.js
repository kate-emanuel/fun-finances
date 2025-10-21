import { defineConfig } from 'vite'

// https://kate-emanuel.github.io/fun-finances/
export default defineConfig({
  base: '/fun-finances/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
