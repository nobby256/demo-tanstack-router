import type { AnyRoute, NavigateOptions } from '@tanstack/react-router'

import { useNavigate, useRouter } from '@tanstack/react-router'

import type { UseUIStateResult } from './useUIState'

import { useNavigateWithoutDataLoad } from './useNavigateWithoutDataLoad'
import { useUIState } from './useUIState'

type RouteWithSearch<TRoute extends AnyRoute = AnyRoute> = TRoute & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  types: { fullSearchSchema: any }
  useSearch: () => RouteSearch<TRoute>
  useParams: () => TRoute['types']['allParams']
}

type RouteSearch<TRoute> = TRoute extends {
  types: { fullSearchSchema: infer S }
}
  ? S
  : never

type UseRouteNavigationResult<TRoute extends RouteWithSearch> = {
  route: TRoute
  search: RouteSearch<TRoute>
  params: TRoute['types']['allParams']

  uiState: UseUIStateResult<TRoute>['uiState']
  patchUiState: UseUIStateResult<TRoute>['patchUiState']

  navigate: (
    options: NavigateOptions & { skipLoader?: boolean },
  ) => Promise<void>

  back: () => Promise<void>

  invalidate: () => Promise<void>
}

export function useRouteNavigation<TRoute extends RouteWithSearch>(
  route: TRoute,
): UseRouteNavigationResult<TRoute> {
  const router = useRouter()
  const navigate = useNavigate()
  const navigateWithoutDataLoad = useNavigateWithoutDataLoad()

  const { uiState, patchUiState } = useUIState(route)

  /**
   * navigation.navigate
   * -------------------------------------------------------------------------
   * - 通常時: navigate(options)
   * - skipLoader: true の場合だけ useNavigateWithoutDataLoad を利用
   */
  async function navigateWithOptionalWithoutDataLoad(
    options: NavigateOptions & { skipLoader?: boolean },
  ): Promise<void> {
    const { skipLoader = false, ...rest } = options

    if (skipLoader) {
      return navigateWithoutDataLoad(rest)
    }

    return navigate(rest)
  }

  /**
   * navigation.back
   * -------------------------------------------------------------------------
   * async にして Promise<void> を返す。
   * 実際には同期的に history.back() するだけだが、
   * navigation.* を全て await 可能に揃えるためのラップ。
   */
  async function back(): Promise<void> {
    const history = router.history as {
      back(): void
    }
    history.back()
  }

  /**
   * navigation.invalidate
   * -------------------------------------------------------------------------
   * 現在のこの Route だけの loader を再実行する。
   * 親ルートには影響を与えない。
   */
  async function invalidate(): Promise<void> {
    await router.invalidate({
      filter: (match) => match.routeId === route.id,
      sync: true,
    })
  }

  return {
    route,
    // TanStack Router の Route 型から取得した値。
    // 利用側へは UseRouteNavigationResult<TRoute> として公開される。
    params: route.useParams() as TRoute['types']['allParams'],
    // TanStack Router の Route 型から取得した値。
    // 利用側へは UseRouteNavigationResult<TRoute> として公開される。
    search: route.useSearch() as RouteSearch<TRoute>,
    uiState,
    patchUiState,
    navigate: navigateWithOptionalWithoutDataLoad,
    back,
    invalidate,
  }
}
