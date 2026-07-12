import { defineConfig } from 'orval'

const OUTPUT_DIR = './.generated/orval'
const INPUT_FILE = './node_modules/demo-api-spec/dist/openapi/openapi-demo.yaml'

export default defineConfig({
  api: {
    input: INPUT_FILE,
    output: {
      target: `${OUTPUT_DIR}/api`,
      client: 'fetch',
      mode: 'tags',
      schemas: {
        path: `${OUTPUT_DIR}/schema`,
        splitByTags: true,
      },
      formatter: 'prettier',
      mock: {
        indexMockFiles: true,
        generators: [
          {
            type: 'msw',
            path: `${OUTPUT_DIR}/msw`,
            useExamples: true,
            // generateEachHttpStatus: true,
          },
        ],
      },
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: 'src/orval/custom-fetch.ts',
          name: 'request',
        },
      },
    },
  },
  zod: {
    input: INPUT_FILE,
    output: {
      target: `${OUTPUT_DIR}/zod`,
      client: 'zod',
      mode: 'tags',
      formatter: 'prettier',
      override: {
        zod: {
          generate: {
            param: false,
            query: false,
            header: false,
            body: true,
            response: false,
          },
        },
        mutator: {
          path: 'src/orval/custom-validate.ts',
          name: 'schema',
        },
      },
    },
  },
})
