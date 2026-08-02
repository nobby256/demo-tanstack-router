import { type RuntimeEvent, runtimeEventBus } from '@vendor/router-enhancer'
import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type AppError, normalizeError } from '#/features/error'
import { type DomainError } from '#/features/types/DomainError'

export function MessageNotifier() {
  const notifyActionError = (
    error: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form?: UseFormReturn<any, any, any>,
  ): void => {
    const appError = normalizeError(error)
    if (appError.statusCode === 422) {
      const data = appError.data as DomainError | undefined
      if (data !== undefined) {
        const toasts: string[] = []
        for (const message of data.messages) {
          if (message.fields !== undefined) {
            //fieldがあれば項目にエラーメッセージを表示する
            for (const field of message.fields) {
              form?.setError(field, {
                type: 'manual',
                message: message.message,
              })
            }
          } else {
            //fieldが無ければトースト表示
            toasts[toasts.length] = message.message
          }
        }
        // トースト表示のメッセージがあれば表示
        if (toasts.length > 0) {
          setTimeout(() => alert(toasts), 0)
        }
      }
    } else {
      notifyNavigationError(appError)
    }
  }

  const notifyNavigationError = (error: unknown): void => {
    const appError = normalizeError(error)
    alertError(appError)
  }

  registerEventHandler({ notifyActionError, notifyNavigationError })

  return <></>
}

function registerEventHandler({
  notifyActionError,
  notifyNavigationError,
}: {
  notifyActionError: (
    error: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any, any, any>,
  ) => void
  notifyNavigationError: (error: unknown) => void
}) {
  useEffect(() => {
    const handler = (event: RuntimeEvent) => {
      switch (event.type) {
        case 'recoverable-navigation-error':
          notifyNavigationError(event.error)
          break
        case 'action-error':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const form = event.form as UseFormReturn<any, any, any>
          notifyActionError(event.error, form)
          break
      }
    }
    runtimeEventBus.on('event', handler)
    return () => {
      runtimeEventBus.off('event', handler)
    }
  }, [])
}

function alertError(error: AppError) {
  let message: string
  switch (error.statusCode) {
    case 400:
      message = 'エラー：400'
      break
    case 401:
      message = 'エラー：401'
      break
    case 403:
      message = 'エラー：403'
      break
    case 404:
      message = 'エラー：404'
      break
    case 410:
      message = 'エラー：410'
      break
    default:
      message = `エラー：${error.statusCode}`
      break
  }
  alert(message)
}
