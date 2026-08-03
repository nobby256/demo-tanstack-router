import type { RouterContext } from '../context'

import { applyNotifications } from './notification-handler'

export type ErrorContext = {
  form?: {
    setError(
      name: string,
      error: {
        type?: string
        message?: string
      },
      options?: {
        shouldFocus: boolean
      },
    ): void
  }
}

export function handleError(
  context: ErrorContext,
  routerContext: RouterContext,
  error: unknown,
): void {
  const appError = routerContext.errorAdapter.normalize(error)

  const notifications = routerContext.errorTransformer.transform(appError)

  applyNotifications(context, routerContext, notifications)
}
