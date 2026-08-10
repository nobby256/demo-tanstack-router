import { type AnyRouter } from '@tanstack/react-router'

import { leafRouteContext } from '../context'
import { applyNotifications } from '../error-notification'

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
        fromLocation,
        toLocation,
        pathChanged: event.pathChanged,
        hrefChanged: event.hashChanged,
        hashChanged: event.hashChanged,
        rollbackLocation: event.fromLocation,
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
      // subrcribeにとっての対象のrouteはmatchesの末尾のroute
      const { errorAdapter, alertMessageResolver } = leafRouteContext(router)
      const appError = errorAdapter.normalize(cause)
      applyNotifications(
        [{ type: 'alert', error: appError }],
        alertMessageResolver,
      )
    }
  })
}
