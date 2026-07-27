import type { ParsedLocation } from '@tanstack/react-router'

declare module '@tanstack/history' {
  interface HistoryState {
    shouldReload?: boolean
  }
}

/**
 * navigateの引数state.shouldReloadによって戻り値が指定可能なshouldReload関数
 *
 * 未指定だった場合のデフォルトはtrue。
 */
export function dynamicShouldReload({
  cause,
  location,
}: {
  cause: 'enter' | 'stay' | 'preload'
  location: ParsedLocation
}) {
  if (cause === 'preload') {
    return true
  }

  // 画面遷移キャンセルが理由で元の画面に戻ってきた場合はloaderは呼び出さない
  if (cause === 'stay' && location.state.__navigationTracker?.redirectCause) {
    return false
  }

  // navigateで与えられたshouldReloadを使用する
  const shouldReload = location.state.shouldReload
  if (shouldReload) {
    return shouldReload
  }

  return true
}
