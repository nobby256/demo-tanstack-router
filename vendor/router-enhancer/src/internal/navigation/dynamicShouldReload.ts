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

  const shouldReload = location.state.shouldReload
  if (shouldReload !== undefined) {
    return shouldReload
  }

  return true
}
