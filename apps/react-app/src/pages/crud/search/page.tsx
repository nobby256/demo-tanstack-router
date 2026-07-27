import { useQueryState } from '@vendor/router-enhancer'
import { z } from 'zod'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
  _check: z.boolean().optional(),
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

  const [check, setCheck] = useQueryState(Route, '_check', false)

  // ─────────────────────────────
  // Route
  // ─────────────────────────────

  const _loaderData = Route.useLoaderData()

  // ─────────────────────────────
  // Form
  // ─────────────────────────────

  const form = usePageForm()

  // ─────────────────────────────
  // Action
  // ─────────────────────────────

  const actions = useActions({ form })

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
      <h2>Search</h2>
      <div>
        <input placeholder="keyword" {...form.register('keyword')} />
        {form.formState.errors.keyword && (
          <span className="error-message">
            {form.formState.errors.keyword.message}
          </span>
        )}
      </div>
      <div>
        <input placeholder="category" {...form.register('category')} />
        {form.formState.errors.category && (
          <span className="error-message">
            {form.formState.errors.category.message}
          </span>
        )}
      </div>
      <div>
        <input
          type="checkbox"
          checked={check}
          onChange={(e) => setCheck(e.target.checked)}
        />
        _check1:useQueryState使用
      </div>
      <div>
        <button type="button" onClick={actions.onSubmit}>
          Search
        </button>
      </div>
    </div>
  )
}
