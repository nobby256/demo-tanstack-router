import { useBlocker } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * 離脱確認時に呼び出される確認関数です。
 *
 * `true` を返した場合は離脱を許可し、`false` を返した場合は離脱を中止します。
 * Promise を返せるため、`window.confirm` だけでなく独自ダイアログにも対応できます。
 */
export type LeaveConfirmHandler = () => boolean | Promise<boolean>

/**
 * SPA 内の画面離脱ガードのオプションです。
 */
export interface UseLeaveGuardOptions {
  /**
   * ガードを有効にするかどうかです。
   */
  when?: boolean

  /**
   * 離脱確認関数です。
   *
   * `true` を返した場合は離脱を許可し、`false` を返した場合は離脱を中止します。
   */
  confirmLeave: LeaveConfirmHandler
}

/**
 * SPA 内の画面遷移をガードします。
 *
 * TanStack Router の blocker を使い、browser back / forward,
 * Link, navigate などの client-side navigation を対象にします。
 *
 * document unload を伴う離脱は対象外です。
 * それらを保護したい場合は appExitGuard 側を利用してください。
 */
export function useLeaveGuard({
  when = true,
  confirmLeave,
}: UseLeaveGuardOptions): void {
  const confirmLeaveRef = useRef<LeaveConfirmHandler>(confirmLeave)
  useLayoutEffect(() => {
    confirmLeaveRef.current = confirmLeave
  }, [confirmLeave])

  const blocker = useBlocker({
    disabled: !when,
    shouldBlockFn: () => true,
    withResolver: true,
    enableBeforeUnload: false,
  })

  useEffect(() => {
    if (blocker.status !== 'blocked') {
      return undefined
    }

    let cancelled = false

    void (async () => {
      const allowLeave = await confirmLeaveRef.current()

      if (cancelled) {
        return
      }

      if (allowLeave) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [blocker])
}
