import { isInNavigationRollback } from './navigationTracker'
import { shouldReloadForNavigation } from './useNavigateWithoutDataLoad'

/**
 * dynamicLoaderPolicy
 * ----------------------------------------------------------------------------
 * ナビゲーションごとに loader の実行可否を動的に決定するポリシー。
 *
 * 本アーキテクチャでは `staleTime = 0` / `staleReloadMode = "blocking"` を
 * 前提とし、画面遷移時は原則として loader を実行して最新データを取得する。
 *
 * ただし次のケースでは loader を実行しない。
 *
 * - Navigation Rollback による元画面復帰
 * - フレームワークのユーティリティによって loader skip が明示された遷移
 *
 * つまり
 *
 * ```
 * 通常遷移 → loader 実行
 * 特殊遷移 → loader skip
 * ```
 *
 * という動作になる。
 */
export function dynamicShouldReload({
  cause,
  location,
}: {
  cause: 'enter' | 'stay' | 'preload'
  location: { href?: string }
}) {
  if (cause === 'preload') {
    return true
  }
  // 画面遷移キャンセルが発生し元の画面に戻ってきた流れの場合はloaderは呼び出さない
  if (cause === 'stay' && isInNavigationRollback()) {
    return false
  }
  // 次の navigation だけ loader をスキップさせる要求がある場合は、loader を呼び出さない
  if (!shouldReloadForNavigation({ location })) {
    return false
  }
  return true
}
