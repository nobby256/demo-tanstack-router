import mitt from 'mitt'

export type RuntimeEvent =
  | {
      type: 'navigation-error'
      error: unknown
    }
  | {
      type: 'action-error'
      error: unknown
      form?: unknown
    }

export const runtimeEventBus = mitt<{
  event: RuntimeEvent
}>()
