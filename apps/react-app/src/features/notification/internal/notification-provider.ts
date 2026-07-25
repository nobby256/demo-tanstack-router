import {
  normalizeError,
  type RuntimeEvent,
  runtimeEventBus,
} from '@vendor/router-enhancer'
import { useEffect } from 'react'

export function NotificationProvider() {
  useEffect(() => {
    const handler = (event: RuntimeEvent) => {
      switch (event.type) {
        case 'recoverable-error':
          notifyError(event.error)
          break
      }
    }
    runtimeEventBus.on('event', handler)
    return () => {
      runtimeEventBus.off('event', handler)
    }
  }, [])
  return undefined
}

export function notifyError(error: unknown) {
  const appError = normalizeError(error)
  const message = appError.message
  alert(message)
}
