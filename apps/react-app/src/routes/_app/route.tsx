/**
 * Route Layer: App
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { initialLoaderPolicy } from '@vendor/router-enhancer'

export const Route = createFileRoute('/_app')({
  // Loader Policy
  ...initialLoaderPolicy,

  loaderDeps: () => ({}),

  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Sample App</h1>
      <hr />
      <Outlet />
    </div>
  )
}
