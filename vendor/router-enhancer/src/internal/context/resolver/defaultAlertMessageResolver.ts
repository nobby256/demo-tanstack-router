import type { AlertMessageResolver, AppError } from '../RouterContext'

export const defaultAlertMessageResolver: AlertMessageResolver = {
  resolve(error: AppError): string {
    if (error.httpError) {
      if (error.timeout) {
        return '通信がタイムアウトしました。'
      }

      const statusCode = error.statusCode
      if (statusCode === undefined) {
        return '通信が出来ませんでした。'
      }

      switch (error.statusCode) {
        case 400:
          return 'リクエストの入力が正しくありません。(400)'

        case 401:
          return 'セッションタイムアウトが発生しました。(401)'

        case 403:
          return 'アクセス権限がありません。(403)'

        case 404:
          return '不正なリクエストです。(404)'

        case 410:
          return '有効期限が切れています。(410)'

        case 422:
          return '業務エラーが発生しました。(422)'

        default:
          return `サーバーエラーが発生しました。(${error.statusCode})`
      }
    }
    return 'クライアントで想定外のエラーが発生しました。'
  },
}
