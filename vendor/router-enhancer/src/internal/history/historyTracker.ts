import { type AnyRouter, type ParsedLocation } from '@tanstack/react-router'

export const histories: Array<ParsedLocation | undefined> = []

let initialized = false

export function initHistoryTracker(router: AnyRouter): void {
  if (initialized) {
    return
  }
  initialized = true

  router.subscribe('onBeforeLoad', (event) => {
    const { toLocation } = event
    const index = toLocation.state.__TSR_index
    histories[index] = toLocation
  })
}
