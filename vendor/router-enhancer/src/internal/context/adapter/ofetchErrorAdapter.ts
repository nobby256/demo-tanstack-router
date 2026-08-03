import type { AppError } from './AppError'
import type { ErrorAdapter } from './ErrorAdapter'

export const ofetchErrorAdapter: ErrorAdapter = {
  normalize(error: unknown): AppError {
    // 既に正規化済みならそのまま返却
    if (isAppError(error)) {
      return error
    }

    // ofetch の FetchError
    if (isFetchError(error)) {
      return fromFetchError(error)
    }

    // JavaScript Runtime Error
    if (error instanceof Error) {
      return fromError(error)
    }

    // throw 'error'
    // throw 123
    // throw null
    // throw {}
    return fromUnknown(error)
  },
}

function fromFetchError(error: Record<string, unknown>): AppError {
  return {
    original: error,

    /**
     * createFetchError() により
     * response.status が statusCode として公開される。
     *
     * 通信障害時は response が存在しないため undefined。
     */
    statusCode:
      typeof error.statusCode === 'number' ? error.statusCode : undefined,

    /**
     * createFetchError() により
     * response._data が data として公開される。
     */
    data: error.data,

    message:
      typeof error.message === 'string' ? error.message : 'Unknown Error',

    /**
     * FetchError である時点で
     * HTTP/通信ライブラリ由来のエラーとみなす。
     */
    httpError: true,

    timeout: isTimeout(error),
  }
}

function fromError(error: Error): AppError {
  return {
    original: error,

    statusCode: undefined,

    data: undefined,

    message: error.message,

    /**
     * JavaScript Runtime Error
     */
    httpError: false,

    timeout: false,
  }
}

function fromUnknown(error: unknown): AppError {
  return {
    original: error,

    statusCode: undefined,

    data: undefined,

    message: String(error),

    /**
     * 通信エラーではない
     */
    httpError: false,

    timeout: false,
  }
}

/**
 * AppError 判定
 */
function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'original' in value &&
    'message' in value &&
    'httpError' in value &&
    'timeout' in value
  )
}

/**
 * ofetch の型に依存しない判定。
 *
 * FetchError クラス名で判定する。
 */
function isFetchError(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.constructor?.name === 'FetchError'
  )
}

/**
 * タイムアウト判定。
 *
 * ofetch は timeout 時に
 * AbortSignal.timeout() を利用する。
 *
 * 発生した例外は createFetchError() により
 * FetchError.cause に保持される。
 *
 * そのため cause.name === 'TimeoutError'
 * で判定する。
 */
function isTimeout(error: Record<string, unknown>): boolean {
  const cause = error.cause

  return (
    typeof cause === 'object' &&
    cause !== null &&
    'name' in cause &&
    cause.name === 'TimeoutError'
  )
}
