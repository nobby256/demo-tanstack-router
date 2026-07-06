import type {
  AnyRoute,
  ErrorComponentProps,
  RouterConstructorOptions,
  RouterHistory,
  TrailingSlashOption,
} from '@tanstack/react-router'

import { createRouter, notFound } from '@tanstack/react-router'

import { registerAppExitGuard, registerBfCacheReload } from './browser'
import { type AppError, normalizeError } from './error'
import { registerEventErrorNotifier } from './event'
import {
  initNavigationTracker,
  registerNavigationErrorNotifier,
} from './navigation'

/**
 * Navigation エラー時の挙動設定
 */
export interface NavigationErrorStrategy {
  /**
   * 継続不能エラー
   */
  fatal: {
    fallback: (error: AppError) => React.ReactNode | void
  }

  /**
   * 期限切れエラー (HTTP 410 Gone)
   */
  gone: {
    fallback: (error: AppError) => React.ReactNode
  }

  /**
   * 継続可能エラー
   */
  recoverable: {
    onError: (error: AppError) => void
  }
}

/**
 * イベントエラー時の挙動設定
 */
export interface EventErrorStrategy {
  onError: (error: AppError) => void
}

export interface RouterEnhancerOptions {
  /**
   * Navigation エラー時の挙動設定
   */
  navigationErrorStrategy: NavigationErrorStrategy

  /**
   * イベントエラー時の挙動設定
   */
  eventErrorStrategy: EventErrorStrategy

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

type RouterOptions<
  TRouteTree extends AnyRoute,
  TTrailingSlashOption extends TrailingSlashOption,
  TDefaultStructuralSharingOption extends boolean,
  TRouterHistory extends RouterHistory,
  TDehydrated extends Record<string, unknown>,
> = RouterConstructorOptions<
  TRouteTree,
  TTrailingSlashOption,
  TDefaultStructuralSharingOption,
  TRouterHistory,
  TDehydrated
>

/**
 * 注意:
 * defaultErrorComponent と defaultNotFoundComponent は
 * Router Enhancer が管理するため指定しても無視されます。
 */
export type EnhancedRouterOptions<
  TRouteTree extends AnyRoute,
  TTrailingSlashOption extends TrailingSlashOption,
  TDefaultStructuralSharingOption extends boolean,
  TRouterHistory extends RouterHistory,
  TDehydrated extends Record<string, unknown>,
> = RouterOptions<
  TRouteTree,
  TTrailingSlashOption,
  TDefaultStructuralSharingOption,
  TRouterHistory,
  TDehydrated
> & {
  enhance: RouterEnhancerOptions
}

export function createEnhancedRouter<
  TRouteTree extends AnyRoute,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
>(
  options: EnhancedRouterOptions<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  >,
) {
  const { enhance, ...routerOptions } = options

  if (enhance.enableAppExitGuard ?? false) {
    registerAppExitGuard()
  }

  if (enhance.enableBfCacheReload ?? true) {
    registerBfCacheReload()
  }

  registerNavigationErrorNotifier(
    enhance.navigationErrorStrategy.recoverable.onError,
  )

  registerEventErrorNotifier(enhance.eventErrorStrategy.onError)

  const router = createRouter({
    ...(routerOptions as RouterOptions<
      TRouteTree,
      TTrailingSlashOption,
      TDefaultStructuralSharingOption,
      TRouterHistory,
      TDehydrated
    >),

    defaultNotFoundComponent: () =>
      notFoundFallback(enhance.navigationErrorStrategy),

    defaultErrorComponent: (props: ErrorComponentProps) =>
      errorFallback(props.error, enhance.navigationErrorStrategy),
  })

  initNavigationTracker(router)

  return router
}

function notFoundFallback(navigationErrorStrategy: NavigationErrorStrategy) {
  return errorFallback(notFound(), navigationErrorStrategy)
}

function errorFallback(
  error: unknown,
  navigationErrorStrategy: NavigationErrorStrategy,
) {
  const appError = normalizeError(error)

  if (appError.category === 'Gone') {
    return navigationErrorStrategy.gone.fallback(appError)
  }

  return navigationErrorStrategy.fatal.fallback(appError)
}
