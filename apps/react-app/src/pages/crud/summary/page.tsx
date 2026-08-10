import { Link } from '@tanstack/react-router'
import { useBackTo } from '@vendor/router-enhancer'
import { z } from 'zod'

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

  const back = useBackTo('/crud/search')

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <div>
      <button type="button" onClick={back} disabled={!back}>
        戻る
      </button>
      <h2>Results</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <Link to="/crud/$id" params={{ id: item.id }}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
