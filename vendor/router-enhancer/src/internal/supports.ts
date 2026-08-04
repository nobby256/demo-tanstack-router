import { useMatch, useRouteContext } from '@tanstack/react-router'

export function useCurrentRouteContext() {
  return useRouteContext({ strict: false })
}

export function useCurrentRoute() {
  return useMatch({ strict: false })
}
