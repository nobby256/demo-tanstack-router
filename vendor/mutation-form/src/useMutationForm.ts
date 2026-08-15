/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import {
  type DefaultValues,
  type FieldValues,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form'
import { z } from 'zod'

import { createMutationResolver } from './createMutationResolver'

export type FormValues<TForm> =
  TForm extends UseFormReturn<infer TFormValues, any, any> ? TFormValues : never

export type MutationValues<TForm> =
  TForm extends UseFormReturn<any, any, infer TRequestValues>
    ? TRequestValues
    : never

export function useMutationForm<
  TFormValues extends FieldValues,
  TRequestSchema extends z.ZodType,
>(config: {
  mutationSchema: TRequestSchema
  defaultValues: TFormValues
  criteriaMode?: UseFormProps<TFormValues>['criteriaMode']
}) {
  type TRequestValues = z.output<TRequestSchema> & FieldValues

  const form = useForm<TFormValues, unknown, TRequestValues>({
    criteriaMode: config.criteriaMode,
    resolver: createMutationResolver<TFormValues, TRequestSchema>(
      config.mutationSchema,
    ),
    // この hook は完全なロード済みフォーム値を要求する。
    // 完全値は RHF の DeepPartial な DefaultValues として安全に扱える。
    defaultValues: config.defaultValues as DefaultValues<TFormValues>,
  })

  useEffect(() => {
    form.reset(config.defaultValues)
  }, [config.defaultValues, form.reset])

  return form
}
