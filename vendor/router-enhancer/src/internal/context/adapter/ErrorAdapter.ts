import type { AppError } from './AppError'

export interface ErrorAdapter {
  normalize(error: unknown): AppError
}
