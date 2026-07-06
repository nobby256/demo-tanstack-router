import { notifyEventError } from './eventErrorNotifier'

/**
 * event.ts
 *
 * イベントハンドラを安全に実行するためのユーティリティ。
 *
 * - すべてのイベントハンドラは `event(...)` でラップすることを想定
 * - async / sync の両方に対応
 * - 非同期処理の場合は await して例外を確実に捕捉する
 * - 将来的にローディング制御や二重実行防止などを追加可能
 */

/**
 * イベント実行時のオプション
 */
export type EventOptions = {
  /**
   * ローディング管理を有効にするか
   * @default true
   */
  loading?: boolean

  /**
   * エラー通知を有効にするか
   * @default true
   */
  notifyError?: boolean

  /**
   * エラーを無視するか
   * @default false
   */
  ignoreError?: boolean
}

/**
 * イベントハンドラ型。
 *
 * 任意の引数を受け取るが、戻り値は
 * void または Promise<void> のみを許可する。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (...args: any[]) => void | Promise<void>

/**
 * イベントハンドラをラップして安全に実行する
 *
 * ## 基本方針
 * - イベントはすべて `event(...)` でラップする
 * - 非同期関数は await して例外を捕捉する
 * - 同期関数もそのままサポートする
 *
 * ## 使用例
 * ```tsx
 * <button onClick={event(onClick)} />
 * <button onClick={event(handleSubmit(onSubmit))} />
 * ```
 *
 * ## 注意
 * - Promiseを返さない非同期処理（fire-and-forget）は検知できない
 * - async関数は必ず await するという規約前提で設計している
 *
 * @param fn 実行したいイベントハンドラ
 * @param options 挙動を制御するオプション（将来拡張用）
 * @returns ラップされたイベントハンドラ
 */
export function event<T extends EventHandler>(
  fn: T,
  options: EventOptions = {},
): (...args: Parameters<T>) => Promise<void> {
  const {
    loading = true,
    notifyError: shouldNotify = true,
    ignoreError = false,
  } = options

  return async (...args: Parameters<T>): Promise<void> => {
    let isAsync = false
    let handledError: unknown = undefined

    try {
      const result = fn(...args)

      // --- 非同期判定 ---
      if (result instanceof Promise) {
        isAsync = true

        if (loading) {
          startGlobalLoading()
        }

        await result
      }
    } catch (error) {
      if (ignoreError) {
        console.error(error)
      } else {
        handledError = error
      }
    } finally {
      if (loading && isAsync) {
        stopGlobalLoading()
      }
    }

    if (handledError && shouldNotify) {
      notifyEventError(handledError)
    }
  }
}

// TODO:
// ローディングはカウンタ方式で管理すること
// start: count++
// stop:  count--
// count === 0 のときだけ非表示
function startGlobalLoading() {}

function stopGlobalLoading() {}
