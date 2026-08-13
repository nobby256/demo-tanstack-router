import { Link } from '@tanstack/react-router'
import { useQueryState } from '@vendor/router-enhancer'
import { Controller } from 'react-hook-form'
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

  const [check, setCheck] = useQueryState(queryStateSchema, '_check')

  // ─────────────────────────────
  // Route
  // ─────────────────────────────

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

  const _data = form.getValues('data')

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <>
      <style>{`
        .nav-link a {
          display: block;
        }
      `}</style>
      <div>
        <h2>Search</h2>
        <div>
          <Controller
            name="data.keyword"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <input placeholder="keyword" {...field} />
                <span className="error-message">
                  {fieldState.error?.message}
                </span>
              </>
            )}
          />
        </div>
        <div>
          <Controller
            name="data.category"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <input placeholder="category" {...field} />
                <span className="error-message">
                  {fieldState.error?.message}
                </span>
              </>
            )}
          />
        </div>
        <div>
          <input
            type="checkbox"
            checked={check ?? false}
            onChange={(e) => setCheck(e.target.checked)}
          />
          _check1:useQueryState使用
        </div>
        <div>
          <button type="button" onClick={actions.submit}>
            Search
          </button>
        </div>

        <hr />
        <Link to="/crud/error-handling">エラーハンドリング画面</Link>
      </div>
    </>
  )
}
