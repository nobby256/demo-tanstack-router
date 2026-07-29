import type { ParsedLocation } from '@tanstack/react-router'

export const formPageReloadPolicy = {
  staleTime: 0,
  reloadMode: 'blocking',
  shouldReload: locationStateShouldReload,
}

function locationStateShouldReload({
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
