// src/validation/validateForm.ts

import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { z } from 'zod'

import {
  createFieldErrors,
  type CriteriaMode,
  isRHFRootErrorPath,
} from './createFieldErrors'
import { normalizeEmptyStrings } from './normalizeEmptyStrings'

export type ValidateFormOptions = {
  criteriaMode?: CriteriaMode
  shouldFocusError?: boolean
}

export function validateForm<
  TSchema extends z.ZodTypeAny,
  TInput extends FieldValues & z.input<TSchema>,
>(
  form: UseFormReturn<TInput>,
  schema: TSchema,
  {
    criteriaMode = 'firstError',
    shouldFocusError = false,
  }: ValidateFormOptions = {},
) {
  form.clearErrors()

  const values = form.getValues()
  const normalizedValues = normalizeEmptyStrings(values)

  const result = schema.safeParse(normalizedValues, {
    reportInput: true,
  })

  if (result.success) {
    return result
  }

  const errors = createFieldErrors(result.error, criteriaMode)

  for (const [path, error] of Object.entries(errors)) {
    form.setError(path as Path<TInput>, error)
  }

  if (shouldFocusError) {
    const firstFocusablePath = Object.keys(errors).find(
      (path) => !isRHFRootErrorPath(path),
    )

    if (firstFocusablePath) {
      form.setFocus(firstFocusablePath as Path<TInput>)
    }
  }

  return result
}
