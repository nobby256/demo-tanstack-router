import { Link, useLocation } from '@tanstack/react-router'

import { Route } from '../route'

export function Page() {
  const loaderData = Route.useLoaderData()
  const location = useLocation()

  return (
    <div>
      <h2>Results</h2>
      <ul>
        {loaderData.map((item) => (
          <li key={item.id}>
            <Link
              to="/crud/$id"
              params={{ id: item.id }}
              search={{ _returnTo: location.href }}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
