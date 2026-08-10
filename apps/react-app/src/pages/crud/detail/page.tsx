import { useBackTo, useQueryState } from '@vendor/router-enhancer'
import { z } from 'zod'

import { usePageBlocker } from '#/features/behavior-hook/use-page-brocker'

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

  const back = useBackTo('/crud/summary')

  // ─────────────────────────────
  // JSX
  // ─────────────────────────────
  return (
    <div>
      <button type="button" onClick={back} disabled={!back}>
        戻る
      </button>
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
          onClick={form.handleSubmit(actions.submitUpdate)}
          disabled={!form.formState.isDirty}
          style={{ display: 'block' }}
        >
          更新
        </button>
      </fieldset>

      <fieldset>
        <legend>QueryState</legend>
        <div>
          <input
            type="checkbox"
            checked={check ?? false}
            onChange={(e) => setCheck(e.target.checked)}
          />
          dirty時でもblockに反応しない自己ナビゲートを発生する
        </div>
      </fieldset>
    </div>
  )
}
