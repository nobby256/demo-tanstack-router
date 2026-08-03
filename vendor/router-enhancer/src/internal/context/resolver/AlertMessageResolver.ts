import type { AppError } from '../adapter/AppError'

export interface AlertMessageResolver {
  resolve(error: AppError): string
}
