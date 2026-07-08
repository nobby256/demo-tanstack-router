import { neutralConfig, nodeConfig } from '@vendor/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig([
  // decorators (node用)
  {
    ...nodeConfig,
    entry: { index: './decorators/src/index.ts' },
    tsconfig: './tsconfig.src.decorators.json',
    exports: {
      customExports(original: Record<string, unknown>) {
        return {
          '.': {
            typespec: './tsp/index.tsp',
            default: original['.'],
          },
          './zod': original['./zod'],
          './package.json': original['./package.json'],
        }
      },
    },
  },

  // zod (vite用)
  {
    ...neutralConfig,
    entry: { zod: './zod/src/index.ts' },
    tsconfig: './tsconfig.src.zod.json',
  },
])
