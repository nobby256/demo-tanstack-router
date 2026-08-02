import { useEffect } from 'react'

import { messageEventBus } from './message-event-bus'

export function AlertMessageProvider() {
  useEffect(() => {
    const handler = ({ message }: { message: string }) => {
      alert(message)
    }

    messageEventBus.on('alertMessage', handler)

    return () => {
      messageEventBus.off('alertMessage', handler)
    }
  }, [])

  return undefined
}
