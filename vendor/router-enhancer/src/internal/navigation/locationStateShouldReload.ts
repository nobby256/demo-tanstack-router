import type { ParsedLocation } from '@tanstack/react-router'

/**
 * `location.state.shouldReload` の値によって動的に reload の有無を切り替える
 * `shouldReload` 関数です。
 *
 * 基本ルール:
 *
 * - `location.state.shouldReload` が指定されている場合はその値を優先する
 * - `location.state.shouldReload` が未指定の場合
 *   - `cause === 'stay'` の場合は reload しない
 *   - それ以外は reload する
 *
 * `stay` は「最終的に同一 Route に留まる遷移」を意味します。
 * ブラウザバックが Blocker によってキャンセルされた場合など、
 * 画面遷移が成立していないケースでも `stay` になることがあります。
 *
 * そのため、デフォルトでは `stay` に対して loader を再実行せず、
 * 現在の画面状態および loader キャッシュを維持します。
 *
 * 一方で、同一 Route への再遷移時に明示的な reload が必要な場合は、
 * `location.state.shouldReload` を指定して動的に上書きできます。
 *
 * @example
 * // Route 定義
 * export const Route = createFileRoute('/users')({
 *   loader: fetchUsers,
 *   shouldReload: locationStateShouldReload,
 * })
 *
 * @example
 * // 通常遷移（デフォルトルールを適用）
 * navigate({
 *   to: '/users',
 * })
 *
 * @example
 * // 同一 Route への遷移時も強制 reload
 * navigate({
 *   to: '/users',
 *   state: {
 *     shouldReload: true,
 *   },
 * })
 *
 * @example
 * // 強制的に reload しない
 * navigate({
 *   to: '/users',
 *   state: {
 *     shouldReload: false,
 *   },
 * })
 */
export function locationStateShouldReload({
  location,
  cause,
}: {
  location: ParsedLocation
  cause: 'preload' | 'enter' | 'stay'
}) {
  const shouldReload = location.state.shouldReload

  if (shouldReload !== undefined) {
    return shouldReload
  }

  if (cause === 'stay') {
    return false
  }

  return true
}
