export function throwSchemaError(
  kind: string,
  option: unknown,
  reason: string,
): never {
  throw new Error(
    [
      '[schema] スキーマ定義エラー',
      '',
      `kind   : ${kind}`,
      `reason : ${reason}`,
      '',
      'option:',
      JSON.stringify(option, undefined, 2),
    ].join('\n'),
  )
}
