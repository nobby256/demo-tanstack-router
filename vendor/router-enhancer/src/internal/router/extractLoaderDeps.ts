type LoaderDeps<TSearch> = {
  [K in keyof TSearch as K extends `_${string}` ? never : K]: TSearch[K]
}

/**
 * extractLoaderDeps
 * ----------------------------------------------------------------------------
 * URL Search Params から LoaderDeps に使用する値のみを抽出する。
 *
 * Router-first SPA では
 *
 *   URL = Application State
 *
 * であるため、URL には
 *
 *   - LoaderDeps
 *   - UI state
 *
 * の両方が含まれる。
 *
 * UI state は `_` prefix を持つキーとして表現され、
 * LoaderDeps には含めない。
 *
 * 例:
 *
 *   /orders?page=1&_modal=true
 *
 *   extractLoaderDeps → { page: 1 }
 *
 * この関数は
 *
 *   search → loaderDeps
 *
 * の変換に使用される。
 */
export function extractLoaderDeps<TSearch extends Record<string, unknown>>({
  search,
}: {
  search: TSearch
}): LoaderDeps<TSearch> {
  const result: Partial<TSearch> = {}

  for (const key of Object.keys(search) as (keyof TSearch)[]) {
    if ((key as string).startsWith('_')) continue

    result[key] = search[key]
  }

  return result as unknown as LoaderDeps<TSearch>
}
