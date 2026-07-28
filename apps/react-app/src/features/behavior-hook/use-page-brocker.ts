import { useBlocker } from '@tanstack/react-router'

export function usePageBlocker(isDirty: boolean) {
  useBlocker({
    shouldBlockFn: ({ current: _current, next: _next, action: _action }) => {
      if (!isDirty) {
        return false
      }
      const shouldLeave = window.confirm('Are you sure you want to leave?')
      return !shouldLeave
    },
  })
}
