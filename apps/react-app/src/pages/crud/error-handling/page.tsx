import { Link } from '@tanstack/react-router'
import { useBackTo } from '@vendor/router-enhancer'
import { Controller } from 'react-hook-form'
import { z } from 'zod'

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

  const back = useBackTo('/crud/search')

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
      <button type="button" onClick={back} disabled={!back}>
        戻る
      </button>
      <h2>Search</h2>
      <div className="nav-link">
        <Link
          to="/crud/error-handling"
          search={{
            status: '400',
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
            status: '401',
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
            status: '403',
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
            status: '404',
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
            status: '410',
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
            status: '422',
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
            status: '500',
          }}
          state={{
            shouldReload: true,
          }}
        >
          ステータスコード：500 - alert
        </Link>
        <hr />
        <div>
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
          <button onClick={form.handleSubmit(actions.done)}>submit</button>
          <button onClick={() => form.setValue('status', '400')}>
            ステータスコード：400
          </button>
          <button onClick={() => form.setValue('status', '401')}>
            ステータスコード：401
          </button>
          <button onClick={() => form.setValue('status', '403')}>
            ステータスコード：403
          </button>
          <button onClick={() => form.setValue('status', '404')}>
            ステータスコード：404
          </button>
          <button onClick={() => form.setValue('status', '410')}>
            ステータスコード：410
          </button>
          <button onClick={() => form.setValue('status', '422')}>
            ステータスコード：422
          </button>
          <button onClick={() => form.setValue('status', '500')}>
            ステータスコード：500
          </button>
        </div>
      </div>
    </>
  )
}
