import { isNotFound, SearchParamError } from '@tanstack/react-router'

import type { AppError } from './AppError'

import { createAppError, isAppError } from './AppError'

function hasStatusCode(error: Error): error is Error & { statusCode: number } {
  return (
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
  )
}

function hasStatusMessage(
  error: Error,
): error is Error & { statusMessage: string } {
  return (
    'statusMessage' in error &&
    typeof (error as { statusMessage?: unknown }).statusMessage === 'string'
  )
}

function hasData(error: Error): error is Error & { data: unknown } {
  return 'data' in error
}

/**
 * normalizeError
 * ----------------------------------------------------------------------------
 * 任意の例外を AppError に正規化する。
 *
 * 対応例外
 *
 *   - AppError
 *   - Error
 *   - unknown
 *
 * Error の派生型で statusCode を持つ場合は、それを利用する。
 * statusCode === 422 の場合は、error.data を AppError.data に格納する。
 */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof SearchParamError) {
    // route.validateSearchで発生したエラー
    // 通常はクライアント側のバグか攻撃で発生する
    // ネットワークやサーバーなどの外的要因ではなく
    // クライアント側の問題で発生しているので継続不能とする
    return createAppError('BAD_REQUEST', {
      statusCode: 400,
      category: 'Fatal', // 致命的エラー扱いとする
      cause: error,
    })
  } else if (isNotFound(error)) {
    return createAppError('BAD_REQUEST', {
      statusCode: 404,
      category: 'Fatal', // 致命的エラー扱いとする
      cause: error,
    })
  } else if (error instanceof Error) {
    const statusCode = hasStatusCode(error) ? error.statusCode : undefined
    const message = hasStatusMessage(error)
      ? error.statusMessage
      : error.message || undefined

    if (statusCode) {
      const category =
        statusCode === 410
          ? 'Gone'
          : statusCode === 403
            ? 'Fatal'
            : 'Recoverble'

      const data = statusCode === 422 && hasData(error) ? error.data : undefined
      return createAppError(message, {
        statusCode,
        category,
        data,
        cause: error,
      })
    } else {
      // 通信系以外のエラーはクライアント内の状態が不安定な訳だから継続したところでどうにもならない
      return createAppError(message, {
        category: 'Fatal',
        cause: error,
      })
    }
  }

  return createAppError(String(error), {
    category: 'Fatal',
    cause: error,
  })
}
