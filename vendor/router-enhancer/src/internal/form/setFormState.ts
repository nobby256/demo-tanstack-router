import type { FieldValues, UseFormReturn } from 'react-hook-form'

type FormStateFieldName<T> = Extract<keyof T, `_${string}`>

export function setFormState<
  TFieldValues extends FieldValues,
  TName extends FormStateFieldName<TFieldValues>,
>(
  form: UseFormReturn<TFieldValues>,
  name: TName,
  value: TFieldValues[TName],
): void {
  ;(
    form as unknown as {
      setValue: (
        name: string,
        value: unknown,
        options?: {
          shouldDirty?: boolean
          shouldTouch?: boolean
          shouldValidate?: boolean
        },
      ) => void
    }
  ).setValue(name, value, {
    shouldDirty: false,
    shouldTouch: false,
    shouldValidate: false,
  })
}
