import type {
  AppError,
  ErrorTransformer,
  FieldMessageItem,
  MessageItem,
  Notification,
} from '../RouterContext'

import { type DomainError, isDomainError } from './DomainError'

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
export const defaultErrorTransformer: ErrorTransformer = {
  transform(error: AppError): Notification[] | undefined {
    const { statusCode, data } = error
    if (isDomainError(statusCode, data)) {
      return transformDomainError(data)
    }
    return undefined
  },
}

function transformDomainError(data: DomainError): Notification[] {
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
