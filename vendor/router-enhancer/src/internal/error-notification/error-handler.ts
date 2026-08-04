import type { RouterContext } from '../context'

import { applyNotifications } from './applyNotifications'

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
  const { errorAdapter: adapter, errorTransformer: transformer } = routerContext

  const appError = adapter.normalize(error)

  // 業務エラーに変換
  let notifications = transformer.transform(appError)

  // 業務エラーでなければalert扱い
  if (!notifications) {
    notifications = [
      {
        type: 'alert',
        error: appError,
      },
    ]
  }

  applyNotifications(notifications, routerContext.alertMessageResolver, form)
}
