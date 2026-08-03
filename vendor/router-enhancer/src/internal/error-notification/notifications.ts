import { useSyncExternalStore } from 'react'

import type { MessageItem } from '../context'

let items: MessageItem[] = []

const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export function addNotifications(...notifications: MessageItem[]): void {
  items = [...items, ...notifications]

  notify()
}

export function clearNotifications(): void {
  items = []

  notify()
}

export function useNotifications(): readonly [
  MessageItem[],
  typeof clearNotifications,
] {
  const value = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    () => items,
  )

  return [value, clearNotifications]
}
