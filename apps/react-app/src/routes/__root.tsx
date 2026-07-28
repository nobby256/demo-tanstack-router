import { createRootRouteWithContext } from '@tanstack/react-router'
import { type RouterContext } from '@vendor/router-enhancer'

import { LayoutComponent } from '#/layouts/layout'

export const Route = createRootRouteWithContext<RouterContext>()({
  staleTime: Infinity,
  gcTime: Infinity,
  shouldReload: () => false,
  loaderDeps: () => ({}),
  component: LayoutComponent,
})
