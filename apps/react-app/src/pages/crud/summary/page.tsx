import { Link, useLocation } from '@tanstack/react-router'
import { z } from 'zod'

import { AppBackButton } from '#/features/components/AppBackButton'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
  _returnTo: z.string().optional(),
})

// ─────────────────────────────
// Constants
// ─────────────────────────────

// ─────────────────────────────
// Types
// ─────────────────────────────

// ─────────────────────────────
// Component
// ─────────────────────────────

// ─────────────────────────────────────
// Page Component
// ─────────────────────────────────────
export function PageComponent() {
  // ─────────────────────────────
  // State
  // ─────────────────────────────

  // ─────────────────────────────
  // Route
  // ─────────────────────────────

  const loaderData = Route.useLoaderData()
  const location = useLocation()

  // ─────────────────────────────
  // Form
  // ─────────────────────────────

  const form = usePageForm()

  // ─────────────────────────────
  // Action
  // ─────────────────────────────

  const _actions = useActions({ form })

  // ─────────────────────────────
  // DerivedData (watch/memo)
  // ─────────────────────────────

  const data = loaderData.data

  // ─────────────────────────────
  // Behavior Hooks (effect)
  // ─────────────────────────────

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <div>
      <AppBackButton pathName={'/crud/search'} />
      <h2>Results</h2>
      <ul>
        {data.map((item) => (
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
