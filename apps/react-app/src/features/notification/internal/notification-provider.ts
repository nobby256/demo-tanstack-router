import { normalizeError } from '@vendor/router-enhancer'
import { useEffect } from 'react'

import { notificationBus, type NotificationEvent } from './notification-bus'

export function NotificationProvider() {
  useEffect(() => {
    const handler = (event: NotificationEvent) => {
      switch (event.type) {
        case 'error':
          notifyError(event.error)
          break
        case 'message':
          notifyMessage(event.message)
          break
      }
    }

    notificationBus.on('notification', handler)

    return () => {
      notificationBus.off('notification', handler)
    }
  }, [])

  return null
}

function notifyError(error: Error) {
  const appError = normalizeError(error)
  const message = appError.message
  alert(message)
}

function notifyMessage(messages: string[]) {
  alert(messages.join('\n'))
}
