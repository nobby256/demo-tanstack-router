import type {
  AnyRoute,
  RouterConstructorOptions,
  RouterHistory,
  TrailingSlashOption,
} from '@tanstack/react-router'

import { createRouter } from '@tanstack/react-router'

import { registerBfCacheReload } from './browser'
import { type RouterContext } from './context'
import {
  defaultAlertMessageResolver,
  defaultErrorTransformer,
  ofetchErrorAdapter,
} from './context'
import { initHistoryTracker } from './history'
import { initNavigationTracker } from './navigation'

type RouterContextOptions = Partial<RouterContext>

export type EnhancedRouterOptions<
  TRouteTree extends AnyRoute,
  TTrailingSlashOption extends TrailingSlashOption,
  TDefaultStructuralSharingOption extends boolean,
  TRouterHistory extends RouterHistory,
  TDehydrated extends Record<string, unknown>,
> = Omit<
  RouterConstructorOptions<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  >,
  'context'
> & {
  context?: RouterContextOptions
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
  /**
   * コンテキストのデフォルト値を設定する
   */
  const routerContext: RouterContext = {
    errorAdapter: ofetchErrorAdapter,
    errorTransformer: defaultErrorTransformer,
    alertMessageResolver: defaultAlertMessageResolver,
    ...options.context,
  }

  /**
   * createRouterの引数を組み立てる
   */
  const routerOptions: RouterConstructorOptions<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  > = {
    ...(options as RouterConstructorOptions<
      TRouteTree,
      TTrailingSlashOption,
      TDefaultStructuralSharingOption,
      TRouterHistory,
      TDehydrated
    >),
    context: routerContext,
  }

  const router = createRouter(routerOptions)

  // registerAppExitGuard()
  registerBfCacheReload()

  initNavigationTracker(router)

  initHistoryTracker(router)

  return router
}
