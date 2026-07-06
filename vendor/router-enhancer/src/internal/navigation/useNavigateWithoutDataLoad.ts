import type { NavigateOptions } from '@tanstack/react-router'

import { useRouter } from '@tanstack/react-router'

type ShouldReloadArgsLike = {
  location?: {
    href?: string
  }
}

/**
 * preferCacheOnce
 * ---------------------------------------------------------------------------
 * 次の navigation だけ loader を抑止するための registry。
 * 同一 navigation が並行実行される可能性があるため
 * reference count を持つ。
 */
const preferCacheOnce = new Map<string, number>()

function inc(key: string) {
  preferCacheOnce.set(key, (preferCacheOnce.get(key) ?? 0) + 1)
}

function dec(key: string) {
  const count = preferCacheOnce.get(key)
  if (!count || count <= 1) preferCacheOnce.delete(key)
  else preferCacheOnce.set(key, count - 1)
}

/**
 * shouldReloadForNavigation
 * ---------------------------------------------------------------------------
 * preferCacheOnce に登録された navigation は
 * loader をスキップする。
 */
export function shouldReloadForNavigation(
  args: ShouldReloadArgsLike,
): boolean | undefined {
  const key = args.location?.href

  if (key && (preferCacheOnce.get(key) ?? 0) > 0) {
    return false // loader をスキップ
  }

  return true
}

/**
 * useNavigateWithoutDataLoad
 * ---------------------------------------------------------------------------
 * 次の navigation だけ loader をスキップさせる navigate wrapper
 */
export function useNavigateWithoutDataLoad() {
  const router = useRouter()

  return async (options: NavigateOptions) => {
    const key =
      'href' in options && typeof options.href === 'string'
        ? options.href
        : router.buildLocation(options).href

    inc(key)

    try {
      return await router.navigate(options)
    } finally {
      dec(key)
    }
  }
}
