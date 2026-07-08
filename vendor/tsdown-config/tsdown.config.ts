import { defineConfig } from 'tsdown'

// https://tsdown.dev/guide/
export default defineConfig({
  unbundle: true,

  treeshake: false,
  minify: false,

  // tsconfigは無視
  tsconfig: false,

  format: ['esm'],
  sourcemap: true,
  dts: {
    sourcemap: true,
  },

  exports: true,
  outDir: 'dist',

  entry: './src/config.ts',
})
