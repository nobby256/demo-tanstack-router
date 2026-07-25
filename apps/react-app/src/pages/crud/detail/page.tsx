import { useLeaveGuard, useQueryState } from '@vendor/router-enhancer'
import { z } from 'zod'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
  _returnTo: z.string(),
  _check1: z.boolean().optional(),
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
  useLeaveGuard({
    when: form.formState.isDirty,
    confirmLeave: () =>
      window.confirm('変更されています。入力内容を破棄してよろしいですか？'),
  })

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <div>
      <h2>Detail</h2>

      <form>
        <fieldset>
          <legend>入力データ</legend>
          <div>id: {loaderData.id}</div>
          <div>version: {loaderData.version}</div>
          <div>
            Name:
            <input {...form.register('name')} />
            {form.formState.errors.name && (
              <span className="error-message">
                {form.formState.errors.name.message}
              </span>
            )}
          </div>
          <div>
            Description:
            <input {...form.register('description')} />
            {form.formState.errors.description && (
              <span className="error-message">
                {form.formState.errors.description.message}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={actions.onSubmitUpdate1}
            disabled={!form.formState.isDirty}
            style={{ display: 'block' }}
          >
            更新（更新した内容を信用してformオブジェクトを更新、versionは変わらない）
          </button>
          <button
            type="button"
            onClick={actions.onSubmitUpdate2}
            disabled={!form.formState.isDirty}
            style={{ display: 'block' }}
          >
            更新（サーバーから最新情報を再読み込み、versionが変わる）
          </button>
        </fieldset>

        <fieldset>
          <legend>QueryState</legend>
          <div>
            <input
              type="checkbox"
              checked={check1}
              onChange={(e) => setCheck1(e.target.checked)}
            />
            dirty時でもblockに反応しない自己ナビゲートを発生する
          </div>
        </fieldset>

        <fieldset>
          <legend>戻るのバリエーション</legend>
          <div>
            <button type="button" onClick={actions.onClickReturn1}>
              loader 呼び出し無し
            </button>
          </div>
          <div>
            <button type="button" onClick={actions.onClickReturn2}>
              loader 呼び出しあり
            </button>
          </div>
          <div>
            <button type="button" onClick={actions.onClickReturn3}>
              loader 呼び出しあり（history.back）
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}
