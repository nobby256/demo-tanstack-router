// createFieldErrors.ts
import type { FieldError, MultipleFieldErrors } from 'react-hook-form'

import { z } from 'zod'

const ROOT_ERROR_PREFIX = 'root.'

export function createFieldErrors(
  error: z.ZodError,
  criteriaMode: 'firstError' | 'all' = 'firstError',
): Record<string, FieldError> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const errors: Record<string, FieldError> = Object.create(null)

  for (const issue of error.issues) {
    const path = toRHFErrorPath(issue.path)
    const type = toRHFErrorType(issue)

    const currentError = errors[path]

    if (!currentError) {
      errors[path] = {
        type,
        message: issue.message,
      }
    }

    if (criteriaMode === 'all') {
      appendError(errors[path], type, issue.message)
    }
  }

  return errors
}

export function isRHFRootErrorPath(path: string): boolean {
  return path.startsWith(ROOT_ERROR_PREFIX)
}

function toRHFErrorPath(path: PropertyKey[]): string {
  if (path.length === 0) {
    return 'root.validation'
  }

  return path.map(String).join('.')
}

function toRHFErrorType(issue: z.ZodIssue): string {
  if (
    issue.code === 'invalid_type' &&
    'input' in issue &&
    issue.input === undefined
  ) {
    return 'required'
  }

  return issue.code
}

function appendError(error: FieldError, type: string, message: string): void {
  const types = error.types ?? {}
  const currentMessage = types[type]

  error.types = {
    ...types,
    [type]:
      currentMessage === undefined
        ? message
        : Array.isArray(currentMessage)
          ? [...currentMessage, message]
          : [currentMessage, message],
  } as MultipleFieldErrors
}
