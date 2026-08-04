import { useRef } from 'react'

import { type RouterContext, useCurrentRouteContext } from '../context'
import { applyNotifications, type FormHandler } from '../error-notification'

type ActionHandler = (...args: never[]) => void | Promise<void>

type Actions = Record<string, ActionHandler>

/**
 * Action Boundary が要求する最低限の Context
 */
export type ActionContext = {
  form?: FormHandler // RHF互換のインタフェース
}

export function useActionBoundary<
  TContext extends ActionContext,
  TActions extends Actions,
>(
  factory: (context: TContext) => TActions,
): (context: TContext) => WrappedActions<TActions> {
  return (context: TContext) => {
    const actions = factory(context)

    return useWrappedActions(actions, context)
  }
}

type WrappedActions<TActions extends Actions> = {
  [K in keyof TActions]: (
    ...args: Parameters<TActions[K]>
  ) => ReturnType<TActions[K]>
}

function useWrappedActions<
  TContext extends ActionContext,
  TActions extends Actions,
>(actions: TActions, context: TContext): WrappedActions<TActions> {
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  const contextRef = useRef(context)
  contextRef.current = context

  const routerContext = useCurrentRouteContext()

  const wrappedRef = useRef<WrappedActions<TActions> | null>(null)

  if (wrappedRef.current == null) {
    const wrapped = {} as WrappedActions<TActions>

    for (const key of Object.keys(actions) as Array<keyof TActions>) {
      wrapped[key] = ((...args: Parameters<TActions[typeof key]>) => {
        try {
          const action = actionsRef.current[key]

          const result = action(...args)

          if (result instanceof Promise) {
            return result.catch((error) => {
              handleError(error, routerContext, contextRef.current.form)
            }) as ReturnType<TActions[typeof key]>
          }

          return result
        } catch (error) {
          handleError(error, routerContext, contextRef.current.form)

          return undefined as ReturnType<TActions[typeof key]>
        }
      }) as WrappedActions<TActions>[typeof key]
    }

    wrappedRef.current = wrapped
  }

  return wrappedRef.current
}

function handleError(
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
