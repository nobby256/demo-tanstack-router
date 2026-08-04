import { useMatch, useRouteContext } from '@tanstack/react-router'

import { type RouterContext } from './RouterContext'

export function useCurrentRouteContext(): RouterContext {
  return useRouteContext({ strict: false })
}

export function useCurrentRoute() {
  return useMatch({ strict: false })
}
