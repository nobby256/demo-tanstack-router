import type { AppError } from '../error/AppError'

import { normalizeError } from '../error/normalizeError'

/**
 * ナビゲーションエラー通知ハンドラ
 *
 * デフォルトでは alert でエラーを通知する。
 * アプリケーションの要件に応じて、適切な実装を登録すること。
 */
let errorNotifier = (error: AppError): void => {
  alert(`エラーが発生しました。\n\n${error.message}`)
}

/**
 * エラーを通知する
 *
 * @param error 発生したエラー
 */
export function notifyEventError(error: unknown): void {
  const appError = normalizeError(error)
  errorNotifier(appError)
}

/**
 * エラー通知ハンドラの登録
 *
 * @param handler ナビゲーションエラー通知ハンドラ
 */
export function registerEventErrorNotifier(handler: (error: AppError) => void) {
  errorNotifier = handler
}
