import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { z } from 'zod'

import { createFieldErrors } from './createFieldErrors'

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
):
  | z.ZodSafeParseSuccess<z.output<TSchema>>
  | z.ZodSafeParseError<z.output<TSchema>> {
  form.clearErrors()

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
  }

  return result
}

export function normalizeEmptyStrings<T>(value: T): T {
  if (value === '') {
    return undefined as T
  }

  if (Array.isArray(value)) {
    return value.map(normalizeEmptyStrings) as T
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeEmptyStrings(item),
      ]),
    ) as T
  }

  return value
}
