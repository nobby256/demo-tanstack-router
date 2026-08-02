import { type RuntimeEvent, runtimeEventBus } from '@vendor/router-enhancer'
import { useEffect } from 'react'

import { type AppError, normalizeError } from '#/features/error'

import {
  type FieldMessageItem,
  messageEventBus,
  type PageMessageItem,
} from './message-event-bus'

interface DomainMessage {
  level: 'info' | 'warn' | 'error'
  message: string
  fields?: string[]
}

interface DomainErrorRepsonseBody {
  messages: DomainMessage[]
}

export function MessageProvider() {
  useEffect(() => {
    const handler = (event: RuntimeEvent) => {
      processError(event)
    }

    runtimeEventBus.on('event', handler)

    return () => {
      runtimeEventBus.off('event', handler)
    }
  }, [])

  return undefined
}

function processError(event: RuntimeEvent) {
  const appError = normalizeError(event.error)

  if (appError.statusCode === 422) {
    processDomainError(appError, event)
    return
  }

  messageEventBus.emit('alertMessage', {
    message: getAlertMessage(appError),
  })
}

function processDomainError(error: AppError, event: RuntimeEvent) {
  const data = error.data as DomainErrorRepsonseBody | undefined

  if (!data) {
    return
  }

  const formErrors: FieldMessageItem[] = []
  const messages: DomainMessage[] = []

  for (const item of data.messages) {
    if (item.fields?.length) {
      for (const field of item.fields) {
        formErrors.push({
          field,
          message: item.message,
        })
      }
      continue
    }

    messages.push({
      level: item.level ?? 'ERROR',
      message: item.message,
    })
  }

  if (formErrors.length > 0 && event.type === 'action-error') {
    messageEventBus.emit('fieldMessage', {
      items: formErrors,
      form: event.form,
    })
  }

  if (messages.length > 0) {
    messageEventBus.emit('pageMessage', {
      items: messages,
    })
  }
}

function getAlertMessage(error: AppError): string {
  switch (error.statusCode) {
    case 400:
      return 'エラー：400'

    case 401:
      return 'エラー：401'

    case 403:
      return 'エラー：403'

    case 404:
      return 'エラー：404'

    case 410:
      return 'エラー：410'

    default:
      return `エラー：${error.statusCode}`
  }
}
