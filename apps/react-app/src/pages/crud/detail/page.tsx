import { useQueryState } from '@vendor/router-enhancer'
import { z } from 'zod'

import { usePageBlocker } from '#/features/behavior-hook/use-page-brocker'
import { AppBackButton } from '#/features/components/AppBackButton'

import { Route, useActions, usePageForm } from './-page-deps-internal'

// ─────────────────────────────
// QueryState Schema
// ─────────────────────────────

export const queryStateSchema = z.object({
  // Query Stateは _ で始まる名前で追加する
  _returnTo: z.string(),
  _check1: z.boolean().optional(),
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

  const actions = useActions({ form })

  // ─────────────────────────────
  // DerivedData (watch/memo)
  // ─────────────────────────────

  const data = loaderData.data

  // ─────────────────────────────
  // Behavior Hooks (effect)
  // ─────────────────────────────

  usePageBlocker(form.formState.isDirty)

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <div>
      <AppBackButton pathName={'/crud/search'} />
      <h2>Detail</h2>

      <fieldset>
        <legend>入力データ</legend>
        <div>id: {data.id}</div>
        <div>version: {data.version}</div>
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
          onClick={actions.submitUpdate1}
          disabled={!form.formState.isDirty}
          style={{ display: 'block' }}
        >
          更新（更新した内容を信用してformオブジェクトを更新、versionは変わらない）
        </button>
        <button
          type="button"
          onClick={actions.submitUpdate2}
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
          <button type="button" onClick={actions.return1}>
            loader 呼び出し無し
          </button>
        </div>
        <div>
          <button type="button" onClick={actions.return2}>
            loader 呼び出しあり
          </button>
        </div>
        <div>
          <button type="button" onClick={actions.return3}>
            loader 呼び出しあり（history.back）
          </button>
        </div>
      </fieldset>
    </div>
  )
}
