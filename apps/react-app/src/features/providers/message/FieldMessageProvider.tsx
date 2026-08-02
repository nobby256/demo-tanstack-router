import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { messageEventBus } from './message-event-bus'

export function FieldMessageProvider() {
  useEffect(() => {
    const handler = ({
      items,
      form,
    }: {
      items: {
        field: string
        message: string
      }[]
      form: unknown
    }) => {
      const rhf = form as UseFormReturn<Record<string, unknown>>

      for (const item of items) {
        rhf.setError(item.field, {
          type: 'manual',
          message: item.message,
        })
      }
    }

    messageEventBus.on('fieldMessage', handler)

    return () => {
      messageEventBus.off('fieldMessage', handler)
    }
  }, [])

  return undefined
}
