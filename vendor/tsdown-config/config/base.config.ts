import type { UserConfig } from 'tsdown'

const baseConfig = {
  // ライブラリではバンドルしない
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
} satisfies UserConfig

export const nodeConfig = {
  ...baseConfig,

  platform: 'node',
  target: 'node22',
} satisfies UserConfig

export const neutralConfig = {
  ...baseConfig,

  platform: 'neutral',
  target: 'esnext',
} satisfies UserConfig
