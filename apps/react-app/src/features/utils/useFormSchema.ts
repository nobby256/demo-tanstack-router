import { zodResolver } from '@hookform/resolvers/zod'
import { type DefaultValues, type FieldValues, useForm } from 'react-hook-form'
import { z } from 'zod'

/**
 * 入力型 = 出力型
 */
export function useFormSchema<
  TInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  // Zod v4
  schema: z.ZodType<TOutput, TInput>
  defaultValues: DefaultValues<TInput>
}) {
  const formSchema = config.schema.transform((input) =>
    normalizeEmptyStrings(input),
  )

  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })
}

/**
 * 入力型 → 出力スキーマ
 */
export function useMappedForm<
  TInput extends FieldValues,
  TParsedInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  // RHF が保持する値は TInput、inputSchema のパース結果は TParsedInput
  inputSchema: z.ZodType<TParsedInput, TInput>
  outputSchema: z.ZodType<TOutput>
  defaultValues: DefaultValues<TInput>
}) {
  const formSchema = config.inputSchema.transform((input) =>
    config.outputSchema.parse(normalizeEmptyStrings(input)),
  )

  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })
}

/**
 * 入力型 → 任意変換
 */
export function useTransformForm<
  TInput extends FieldValues,
  TParsedInput extends FieldValues,
  TOutput extends FieldValues,
>(config: {
  inputSchema: z.ZodType<TParsedInput, TInput>
  transform: (input: TParsedInput) => TOutput
  defaultValues: DefaultValues<TInput>
}) {
  const formSchema = config.inputSchema.transform((input) =>
    config.transform(normalizeEmptyStrings(input)),
  )

  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: config.defaultValues,
  })
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
      Object.entries(value).map(([k, v]) => [k, normalizeEmptyStrings(v)]),
    ) as T
  }

  return value
}
