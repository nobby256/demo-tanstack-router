import type { ParsedLocation } from '@tanstack/react-router'

/**
 * `location.state.shouldReload` による動的な reload 制御を行います。
 *
 * 優先順位:
 *
 * 1. `location.state.shouldReload`
 * 2. `cause === 'stay'` の場合は `false`
 * 3. 上記以外は `true`
 */
export function locationStateShouldReload({
  location,
  cause,
}: {
  location: ParsedLocation
  cause: 'preload' | 'enter' | 'stay'
}) {
  const shouldReload = location.state.shouldReload

  if (shouldReload !== undefined) {
    return shouldReload
  }

  if (cause === 'stay') {
    return false
  }

  return true
}
