import { useRouter } from '@tanstack/react-router'
import { z } from 'zod'

/**
 * useQueryState
 * ---------------------------------------------------------------------------
 * Search Params 上の QueryState を useState 風に扱う。
 *
 * 例:
 *   const [check, setCheck] =
 *     useQueryState(queryStateSchema, ' _check', false)
 */
export function useQueryState<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema extends z.ZodObject<any>,
  TSearch = z.infer<TSchema>,
  TKey extends keyof TSearch = keyof TSearch,
>(_schema: TSchema, key: TKey) {
  const router = useRouter()

  const search = router.state.location.search as TSearch
  const value = search[key]

  const setValue = async (nextValue: TSearch[TKey]): Promise<void> => {
    await router.navigate({
      search: (prev: Record<string, unknown>) =>
        // 現在の Location を基準に QueryState を部分更新する。
        // Route 固有の Search 型は取得できないため、Search の型チェックのみ回避する。
        ({
          ...prev,
          [key as string]: nextValue,
        }) as never,
      replace: true,
      ignoreBlocker: true,
      state: {
        shouldReload: false,
      },
    })
  }

  return [value, setValue] as const
}
