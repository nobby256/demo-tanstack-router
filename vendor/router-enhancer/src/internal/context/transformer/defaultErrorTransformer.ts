import type {
  AppError,
  ErrorTransformer,
  FieldMessageItem,
  MessageItem,
  Notification,
} from '../RouterContext'

import { isDomainError } from './DomainError'

export const defaultErrorTransformer: ErrorTransformer = {
  transform(error: AppError): Notification[] {
    /**
     * デフォルト仕様
     *
     * 422 は業務エラーとして扱う。
     * DomainError を解析して
     * field通知またはnotification通知へ変換する。
     *
     * それ以外のエラーは
     * alert通知へ変換する。
     */
    if (error.statusCode === 422) {
      return transformDomainError(error)
    }

    return [
      {
        type: 'alert',
        error,
      },
    ]
  },
}

function transformDomainError(error: AppError): Notification[] {
  if (!isDomainError(error.data)) {
    return [
      {
        type: 'alert',
        error: error,
      },
    ]
  }

  const data = error.data

  const fieldItems: FieldMessageItem[] = []
  const notificationItems: MessageItem[] = []

  for (const message of data.messages) {
    if (message.fields?.length) {
      for (const field of message.fields) {
        fieldItems.push({
          field,
          message: message.message,
        })
      }
    } else {
      notificationItems.push({
        level: message.level ?? 'ERROR',
        message: message.message,
      })
    }
  }

  const notifications: Notification[] = []

  if (fieldItems.length > 0) {
    notifications.push({
      type: 'field',
      items: fieldItems,
    })
  }

  if (notificationItems.length > 0) {
    notifications.push({
      type: 'notification',
      items: notificationItems,
    })
  }

  return notifications
}
