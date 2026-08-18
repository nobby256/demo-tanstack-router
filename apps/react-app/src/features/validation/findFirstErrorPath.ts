import type { FieldErrors, FieldValues } from 'react-hook-form'

export function findFirstErrorPath<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
): string | undefined {
  return find(errors)
}

function find(value: unknown, prefix = ''): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const record = value as Record<string, unknown>

  if ('type' in record || 'message' in record) {
    return prefix
  }

  for (const [key, child] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key

    const result = find(child, path)

    if (result) {
      return result
    }
  }

  return undefined
}
