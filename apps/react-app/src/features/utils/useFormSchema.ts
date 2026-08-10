import { z } from 'zod'

export type FormInputValues<T extends z.ZodTypeAny> = z.input<T>

export type FormOutputValues<T extends z.ZodTypeAny> = z.output<T>

/**
 * 入力型 = 出力型
 */
export function defineFormSchema<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
) {
  return schema.transform((input) => normalizeEmptyStrings(input))
}

/**
 * 入力型 → 出力スキーマ
 */
export function defineMappedFormSchema<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny,
>(inputSchema: TInputSchema, outputSchema: TOutputSchema) {
  return inputSchema.transform((input) =>
    outputSchema.parse(normalizeEmptyStrings(input)),
  )
}

/**
 * 入力型 → 任意変換
 */
export function defineTransformFormSchema<
  TInputSchema extends z.ZodTypeAny,
  TOutput,
>(
  inputSchema: TInputSchema,
  transform: (input: z.output<TInputSchema>) => TOutput,
) {
  return inputSchema.transform((input) =>
    transform(normalizeEmptyStrings(input)),
  )
}

/**
 * 空文字("")を再帰的に undefined へ変換する。
 */
function normalizeEmptyStrings<T>(value: T): T {
  if (value === '') {
    return undefined as T
  }

  if (Array.isArray(value)) {
    return value.map(normalizeEmptyStrings) as T
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        normalizeEmptyStrings(val),
      ]),
    ) as T
  }

  return value
}
