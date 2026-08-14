/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import {
  type DefaultValues,
  type FieldValues,
  useForm,
  type UseFormReturn,
} from 'react-hook-form'
import { z } from 'zod'

import { createRequestResolver } from './createRequestResolver'

export type FormInput<TForm> =
  TForm extends UseFormReturn<infer TInput, any, any> ? TInput : never

export type FormOutput<TForm> =
  TForm extends UseFormReturn<any, any, infer TOutput> ? TOutput : never

export function useRequestForm<
  TResponseSchema extends z.ZodType,
  TRequestSchema extends z.ZodType,
>(config: {
  responseSchema: TResponseSchema

  requestSchema: TRequestSchema

  defaultValues?: DefaultValues<z.output<TResponseSchema> & FieldValues>
}) {
  type TInput = z.output<TResponseSchema> & FieldValues

  type TOutput = z.output<TRequestSchema> & FieldValues

  const form = useForm<TInput, unknown, TOutput>({
    resolver: createRequestResolver<TInput, TRequestSchema>(
      config.requestSchema,
    ),

    defaultValues: config.defaultValues,
  })

  useEffect(() => {
    if (config.defaultValues) {
      form.reset(config.defaultValues)
    }
  }, [config.defaultValues, form])

  return form
}
