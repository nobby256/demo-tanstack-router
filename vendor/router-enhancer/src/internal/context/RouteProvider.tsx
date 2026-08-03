import { type AnyRoute } from '@tanstack/react-router'
import { createContext, type ReactNode, useContext } from 'react'

const RouteContext = createContext<AnyRoute | undefined>(undefined)

export type RouteProviderProps = {
  children: ReactNode
  route: AnyRoute
}

export function RouteProvider({ children, route }: RouteProviderProps) {
  return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
}

export function useRoute(): AnyRoute {
  const route = useContext(RouteContext)

  if (!route) {
    throw new Error('RouteProvider is required.')
  }

  return route
}
