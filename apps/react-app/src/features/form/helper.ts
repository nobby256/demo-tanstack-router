import { type UseFormReturn } from 'react-hook-form'

export type FormInput<TForm> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<infer TFormValues, any, any> ? TFormValues : never

export type FormOutput<TForm> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<any, any, infer TMutationSchema>
    ? TMutationSchema
    : never

/**
 * formの型を取得する型へパー
 *
 * useForm<TFieldValues>のTFieldValuesを取得する。
 * ジェネリクスパラメータにはUseFormReturn<>で取得できる型を指定する。
 */
export type FormValues<TUsePageFormReturn> =
  TUsePageFormReturn extends UseFormReturn<infer TFormValues>
    ? TFormValues
    : never
