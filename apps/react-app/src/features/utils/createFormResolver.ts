import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export type FormInputValues<T extends z.ZodTypeAny> = z.input<T>

export type FormOutputValues<T extends z.ZodTypeAny> = z.output<T>

/**
 * 入力型 = 出力型
 */
export function createFormResolver<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
) {
  const formSchema = schema.transform((input) => normalizeEmptyStrings(input))

  return {
    schema: formSchema,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
  }
}

/**
 * 入力型 → 出力スキーマ
 */
export function createMappedFormResolver<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny,
>(inputSchema: TInputSchema, outputSchema: TOutputSchema) {
  const formSchema = inputSchema.transform((input) =>
    outputSchema.parse(normalizeEmptyStrings(input)),
  )

  return {
    schema: formSchema,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
  }
}

/**
 * 入力型 → 任意変換
 */
export function createTransformFormResolver<
  TInputSchema extends z.ZodTypeAny,
  TOutput,
>(
  inputSchema: TInputSchema,
  transform: (input: z.output<TInputSchema>) => TOutput,
) {
  const formSchema = inputSchema.transform((input) =>
    transform(normalizeEmptyStrings(input)),
  )

  return {
    schema: formSchema,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
  }
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
