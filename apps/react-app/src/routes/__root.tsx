import { createRootRouteWithContext } from '@tanstack/react-router'

import { LayoutComponent } from '#/layouts/layout'

export const Route = createRootRouteWithContext()({
  staleTime: Infinity,
  gcTime: Infinity,
  shouldReload: () => false,
  loaderDeps: () => ({}),
  component: LayoutComponent,
})
