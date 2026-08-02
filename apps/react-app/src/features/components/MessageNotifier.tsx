import { type RuntimeEvent, runtimeEventBus } from '@vendor/router-enhancer'
import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type AppError, normalizeError } from '#/features/error'
import { type DomainError } from '#/features/types/DomainError'

interface MessageItem {
  level: string
  message: string
}

export function MessageNotifier() {
  const [messageItems, setMessageItems] = useState<MessageItem[]>([])

  const notifyActionError = (
    error: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form?: UseFormReturn<any, any, any>,
  ): void => {
    const appError = normalizeError(error)
    if (appError.statusCode === 422) {
      const items: MessageItem[] = []

      const data = appError.data as DomainError | undefined
      if (data !== undefined) {
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
            //fieldが無ければ一覧表示
            items[items.length] = {
              level: message.level ?? 'ERROR',
              message: message.message,
            }
          }
        }
      }

      setMessageItems(items)
    } else {
      notifyNavigationError(appError)
    }
  }

  const notifyNavigationError = (error: unknown): void => {
    const appError = normalizeError(error)
    alertError(appError)
  }

  registerEventHandler({ notifyActionError, notifyNavigationError })

  return (
    <>
      <ul>
        {messageItems.map((item, index) => (
          <li key={index}>{`${item.level} ${item.message}`}</li>
        ))}
      </ul>
    </>
  )
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
    /**
     * メッセージ対値ハンドラ
     */
    const handler = (event: RuntimeEvent) => {
      switch (event.type) {
        case 'recoverable-navigation-error':
          // 画面遷移時に発生したリカバリー可能エラーの表示
          notifyNavigationError(event.error)
          break
        case 'action-error':
          // アクションで発生したエラーの表示
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const form = event.form as UseFormReturn<any, any, any>
          notifyActionError(event.error, form)
          break
      }
    }

    // メッセージ通知ハンドラを登録
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
