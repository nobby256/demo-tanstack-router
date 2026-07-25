import { useRef } from 'react'

import { notifyActionError } from './actionErrorNotifier'

type ActionHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => void | Promise<void>

type Actions = Record<string, ActionHandler>

function useWrappedActions<TActions extends Actions>(
  actions: TActions,
): TActions {
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const wrappedRef = useRef<TActions | null>(null)

  if (wrappedRef.current == null) {
    const wrapped = {} as TActions
    for (const key of Object.keys(actions) as Array<keyof TActions>) {
      wrapped[key] = (async (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
      ) => {
        try {
          const action = actionsRef.current[key]
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await action(...args)
        } catch (error) {
          notifyActionError(error)
        }
      }) as TActions[typeof key]
    }
    wrappedRef.current = wrapped
  }

  return wrappedRef.current
}

export function useActionBoundary<
  TArgs extends unknown[],
  TActions extends Actions,
>(factory: (...args: TArgs) => TActions): (...args: TArgs) => TActions {
  return (...args: TArgs) => {
    const actions = factory(...args)
    return useWrappedActions(actions)
  }
}
