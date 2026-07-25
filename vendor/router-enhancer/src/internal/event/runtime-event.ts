import mitt from 'mitt'

export type RuntimeEvent = {
  type: 'recoverable-error'
  error: unknown
}

export const runtimeEventBus = mitt<{
  event: RuntimeEvent
}>()
