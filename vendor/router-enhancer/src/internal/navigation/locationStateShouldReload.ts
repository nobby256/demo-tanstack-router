import type { ParsedLocation } from '@tanstack/react-router'

/**
 * `location.state.shouldReload` の値によって動的に reload の有無を切り替える
 * `shouldReload` 関数を生成します。
 *
 * `navigate()` 時に `state.shouldReload` が指定されている場合はその値を優先し、
 * 指定されていない場合は `defaultValue` を返します。
 *
 * 主に「特定の画面遷移時のみ reload しない」といったユースケースで利用します。
 *
 * @param defaultValue `location.state.shouldReload` が未指定の場合に返すデフォルト値
 * @returns TanStack Router の `shouldReload` に指定可能な関数
 *
 * @example
 * // Route 定義
 * export const Route = createFileRoute('/users')({
 *   loader: fetchUsers,
 *   shouldReload: locationStateShouldReload(),
 * })
 *
 * @example
 * // 通常遷移（reload はデフォルトルールに任せる）
 * navigate({
 *   to: '/users',
 * })
 *
 * @example
 * // 強制 reload
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
export function locationStateShouldReload(defaultValue?: boolean) {
  return ({ location }: { location: ParsedLocation }) => {
    const shouldReload = location.state.shouldReload

    if (shouldReload !== undefined) {
      return shouldReload
    }

    return defaultValue
  }
}
