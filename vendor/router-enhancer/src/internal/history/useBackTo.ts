import {
  type AnyRouter,
  type RegisteredRouter,
  type RouterHistory,
  useRouter,
} from '@tanstack/react-router'

import { histories, type HistoryEntry } from './historyTracker'

type RouterPath = keyof RegisteredRouter['routesByPath']

function findPreviousLocation(
  router: AnyRouter,
  pathname: RouterPath,
): HistoryEntry | undefined {
  const history = router.history as RouterHistory

  const currentIndex = history.location.state.__TSR_index

  for (let i = currentIndex - 1; i >= 0; i--) {
    const location = histories[i]

    if (!location) {
      continue
    }

    if (location.pathname === pathname) {
      return location
    }
  }

  return undefined
}

export function useBackTo(pathname: RouterPath): (() => void) | undefined {
  const router = useRouter()

  const location = findPreviousLocation(router, pathname)

  if (!location) {
    return undefined
  }

  return () => {
    const history = router.history as RouterHistory

    const currentIndex = history.location.state.__TSR_index

    history.go(location.index - currentIndex)
  }
}
