import type { AnyRouter } from '@tanstack/react-router'

import type { AppError } from '../error'

import { createAppError } from '../error'
import { notifyNavigationError } from './navigationErrorNotifier'

/**
 * ナビゲーション状態
 */
export interface NavigationState {
  /**
   * 最後に成功した navigation の URL
   *
   * 初回アクセスの場合は undefined。
   */
  lastResolvedUrl?: string

  /**
   * リダイレクトの原因となったエラー
   *
   * navigateが並列実行される可能性を考慮して、スタックで管理する。
   */
  redirectErrors: AppError[]
}

/**
 * 内部状態
 */
const state: NavigationState = { redirectErrors: [] }

let initialized = false

/**
 * navigationTracker 初期化
 *
 * Router の `onResolved` イベントを利用して
 * 成功した navigation を記録する。
 *
 * 同一URL navigation は除外する。
 *
 * @param router TanStack Router instance
 */
export function initNavigationTracker(router: AnyRouter): void {
  if (initialized) {
    return
  }
  initialized = true

  router.subscribe('onResolved', (event) => {
    /**
     * 同一URL navigation は無視
     */
    if (state.lastResolvedUrl !== event.toLocation.href) {
      state.lastResolvedUrl = event.toLocation.href
    }

    const redirectError = getLastRedirectError()
    endRedirect()
    if (redirectError) {
      notifyNavigationError(redirectError)
    }
  })
}

/**
 * 遷移に成功した最後の URL 取得
 *
 * 初回アクセス時は undefined を返す。
 */
export function getLastResolvedUrl(): string | undefined {
  return state.lastResolvedUrl
}

/**
 * リダイレクトの開始
 *
 * 一定回数リダイレクトが繰り返された場合は致命的エラーとみなし、例外をスローする。
 *
 * @param error 画面遷移時に発生したエラー
 */
export function beginRedirect(error: AppError) {
  if (state.redirectErrors.length >= 5) {
    throw createAppError(
      'リダイレクトが繰り返されているため、処理を中断します。',
      {
        cause: error,
        category: 'Fatal',
      },
    )
  }
  state.redirectErrors.push(error)
}

function endRedirect() {
  state.redirectErrors = []
}

function getLastRedirectError(): AppError | undefined {
  if (state.redirectErrors.length === 0) {
    return undefined
  }
  return state.redirectErrors[state.redirectErrors.length - 1]
}

/**
 * 現在のルーティングがロールバックの為のルーティングであるか？
 *
 * @returns true: ロールバックの為のルーティングである
 */
export function isInNavigationRollback() {
  return state.redirectErrors.length > 0
}
