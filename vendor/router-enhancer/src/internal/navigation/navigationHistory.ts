import {
  type AnyRouter,
  type ParsedLocation,
  type RegisteredRouter,
  type RouterHistory,
  useRouter,
} from '@tanstack/react-router'

type RouterPath = keyof RegisteredRouter['routesByPath']

const histories: Array<ParsedLocation | undefined> = []

let initialized = false

export function initNavigationHistory(router: AnyRouter): void {
  if (initialized) {
    return
  }

  initialized = true

  router.subscribe('onBeforeLoad', (event) => {
    const { toLocation } = event

    const index = toLocation.state.__TSR_index

    if (typeof index !== 'number') {
      return
    }

    histories[index] = toLocation
  })
}

function findPreviousLocation(
  router: AnyRouter,
  pathname: RouterPath,
): ParsedLocation | undefined {
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
    const targetIndex = location.state.__TSR_index
    history.go(targetIndex - currentIndex)
  }
}
