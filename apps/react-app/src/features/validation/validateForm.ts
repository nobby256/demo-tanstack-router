import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { z } from 'zod'

import { createFieldErrors } from './createFieldErrors'
import { findFirstErrorPath } from './findFirstErrorPath'
import { normalizeEmptyStrings } from './normalizeEmptyStrings'

export type ValidateFormOptions = {
  criteriaMode?: 'firstError' | 'all'
  shouldFocusError?: boolean
}

type ValidationFailedResult = {
  success: false
}

export async function validateForm<
  TInput extends FieldValues,
  TSchema extends z.ZodType,
>(
  form: UseFormReturn<TInput>,
  schema: TSchema,
  options?: ValidateFormOptions,
): Promise<z.ZodSafeParseSuccess<z.output<TSchema>> | ValidationFailedResult> {
  form.clearErrors()

  const rhfValid = await form.trigger()

  if (!rhfValid) {
    if (options?.shouldFocusError) {
      const firstErrorPath = findFirstErrorPath(form.formState.errors)

      if (firstErrorPath) {
        form.setFocus(firstErrorPath as Path<TInput>)
      }
    }

    return {
      success: false,
    }
  }

  const values = form.getValues()
  const normalizedValues = normalizeEmptyStrings(values)
  const result = schema.safeParse(normalizedValues)

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

    return {
      success: false,
    }
  }

  return result
}
