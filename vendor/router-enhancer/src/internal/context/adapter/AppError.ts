export interface AppError {
  /**
   * 元例外
   */
  readonly original: unknown

  /**
   * HTTPステータスコード
   *
   * 通信失敗などによりレスポンスが取得できなかった場合は undefined。
   */
  readonly statusCode?: number

  /**
   * レスポンスボディ
   *
   * 422などの業務エラーのレスポンス解析に利用する。
   */
  readonly data?: unknown

  /**
   * エラーメッセージ
   */
  readonly message: string

  /**
   * HTTP/通信ライブラリ由来のエラー。
   *
   * FetchError であれば true。
   *
   * 例:
   * - 400
   * - 401
   * - 403
   * - 404
   * - 410
   * - 422
   * - 500
   * - オフライン
   * - DNS解決失敗
   * - CORS
   * - 接続拒否
   * - TLSエラー
   * - タイムアウト
   *
   * false:
   * - TypeError
   * - ReferenceError
   * - SyntaxError
   * - Error
   * - その他アプリケーションの不具合
   */
  readonly httpError: boolean

  /**
   * 通信タイムアウト
   */
  readonly timeout: boolean
}
