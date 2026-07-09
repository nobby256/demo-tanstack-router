import { useLeaveGuard, useRouteNavigation } from '@vendor/router-enhancer'
import { FormProvider } from 'react-hook-form'

import { usePageEvents } from './-event'
import { usePageForm } from './-form'
import { Route } from './route'

// ─────────────────────────────────────
// Page Component
// ─────────────────────────────────────
export function Page() {
  const form = usePageForm()
  const events = usePageEvents()

  useLeaveGuard({
    when: form.formState.isDirty,
    confirmLeave: () =>
      window.confirm('変更されています。入力内容を破棄してよろしいですか？'),
  })

  const navigation = useRouteNavigation(Route)
  const loaderData = Route.useLoaderData()
  return (
    <FormProvider {...form}>
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
              onClick={form.handleSubmit(events.onSubmitUpdate1)}
              disabled={!form.formState.isDirty}
              style={{ display: 'block' }}
            >
              更新（更新した内容を信用してformオブジェクトを更新、versionは変わらない）
            </button>
            <button
              type="button"
              onClick={form.handleSubmit(events.onSubmitUpdate2)}
              disabled={!form.formState.isDirty}
              style={{ display: 'block' }}
            >
              更新（サーバーから最新情報を再読み込み、versionが変わる）
            </button>
          </fieldset>

          <fieldset>
            <legend>UIStateのバリエーション</legend>
            <div>
              <input
                type="checkbox"
                checked={navigation.uiState._check1 ?? false}
                onChange={(e) => events.onChangeCheckbox1(e.target.checked)}
              />
              dirty時でもblockに反応しない
            </div>
            <div>
              <input
                type="checkbox"
                checked={navigation.uiState._check2 ?? false}
                onChange={(e) => events.onChangeCheckbox2(e.target.checked)}
              />
              dirty時にはblockに反応する
            </div>
          </fieldset>

          <fieldset>
            <legend>戻るのバリエーション</legend>
            <div>
              <button type="button" onClick={events.onClickReturn1}>
                loader 呼び出し無し
              </button>
            </div>
            <div>
              <button type="button" onClick={events.onClickReturn2}>
                loader 呼び出しあり
              </button>
            </div>
            <div>
              <button type="button" onClick={events.onClickReturn3}>
                loader 呼び出しあり（history.back）
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </FormProvider>
  )
}
