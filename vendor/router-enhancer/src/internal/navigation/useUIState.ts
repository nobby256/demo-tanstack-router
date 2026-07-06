import { useNavigateWithoutDataLoad } from './useNavigateWithoutDataLoad'

/**
 * `_` prefix UI state
 */
type UIStateKeys<T> = {
  [K in keyof T]: K extends `_${string}` ? K : never
}[keyof T]

/**
 * UI state を読み取るための型。
 * `_` で始まるキーだけを抽出。
 * `_` で始まるキーが無い場合は `{}`。
 */
type UIState<T> =
  UIStateKeys<T> extends never
    ? // UIState の空ケースは {} で表現したい
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}
    : {
        [K in UIStateKeys<T>]: T[K]
      }

/**
 * UI state を更新するための patch 型。
 * `_` で始まるキーだけを許可。
 * `_` が無い場合は全てのキーを不許可。
 */
type UIStatePatch<T> =
  UIStateKeys<T> extends never
    ? Record<string, never>
    : {
        [K in UIStateKeys<T>]?: T[K] | undefined
      }

type RouteSearch<TRoute> = TRoute extends {
  types: { fullSearchSchema: infer S }
}
  ? S
  : never

/**
 * 検索オブジェクトから `_` prefix の UI state だけを抽出
 */
function pickUIState<T extends Record<string, unknown>>(search: T): UIState<T> {
  const entries = Object.entries(search).filter(([key]) => key.startsWith('_'))

  return Object.fromEntries(entries) as UIState<T>
}

type PatchUiStateOptions = {
  ignoreBlocker?: boolean
  replace?: boolean
}

export type UseUIStateResult<
  TRoute extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    types: { fullSearchSchema: any }
  },
> = {
  uiState: UIState<RouteSearch<TRoute>>

  patchUiState: (
    patch: UIStatePatch<RouteSearch<TRoute>>,
    options?: PatchUiStateOptions,
  ) => Promise<void>
}

/**
 * useUIState
 * ---------------------------------------------------------------------------
 * `_` prefix UI state だけ変更。
 * 戻り値として:
 *   - uiState: `_` prefix の UI state 部分だけを抜き出したオブジェクト
 *              （`_` が無い場合は `{}`）
 *   - patchUiState: `_` prefix UI state のみを部分更新する関数
 */
export function useUIState<
  TRoute extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    types: { fullSearchSchema: any }
    useSearch: () => RouteSearch<TRoute>
  },
>(route: TRoute): UseUIStateResult<TRoute> {
  const navigate = useNavigateWithoutDataLoad()

  type Search = RouteSearch<TRoute>
  type UiState = UIState<Search>

  // TanStack Router の Route 型から取得した値。
  // 利用側へは RouteSearch<TRoute> として公開する。
  const search = route.useSearch()

  // Route の search から `_` prefix だけを抽出して UI state として返す
  const uiState = pickUIState(search as Record<string, unknown>) as UiState

  async function patchUiState(
    patch: UIStatePatch<Search>,
    options: PatchUiStateOptions = {},
  ): Promise<void> {
    // searchに対してpatchで上書きすることで新しいsearchを作成する
    const newSearch = {
      ...search,
      ...patch,
    }

    await navigate({
      to: '.',
      search: newSearch,
      replace: options.replace ?? true,
      ignoreBlocker: options.ignoreBlocker ?? true,
    })
  }

  return {
    uiState,
    patchUiState,
  }
}
