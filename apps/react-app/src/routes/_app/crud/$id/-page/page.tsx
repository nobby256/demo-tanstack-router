import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  event,
  useLeaveGuard,
  useRouteNavigation,
} from '@vendor/router-enhancer'
import { update } from 'demo-api-client/api/detail_page'
import { UpdateBody } from 'demo-api-client/zod/detail_page'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Route } from '../route'

// ─────────────────────────────────────
// Form Definition
// ─────────────────────────────────────
// UIフォーム用スキーマはAPI Bodyを変換して定義する
const formSchema = UpdateBody.omit({
  // none
}).extend({
  // none
})
type FormValues = z.infer<typeof formSchema>

// ─────────────────────────────────────
// Page Component
// ─────────────────────────────────────
export function Page() {
  const loaderData = Route.useLoaderData()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...loaderData,
    },
  })
  const errors = form.formState.errors
  useEffect(() => {
    form.reset({
      ...loaderData,
    })
  }, [loaderData, form.reset])

  useLeaveGuard({
    when: form.formState.isDirty,
    confirmLeave: () =>
      window.confirm('変更されています。入力内容を破棄してよろしいですか？'),
  })

  const navigation = useRouteNavigation(Route)

  /*
   * 更新ボタンのハンドラ
   */
  const submitUpdate1 = async (formValues: FormValues) => {
    // FormValues → API Body への変換ポイント
    const apiBody = { ...formValues }

    await update(apiBody)

    alert('Update successful')

    // 初期値を現在の値に更新することで、dirtyフラグをリセット
    form.reset(formValues)
  }

  const submitUpdate2 = async (formValues: FormValues) => {
    // FormValues → API Body への変換ポイント
    const apiBody = { ...formValues }

    await update(apiBody)

    // URLを変えずにloaderの再実行
    await navigation.invalidate()

    alert('Update successful')
  }

  /*
   * 戻るボタンのハンドラ
   */
  const onClickReturn1 = async () => {
    // loaderの呼び出し "なし" で遷移
    await navigation.navigate({
      href: navigation.search._returnTo,
      skipLoader: true,
    })
  }
  const onClickReturn2 = async () => {
    // loaderの呼び出し "あり" で遷移
    await navigation.navigate({
      href: navigation.search._returnTo,
      skipLoader: false,
    })
  }
  const onClickReturn3 = async () => {
    // loaderの呼び出し "あり" で遷移
    await navigation.back()
  }

  /*
   * UIStateの変更ハンドラ
   */
  const onChangeCheckbox1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await navigation.patchUiState({
      _check1: e.target.checked,
    })
  }
  const onChangeCheckbox2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await navigation.patchUiState(
      {
        _check2: e.target.checked,
      },
      { ignoreBlocker: false },
    )
  }

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
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>
          <div>
            Description:
            <input {...form.register('description')} />
            {errors.description && (
              <span className="error-message">
                {errors.description.message}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={event(form.handleSubmit(submitUpdate1))}
            disabled={!form.formState.isDirty}
            style={{ display: 'block' }}
          >
            更新（更新した内容を信用してformオブジェクトを更新、versionは変わらない）
          </button>
          <button
            type="button"
            onClick={event(form.handleSubmit(submitUpdate2))}
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
              onChange={event(onChangeCheckbox1)}
            />
            dirty時でもblockに反応しない
          </div>
          <div>
            <input
              type="checkbox"
              checked={navigation.uiState._check2 ?? false}
              onChange={event(onChangeCheckbox2)}
            />
            dirty時にはblockに反応する
          </div>
        </fieldset>

        <fieldset>
          <legend>戻るのバリエーション</legend>
          <div>
            <button type="button" onClick={event(onClickReturn1)}>
              loader 呼び出し無し
            </button>
          </div>
          <div>
            <button type="button" onClick={event(onClickReturn2)}>
              loader 呼び出しあり
            </button>
          </div>
          <div>
            <button type="button" onClick={event(onClickReturn3)}>
              loader 呼び出しあり（history.back）
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}
