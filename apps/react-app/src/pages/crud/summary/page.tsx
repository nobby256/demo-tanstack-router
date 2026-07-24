import { Link, useLocation } from '@tanstack/react-router'
import { z } from 'zod'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
  _returnTo: z.string(),
  _check1: z.boolean().optional(),
  _check2: z.boolean().optional(),
})
type QueryState = z.infer<typeof queryStateSchema>

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

  const actions = useActions(form)

  // ─────────────────────────────
  // DerivedData (watch/memo)
  // ─────────────────────────────

  // ─────────────────────────────
  // Effect
  // ─────────────────────────────

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
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
