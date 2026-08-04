// ─────────────────────────────
// context
// ─────────────────────────────

export interface RouterContext {
  errorAdapter: ErrorAdapter
  errorTransformer: ErrorTransformer
  alertMessageResolver: AlertMessageResolver
}

// ─────────────────────────────
// adapter
// ─────────────────────────────

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

export interface ErrorAdapter {
  normalize(error: unknown): AppError
}

// ─────────────────────────────
// transformer
// ─────────────────────────────

export interface MessageItem {
  level: string
  message: string
}

export interface FieldMessageItem {
  field: string
  message: string
}

export type Notification =
  | {
      type: 'alert'
      error: AppError
    }
  | {
      type: 'field'
      items: FieldMessageItem[]
    }
  | {
      type: 'notification'
      items: MessageItem[]
    }

export interface ErrorTransformer {
  transform(error: AppError): Notification[] | undefined
}

// ─────────────────────────────
// resolver
// ─────────────────────────────

export interface AlertMessageResolver {
  resolve(error: AppError): string
}
