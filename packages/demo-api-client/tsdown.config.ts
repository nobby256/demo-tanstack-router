import { neutralConfig } from '@vendor/tsdown-config'
import { defineConfig } from 'tsdown'

// https://tsdown.dev/guide/
export default defineConfig([
  {
    ...neutralConfig,
    entry: {
      'op/*': ['./.generated/orval/op/*.ts'],
      'zod/*': './.generated/orval/zod/*.ts',
      fetch: './src/orval/custom-fetch.ts',
      msw: './src/msw/index.ts',
    },
  },
])
