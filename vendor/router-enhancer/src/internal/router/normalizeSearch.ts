/**
 * normalizeSearch
 * ----------------------------------------------------------------------------
 * URL Search Params を正規化する。
 *
 * Router-first SPA では
 *
 *   URL = Application State
 *
 * であるため、同じ状態を表す URL は
 * 常に同一の形式になるよう正規化する必要がある。
 *
 * この関数は次の正規化を行う。
 *
 *   - key のソート
 *   - undefined / null の除外
 *   - 空文字の除外
 *   - string の trim
 *   - 配列の順序正規化
 *
 * 例:
 *
 *   { status: ['closed','open'], keyword: '  foo  ' }
 *     ↓
 *   { keyword: 'foo', status: ['closed','open'] }
 */
export function normalizeSearch<T extends Record<string, unknown>>(
  search: T,
): T {
  const result: Record<string, unknown> = {}

  /**
   * key の順序を安定化
   *
   * URL canonicalization のため
   */
  const entries = Object.entries(search).sort(([a], [b]) => a.localeCompare(b))

  for (const [key, value] of entries) {
    // null / undefined は削除
    if (value === undefined || value === null) {
      continue
    }

    /**
     * string 正規化
     */
    if (typeof value === 'string') {
      const trimmed = value.trim()

      // 空文字は削除
      if (trimmed === '') {
        continue
      }

      result[key] = trimmed
      continue
    }

    /**
     * 配列は順序を正規化
     */
    if (Array.isArray(value)) {
      const normalized: unknown[] = value
        .filter((v): v is NonNullable<unknown> => v != null)
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => v !== '')

      if (normalized.length === 0) {
        continue
      }

      result[key] = normalized.toSorted()
      continue
    }

    result[key] = value
  }

  return result as T
}
