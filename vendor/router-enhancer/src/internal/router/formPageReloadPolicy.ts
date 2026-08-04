import { locationStateShouldReload } from '../navigation'

/**
 * フォーム入力を伴うページ向けの TanStack Router の reload ポリシーです。
 *
 * このポリシーは以下の方針で動作します。
 *
 * - `staleTime = 0`
 *   - Route 遷移時は常に loader の再評価を行う
 * - `reloadMode = 'blocking'`
 *   - loader 完了後に画面を表示する
 * - `shouldReload`
 *   - `location.state.shouldReload` が指定されている場合はその値を優先する
 *   - `cause === 'stay'` の場合は reload しない
 *   - それ以外は reload する
 *
 * `stay` は結果的に現在の Route に留まる遷移を表します。
 *
 * 代表例:
 *
 * - Blocker によりブラウザバックがキャンセルされた
 * - 同一 Route への navigate が実行された
 *
 * `stay` 時に loader を再実行してしまうと、フォームの初期化処理
 * (`form.reset(loaderData)` など) が意図せず実行され、
 * ユーザー入力が失われる可能性があります。
 *
 * そのため、本ポリシーでは `stay` をデフォルトで
 * 「reload しない」としています。
 *
 * 同一 Route への遷移時に明示的な reload が必要な場合は、
 * `navigate` の `state.shouldReload` によって動的に上書きできます。
 *
 * @example
 * export const Route = createFileRoute('/users')({
 *   loader,
 *   ...formPageReloadPolicy,
 * })
 *
 * @example
 * // 同一 Route でも強制 reload
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
export const formPageReloadPolicy = {
  staleTime: 0,
  reloadMode: 'blocking',
  shouldReload: locationStateShouldReload,
}
