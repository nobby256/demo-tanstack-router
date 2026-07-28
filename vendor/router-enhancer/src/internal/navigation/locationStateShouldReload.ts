import type { ParsedLocation } from '@tanstack/react-router'

declare module '@tanstack/history' {
  interface HistoryState {
    shouldReload?: boolean
  }
}

/**
 * navigateの引数state.shouldReloadによって戻り値が指定可能なshouldReload関数
 */
export function locationStateShouldReload(defaultValue?: boolean) {
  return ({ location }: { location: ParsedLocation }) => {
    const shouldReload = location.state.shouldReload

    if (shouldReload !== undefined) {
      return shouldReload
    }

    return defaultValue
  }
}
