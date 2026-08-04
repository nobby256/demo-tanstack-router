import type { RouterContext } from '../context'

import { applyNotifications } from './notification-handler'

export type FormHandler = {
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

export function handleError(
  error: unknown,
  routerContext: RouterContext,
  form?: FormHandler,
): void {
  const appError = routerContext.errorAdapter.normalize(error)

  const notifications = routerContext.errorTransformer.transform(appError)

  applyNotifications(notifications, routerContext, form)
}
