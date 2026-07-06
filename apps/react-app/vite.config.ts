import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

const config = defineConfig(({ mode }) => {
  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      viteReact(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __DEMO_MODE__: JSON.stringify(mode === 'demo'),
    },
    build: {
      sourcemap: true,
      target: 'esnext',
      outDir: 'dist',
    },
  }
})

export default config
