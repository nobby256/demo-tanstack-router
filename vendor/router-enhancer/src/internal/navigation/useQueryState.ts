import { useNavigateWithoutDataLoad } from './useNavigateWithoutDataLoad'

/**
 * `_` prefix UI state
 */
type QueryStateKeys<T> = {
  [K in keyof T]: K extends `_${string}` ? K : never
}[keyof T]

type RouteSearch<TRoute> = TRoute extends {
  types: { fullSearchSchema: infer S }
}
  ? S
  : never

/**
 * useQueryState
 * ---------------------------------------------------------------------------
 * Search Params 上の `_` prefix QueryState を useState 風に扱う。
 * 例:
 *   const [tab, setTab] = useQueryState(Route, "_tab")
 *   await setTab("common")
 */
export function useQueryState<
  TRoute extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    types: { fullSearchSchema: any }
    useSearch: () => RouteSearch<TRoute>
    useNavigate: () => (options: {
      search: RouteSearch<TRoute>
      replace: boolean
    }) => Promise<void>
  },
  TKey extends QueryStateKeys<RouteSearch<TRoute>>,
>(route: TRoute, key: TKey, defaultValue?: RouteSearch<TRoute>[TKey]) {
  type Search = RouteSearch<TRoute>

  const search = route.useSearch()
  const navigate = useNavigateWithoutDataLoad()

  const value = search[key] ?? defaultValue

  const setValue = async (nextValue: Search[TKey]): Promise<void> => {
    await navigate({
      search: {
        ...search,
        [key]: nextValue,
      },
      replace: true,
      ignoreBlocker: true,
    })
  }

  return [value, setValue] as const
}
