import type {
  AnyRoute,
  RouterConstructorOptions,
  RouterHistory,
  TrailingSlashOption,
} from '@tanstack/react-router'

import { createRouter } from '@tanstack/react-router'

import { registerAppExitGuard, registerBfCacheReload } from './browser'
import { initHistoryTracker } from './history'
import { initNavigationTracker } from './navigation'

/**
 * 継続可能エラー時の挙動設定
 */
export interface RecoverableErrorStrategy {
  onError: (error: unknown) => void
}

export interface RouterEnhancerOptions {
  /**
   * イベントエラー時の挙動設定
   */
  recoverableErrorStrategy: RecoverableErrorStrategy

  /**
   * アプリケーション終了ガード
   *
   * - タブクローズ
   * - リロード
   * - URL直接入力
   * - 外部サイト遷移
   *
   * default: false
   */
  enableAppExitGuard?: boolean

  /**
   * bfcache 復元時のリロード
   *
   * default: true
   */
  enableBfCacheReload?: boolean
}

/**
 * 注意:
 * defaultErrorComponent と defaultNotFoundComponent は
 * Router Enhancer が管理するため指定しても無視されます。
 */
export function createEnhancedRouter<
  TRouteTree extends AnyRoute,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
>(
  options: RouterConstructorOptions<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  >,
  enhanceOptions?: RouterEnhancerOptions,
) {
  if (enhanceOptions?.enableAppExitGuard ?? false) {
    registerAppExitGuard()
  }

  if (enhanceOptions?.enableBfCacheReload ?? true) {
    registerBfCacheReload()
  }

  const router = createRouter({
    ...options,
    defaultStaleTime: 0,
    defaultStaleReloadMode: 'blocking',
  })

  initNavigationTracker(router)

  initHistoryTracker(router)

  return router
}
