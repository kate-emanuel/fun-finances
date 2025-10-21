// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/fun-finances/' : '/',
  server: {
    base: '/',
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname
      }
    }
  }
}))
