import { useBackTo, useQueryState } from '@vendor/router-enhancer'
import { Controller } from 'react-hook-form'
import { z } from 'zod'

import { usePageBlocker } from '#/features/hooks/use-page-brocker'

import { useActions, usePageForm } from './-page-deps-internal'

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

  const data = form.getValues('data')

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
          <Controller
            control={form.control}
            name="data.name"
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <span className="error-message">
                  {fieldState.error?.message}
                </span>
              </>
            )}
          />
        </div>
        <div>
          Description:
          <Controller
            control={form.control}
            name="data.description"
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <span className="error-message">
                  {fieldState.error?.message}
                </span>
              </>
            )}
          />
        </div>
        <button
          type="button"
          onClick={actions.update}
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
