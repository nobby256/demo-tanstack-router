import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { z } from 'zod'

import { createFieldErrors } from './createFieldErrors'
import { normalizeEmptyStrings } from './normalizeEmptyStrings'

export type ValidateFormOptions = {
  criteriaMode?: 'firstError' | 'all'
  shouldFocusError?: boolean
}

export function validateForm<
  TInput extends FieldValues,
  TSchema extends z.ZodType,
>(
  form: UseFormReturn<TInput>,
  schema: TSchema,
  options?: ValidateFormOptions,
): z.ZodSafeParseResult<z.output<TSchema>> {
  form.clearErrors()

  const result = schema.safeParse(normalizeEmptyStrings(form.getValues()))

  if (!result.success) {
    const errors = createFieldErrors(result.error, options?.criteriaMode)

    for (const [path, error] of Object.entries(errors)) {
      form.setError(path as Path<TInput>, error)
    }

    if (options?.shouldFocusError) {
      const firstIssue = result.error.issues[0]

      if (firstIssue?.path.length) {
        form.setFocus(firstIssue.path.join('.') as Path<TInput>)
      }
    }
  }

  return result
}
