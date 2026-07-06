/**
 * QueryState
 * ----------------------------------------------------------------------------
 * URL Search Params から Query state に使用するキーのみを抽出した型。
 *
 * `_` prefix を持つキーは UI state として扱われ、
 * Query state には含めない。
 *
 * 例:
 *
 *   search = { page: 1, _modal: true }
 *
 *   QueryState<typeof search>
 *   → { page: 1 }
 */
type QueryState<TSearch> = {
  [K in keyof TSearch as K extends `_${string}` ? never : K]: TSearch[K]
}

/**
 * extractQueryState
 * ----------------------------------------------------------------------------
 * URL Search Params から query に使用する値のみを抽出する。
 *
 * Router-first SPA では
 *
 *   URL = Application State
 *
 * であるため、URL には
 *
 *   - Query state
 *   - UI state
 *
 * の両方が含まれる。
 *
 * UI state は `_` prefix を持つキーとして表現され、
 * Query state には使用しない。
 *
 * 例:
 *
 *   /orders?page=1&_modal=true
 *
 *   extractQueryState → { page: 1 }
 *
 * この関数は
 *
 *   search → loaderDeps
 *
 * の変換に使用される。
 */
export function extractQueryState<TSearch extends Record<string, unknown>>(
  search: TSearch,
): QueryState<TSearch> {
  const result: Partial<TSearch> = {}

  for (const key of Object.keys(search) as (keyof TSearch)[]) {
    if ((key as string).startsWith('_')) continue

    result[key] = search[key]
  }

  return result as unknown as QueryState<TSearch>
}
