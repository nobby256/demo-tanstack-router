import { useLeaveGuard, useQueryState } from '@vendor/router-enhancer'
import { useState } from 'react'
import { z } from 'zod'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
  _check1: z.boolean().optional(),
  _check2: z.boolean().optional(),
  _check3: z.boolean().optional(),
  check: z.boolean().optional(),
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

  const [check1, setCheck1] = useQueryState(Route, '_check1', false)

  // ─────────────────────────────
  // Route
  // ─────────────────────────────

  const loaderData = Route.useLoaderData()

  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const check = search.check ?? false
  const check2 = search._check2 ?? false
  const check3 = search._check3 ?? false
  const changeChack = async () => {
    await navigate({
      search: {
        ...search,
        check: !check,
      },
      replace: true,
    })
  }
  const changeChack2 = async () => {
    await navigate({
      search: {
        ...search,
        _check2: !check2,
      },
      replace: true,
    })
  }
  const changeChack3 = async () => {
    await navigate({
      to: '/crud/search',
      search: (prev) => ({
        prev,
        _check3: !prev._check3,
      }),
      replace: true,
    })
  }

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
      <form>
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
            checked={check1}
            onChange={(e) => setCheck1(e.target.checked)}
          />
          _check1:useQueryState使用
        </div>
        <div>
          <input type="checkbox" checked={check2} onChange={changeChack2} />
          _check2:navigate使用、to無し
        </div>
        <div>
          <input type="checkbox" checked={check3} onChange={changeChack3} />
          _check3:navigate使用、toあり
        </div>
        <div>
          <input type="checkbox" checked={check} onChange={changeChack} />
          check:navigate使用、toなし
        </div>
        <div>
          <button type="submit" onClick={actions.onSubmit}>
            Search
          </button>
        </div>
      </form>
    </div>
  )
}
