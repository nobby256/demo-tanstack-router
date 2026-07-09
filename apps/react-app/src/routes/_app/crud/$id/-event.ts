import { createEventHook, useRouteNavigation } from '@vendor/router-enhancer'
import { update } from 'demo-api-client/api/detail_page'

import type { FormValues, PageForm } from './-form'

import { Route } from './route'

// ─────────────────────────────────────
// Event Hook
// ─────────────────────────────────────

export const usePageEvents = createEventHook((form: PageForm) => {
  const navigation = useRouteNavigation(Route)

  /*
   * 更新ボタンのハンドラ
   */
  const onSubmitUpdate1 = async (formValues: FormValues) => {
    // FormValues → API Body への変換ポイント
    const apiBody = { ...formValues }

    await update(apiBody)

    alert('Update successful')

    // 初期値を現在の値に更新することで、dirtyフラグをリセット
    form.reset(formValues)
  }

  const onSubmitUpdate2 = async (formValues: FormValues) => {
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
  const onChangeCheckbox1 = async (checked: boolean) => {
    await navigation.patchUiState({
      _check1: checked,
    })
  }

  const onChangeCheckbox2 = async (checked: boolean) => {
    await navigation.patchUiState(
      {
        _check2: checked,
      },
      { ignoreBlocker: false },
    )
  }

  return {
    onSubmitUpdate1,
    onSubmitUpdate2,
    onClickReturn1,
    onClickReturn2,
    onClickReturn3,
    onChangeCheckbox1,
    onChangeCheckbox2,
  }
})
