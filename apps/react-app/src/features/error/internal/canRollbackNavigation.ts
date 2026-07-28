import { normalizeError } from './normalizeError'

export function canRollbackNavigation(error: unknown) {
  const appError = normalizeError(error)
  return appError.category === 'Recoverble'
}
