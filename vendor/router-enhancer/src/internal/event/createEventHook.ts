import { useMemo } from 'react'

import { event } from './event'

/**
 * イベントハンドラ型。
 *
 * Page Eventsでは戻り値を持たないイベントのみを許可する。
 *
 * @example
 * const onSave = async () => {}
 * const onDelete = () => {}
 */
type PageEventHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => void | Promise<void>

/**
 * Page Eventsの定義型。
 *
 * @example
 * {
 *   onSave: async () => {},
 *   onDelete: async () => {}
 * }
 */
type PageEvents = Record<string, PageEventHandler>

/**
 * イベント群を自動的にラップする。
 *
 * `event(...)` を各イベントへ適用し、
 * 例外通知・ローディング管理などを統一する。
 *
 * @param events 元のイベント集合
 * @returns ラップ済みイベント集合
 */
function useWrappedEvents<T extends PageEvents>(events: T): T {
  return useMemo(() => {
    const wrapped = {} as T

    for (const key in events) {
      wrapped[key] = event(events[key]) as T[typeof key]
    }

    return wrapped
  }, [events])
}

/**
 * Page Eventsを定義するためのヘルパー。
 *
 * ## 目的
 *
 * 各イベントへ `event(...)` を自動適用し、
 * 開発者が個別にラップする手間をなくす。
 *
 * ## 使用例
 *
 * ```ts
 * export const usePageEvents = definePageEvents(() => {
 *   const navigate = useNavigate()
 *
 *   const onSave = async () => {
 *     await saveUser()
 *
 *     navigate({
 *       to: '/users',
 *     })
 *   }
 *
 *   const onDelete = async () => {
 *     await deleteUser()
 *   }
 *
 *   return {
 *     onSave,
 *     onDelete,
 *   }
 * })
 * ```
 *
 * ```tsx
 * const events = usePageEvents()
 *
 * <Button onClick={events.onSave}>
 *   保存
 * </Button>
 * ```
 *
 * ## 効果
 *
 * 以下を自動適用する。
 *
 * - エラー通知
 * - ローディング制御
 * - 将来的な二重押下防止
 * - 将来的な操作ログ出力
 *
 * そのため、画面側では
 *
 * ```tsx
 * onClick={events.onSave}
 * ```
 *
 * と書くだけでよい。
 *
 * @param factory イベント群を生成するHook
 * @returns イベント群を返すHook
 */
export function createEventHook<T extends PageEvents>(
  factory: () => T,
): () => T {
  return () => {
    const events = factory()

    return useWrappedEvents(events)
  }
}
