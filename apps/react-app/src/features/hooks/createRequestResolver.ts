import type { FieldValues, Resolver } from 'react-hook-form'

import { toNestErrors } from '@hookform/resolvers'
import { z } from 'zod'

export function createRequestResolver<
  TInput extends FieldValues,
  TRequestSchema extends z.ZodType,
>(
  requestSchema: TRequestSchema,
): Resolver<TInput, unknown, z.output<TRequestSchema> & FieldValues> {
  return async (values, _context, options) => {
    const result = await requestSchema.safeParseAsync(
      normalizeEmptyStrings(values),
    )

    if (result.success) {
      return {
        values: result.data as z.output<TRequestSchema> & FieldValues,
        errors: {},
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: Record<string, any> = {}

    for (const issue of result.error.issues) {
      const path = issue.path.join('.')

      errors[path] = {
        type: issue.code,
        message: issue.message,
      }
    }

    return {
      values: {},
      errors: toNestErrors(errors, options),
    }
  }
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
