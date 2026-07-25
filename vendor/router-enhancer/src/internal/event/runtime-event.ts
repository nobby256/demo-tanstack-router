import type { UseFormReturn } from 'react-hook-form'

import mitt from 'mitt'

export type RuntimeEvent =
  | {
      type: 'navigation-error'
      error: unknown
    }
  | {
      type: 'action-error'
      error: unknown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form?: UseFormReturn<any, any, any>
    }

export const runtimeEventBus = mitt<{
  event: RuntimeEvent
}>()
