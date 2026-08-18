import type { UseFormReturn } from 'react-hook-form'

/**
 * UseFormReturn から RHF の UI FormValues 型を抽出する。
 *
 * この型は Zod schema の input / output や API request 型ではなく、
 * useForm<TFieldValues>() が管理する編集状態の型を表す。
 */
export type RHFFieldValuesOf<TForm> =
  TForm extends UseFormReturn<infer TFieldValues, unknown, unknown>
    ? TFieldValues
    : never
