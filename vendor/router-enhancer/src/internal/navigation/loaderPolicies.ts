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
 *
 * 主に業務データを扱うページルートで使用する。
 */
export const dynamicLoaderPolicy = {
  staleReloadMode: 'blocking',
  staleTime: 0,
  shouldReload: ({
    cause,
    location,
  }: {
    cause: 'enter' | 'stay' | 'preload'
    location: { href?: string }
  }) => {
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
  },
} as const

/**
 * initialLoaderPolicy
 * ----------------------------------------------------------------------------
 * 初回アクセス時のみ loader を実行し、それ以降は Snapshot Cache を再利用するポリシー。
 *
 * 主にアプリケーション全体で共有されるデータに使用する。
 *
 * 例:
 * - ユーザープロファイル
 * - Feature Flags
 * - マスターデータ
 * - アプリ設定
 *
 * 設定内容
 *
 * ```
 * staleTime = Infinity
 * gcTime = Infinity
 * shouldReload = false
 * ```
 *
 * これにより
 *
 * ```
 * 初回 Navigation → loader 実行
 * 以降の Navigation → Snapshot Cache 再利用
 * ```
 *
 * という動作になる。
 */
export const initialLoaderPolicy = {
  staleReloadMode: 'blocking',
  staleTime: Infinity,
  gcTime: Infinity,
  shouldReload: () => false,
} as const
