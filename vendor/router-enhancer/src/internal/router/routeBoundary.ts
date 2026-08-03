import type { ParsedLocation } from '@tanstack/react-router'

import { isNotFound, isRedirect, redirect } from '@tanstack/react-router'

import { type RouterContext } from '../context'

/**
 * routeBoundary
 * ----------------------------------------------------------------------------
 * Router 用 エラーハンドラ。
 *
 * beforeLoad / loader で発生する例外を
 * Router Transaction Architecture のポリシーに従って処理する。
 *
 * @typeParam T
 * loader / beforeLoad の戻り値型
 *
 * @param match
 * Router navigation コンテキスト
 *
 * @param fn
 * 実行する loader / beforeLoad 処理
 */
export async function routeBoundary<
  TContext extends {
    location: ParsedLocation
    cause: 'enter' | 'stay' | 'preload'
    context: RouterContext
  },
  TResult,
>(match: TContext, fn: () => Promise<TResult>): Promise<TResult> {
  try {
    return await fn()
  } catch (error) {
    /**
     * preload navigation は対象外
     */
    if (match.cause === 'preload') {
      throw error
    }

    /**
     * redirect / notFound は navigation 制御のための例外なので
     * transaction では処理せずそのまま再スローする。
     */
    if (isRedirect(error) || isNotFound(error)) {
      throw error
    }

    /**
     * ロールバック対象外のエラーはErrorComponentに委譲
     */
    const statusCode = match.context.errorAdapter.normalize(error).statusCode
    if (statusCode === 401 || statusCode === 403) {
      throw error
    }

    /**
     * 初回アクセスなど戻る先が存在しない場合はErrorComponentに委譲する
     */
    const tracker = match.location.state.__navigationTracker
    const redirectLocation = tracker?.rollbackLocation
    if (!redirectLocation) {
      throw error
    }

    /**
     * ロールバックトの原因となったエラーを把持する
     */
    if (tracker) {
      tracker.rollbackCause = error
    }

    /**
     * 疑似 navigation cancel
     * エラーの通知はリダイレクト後に発生させる。
     * navigationTracker を参照。
     */
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({
      to: redirectLocation.href,
      replace: true,
      state: {
        // loaderの実行を抑制することでloadエラーによるリダイレクトの連続発生を抑制する
        // 遷移中にRedirectで遷移前の画面に戻った時は、遷移前画面のActiveキャッシュがまだ有効なので
        // loaderの実行不要でキャッシュからデータを取得できる
        shouldReload: false,
        __navigationTracker: tracker,
      },
    })
  }
}
