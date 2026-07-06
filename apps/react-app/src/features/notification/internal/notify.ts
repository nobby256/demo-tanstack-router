import { normalizeError } from '@vendor/router-enhancer'

export function notifyError(error: unknown) {
  const appError = normalizeError(error)
  const message = appError.message
  alert(message)
}
