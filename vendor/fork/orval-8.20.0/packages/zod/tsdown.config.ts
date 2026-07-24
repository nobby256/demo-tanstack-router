import { nodeConfig } from '@vendor/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    ...nodeConfig,
    entry: './src/index.ts'
  },
])
