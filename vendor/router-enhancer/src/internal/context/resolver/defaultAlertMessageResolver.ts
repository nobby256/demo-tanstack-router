import type { AlertMessageResolver, AppError } from '../RouterContext'

export const defaultAlertMessageResolver: AlertMessageResolver = {
  resolve(error: AppError): string {
    if (error.timeout) {
      return '通信がタイムアウトしました。'
    }
    switch (error.statusCode) {
      case 401:
        return 'セッションタイムアウトが発生しました。'

      case 403:
        return 'アクセス権限がありません。'

      case 410:
        return '有効期限が切れています。'

      default:
        return 'エラーが発生しました。'
    }
  },
}
