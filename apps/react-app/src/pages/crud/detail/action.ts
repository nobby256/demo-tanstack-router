import { useRouter } from '@tanstack/react-router'
import { useRouteNavigation } from '@vendor/router-enhancer'

import { withActionBoundary } from '#/features/router'

import { operation, type PageForm, Route } from './-page-deps-internal'

// ─────────────────────────────────────
// Actions Hook
// ─────────────────────────────────────

export const useActions = withActionBoundary((form: PageForm) => {
  const router = useRouter()
  const search = Route.useSearch()
  // const navigate = useNavigate();
  const navigation = useRouteNavigation(Route)

  /*
   * 更新ボタンのハンドラ
   */
  const onSubmitUpdate1 = async () => {
    const valid = await form.trigger()
    if (!valid) {
      return
    }

    const formValues = form.getValues()
    await operation.detailPageUpdate(formValues)

    alert('Update successful')

    // 初期値を現在の値に更新することで、dirtyフラグをリセット
    form.reset(formValues)
  }

  const onSubmitUpdate2 = async () => {
    const valid = await form.trigger()
    if (!valid) {
      return
    }

    const formValues = form.getValues()
    await operation.detailPageUpdate(formValues)

    // URLを変えずにloaderの再実行
    // await navigation.invalidate()
    await router.invalidate()

    alert('Update successful')
  }

  /*
   * 戻るボタンのハンドラ
   */
  const onClickReturn1 = async () => {
    // loaderの呼び出し "なし" で遷移
    await navigation.navigate({
      href: search._returnTo,
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

  return {
    onSubmitUpdate1,
    onSubmitUpdate2,
    onClickReturn1,
    onClickReturn2,
    onClickReturn3,
  }
})
