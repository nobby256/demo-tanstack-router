import { useRouteContext } from '@tanstack/react-router'
import { useRef } from 'react'

import { type RouterContext } from '../context'
import { handleError } from '../error-notification'

type ActionHandler = (...args: never[]) => void | Promise<void>

type Actions = Record<string, ActionHandler>

/**
 * Action Boundary が要求する最低限の Context
 */
export type ActionContext = {
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

  const routerContext: RouterContext = useRouteContext({ strict: false })

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
              handleError(contextRef.current, routerContext, error)
            }) as ReturnType<TActions[typeof key]>
          }

          return result
        } catch (error) {
          handleError(error, routerContext, contextRef.current)

          return undefined as ReturnType<TActions[typeof key]>
        }
      }) as WrappedActions<TActions>[typeof key]
    }

    wrappedRef.current = wrapped
  }

  return wrappedRef.current
}
