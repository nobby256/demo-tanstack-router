import { type AnyRouter } from '@tanstack/react-router'

import { runtimeEventBus } from '../event'

let initialized = false

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
        rollbackLocation: fromLocation,
      }
    }
  })

  router.subscribe('onResolved', (event) => {
    const { toLocation } = event
    const cause = toLocation.state.__navigationTracker?.rollbackCause

    // 履歴に格納されているLocationに当時の情報が残らないように
    // 遷移完了時にクリアする必要がある
    toLocation.state.__navigationTracker = undefined
    toLocation.state.shouldReload = undefined

    if (cause) {
      // 遷移キャンセルを発生させたエラーを通知する
      runtimeEventBus.emit('event', {
        type: 'recoverable-navigation-error',
        error: cause,
      })
    }
  })
}
