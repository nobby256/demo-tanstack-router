/**
 * エラーハンドラ
 *
 * デフォルトでは alert でエラーを通知する。
 * アプリケーションの要件に応じて、適切な実装を登録すること。
 */
let errorNotifier = (error: unknown): void => {
  alert(`エラーが発生しました。\n\n${JSON.stringify(error)}`)
}

/**
 * エラーを通知する
 *
 * @param error 発生したエラー
 */
export function notifyActionError(error: unknown): void {
  errorNotifier(error)
}

/**
 * エラーハンドラの登録
 *
 * @param handler ナビゲーションエラー通知ハンドラ
 */
export function registerActionErrorNotifier(handler: (error: unknown) => void) {
  errorNotifier = handler
}
