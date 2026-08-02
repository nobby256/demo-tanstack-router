import { type RuntimeEvent, runtimeEventBus } from '@vendor/router-enhancer'
import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type AppError, normalizeError } from '#/features/error'
import { type DomainError } from '#/features/types/DomainError'

export function MessageNotifier() {
  useEffect(() => {
    const handler = (event: RuntimeEvent) => {
      const appError = normalizeError(event.error)
      switch (event.type) {
        case 'recoverable-navigation-error':
          alertError(appError)
          break
        case 'action-error':
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const form = event.form as UseFormReturn<any, any, any>
          notifyActionError(appError, form)
          break
      }
    }
    runtimeEventBus.on('event', handler)
    return () => {
      runtimeEventBus.off('event', handler)
    }
  }, [])
  return <></>
}

function notifyActionError(
  error: AppError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<any, any, any>,
) {
  if (error.statusCode === 422) {
    const data = error.data as DomainError | undefined
    if (data !== undefined) {
      const toasts: string[] = []
      for (const message of data.messages) {
        if (message.fields !== undefined) {
          //fieldがあれば項目にエラーメッセージを表示する
          for (const field of message.fields) {
            form?.setError(field, { type: 'manual', message: message.message })
          }
        } else {
          //fieldが無ければトースト表示
          toasts[toasts.length] = message.message
        }
      }
      // トースト表示のメッセージがあれば表示
      if (toasts.length > 0) {
        alert(toasts)
      }
    }
  } else {
    alertError(error)
  }
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

export function notifyError(error: unknown) {
  const appError = normalizeError(error)
  const message = appError.message
  alert(message)
}
