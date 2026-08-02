import { Link } from '@tanstack/react-router'
import { Controller } from 'react-hook-form'
import { z } from 'zod'

import { AppBackButton } from '#/features/components/AppBackButton'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
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
    <>
      <style>{`
        .nav-link a {
          display: block;
        }
        .nav-link button {
          display: block;
        }
      `}</style>
      <div>
        <AppBackButton pathName={'/crud/search'} />
        <h2>Search</h2>
        <div>
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <input placeholder="status" {...field} />
                <span className="error-message">
                  {fieldState.error?.message}
                </span>
              </>
            )}
          />
        </div>
        <div>
          <button type="button" onClick={actions.done}>
            Search
          </button>
        </div>

        <hr />
        <div className="nav-link">
          <Link
            to="/crud/error-handling"
            search={{
              status: 400,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：400 - alert
          </Link>
          <Link
            to="/crud/error-handling"
            search={{
              status: 401,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：401 - 継続不能エラー画面へ遷移
          </Link>
          <Link
            to="/crud/error-handling"
            search={{
              status: 403,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：403 - 継続不能エラー画面へ遷移
          </Link>
          <Link
            to="/crud/error-handling"
            search={{
              status: 404,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：404 - alert
          </Link>
          <Link
            to="/crud/error-handling"
            search={{
              status: 410,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：410 - 期限切れエラー画面を表示
          </Link>
          <Link
            to="/crud/error-handling"
            search={{
              status: 422,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：422 - alert
          </Link>
          <Link
            to="/crud/error-handling"
            search={{
              status: 500,
            }}
            state={{
              shouldReload: true,
            }}
          >
            ステータスコード：500 - alert
          </Link>
          <hr />
          <button onClick={actions.done}>ステータスコード：400</button>
          <button onClick={actions.done}>ステータスコード：401</button>
          <button onClick={actions.done}>ステータスコード：403</button>
          <button onClick={actions.done}>ステータスコード：404</button>
          <button onClick={actions.done}>ステータスコード：410</button>
          <button onClick={actions.done}>ステータスコード：422</button>
          <button onClick={actions.done}>ステータスコード：500</button>
        </div>
      </div>
    </>
  )
}
