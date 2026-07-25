import { useRef } from 'react'

import { notifyActionError } from './actionErrorNotifier'

type ActionHandler = (...args: never[]) => void | Promise<void>

type Actions = Record<string, ActionHandler>

type WrappedActions<TActions extends Actions> = {
  [K in keyof TActions]: (
    ...args: Parameters<TActions[K]>
  ) => ReturnType<TActions[K]>
}

function useWrappedActions<TActions extends Actions>(
  actions: TActions,
): WrappedActions<TActions> {
  const actionsRef = useRef(actions)
  actionsRef.current = actions

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
              notifyActionError(error)
            }) as ReturnType<TActions[typeof key]>
          }

          return result
        } catch (error) {
          notifyActionError(error)

          return undefined as ReturnType<TActions[typeof key]>
        }
      }) as WrappedActions<TActions>[typeof key]
    }

    wrappedRef.current = wrapped
  }

  return wrappedRef.current
}

export function useActionBoundary<
  TArgs extends unknown[],
  TActions extends Actions,
>(
  factory: (...args: TArgs) => TActions,
): (...args: TArgs) => WrappedActions<TActions> {
  return (...args: TArgs) => {
    const actions = factory(...args)
    return useWrappedActions(actions)
  }
}
