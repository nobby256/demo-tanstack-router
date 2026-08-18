// validateForm.ts
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { z } from 'zod'

import { createFieldErrors, isRHFRootErrorPath } from './createFieldErrors'

export type ValidateFormOptions = {
  criteriaMode?: 'firstError' | 'all'
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

  for (const [name, error] of Object.entries(errors)) {
    form.setError(name as Path<TInput>, error)
  }

  if (shouldFocusError) {
    const firstFocusablePath = Object.keys(errors).find(
      (name) => !isRHFRootErrorPath(name),
    )

    if (firstFocusablePath) {
      form.setFocus(firstFocusablePath as Path<TInput>)
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

  if (isNormalizableObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeEmptyStrings(item),
      ]),
    ) as T
  }

  return value
}

function isNormalizableObject(
  value: unknown,
): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false
  }

  if (value instanceof Date) {
    return false
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return false
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return false
  }

  if (value instanceof Map || value instanceof Set) {
    return false
  }

  return Object.getPrototypeOf(value) === Object.prototype
}
