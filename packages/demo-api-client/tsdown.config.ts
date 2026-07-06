import { neutralConfig } from '@vendor/tsdown-config/base.config'
import { defineConfig } from 'tsdown'

// https://tsdown.dev/guide/
export default defineConfig([
  {
    ...neutralConfig,
    entry: {
      'api-fetch': './src/client/api-fetch.ts',
      'api/*': [
        './generated/orval/client/api/*.ts',
        '!./generated/orval/client/api/*.msw.ts',
      ],
      'zod/*': './generated/orval/client/zod/*.ts',
      msw: './src/msw/index.ts',
    },
  },
])
