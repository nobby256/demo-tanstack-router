import { type AnyRouter, type ParsedLocation } from '@tanstack/react-router'

import { runtimeEventBus } from '../event'

declare module '@tanstack/history' {
  interface HistoryState {
    /**
     * navigationTracker 用の内部状態
     */
    __navigationTracker?: {
      /**
       * 遷移エラーが発生した時のリダイレクト先
       * ただし、ダイレクトアクセス（ブラウザ履歴含む）の場合はundefinedとなる。
       * その場合はリダイレクトせず継続不能エラー画面に遷移する。
       */
      redirectLocation?: ParsedLocation

      /**
       * リダイレクトの発端となったエラー
       */
      redirectCause?: unknown
    }
  }
}

let initialized = false

/**
 * navigationTracker 初期化
 */
export function initNavigationTracker(router: AnyRouter): void {
  if (initialized) {
    return
  }
  initialized = true

  router.subscribe('onBeforeLoad', (event) => {
    const { fromLocation, toLocation } = event

    // リダイレクトによって発生したnavigateの場合は__navigationTrackerの格納は不要
    if (!toLocation.state.__navigationTracker) {
      // 遷移エラーが発生した時のリダイレクト先（fromLocation）をstateに格納する
      toLocation.state.__navigationTracker = {
        redirectLocation: fromLocation,
      }
    }
  })

  router.subscribe('onResolved', (event) => {
    const { toLocation } = event
    const cause = toLocation.state.__navigationTracker?.redirectCause

    // 履歴に残らないように使用済みのtrackerはクリアする
    // これをやっておかないとブラウザバックを行ったときに状態が残ってしまう
    toLocation.state.__navigationTracker = undefined
    toLocation.state.shouldReload = undefined

    if (cause) {
      // 遷移キャンセルを発生させたエラーを通知する
      runtimeEventBus.emit('event', {
        type: 'navigation-error',
        error: cause,
      })
    }
  })
}
