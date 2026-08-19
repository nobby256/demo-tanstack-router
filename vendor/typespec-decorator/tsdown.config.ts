import { nodeConfig } from '@vendor/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    ...nodeConfig,
    entry: { index: './src/index.ts' },
    tsconfig: './tsconfig.src.json',
    exports: {
      customExports(original: Record<string, unknown>) {
        return {
          '.': {
            typespec: './tsp/index.tsp',
            default: original['.'],
          },
        }
      },
    },
  },
])
