import {
  type AnyRouter,
  useMatch,
  useRouteContext,
} from '@tanstack/react-router'

import { type RouterContext } from './RouterContext'

export function useCurrentRouteContext(): RouterContext {
  return useRouteContext({ strict: false })
}

export function useCurrentRoute() {
  return useMatch({ strict: false })
}

export function leafRouteContext(router: AnyRouter): RouterContext {
  // matchesの中の末端のrouteを取得
  const match = router.state.matches.at(-1)
  if (match) {
    return match.context as RouterContext
  }
  throw new Error('routerのhatchesがゼロ件。')
}
