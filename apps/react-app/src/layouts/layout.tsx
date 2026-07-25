import { Outlet } from '@tanstack/react-router'

export function LayoutComponent() {
  return (
    <div>
      <h1>Sample App</h1>
      <hr />
      <Outlet />
    </div>
  )
}
