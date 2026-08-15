import { neutralConfig } from '@vendor/tsdown-config'
import { defineConfig } from 'tsdown'

// https://tsdown.dev/guide/
export default defineConfig([
  {
    ...neutralConfig,
    entry: './src/index.ts',
  },
])
