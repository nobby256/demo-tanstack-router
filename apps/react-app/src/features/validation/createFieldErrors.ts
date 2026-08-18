// src/validation/createFieldErrors.ts

import type { FieldError, MultipleFieldErrors } from 'react-hook-form'

import { z } from 'zod'

import { isRequiredIssue } from './requiredIssue'

export type CriteriaMode = 'firstError' | 'all'

type ZodIssue = z.core.$ZodIssue

const ROOT_VALIDATION_ERROR_PATH = 'root.validation'
const ROOT_ERROR_PREFIX = 'root.'

export function createFieldErrors(
  error: z.ZodError,
  criteriaMode: CriteriaMode = 'firstError',
): Record<string, FieldError> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const errors: Record<string, FieldError> = Object.create(null)

  for (const issue of error.issues) {
    const path = toRHFErrorPath(issue.path)
    const type = toFieldErrorType(issue)

    if (!errors[path]) {
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

function toRHFErrorPath(path: readonly PropertyKey[]): string {
  if (path.length === 0) {
    return ROOT_VALIDATION_ERROR_PATH
  }

  return path.map(String).join('.')
}

function toFieldErrorType(issue: ZodIssue): string {
  return isRequiredIssue(issue) ? 'required' : issue.code
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
