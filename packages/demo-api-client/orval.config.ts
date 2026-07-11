import type { ConfigExternal } from 'orval'

import { mkdirSync, readdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { defineConfig } from 'orval'

const OPENAPI_DIR = './node_modules/demo-api-spec/dist/openapi'
const OUTPUT_DIR = './.generated/orval'

// ✅ 出力ディレクトリが無ければ作る
mkdirSync(OUTPUT_DIR, { recursive: true })

const files = readdirSync(OPENAPI_DIR)
  .filter((f) => /\.(json|ya?ml)$/.test(f))
  .sort()

const entries = files.flatMap((file) => {
  const name = basename(file, extname(file))
  const input = join(OPENAPI_DIR, file)

  return [
    [
      `${name}Client`,
      {
        input,
        output: {
          target: `${OUTPUT_DIR}/client/api/${name}.ts`,
          client: 'fetch',
          mode: 'split',
          formatter: 'prettier',
          mock: {
            generators: [
              {
                type: 'msw',
                useExamples: true,
                generateEachHttpStatus: true,
              },
            ],
          },
          // baseUrl: {
          //   runtime: 'import.meta.env.VITE_API_BASE_URL',
          // },
          override: {
            fetch: {
              includeHttpResponseReturnType: false,
            },
            mutator: {
              path: 'src/client/api-fetch.ts',
              name: 'request',
            },
          },
        },
      },
    ] as const,

    [
      `${name}Zod`,
      {
        input,
        output: {
          target: `${OUTPUT_DIR}/client/zod/${name}.ts`,
          client: 'zod',
          mode: 'split',
          formatter: 'prettier',
          override: {
            mutator: {
              path: 'src/client/zod-schema.ts',
              name: 'schema',
            },
          },
        },
      },
    ] as const,
  ]
})

const configObject = Object.fromEntries(entries) as ConfigExternal

export default defineConfig(configObject)
