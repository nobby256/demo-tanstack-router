import { useQueryState } from '@vendor/router-enhancer'
import { Controller } from 'react-hook-form'
import { z } from 'zod'

import { AppBackButton } from '#/features/components/AppBackButton'

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
  // Behavior Hooks (effect)
  // ─────────────────────────────

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <div>
      <AppBackButton pathName={'/crud/search'} />
      <h2>Search</h2>
      <div>
        <Controller
          name="keyword"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <input placeholder="keyword" {...field} />
              <span className="error-message">{fieldState.error?.message}</span>
            </>
          )}
        />
      </div>
      <div>
        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <input placeholder="category" {...field} />
              <span className="error-message">{fieldState.error?.message}</span>
            </>
          )}
        />
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
