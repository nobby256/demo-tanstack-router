import type { ParsedLocation } from '@tanstack/react-router'

import { isNotFound, isRedirect, redirect } from '@tanstack/react-router'

import { normalizeError } from '../error'

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
 * @param ctx
 * Router navigation コンテキスト
 *
 * @param fn
 * 実行する loader / beforeLoad 処理
 */
export async function routeBoundary<
  TContext extends {
    location: ParsedLocation
    cause: 'enter' | 'stay' | 'preload'
  },
  TResult,
>(ctx: TContext, fn: () => Promise<TResult>): Promise<TResult> {
  try {
    return await fn()
  } catch (error) {
    /**
     * preload navigation は UI に影響させない
     */
    if (ctx.cause === 'preload') {
      // preload 時のエラーは画面遷移ではないので再スローしていい
      throw error
    }

    /**
     * Router control flow
     *
     * redirect / notFound は navigation 制御のための例外なので
     * transaction では処理せずそのまま再スローする。
     */
    if (isRedirect(error) || isNotFound(error)) {
      throw error
    }

    const appError = normalizeError(error)

    /**
     * 継続可能エラー以外はErrorComponentに委譲
     */
    if (appError.category !== 'Recoverble') {
      throw appError
    }

    /**
     * 初回アクセスなど戻る先が存在しない場合は継続可能であってもFatalに変更し、
     * ErrorComponentに委譲する（Goneではない）
     */
    const tracker = ctx.location.state.__navigationTracker
    const redirectLocation = tracker?.rollbackLocation
    if (!redirectLocation) {
      appError.category = 'Fatal'
      throw appError
    }

    // リダイレクトの原因となったエラーを把持する
    if (tracker) {
      tracker.rollbackCause = error
    }

    /**
     * 疑似 navigation cancel
     * 継続可能エラーの通知はリダイレクト後に発生させる。
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
