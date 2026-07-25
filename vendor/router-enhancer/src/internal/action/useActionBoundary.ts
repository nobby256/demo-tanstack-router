import type { UseFormReturn } from 'react-hook-form'

import { useRef } from 'react'

import { runtimeEventBus } from '../event'

type ActionHandler = (...args: never[]) => void | Promise<void>

type Actions = Record<string, ActionHandler>

/**
 * Action Boundary が要求する最低限の Context
 */
export type ActionContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TForm extends UseFormReturn<any, any, any> = UseFormReturn<any, any, any>,
> = {
  form: TForm
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
              onError(contextRef.current, error)
            }) as ReturnType<TActions[typeof key]>
          }

          return result
        } catch (error) {
          onError(contextRef.current, error)

          return undefined as ReturnType<TActions[typeof key]>
        }
      }) as WrappedActions<TActions>[typeof key]
    }

    wrappedRef.current = wrapped
  }

  return wrappedRef.current
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

function onError<TContext extends ActionContext>(
  context: TContext,
  error: unknown,
) {
  // const _form = context.form
  // 将来ここで ValidationError を form.setError へ変換可能
  //
  // if (isValidationError(error)) {
  //   applyValidationError(context.form, error)
  //   return
  // }

  runtimeEventBus.emit('event', {
    type: 'recoverable-error',
    error,
  })
}
