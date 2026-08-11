import { readFile, writeFile } from 'node:fs/promises'

const schemaFile = './.generated/orval/zod/demo.schemas.ts'
const source = await readFile(schemaFile, 'utf8')

if (!/\bfrom\s+['"]zod['"]/.test(source)) {
  await writeFile(
    schemaFile,
    `import { z as zod } from 'zod';\n${source}`,
    'utf8',
  )
}
