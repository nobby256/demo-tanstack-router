/**
 * orval.config.ts で generateReusableSchemas: true を指定して出力された ts に
 * 下記が記述されない不具合の対応。
 *
 * import { z as zod } from 'zod';
 *
 * Orval 側で import が生成されるようになった場合、このスクリプトは不要になる。
 */
import { readFile, writeFile } from 'node:fs/promises'

const schemaFile = './.generated/orval/zod/demo.schemas.ts'
const source = await readFile(schemaFile, 'utf8')

const hasZodImport = /\bfrom\s+['"]zod['"]/.test(source)

if (hasZodImport) {
  throw new Error(
    [
      `Zod import is already generated in "${schemaFile}".`,
      'The Orval workaround script is no longer necessary.',
      'Remove this script and its invocation from the build process.',
    ].join(' '),
  )
}

await writeFile(
  schemaFile,
  `import { z as zod } from "zod";\n${source}`,
  'utf8',
)
