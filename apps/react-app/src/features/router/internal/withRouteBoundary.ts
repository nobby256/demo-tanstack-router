import type { ParsedLocation } from '@tanstack/react-router'

export async function withRouteBoundary<
  TContext extends {
    location: ParsedLocation
    cause: 'enter' | 'stay' | 'preload'
  },
  TResult,
>(_ctx: TContext, fn: () => Promise<TResult>): Promise<TResult> {
  return await fn()
}
