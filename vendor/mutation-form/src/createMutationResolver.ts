import type {
  FieldError,
  FieldValues,
  MultipleFieldErrors,
  Resolver,
} from 'react-hook-form'

import { toNestErrors } from '@hookform/resolvers'
import { z } from 'zod'

export function createMutationResolver<
  TInput extends FieldValues,
  TMutationSchema extends z.ZodType,
>(
  mutationSchema: TMutationSchema,
): Resolver<TInput, unknown, z.output<TMutationSchema> & FieldValues> {
  return (values, _context, options) => {
    const result = mutationSchema.safeParse(normalizeEmptyStrings(values))

    if (result.success) {
      return {
        values: result.data as z.output<TMutationSchema> & FieldValues,
        errors: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const errors: Record<string, FieldError> = Object.create(null)

    const validateAllFieldCriteria =
      options.criteriaMode === 'all' && !options.shouldUseNativeValidation

    for (const issue of result.error.issues) {
      const path =
        issue.path.length === 0 ? 'root.validation' : issue.path.join('.')

      const currentError = errors[path]

      if (!currentError) {
        errors[path] = {
          type: issue.code,
          message: issue.message,
        }
      }

      if (validateAllFieldCriteria) {
        appendError(errors[path], issue)
      }
    }

    return {
      values: {},
      errors: toNestErrors(errors, options),
    }
  }
}

function appendError(error: FieldError, issue: z.ZodIssue): void {
  const types = error.types ?? {}
  const currentMessage = types[issue.code]

  error.types = {
    ...types,
    [issue.code]:
      currentMessage === undefined
        ? issue.message
        : Array.isArray(currentMessage)
          ? [...currentMessage, issue.message]
          : [currentMessage, issue.message],
  } as MultipleFieldErrors
}

function normalizeEmptyStrings<T>(value: T): T {
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
