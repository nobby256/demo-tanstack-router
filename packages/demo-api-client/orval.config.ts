import { defineConfig } from 'orval'

const OUTPUT_DIR = './.generated/orval'
const INPUT_FILE =
  './node_modules/demo-api-spec/dist/openapi/openapi-service.yaml'

export default defineConfig({
  api: {
    input: INPUT_FILE,
    output: {
      target: `${OUTPUT_DIR}/op`,
      client: 'fetch',
      mode: 'tags',
      clean: true,
      // schemas: {
      //   path: `${OUTPUT_DIR}/schemas`,
      //   // splitByTags: true,
      //   type: 'zod',
      // },
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
          runtimeValidation: true,
        },
        mutator: {
          path: 'src/orval/custom-fetch.ts',
          name: 'customFetch',
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
          // generateReusableSchemas: true,
          generate: {
            param: false,
            query: false,
            header: false,
            body: true,
            response: true,
          },
          coerce: {
            param: true,
            query: true,
            header: false,
            body: true,
            response: false,
          },
        },
      },
    },
  },
})
