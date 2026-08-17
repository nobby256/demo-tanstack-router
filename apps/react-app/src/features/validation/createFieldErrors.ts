import type { FieldError, MultipleFieldErrors } from 'react-hook-form'

import { z } from 'zod'

export function createFieldErrors(
  error: z.ZodError,
  criteriaMode: 'firstError' | 'all' = 'firstError',
): Record<string, FieldError> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const errors: Record<string, FieldError> = Object.create(null)

  const validateAllFieldCriteria = criteriaMode === 'all'

  for (const issue of error.issues) {
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

  return errors
}

function appendError(
  error: FieldError,
  issue: z.ZodError['issues'][number],
): void {
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
